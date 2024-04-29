import "server-only";
import * as db from "./index";

export interface Folder {
  name: string;
  id?: string;
  parent: string;
}

export async function getFolderFromDB(id: string): Promise<Folder> {
  const result = await db.query("SELECT * FROM folders WHERE id = $1", [id]);
  return result?.rows[0];
}

export async function getFoldersFromDB(parent: string): Promise<Array<Folder>> {
  const result = await db.query("SELECT * FROM folders WHERE parent = $1", [
    parent,
  ]);
  return result?.rows;
}

export async function createFolderInDB(
  folderId: string,
  parent: string,
  folder: Folder,
) {
  await db.query(
    "INSERT INTO folders(id, name, parent) VALUES($1, $2, $3)   ",
    [folderId, folder?.name, parent],
  );
  return await getFoldersFromDB(parent);
}
