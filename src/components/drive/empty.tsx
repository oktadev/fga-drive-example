import { TableCell, TableRow } from "@/components/ui/table";
import { DriveTable } from "@/components/drive/table";

export function DriveEmpty() {
  return (
    <DriveTable>
      <TableRow>
        <TableCell>No files</TableCell>
      </TableRow>
    </DriveTable>
  );
}
