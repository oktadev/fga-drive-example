"use server";
import { v4 as uuidv4 } from "uuid";
import { extname } from "path";
import { StoredFile, createFile } from "@/store/files";
import { isAuthenticated } from "@/data/authentication";
import {
  authorizeNewFile,
  authorizeNewSharedFile,
  canShareFile,
  canUploadFileForParent,
} from "@/data/authorization";
import { getUserDTO, getUserId } from "@/data/user";
import { getFileHash } from "@/helpers/hash";
import { Hash } from "crypto";
import { writeFile } from "fs/promises";
import { revalidatePath } from "next/cache";
import { auth0ManagementClient } from "@/helpers/auth0Management";

export async function uploadFile(parent: string, formData: FormData) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canUploadFileForParent(userId, parent)) {
      return { error: "Forbidden" };
    }

    const user = await getUserDTO();
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
    const files = await createFile(fileId, parent, uploadedFile);

    // Write OpenFGA tupples for the new file
    await authorizeNewFile(fileId, userId, parent);

    revalidatePath("/folder");
    return { file: uploadedFile };
  } catch (error) {
    console.error(error);
    return { error: "Something went wrong." };
  }
}

export async function shareFile(file: string, email: string) {
  try {
    const userId = await getUserId();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

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
