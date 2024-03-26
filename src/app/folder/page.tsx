import Navigation from "@/components/navigation";
import Drive from "@/components/drive/drive";
import Header from "@/components/header";
import { getUserId } from "@/data/user";
import { getAllFilesForParentDTO } from "@/data/files";
import { getAllFoldersForParentDTO, getFolderDTO } from "@/data/folders";
import { DriveHeader } from "@/components/drive/header";
import { Error } from "@/components/error";

export const dynamic = "force-dynamic";
export default async function () {
  const userId = await getUserId();
  const parent = userId; // If we're in the root folder, the parent folder is the user's ID
  const { files, error: filesError } = await getAllFilesForParentDTO(parent);
  const { folders, error: foldersError } =
    await getAllFoldersForParentDTO(parent);
  const { folder: currentFolder, error: currentFolderErrror } =
    await getFolderDTO(parent);

  return (
    <div className="flex min-h-screen w-full bg-gray-100/40 dark:bg-gray-800/40">
      <Navigation current="folder" />
      <div className="flex-1 flex flex-col min-h-0">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          {!!filesError && <Error message={JSON.stringify(filesError)}></Error>}
          {!!foldersError && (
            <Error message={JSON.stringify(foldersError)}></Error>
          )}
          {!!currentFolderErrror && (
            <Error message={JSON.stringify(currentFolderErrror)}></Error>
          )}

          <DriveHeader parent={currentFolder.id} />
          <Drive files={files} folders={folders} folder={currentFolder} />
        </main>
      </div>
    </div>
  );
};
