"use server";
import "server-only";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { StoredFile } from "@/db/files";
import { Folder } from "@/db/folders";
import {
  ReadableStoredFile,
  getAllFilesForParentDTO,
  getAllSharedFilesDTO,
  getFileDTO,
  shareFileDTO,
  uploadFileDTO,
} from "@/data/files";
import {
  createFolderDTO,
  getAllFoldersForParentDTO,
  getFolderDTO,
  shareFolderDTO,
} from "@/data/folders";

export async function getFile(
  fileId: string,
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    const { file, error } = await getFileDTO(fileId);

    if (file) {
      return { file };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFiles(
  parent: string,
): Promise<{ files?: Array<ReadableStoredFile>; error?: unknown }> {
  try {
    const { files, error } = await getAllFilesForParentDTO(parent);

    if (files) {
      return { files };
    }
    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getSharedFiles(): Promise<{
  files?: Array<ReadableStoredFile>;
  error?: unknown;
}> {
  try {
    const { files, error } = await getAllSharedFilesDTO();

    if (files) {
      return { files };
    }
    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function uploadFile(
  parent: string,
  formData: FormData,
): Promise<{ files?: Array<StoredFile>; error?: unknown }> {
  try {
    // Store the files metadata in our Vercel Key/Value Store
    const file: File = formData.get("file") as unknown as File;
    const { files, error } = await uploadFileDTO(parent, file);

    if (files) {
      // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
      // If it's not we'll revalidate the sub-folder's route /folder/[parent]
      revalidatePath(`/folder${parent ?? `/${parent}`}`);
      return { files };
    }
    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFile(
  fileId: string,
  email: string,
): Promise<{ file?: string; error?: unknown }> {
  try {
    const { file, error } = await shareFileDTO(fileId, email);

    if (file) {
      return { file };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolder(
  folderId: string,
): Promise<{ folder?: { name: string | null; id: string }; error?: unknown }> {
  try {
    const { folder, error } = await getFolderDTO(folderId);

    if (folder) {
      return { folder };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolders(
  parent: string,
): Promise<{ folders?: Array<Folder>; error?: unknown }> {
  try {
    const { folders, error } = await getAllFoldersForParentDTO(parent);

    if (folders) {
      return { folders };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function createFolder(
  parent: string,
  name: string,
): Promise<{ folder?: string; error?: unknown }> {
  try {
    // Create a random and unique id for the new folder
    const folderId = uuidv4();

    // Save the new folder to our Vercel Key/Value Store
    const { folder, error } = await createFolderDTO(folderId, parent, {
      name: name,
      parent,
    });

    if (folder) {
      // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
      // If it's not we'll revalidate the sub-folder's route /folder/[parent]
      revalidatePath(`/folder${parent ?? `/${parent}`}`);

      return {
        folder: folder?.name,
      };
    }
    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFolder(
  folderId: string,
  email: string,
): Promise<{ folder?: string; error?: unknown }> {
  try {
    const { folder, error } = await shareFolderDTO(folderId, email);

    if (folder) {
      return { folder };
    }

    return { error };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
