"use server";

import { isAuthenticated } from "@/app/authentication";
import {
  canCreateFolderForParent,
  canShareFolder,
  canViewFolder,
  filterFoldersForUser,
} from "@/app/authorization";
import { getUserId } from "./user";
import {
  createFolder,
  getFolder,
  getFolders,
  shareFolder,
} from "@/app/actions";
import { Folder } from "@/store/folders";

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
    const { folder, error } = await getFolder(folderId);

    if (folder) {
      return {
        folder: {
          name: folderId !== userId ? folder?.name : null,
          id: folder?.id || userId,
        },
      };
    }
    return { error };
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
    const { folders, error } = await getFolders(parent);

    if (folders) {
      // Filter the folders for the ones we're allowed to see according to OpenFGA and return these
      return { folders: await filterFoldersForUser(folders, userId) };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function createFolderDTO(
  parent: string,
  name: string,
): Promise<{ folder?: string; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canCreateFolderForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    return createFolder(parent, name, userId);
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

    return shareFolder(folderId, email);
  } catch (error) {
    return { error };
  }
}
