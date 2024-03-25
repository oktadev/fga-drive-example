'use client';

import Link from "next/link";
import { DriveTable } from "@/components/driveTable";
import { DriveFile } from "@/components/driveFile";
import { Error } from '@/components/error';
import useSWR from "swr";
import { getSharedFiles } from "@/requests/files";
import { DriveEmpty } from "@/components/driveEmpty";
import { DriveSkeleton } from "@/components/driveSkeleton";
import { StoredFile } from "@/store/files";

export default function Shared() {
    const {
        data: files,
        error,
        mutate,
      } = useSWR(`/api/files/shared`, getSharedFiles);
  return (
    <>
        <div className="flex justify-between m-2 bg-slate-100 rounded-lg p-4">
        <h1 className="font-semibold text-2xl align-middle leading-relaxed">
            <Link href="/shared">Shared with me</Link>
        </h1>
        </div>
        <div className="p-2">
            {error && <Error message={error.message} />}
            {files === undefined && <DriveSkeleton />}
            {files?.length === 0 && <DriveEmpty />}
            {files?.length > 0 && <DriveTable>
                {files.map((file: StoredFile) => <DriveFile file={file} />)}
            </DriveTable>}
        </div>
    </>
  );
}
