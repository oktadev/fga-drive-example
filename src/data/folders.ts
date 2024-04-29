import "server-only";
import { isAuthenticated } from "@/app/authentication";
import { fgaClient, filterFoldersForUser } from "@/app/authorization";
import { getUserId } from "@/data/user";
import {
  Folder,
  createFolderInDB,
  getFolderFromDB,
  getFoldersFromDB,
} from "@/db/folders";
import { auth0ManagementClient } from "@/helpers/auth0-management";

export async function getFolderDTO(
  folderId: string,
): Promise<{ folder?: { name: string | null; id: string }; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_view",
      object: `folder:${folderId}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    // Get the folder from our Vercel Key/Value Store
    const folder = await getFolderFromDB(folderId);

    if (folder) {
      return {
        folder: {
          name: folderId !== userId ? folder?.name : null,
          id: folder?.id || userId,
        },
      };
    }

    return { error: "No folder found" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getAllFoldersForParentDTO(
  parent: string,
): Promise<{ folders?: Array<Folder>; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_view",
      object: `folder:${parent}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    // Get all folders for the parent from our Vercel Key/Value Store
    const folders = await getFoldersFromDB(parent);

    if (folders) {
      // Filter the folders for the ones we're allowed to see according to OpenFGA and return these
      return { folders: await filterFoldersForUser(folders, userId) };
    }

    return { error: "No folders" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function createFolderDTO(
  folderId: string,
  parent: string,
  newFolder: Folder,
): Promise<{ folder?: Folder; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_create_folder",
      object: `folder:${parent}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    const folder = await createFolderInDB(folderId, parent, newFolder);

    if (folder) {
      // Write OpenFGA tupples for the new folder
      await fgaClient.writeTuples([
        {
          user: `user:${userId}`,
          relation: "owner",
          object: `folder:${folderId}`,
        },
        {
          user: `folder:${parent}`,
          relation: "parent",
          object: `folder:${folderId}`,
        },
      ]);

      return { folder };
    }

    return { error: "No folder was created" };
  } catch (error) {
    return { error };
  }
}

export async function shareFolderDTO(
  folderId: string,
  email: string,
): Promise<{ folder?: string; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_share",
      object: `folder:${folderId}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    try {
      // Check the Auth0 management API for a user with the given email addres
      const { data } = await auth0ManagementClient.usersByEmail.getByEmail({
        email,
        fields: "user_id",
      });

      // No known user with the email addresss, return an error
      if (data.length === 0) {
        return { error: "A user with this email address does not exist." };
      }

      // Write a new OpenFGA tupple to share the folder
      await fgaClient.writeTuples([
        {
          user: `user:${data[0].user_id}`,
          relation: "viewer",
          object: `folder:${folderId}`,
        },
      ]);

      return { folder: folderId };
    } catch (error) {
      return { error };
    }
  } catch (error) {
    return { error };
  }
}
