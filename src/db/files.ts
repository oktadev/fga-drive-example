import "server-only";
import * as db from "./index";

export interface StoredFile {
  name: string;
  filename: string;
  lastmodified: number;
  size: number;
  id?: string;
}

export async function getFileFromDB(id: string): Promise<StoredFile> {
  const result = await db.query("SELECT * FROM files WHERE id = $1", [id]);
  return result?.rows[0];
}

export async function getFilesFromDB(
  parent: string,
): Promise<Array<StoredFile>> {
  const result = await db.query("SELECT * FROM files WHERE parent = $1", [
    parent,
  ]);
  return result?.rows;
}

export async function getFilesSubsetFromDB(
  subset: Array<string>,
): Promise<Array<StoredFile>> {
  const result = await db.query(
    `SELECT * FROM files WHERE id in (${subset.map((id) => `'${id}'`).join(",")})`,
    [],
  );
  return result?.rows;
}

export async function createFileInDB(
  fileId: string,
  parent: string,
  file: StoredFile,
): Promise<Array<StoredFile>> {
  await db.query(
    "INSERT INTO files(id, name, filename, lastmodified, size, parent) VALUES($1, $2, $3, $4, $5, $6)   ",
    [
      fileId,
      file?.name,
      file?.filename,
      file?.lastmodified,
      file?.size,
      parent,
    ],
  );
  return await getFilesFromDB(parent);
}
