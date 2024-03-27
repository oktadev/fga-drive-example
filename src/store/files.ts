import "server-only";

export interface StoredFile {
  name: string;
  lastModified: number;
  fileName: string;
  id: string;
  owner: { name: string; sub: string };
  size: number;
  parent: string;
}

export interface GetFileParams {
  parent?: string;
  subset?: Array<string|undefined>;
}

let store: Array<StoredFile> = [];

export function getFile(id: string): StoredFile | undefined {
  return store.find((file: StoredFile) => file.id === id);
}

export function getFiles(
  params?: GetFileParams,
): Array<StoredFile | undefined> {
  if (params?.subset) {
    return store.filter((file: StoredFile) => params?.subset?.includes(file.id));
  }

  if (params?.parent) {
    return store.filter((file: StoredFile) => file.parent === params.parent);
  }

  return store;
}

export function createFile(file: StoredFile): StoredFile | undefined {
  store = [...store, file];
  return getFile(file.id);
}

export function editFile(
  id: string,
  updatedFile: StoredFile,
): StoredFile | undefined {
  store = store.map((file) => {
    if (id === file.id) {
      return { ...file, ...updatedFile };
    }
    return file;
  });

  return getFile(id);
}

export function deleteFile(id: string): void {
  store = store.filter((file: StoredFile) => file.id !== id);
}
