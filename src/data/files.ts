"use server";

import { getFiles, getFilesSubset } from "@/store/files";
import { isAuthenticated } from "./authentication";
import {
  canViewFilesForParent,
  filterFilesForUser,
  listSharedFiles,
} from "./authorization";
import { getUserId } from "./user";
import { stripObjectName } from "@/helpers/fga";

export async function getAllFilesForParentDTO(parent: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canViewFilesForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Get all files from the Vercel Key/Value Store
    const files = await getFiles(parent);
    console.log(files);
    // Filter all files for the ones we're allowed to see according to OpenFGA
    const filteredFiles = await filterFilesForUser(files, userId);

    // Convert the lase modified timestamp to a human readable date and time and return the files
    return {
      files: filteredFiles.map((file) => ({
        ...file,
        lastModified: `${new Date(
          Number(file?.lastModified),
        ).toLocaleTimeString()} - ${new Date(
          Number(file?.lastModified),
        ).toLocaleDateString()}`,
      })),
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getAllSharedFilesDTO() {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    // List all files that are shared with the current user in OpenFGA
    const sharedFiles = await listSharedFiles(userId);

    // Get all shared files from our our Vercel Key/Value Store
    const files = await getFilesSubset(
      sharedFiles?.objects?.map((file) => stripObjectName(file)),
    );

    return {
      files: files.map((file) => ({
        ...file,
        lastModified: `${new Date(
          Number(file?.lastModified),
        ).toLocaleTimeString()} - ${new Date(
          Number(file?.lastModified),
        ).toLocaleDateString()}`,
      })),
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
