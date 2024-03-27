import { kv } from "@vercel/kv";

export interface StoredFile {
  name: string;
  fileName: string;
  lastModified: number;
  size: number;
  id?: string;
}

export async function getFileFromStore(id: string) {
  return { ...(await kv.hgetall(`file:${id}`)), id };
}

export async function getFilesFromStore(parent: string) {
  const filesForFolder = await kv.smembers(`folder-files:${parent}`);
  const promises: Array<Promise<StoredFile>> = [];
  filesForFolder.forEach((fileId) =>
    promises.push(kv.hgetall(`file:${fileId}`)),
  );

  return (await Promise.all(promises))?.map((file, index) => {
    if (!!file) {
      return {
        ...file,
        id: filesForFolder[index],
      }
    }
  }).filter(Boolean);;
}

export async function getFilesSubsetFromStore(subset: Array<string>) {
  const promises: Array<Promise<StoredFile>> = [];
  subset.forEach((fileId) => promises.push(kv.hgetall(`file:${fileId}`)));

  return (await Promise.all(promises))?.map((file, index) => {
    if (!!file) {
      return {
        ...file,
        id: subset[index],
      }
    }
  }).filter(Boolean);
}

export async function createFileInStore(
  fileId: string,
  parent: string,
  file: StoredFile,
) {
  await kv.hset(`file:${fileId}`, { ...file });
  await kv.sadd(`folder-files:${parent}`, fileId);
  return await getFilesFromStore(parent);
}
