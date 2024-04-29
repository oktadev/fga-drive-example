import { TableRow, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileIcon } from "@/components/icons";
import { formatBytes } from "@/helpers/file-size";
import { ShareFile } from "@/components/drive/share-file";
import { ReadableStoredFile } from "@/data/files";

export function DriveFile({ file }: { file: ReadableStoredFile }) {
  return (
    <TableRow>
      <TableCell>
        <FileIcon />
      </TableCell>
      <TableCell>
        <Dialog>
          <DialogTrigger>{file?.name}</DialogTrigger>
          <DialogContent className="w-[calc(80vw)] max-w-[calc(80vw)] h-[calc(80vh)]">
            <DialogHeader>
              <DialogTitle>{file?.name}</DialogTitle>
              <DialogDescription>
                Last updated on <strong>{file?.lastmodified}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="relative min-h-full h-[calc(80vh-8rem)] w-[calc(80vw-4rem)]">
              <img
                src={`/api/files/${file?.id}`}
                alt={file?.name}
                className="w-full h-full object-contain"
              />
              {/* Next Image servers the imgaes from a /next folder and this breaks the /file endpoint authorization check */}
              {/* <Image
                  src={`/api/files/${file?.id}`}
                  alt={file?.name}
                  fill
                  style={{ objectFit: "contain" }}
                /> */}
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
      <TableCell>{file?.lastmodified}</TableCell>
      <TableCell>{formatBytes(file?.size)}</TableCell>
      <TableCell>
        <ShareFile file={file} />
      </TableCell>
    </TableRow>
  );
}
