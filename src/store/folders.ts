import { kv } from "@vercel/kv";

export interface Folder {
  name: string;
  id?: string;
  parent: string;
}

export async function getFolderFromStore(id: string): Promise<Folder> {
  return { ...(await kv.hgetall(`folder:${id}`)), id } as Folder;
}

export async function getFoldersFromStore(
  parent: string,
): Promise<Array<Folder>> {
  const foldersForFolder = await kv.smembers(`folder-folders:${parent}`);
  const promises: Array<Promise<Record<string, unknown> | null>> = [];
  foldersForFolder.forEach((folderId) =>
    promises.push(kv.hgetall(`folder:${folderId}`)),
  );

  return (await Promise.all(promises)).map(
    (folder: Record<string, unknown> | null, index: number) => ({
      ...folder,
      id: foldersForFolder[index],
    }),
  ) as Array<Folder>;
}

export async function createFolderInStore(
  folderId: string,
  parent: string,
  folder: Folder,
) {
  await kv.hset(`folder:${folderId}`, { ...folder });
  await kv.sadd(`folder-folders:${parent}`, folderId);
  return await getFolderFromStore(parent);
}
