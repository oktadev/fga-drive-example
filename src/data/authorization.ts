"use server";

import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";
import { stripObjectName } from "@/helpers/fga";
import { StoredFile } from "@/store/files";
import { Folder } from "@/store/folders";

const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,
  storeId: process.env.FGA_STORE_ID,
  authorizationModelId: process.env.FGA_AUTHORIZATION_MODEL_ID,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER as string,
      apiAudience: process.env.FGA_API_AUDIENCE as string,
      clientId: process.env.FGA_CLIENT_ID as string,
      clientSecret: process.env.FGA_CLIENT_SECRET as string,
    },
  },
});

export async function doCheck(
  user: string,
  relation: string,
  object: string,
): Promise<Boolean> {
  const { allowed } = await fgaClient.check({
    user,
    relation,
    object,
  });

  return !!allowed;
}

export const canViewFile = async (user: string, file: string) =>
  doCheck(`user:${user}`, "can_view", `file:${file}`);

export const canViewFilesForParent = async (user: string, parent: string) =>
  doCheck(`user:${user}`, "can_view", `folder:${parent}`);

export const canUploadFileForParent = async (user: string, parent: string) =>
  doCheck(`user:${user}`, "can_create_file", `folder:${parent}`);

export const canShareFile = async (user: string, file: string) =>
  doCheck(`user:${user}`, "can_share", `file:${file}`);

export const canViewFolder = async (user: string, folder: string) =>
  doCheck(`user:${user}`, "can_view", `folder:${folder}`);

export const canCreateFolderForParent = async (user: string, parent: string) =>
  doCheck(`user:${user}`, "can_create_folder", `folder:${parent}`);

export const canShareFolder = async (user: string, folder: string) =>
  doCheck(`user:${user}`, "can_share", `folder:${folder}`);

export async function filterFilesForUser(
  files: Array<StoredFile | undefined>,
  user: string,
): Promise<Array<StoredFile | undefined>> {
  const { responses } = await fgaClient.batchCheck(
    files.map((file) => {
      return {
        user: `user:${user}`,
        object: `file:${file?.id}`,
        relation: "can_view",
      };
    }),
  );
  console.log(responses, files);
  return responses
    .map((check) =>
      check.allowed
        ? files.find(
            (file) => file?.id === stripObjectName(check._request.object),
          )
        : undefined,
    )
    .filter(Boolean);
}

export async function filterFoldersForUser(
  folders: Array<Folder | undefined>,
  user: string,
): Promise<Array<Folder | undefined>> {
  const { responses } = await fgaClient.batchCheck(
    folders.map((folder) => {
      return {
        user: `user:${user}`,
        object: `folder:${folder?.id}`,
        relation: "can_view",
      };
    }),
  );

  return responses
    .map((check) =>
      check.allowed
        ? folders.find(
            (folder) => folder?.id === stripObjectName(check._request.object),
          )
        : undefined,
    )
    .filter(Boolean);
}

export async function authorizeNewFile(
  file: string,
  user: string,
  parent: string,
) {
  return fgaClient.writeTuples([
    {
      user: `user:${user}`,
      relation: "owner",
      object: `file:${file}`,
    },
    {
      user: `folder:${parent}`,
      relation: "parent",
      object: `file:${file}`,
    },
  ]);
}

export async function authorizeNewFolder(
  folder: string,
  user: string,
  parent: string,
) {
  return fgaClient.writeTuples([
    {
      user: `user:${user}`,
      relation: "owner",
      object: `folder:${folder}`,
    },
    {
      user: `folder:${parent}`,
      relation: "parent",
      object: `folder:${folder}`,
    },
  ]);
}

export async function authorizeNewSharedFile(file: string, user: string) {
  return fgaClient.writeTuples([
    {
      user: `user:${user}`,
      relation: "viewer",
      object: `file:${file}`,
    },
  ]);
}

export async function authorizeNewSharedFolder(folder: string, user: string) {
  return fgaClient.writeTuples([
    {
      user: `user:${user}`,
      relation: "viewer",
      object: `folder:${folder}`,
    },
  ]);
}

export async function listSharedFiles(user: string) {
  return fgaClient.listObjects({
    user: `user:${user}`,
    relation: "is_shared",
    type: "file",
  });
}
