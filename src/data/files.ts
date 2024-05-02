import "server-only";
import { fgaClient, filterFilesForUser } from "@/app/authorization";
import { getUserId } from "@/data/user";
import { stripObjectName } from "@/helpers/strip-object-name";
import { isAuthenticated } from "@/app/authentication";
import { auth0ManagementClient } from "@/helpers/auth0-management";
import { extname } from "path";
import { getFileHash } from "@/helpers/hash";
import { Hash } from "crypto";
import { writeFile } from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import {
  StoredFile,
  createFileInDB,
  getFileFromDB,
  getFilesFromDB,
  getFilesSubsetFromDB,
} from "@/db/files";

export async function getFileDTO(
  fileId: string,
): Promise<{ file?: StoredFile; error?: unknown }> {
  try {
    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    const userId = await getUserId();
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_view",
      object: `file:${fileId}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    const file = await getFileFromDB(fileId);

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
  filename: string;
  size: number;
  id?: string;
  lastmodified: string;
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
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_view",
      object: `folder:${parent}`,
    });

    if (!allowed) {
      return { error: "Forbidden" };
    }

    // Get all saved files
    const files = await getFilesFromDB(parent);

    if (files) {
      // Filter all files for the ones we're allowed to see according to OpenFGA
      const filteredFiles = await filterFilesForUser(files, userId);

      // Convert the lase modified timestamp to a human readable date and time and return the files
      return {
        files: filteredFiles.map((file) => ({
          ...file,
          lastmodified: `${new Date(
            Number(file?.lastmodified),
          ).toLocaleTimeString()} - ${new Date(
            Number(file?.lastmodified),
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
    const sharedFiles = await fgaClient.listObjects({
      user: `user:${userId}`,
      relation: "is_shared",
      type: "file",
    });

    // Get all shared files from our our Vercel Key/Value Store
    const files = await getFilesSubsetFromDB(
      sharedFiles?.objects?.map((file) => stripObjectName(file)),
    );

    if (files) {
      return {
        files: files?.map((file: StoredFile) => ({
          ...file,
          lastmodified: `${new Date(
            Number(file?.lastmodified),
          ).toLocaleTimeString()} - ${new Date(
            Number(file?.lastmodified),
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
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_create_file",
      object: `folder:${parent}`,
    });

    if (!allowed) {
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
      lastmodified: file.lastModified,
      filename: `${fileHash}${fileExtension}`,
      size: fileSize,
    };

    // Save the file to the /upload folder, this should probably be saved in a static file store like Vercel Blob Storage of AWS S3 in the real world
    await writeFile(filePath, fileBuffer);

    // const files = await createFileInStore(fileId, parent, uploadedFile);
    const files = await createFileInDB(fileId, parent, uploadedFile);

    if (files) {
      // Write OpenFGA tupples for the new file
      await fgaClient.writeTuples([
        {
          user: `user:${userId}`,
          relation: "owner",
          object: `file:${fileId}`,
        },
        {
          user: `folder:${parent}`,
          relation: "parent",
          object: `file:${fileId}`,
        },
      ]);

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
    const { allowed } = await fgaClient.check({
      user: `user:${userId}`,
      relation: "can_share",
      object: `file:${file}`,
    });

    if (!allowed) {
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
      await fgaClient.writeTuples([
        {
          user: `user:${data[0].user_id}`,
          relation: "viewer",
          object: `file:${file}`,
        },
      ]);

      return { file };
    } catch (error) {
      return { error };
    }
  } catch (error) {
    return { error };
  }
}
