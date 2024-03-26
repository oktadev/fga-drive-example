"use server";
import { isAuthenticated } from "./authentication";
import { canViewFolder, filterFoldersForUser } from "./authorization";
import { getUserId } from "./user";
import { getFolder, getFolders } from "@/store/folders";

export async function getAllFoldersForParentDTO(parent: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canViewFolder(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Get all folders for the parent from our Vercel Key/Value Store
    const folders = await getFolders(parent);

    // Filter the folders for the ones we're allowed to see according to OpenFGA and return these
    return { folders: await filterFoldersForUser(folders, userId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolderDTO(folderId: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canViewFolder(userId, folderId)) {
      return { error: "Forbidden" };
    }

    // Get the folder from our Vercel Key/Value Store
    const folder = await getFolder(folderId);

    // Return relevant properties only
    return {
      folder: {
        name: folderId !== userId ? folder?.name : null,
        id: folder?.id || userId,
      },
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
