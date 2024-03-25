import "server-only";
const mock: Array<StoredFile> = [
  // {
  //   id: "eedfb3c8-5cd9-4763-ad0e-21eef42461de",
  //   name: "Micio.jpeg",
  //   lastModified: 1710490729147,
  //   fileName: "ac8ba4adc93cb7a69208bc84ed76c36b0724dcb8.jpeg",
  //   owner: {
  //     name: "Sam Bellen",
  //     sub: "google-oauth2|113579922173428537783",
  //   },
  //   size: 213890,
  //   parent: "google-oauth2|113579922173428537783",
  // },
  // {
  //   id: "78822b0a-0922-488d-b996-bd5e18173f39",
  //   name: "Trailrun.jpg",
  //   lastModified: 1710490729156,
  //   fileName: "6b56301831f00b9805d56f555af79a509be90d3d.jpg",
  //   owner: {
  //     name: "Sam Bellen",
  //     sub: "google-oauth2|113579922173428537783",
  //   },
  //   size: 183311,
  //   parent: "google-oauth2|113579922173428537783",
  // },
];

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

let store: Array<StoredFile> =
  process.env.NODE_ENV !== "production" ? mock : [];

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
