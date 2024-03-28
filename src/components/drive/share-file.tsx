import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Error } from "@/components/error";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShareIcon } from "@/components/icons";
import { useState } from "react";
import { StoredFile } from "@/store/files";
import { useToast } from "@/components/ui/use-toast";
import { shareFileDTO } from "@/data/files";

export function ShareFile({ file }: { file: StoredFile}) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>) {
    setEmail(event.target.value);
  }

  async function handleShare(fileId: string) {
    const { file: sharedFile, error } = await shareFileDTO(fileId, email);

    if (sharedFile) {
      toast({
        title: "File shared",
        description: `The file ${file?.name} has been shared with ${email}!`,
      });
    }

    if (error) {
      toast({
        title: "Something went wrong sharing the file",
        description: JSON.stringify(error),
        variant: "destructive",
      });
    }
  }
  return (
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              className="col-span-3"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={() => handleShare(file.id)}>
              Share
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
