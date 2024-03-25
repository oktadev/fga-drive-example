import { ShareFile } from "@/requests/share";
import { StoredFile } from "@/store/files";
import { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog";
import { FileIcon, ShareIcon } from "@/components/icons";
import Image from "next/image";
import { formatBytes } from "@/helpers/fileSize";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function DriveFile({ file }: { file: StoredFile }) {
    const [shareEmail, setShareEmail] = useState("");
    const [shareError, setShareError] = useState();
  
    function handleShareEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
      setShareEmail(event.target.value);
    }
  
    async function handleShare(fileId: string) {
      const response = await ShareFile(fileId, shareEmail);
  
      if (response.ok) {
        setShareEmail("");
        setShareError(undefined);
      } else {
        setShareError(await response.text());
      }
    }
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
                  Last updated by <strong>{file?.owner?.name}</strong> on{" "}
                  <strong>
                    {new Date(file?.lastModified).toLocaleTimeString()} -{" "}
                    {new Date(file?.lastModified).toLocaleDateString()}
                  </strong>
                  .
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
        <TableCell>{file?.owner?.name}</TableCell>
        <TableCell>
          {new Date(file?.lastModified).toLocaleTimeString()} -{" "}
          {new Date(file?.lastModified).toLocaleDateString()}
        </TableCell>
        <TableCell>{formatBytes(file?.size)}</TableCell>
        <TableCell>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <ShareIcon />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  Share <strong>{file?.name}</strong>
                </DialogTitle>
                <DialogDescription>
                  Share {file?.name} with other people in your network.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {shareError && (
                  <Error message={shareError} />
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    className="col-span-3"
                    value={shareEmail}
                    onChange={handleShareEmailChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => handleShare(file.id)}>
                  Share
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  }