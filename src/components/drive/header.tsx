"use client";

import { AddFolderIcon, ChevronRightIcon } from "@/components/icons";
import Link from "next/link";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { createFolder } from "@/app/actions";

export function DriveHeader({
  name,
  parent,
  title,
}: {
  name?: string | null;
  parent?: string | null;
  title?: string | null;
}) {
  const { toast } = useToast();
  const [newFolderName, setNewFolderName] = useState("");
  function handleChangeNewFolderName(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setNewFolderName(event.target.value);
  }

  async function handleCreateFolder() {
    if (!!parent) {
      const { folder, error } = await createFolder(parent, newFolderName);

      if (folder) {
        toast({
          title: "Folder created",
          description: `The folder ${newFolderName} has been created successfully!`,
        });
      }

      if (error) {
        toast({
          title: "Something went wrong creating the new folder",
          description: JSON.stringify(error),
          variant: "destructive",
        });
      }
    }
  }
  return (
    <div className="flex justify-between m-2 bg-slate-100 rounded-lg p-4">
      <h1 className="font-semibold text-2xl align-middle leading-relaxed">
        <Link href="/folder">{title ? title : "My Drive"}</Link>
        {name && (
          <>
            <ChevronRightIcon className="inline-block" />{" "}
            <span className="font-normal">{name}</span>
          </>
        )}
      </h1>

      {parent && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new folder</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
              <DialogClose asChild>
                <Button onClick={handleCreateFolder}>Create folder</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
          <DialogTrigger asChild>
            <Button variant="outline">
              <AddFolderIcon className="mr-2" /> Add Folder
            </Button>
          </DialogTrigger>
        </Dialog>
      )}
    </div>
  );
}
