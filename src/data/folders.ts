import { isAuthenticated } from "../app/authentication";
import { canViewFolder, filterFoldersForUser } from "../app/authorization";
import { getUserId } from "./user";
import { getFolder, getFolders } from "@/app/actions";

export async function getFolderDTO(folderId: string) {
  try {
    const userId = await getUserId();

    // Get the folder from our Vercel Key/Value Store
    const { folder } = await getFolder(folderId);

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

export async function getAllFoldersForParentDTO(parent: string) {
  try {
    const userId = await getUserId();

    // Get all folders for the parent from our Vercel Key/Value Store
    const { folders } = await getFolders(parent);

    // Filter the folders for the ones we're allowed to see according to OpenFGA and return these
    return { folders: await filterFoldersForUser(folders, userId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
