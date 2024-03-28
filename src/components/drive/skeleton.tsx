import { DriveTable } from "@/components/drive/table";
import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function DriveSkeleton() {
  return (
    <DriveTable>
      <TableRow>
        <TableCell>
          <Skeleton className="w-[20px] h-[20px] rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-[20px] rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-[20px] rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-[20px] rounded-full" />
        </TableCell>
        <TableCell>
          <Skeleton className="w-full h-[20px] rounded-full" />
        </TableCell>
      </TableRow>
    </DriveTable>
  );
}
