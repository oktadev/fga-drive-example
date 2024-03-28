"use server";
import {
  getFile,
  getFiles,
  getFilesSubset,
  shareFile,
  uploadFile,
} from "@/app/actions";
import {
  canShareFile,
  canUploadFileForParent,
  canViewFile,
  canViewFilesForParent,
  filterFilesForUser,
  listSharedFiles,
} from "@/app/authorization";
import { getUserId } from "./user";
import { stripObjectName } from "@/helpers/strip-object-name";
import { StoredFile } from "@/store/files";
import { isAuthenticated } from "@/app/authentication";

export async function getFileDTO(
  fileId: string
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFile(userId, fileId)) {
      return { error: "Forbidden" };
    }

    return getFile(fileId);
  } catch (error) {
    return { error };
  }
}


export interface ReadableStoredFile {
    name: string;
    fileName: string;
    size: number;
    id?: string;
    lastModified: string;
}
export async function getAllFilesForParentDTO(
  parent: string
): Promise<{
  files?: Array<ReadableStoredFile>;
  error?: unknown;
}> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFilesForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Get all saved files
    const { files, error } = await getFiles(parent);

    if (files) {
      // Filter all files for the ones we're allowed to see according to OpenFGA
      const filteredFiles = await filterFilesForUser(files, userId);

      // Convert the lase modified timestamp to a human readable date and time and return the files
      return {
        files: filteredFiles.map((file) => ({
          ...file,
          lastModified: `${new Date(
            Number(file?.lastModified)
          ).toLocaleTimeString()} - ${new Date(
            Number(file?.lastModified)
          ).toLocaleDateString()}`,
        })),
      };
    }
    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getAllSharedFilesDTO(): Promise<{
  files?: Array<ReadableStoredFile>;
  error?: unknown;
}> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    // List all files that are shared with the current user in OpenFGA
    const sharedFiles = await listSharedFiles(userId);
    // Get all shared files from our our Vercel Key/Value Store
    const { files, error } = await getFilesSubset(
      sharedFiles?.objects?.map((file) => stripObjectName(file))
    );

    if (files) {
      return {
        files: files?.map((file) => ({
          ...file,
          lastModified: `${new Date(
            Number(file?.lastModified)
          ).toLocaleTimeString()} - ${new Date(
            Number(file?.lastModified)
          ).toLocaleDateString()}`,
        })),
      };
    }

    return {error}
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function uploadFileDTO(parent: string, formData: FormData): Promise<{file?: StoredFile, error?: unknown}> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canUploadFileForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    const file: File = formData.get("file") as unknown as File;
    return uploadFile(parent, file, userId);
  } catch (error) {
    return { error };
  }
}

export async function shareFileDTO(fileId: string, email: string): Promise<{file?:string, error?:unknown}> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canShareFile(userId, fileId)) {
      return { error: "Forbidden" };
    }

    return shareFile(fileId, email);
  } catch (error) {
    return { error };
  }
}
