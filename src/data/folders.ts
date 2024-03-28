import "server-only";
import { isAuthenticated } from "@/app/authentication";
import {
  authorizeNewFolder,
  authorizeNewSharedFolder,
  canCreateFolderForParent,
  canShareFolder,
  canViewFolder,
  filterFoldersForUser,
} from "@/app/authorization";
import { getUserId } from "@/data/user";
import {
  Folder,
  createFolderInStore,
  getFolderFromStore,
  getFoldersFromStore,
} from "@/store/folders";
import { auth0ManagementClient } from "@/helpers/auth0-management";

export async function getFolderDTO(
  folderId: string,
): Promise<{ folder?: { name: string | null; id: string }; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFolder(userId, folderId)) {
      return { error: "Forbidden" };
    }

    // Get the folder from our Vercel Key/Value Store
    const folder = await getFolderFromStore(folderId);

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
    if (await !canViewFolder(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Get all folders for the parent from our Vercel Key/Value Store
    const folders = await getFoldersFromStore(parent);

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
    if (await !canCreateFolderForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    const folder = await createFolderInStore(folderId, parent, newFolder);

    if (folder) {
      // Write OpenFGA tupples for the new folder
      await authorizeNewFolder(folderId, userId, parent);

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
    if (await !canShareFolder(userId, folderId)) {
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
      await authorizeNewSharedFolder(folderId, data[0].user_id);
      return { folder: folderId };
    } catch (error) {
      return { error };
    }
  } catch (error) {
    return { error };
  }
}
