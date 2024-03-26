import "server-only";
import { kv } from "@vercel/kv";

export interface Folder {
  name: string;
  id?: string;
  parent: string;
}

export async function getFolder(id: string) {
  return { ...(await kv.hgetall(`folder:${id}`)), id };
}

export async function getFolders(parent: string) {
  const foldersForFolder = await kv.smembers(`folder-folders:${parent}`);
  const promises: Array<Promise<Folder>> = [];
  foldersForFolder.forEach((folderId) =>
    promises.push(kv.hgetall(`folder:${folderId}`)),
  );

  return (await Promise.all(promises)).map((folder, index) => ({
    ...folder,
    id: foldersForFolder[index],
  }));
}

export async function createFolder(
  folderId: string,
  parent: string,
  folder: Folder,
) {
  await kv.hset(`folder:${folderId}`, { ...folder });
  await kv.sadd(`folder-folders:${parent}`, folderId);
  return await getFolders(parent);
}
