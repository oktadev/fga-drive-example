"use server";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { isAuthenticated } from "@/app/authentication";
import {
  authorizeNewFile,
  authorizeNewFolder,
  authorizeNewSharedFile,
  authorizeNewSharedFolder,
  canCreateFolderForParent,
  canShareFile,
  canShareFolder,
  canUploadFileForParent,
  canViewFile,
  canViewFilesForParent,
  canViewFolder,
} from "@/app/authorization";
import { getUserId } from "@/data/user";
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
} from "@/store/folders";

export async function getFile(fileId: string) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFile(userId, fileId)) {
      return { error: "Forbidden" };
    }

    // Get file from the Vercel Key/Value Store
    return { file: await getFileFromStore(fileId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFiles(parent: string) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFilesForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Get all files for the parent from the Vercel Key/Value Store
    return { files: await getFilesFromStore(parent) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFilesSubset(subset: Array<string>) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    // Get the subset of files from the Vercel Key/Value Store
    return { files: await getFilesSubsetFromStore(subset) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function uploadFile(parent: string, formData: FormData) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canUploadFileForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    const file: File = formData.get("file") as unknown as File;
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
    const files = await createFileInStore(fileId, parent, uploadedFile);

    // Write OpenFGA tupples for the new file
    await authorizeNewFile(fileId, userId, parent);

    // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
    // If it's not we'll revalidate the sub-folder's route /folder/[parent]
    revalidatePath(`/folder${parent === userId ? '' : `/${parent}`}`);
    return { file: uploadedFile };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFile(file: string, email: string) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canShareFile(userId, file)) {
      return { error: "Forbidden" };
    }

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

export async function getFolder(folderId: string) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFolder(userId, folderId)) {
      return { error: "Forbidden" };
    }

    // Return the folder from our Vercel Key/Value Store
    return { folder: await getFolderFromStore(folderId) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function getFolders(parent: string) {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFolder(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Return all folders for the parent from our Vercel Key/Value Store
    return { folders: await getFoldersFromStore(parent) };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function createFolder(parent: string, name: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canCreateFolderForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    // Create a random and unique id for the new folder
    const folderId = uuidv4();

    // Save the new folder to our Vercel Key/Value Store
    const folder = createFolderInStore(folderId, parent, {
      name: name,
      parent,
    });

    // Write OpenFGA tupples for the new folder
    await authorizeNewFolder(folderId, userId, parent);

    // If the parent folder is equal to our userId, we're in the root folder and we'll revalidate /folder,
    // If it's not we'll revalidate the sub-folder's route /folder/[parent]
    revalidatePath(`/folder${parent === userId ? '' : `/${parent}`}`);
    return {
      folder: folder?.name,
    };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFolder(folder: string, email: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canShareFolder(userId, folder)) {
      return { error: "Forbidden" };
    }

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
