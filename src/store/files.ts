import { kv } from "@vercel/kv";

export interface StoredFile {
  name: string;
  fileName: string;
  lastModified: number;
  size: number;
  id?: string;
}

export async function getFileFromStore(id: string): Promise<StoredFile> {
  return { ...(await kv.hgetall(`file:${id}`)), id } as StoredFile;
}

export async function getFilesFromStore(parent: string): Promise<Array<StoredFile>> {
  const filesForFolder = await kv.smembers(`folder-files:${parent}`);
  const promises: Array<Promise<Record<string, unknown> | null>> = [];
  filesForFolder.forEach((fileId) =>
    promises.push(kv.hgetall(`file:${fileId}`)),
  );

  return (await Promise.all(promises))
    ?.map((file, index) => {
      if (!!file) {
        return {
          ...file,
          id: filesForFolder[index],
        };
      }
    })
    .filter(Boolean) as Array<StoredFile>;
}

export async function getFilesSubsetFromStore(subset: Array<string>): Promise<Array<StoredFile>> {
  const promises: Array<Promise<Record<string, unknown> | null>> = [];
  subset.forEach((fileId) => promises.push(kv.hgetall(`file:${fileId}`)));

  return (await Promise.all(promises))
    ?.map((file, index) => {
      if (!!file) {
        return {
          ...file,
          id: subset[index],
        };
      }
    })
    .filter(Boolean) as Array<StoredFile>;
}

export async function createFileInStore(
  fileId: string,
  parent: string,
  file: StoredFile,
): Promise<Array<StoredFile>> {
  await kv.hset(`file:${fileId}`, { ...file });
  await kv.sadd(`folder-files:${parent}`, fileId);
  return await getFilesFromStore(parent);
}
