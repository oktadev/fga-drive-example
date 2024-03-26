import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { FolderIcon } from "@/components/icons";
import { Folder } from "@/store/folders";
import Link from "next/link";
import { ShareFolder } from "@/components/drive/share-folder";
export function DriveFolder({ folder }: { folder: Folder }) {
  return (
    <TableRow>
      <TableCell>
        <FolderIcon />
      </TableCell>
      <TableCell>
        <Link href={`/folder/${folder?.id}`}>{folder?.name}</Link>
      </TableCell>
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        <ShareFolder folder={folder} />
      </TableCell>
    </TableRow>
  );
}
