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
import { FolderIcon, ShareIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Folder } from "@/store/folders";
import { ShareFolder } from "@/requests/share";
import Link from "next/link";
export function DriveFolder({ folder }: { folder: Folder }) {
    const [shareEmail, setShareEmail] = useState("");
    const [shareError, setShareError] = useState();
  
    function handleShareEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
      console.log(event);
      setShareEmail(event.target.value);
    }
  
    async function handleShare(folderId: string) {
      const response = await ShareFolder(folderId, shareEmail);
  
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
          <FolderIcon />
        </TableCell>
        <TableCell>
          <Link href={`/folder/${folder?.id}`}>{folder?.name}</Link>
        </TableCell>
        <TableCell>{folder?.owner?.name}</TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
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
                  Share <strong>{folder?.name}</strong>
                </DialogTitle>
                <DialogDescription>
                  Share folder: {folder?.name} with other people in your network.
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
                <Button type="submit" onClick={() => handleShare(folder.id)}>
                  Share
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TableCell>
      </TableRow>
    );
  }