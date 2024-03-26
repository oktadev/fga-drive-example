"use server";
import { v4 as uuidv4 } from "uuid";
import { isAuthenticated } from "@/data/authentication";
import {
  authorizeNewFolder,
  authorizeNewSharedFolder,
  canCreateFolderForParent,
  canShareFolder,
} from "@/data/authorization";
import { getUserDTO, getUserId } from "@/data/user";
import {
  createFolder as createFolderInStore,
} from "@/store/folders";
import { revalidatePath } from "next/cache";
import { auth0ManagementClient } from "@/helpers/auth0Management";

export async function createFolder(parent: string, name: string) {
  try {
    const user = await getUserDTO();

    if (await !isAuthenticated()) {
      return { error: "Unauthorized" };
    }

    if (await !canCreateFolderForParent(user?.sub, parent)) {
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
    await authorizeNewFolder(folderId, user?.sub, parent);

    revalidatePath("/folder");
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
