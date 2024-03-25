"use client";

import useSWR from "swr";
import { useDropzone } from "react-dropzone";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AddFolderIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
} from "@/components/icons";
import { getAllFiles } from "@/requests/files";
import { useCallback, useState } from "react";
import { upload } from "@/requests/upload";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { getFolder, getAllFolders, createFolder } from "@/requests/folders";
import Link from "next/link";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Error } from "@/components/error";
import { DriveSkeleton } from "@/components/driveSkeleton";
import { DriveEmpty } from "@/components/driveEmpty";
import { DriveTable } from "@/components/driveTable";
import { DriveFolder } from "@/components/driveFolder";
import { DriveFile } from "@/components/driveFile";
import { StoredFile } from "@/store/files";

export default function Drive({ folder }: { folder: string }) {
  const { user } = useUser();
  const {
    data: files,
    error: fileError,
    mutate: mutateFile,
  } = useSWR(`/api/files?parent=${folder}`, getAllFiles);
  const {
    data: folders,
    error: folderError,
    mutate: mutateFolders,
  } = useSWR(`/api/folders?parent=${folder}`, getAllFolders);
  const { data: folderData } = useSWR(`/api/folders/${folder}`, getFolder);
  const [newFolderName, setNewFolderName] = useState("");
  const [createFolderError, setCreateFolderError] = useState();
  function handleChangeNewFolderName(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setNewFolderName(event.target.value);
  }
  async function handleCreateFolder() {
    const response = await createFolder(folder, newFolderName);

    if (response.ok) {
      mutateFolders();
      setNewFolderName("");
      setCreateFolderError(undefined);
    } else {
      setCreateFolderError(await response.text());
    }
  }

  const onDrop = useCallback(
    (newFiles: Array<File>) => {
      const promisses: Array<Promise<StoredFile>> = [];
      newFiles.forEach(async (newFile: File) => {
        promisses.push(upload(folder, newFile));
      });
      Promise.all(promisses).then((uploadedFiles) => {
        mutateFile([...files, ...uploadedFiles], { revalidate: false }); // Dont revalidate immediately, Okta FGA has a 20sec cache, so the changes are not instantly reflected
      })
    },
    [files, mutateFile, folder],
  );

  return (
    <>
      <div className="flex justify-between m-2 bg-slate-100 rounded-lg p-4">
        <h1 className="font-semibold text-2xl align-middle leading-relaxed">
          <Link href="/folder">My Drive</Link>
          {folder !== user?.sub && (
            <>
              <ChevronRightIcon className="inline-block" />{" "}
              <span className="font-normal">
                {folderData === undefined ? "..." : folderData?.name}
              </span>
            </>
          )}
        </h1>
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {createFolderError && (
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Oops, something went wrong!</AlertTitle>
                  <AlertDescription>{createFolderError}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Folder Name
                </Label>
                <Input
                  id="email"
                  className="col-span-3"
                  value={newFolderName}
                  onChange={handleChangeNewFolderName}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateFolder}>Create folder</Button>
            </DialogFooter>
          </DialogContent>
          <DialogTrigger asChild>
            <Button variant="outline">
              <AddFolderIcon className="mr-2" /> Add Folder
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
      <DropZone onDrop={onDrop}>
        {fileError && <Error message={fileError.message} />}
        {folderError && <Error message={folderError.message} />}
        {files && folders === undefined && <DriveSkeleton />}
        {files?.length === 0 && folders?.length === 0 && <DriveEmpty />}
        {(files?.length > 0 || folders?.length > 0) && (
          <DriveTable>
          {folders?.map((folder) => {
            return <DriveFolder folder={folder} key={folder?.id} />;
          })}
          {files?.map((file) => {
            return <DriveFile file={file} key={file?.id} />;
          })}
        </DriveTable>
        )}
      </DropZone>
    </>
  );
}

export function DropZone({ children, onDrop }: { children: React.ReactNode }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    onDrop,
    accept: {
      "image/*": [".png", ".gif", ".jpeg", ".jpg"],
    },
  });

  return (
    <div
      {...getRootProps({
        className: `dropzone min-h-[calc(100%-4rem)] border-8 border-transparent border-dashed rounded-lg ${
          isDragActive ? "!border-slate-200" : ""
        }`,
      })}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
}
