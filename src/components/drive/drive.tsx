"use client";

import { useDropzone } from "react-dropzone";
import { useToast } from "@/components/ui/use-toast";
import { useCallback } from "react";
import { DriveSkeleton } from "@/components/drive/skeleton";
import { DriveEmpty } from "@/components/drive/empty";
import { DriveTable } from "@/components/drive/table";
import { DriveFolder } from "@/components/drive/folder";
import { DriveFile } from "@/components/drive/file";
import { Folder } from "@/db/folders";
import { ReadableStoredFile } from "@/data/files";
import { uploadFile } from "@/app/actions";

export interface DriveProps {
  files: Array<ReadableStoredFile> | undefined;
  folders?: Array<Folder | undefined>;
  folder?: { id: string; name?: string | null } | undefined;
  droppable?: boolean;
}

export default function Drive({
  files = [],
  folders = [],
  folder,
  droppable = true,
}: DriveProps) {
  const { toast } = useToast();
  const onDrop = useCallback(
    async (newFiles: Array<File>) => {
      for (const file of newFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const { file: uploadedFile, error } = await uploadFile(
          folder?.id as string,
          formData,
        );

        if (uploadedFile) {
          toast({
            title: "File upload complete!",
            description: `The file ${uploadedFile?.name} has been successfully uploaded`,
          });
        }

        if (error) {
          toast({
            title: "Something went wrong uploading the file",
            description: JSON.stringify(error),
            variant: "destructive",
          });
        }
      }
    },
    [folder, toast],
  );

  if (droppable) {
    return (
      <DropZone onDrop={onDrop}>
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
    );
  }

  return (
    <div className="p-2">
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
    </div>
  );
}

export function DropZone({
  children,
  onDrop,
}: {
  children: React.ReactNode;
  onDrop: (newFiles: Array<File>) => void;
}) {
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
