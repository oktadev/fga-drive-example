import "server-only";
import {
  authorizeNewFile,
  authorizeNewSharedFile,
  canShareFile,
  canUploadFileForParent,
  canViewFile,
  canViewFilesForParent,
  filterFilesForUser,
  listSharedFiles,
} from "@/app/authorization";
import { getUserId } from "@/data/user";
import { stripObjectName } from "@/helpers/strip-object-name";
import {
  StoredFile,
  createFileInStore,
  getFileFromStore,
  getFilesFromStore,
  getFilesSubsetFromStore,
} from "@/store/files";
import { isAuthenticated } from "@/app/authentication";
import { auth0ManagementClient } from "@/helpers/auth0-management";
import { extname } from "path";
import { getFileHash } from "@/helpers/hash";
import { Hash } from "crypto";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export async function getFileDTO(
  fileId: string,
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canViewFile(userId, fileId)) {
      return { error: "Forbidden" };
    }

    const file = await getFileFromStore(fileId);

    if (file) {
      return { file };
    }

    return { error: "No file found" };
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
export async function getAllFilesForParentDTO(parent: string): Promise<{
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
    const files = await getFilesFromStore(parent);

    if (files) {
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
    }

    return { error: "No files found" };
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
    const files = await getFilesSubsetFromStore(
      sharedFiles?.objects?.map((file) => stripObjectName(file)),
    );

    if (files) {
      return {
        files: files?.map((file: StoredFile) => ({
          ...file,
          lastModified: `${new Date(
            Number(file?.lastModified),
          ).toLocaleTimeString()} - ${new Date(
            Number(file?.lastModified),
          ).toLocaleDateString()}`,
        })),
      };
    }

    return { error: "No shared files" };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function uploadFileDTO(
  parent: string,
  file: File,
): Promise<{ files?: Array<StoredFile>; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canUploadFileForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    const fileBytes: ArrayBuffer = await file.arrayBuffer();
    const fileBuffer: Buffer = Buffer.from(fileBytes);
    const fileId: string = uuidv4();
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

    const files = await createFileInStore(fileId, parent, uploadedFile);

    if (files) {
      // Write OpenFGA tupples for the new file
      await authorizeNewFile(fileId, userId, parent);

      return { files };
    }

    return { error: "No files uploaded" };
  } catch (error) {
    return { error };
  }
}

export async function shareFileDTO(
  file: string,
  email: string,
): Promise<{ file?: string; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    if (await !canShareFile(userId, file)) {
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

      // Write a new OpenFGA tupple to share the file
      await authorizeNewSharedFile(file, data[0].user_id);
      return { file };
    } catch (error) {
      return { error };
    }
  } catch (error) {
    return { error };
  }
}
