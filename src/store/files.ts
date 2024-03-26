import "server-only";
import { kv } from "@vercel/kv";

export interface StoredFile {
  name: string;
  fileName: string;
  lastModified: number;
  size: number;
  id?: string;
}

export async function getFile(id: string) {
  return { ...(await kv.hgetall(`file:${id}`)), id };
}

export async function getFiles(parent: string) {
  const filesForFolder = await kv.smembers(`folder-files:${parent}`);
  const promises: Array<Promise<StoredFile>> = [];
  filesForFolder.forEach((fileId) =>
    promises.push(kv.hgetall(`file:${fileId}`)),
  );

  return (await Promise.all(promises)).map((file, index) => ({
    ...file,
    id: filesForFolder[index],
  }));
}

export async function getFilesSubset(subset: Array<string>) {
  const promises: Array<Promise<StoredFile>> = [];
  subset.forEach((fileId) => promises.push(kv.hgetall(`file:${fileId}`)));

  return (await Promise.all(promises)).map((file, index) => ({
    ...file,
    id: subset[index],
  }));
}

export async function createFile(
  fileId: string,
  parent: string,
  file: StoredFile,
) {
  await kv.hset(`file:${fileId}`, { ...file });
  await kv.sadd(`folder-files:${parent}`, fileId);
  return await getFiles(parent);
}
