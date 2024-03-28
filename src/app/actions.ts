import "server-only";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import {
  authorizeNewFile,
  authorizeNewFolder,
  authorizeNewSharedFile,
  authorizeNewSharedFolder,
} from "@/app/authorization";
import { getFileHash } from "@/helpers/hash";
import { Hash } from "crypto";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { auth0ManagementClient } from "@/helpers/auth0-management";
import {
  StoredFile,
  getFilesFromStore,
  getFileFromStore,
  getFilesSubsetFromStore,
  createFileInStore,
} from "@/store/files";
import {
  getFolderFromStore,
  getFoldersFromStore,
  createFolderInStore,
  Folder,
} from "@/store/folders";

export async function getFile(
  fileId: string,
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    return { file: await getFileFromStore(fileId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFiles(
  parent: string,
): Promise<{ files?: Array<StoredFile>; error?: unknown }> {
  try {
    return { files: await getFilesFromStore(parent) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFilesSubset(
  subset: Array<string>,
): Promise<{ files?: Array<StoredFile>; error?: unknown }> {
  try {
    return { files: await getFilesSubsetFromStore(subset) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function uploadFile(
  parent: string,
  file: File,
  userId: string,
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    const fileBytes: ArrayBuffer = await file.arrayBuffer();
    const fileBuffer: Buffer = Buffer.from(fileBytes);
    const fileId = uuidv4();
    const fileHash: Hash = getFileHash(fileBuffer);
    const fileExtension: string = extname(file.name);
    const filePath: string = `${process.cwd()}/upload/${fileHash.toString()}${fileExtension}`;
    const fileSize: number = Buffer.byteLength(fileBuffer);
    const uploadedFile: StoredFile = {
      name: file.name,
      lastModified: file.lastModified,
      fileName: `${fileHash}${fileExtension}`,
      size: fileSize,
    };

    // Save the file to the /upload folder, this should probably be saved in a static file store like Vercel Blob Storage of AWS S3 in the real world
    await writeFile(filePath, fileBuffer);

    // Store the files metadata in our Vercel Key/Value Store
    await createFileInStore(fileId, parent, uploadedFile);

    // Write OpenFGA tupples for the new file
    await authorizeNewFile(fileId, userId, parent);

    // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
    // If it's not we'll revalidate the sub-folder's route /folder/[parent]
    revalidatePath(`/folder${parent === userId ? "" : `/${parent}`}`);
    return { file: uploadedFile };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFile(
  file: string,
  email: string,
): Promise<{ file?: string; error?: unknown }> {
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

    // Write a new OpenFGA tupple to share the file
    await authorizeNewSharedFile(file, data[0].user_id);

    return { file };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolder(
  folderId: string,
): Promise<{ folder?: Folder; error?: unknown }> {
  try {
    return { folder: await getFolderFromStore(folderId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolders(
  parent: string,
): Promise<{ folders?: Array<Folder>; error?: unknown }> {
  try {
    return { folders: await getFoldersFromStore(parent) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function createFolder(
  parent: string,
  name: string,
  userId: string,
): Promise<{ folder?: string; error?: unknown }> {
  try {
    // Create a random and unique id for the new folder
    const folderId = uuidv4();

    // Save the new folder to our Vercel Key/Value Store
    const folder: Folder = await createFolderInStore(folderId, parent, {
      name: name,
      parent,
    });

    // Write OpenFGA tupples for the new folder
    await authorizeNewFolder(folderId, userId, parent);

    // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
    // If it's not we'll revalidate the sub-folder's route /folder/[parent]
    revalidatePath(`/folder${parent === userId ? "" : `/${parent}`}`);

    return {
      folder: folder?.name,
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFolder(
  folder: string,
  email: string,
): Promise<{ folder?: string; error?: unknown }> {
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
    await authorizeNewSharedFolder(folder, data[0].user_id);

    return { folder };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}
