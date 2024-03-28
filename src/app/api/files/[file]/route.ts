import "server-only";
import { getFileFromStore } from "@/store/files";
import { getSession } from "@auth0/nextjs-auth0";
import { readFile } from "fs/promises";
import mime from "mime";
import { NextRequest, NextResponse } from "next/server";
import { canViewFile } from "@/app/authorization";

export const dynamic = "force-dynamic";
export const GET = async function (
  request: NextRequest,
  { params }: { params: { file: string } },
) {
  try {
    const session = await getSession();
    const user = session?.user;
    const fileId = params?.file;

    // If we're allowed to see the file, return it
    if (await canViewFile(user?.sub, fileId)) {
      const file = await getFileFromStore(params?.file);
      const filePath = `${process.cwd()}/upload/${file?.fileName}`;
      const mimeType = mime.getType(filePath);
      const data = await readFile(filePath);
      return new NextResponse(data, {
        headers: { "content-type": mimeType ?? "text/plain" },
      });
    }

    // We're not allowed to see the file, returen a 403, forbidden error
    return new NextResponse("Forbidden", {
      status: 403,
    });
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
};
