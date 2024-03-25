import "server-only";
const mock: Array<Folder> = [
  // {
  //   id: "a4d67f8f-d049-4d35-97e2-f00a28e78a1a",
  //   name: "Cats",
  //   owner: {
  //     name: "Sam Bellen",
  //     sub: "google-oauth2|113579922173428537783",
  //   },
  //   parent: "google-oauth2|113579922173428537783",
  // },
  // {
  //   id: "b4d67f8f-d049-4d35-97e2-f00a28e78a1a",
  //   name: "Micio",
  //   owner: {
  //     name: "Sam Bellen",
  //     sub: "google-oauth2|113579922173428537783",
  //   },
  //   parent: "a4d67f8f-d049-4d35-97e2-f00a28e78a1a",
  // },
  // {
  //   id: "x4d67f8f-d049-4d35-97e2-f00a28e78a1a",
  //   name: "Whiskey",
  //   owner: {
  //     name: "Sam Bellen",
  //     sub: "google-oauth2|113579922173428537783",
  //   },
  //   parent: "a4d67f8f-d049-4d35-97e2-f00a28e78a1a",
  // },
];

export interface Folder {
  name: string;
  id: string;
  owner: { name: string; sub: string };
  parent: string;
}

interface GetFolderParams {
  subset: Array<string>;
  parent: String;
}

let store: Array<Folder> = process.env.NODE_ENV !== "production" ? mock : [];

export function getFolder(id: string): Folder | undefined {
  return store.find((folder: Folder) => folder.id === id);
}

export function getFolders(params: GetFolderParams): Array<Folder | undefined> {
  if (params?.subset) {
    return store.filter((folder: Folder) => params?.subset.includes(folder.id));
  }

  if (params?.parent) {
    return store.filter((folder: Folder) => folder?.parent === params?.parent);
  }

  return store;
}

export function createFolder(folder: Folder): Folder | undefined {
  store = [...store, folder];
  return getFolder(folder.id);
}

export function editFolder(
  id: string,
  updatedFolder: Folder,
): Folder | undefined {
  store = store.map((folder) => {
    if (id === folder.id) {
      return { ...folder, ...updatedFolder };
    }
    return folder;
  });

  return getFolder(id);
}

export function deleteFolder(id: string): void {
  store = store.filter((folder: Folder) => folder.id !== id);
}
