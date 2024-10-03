import "server-only";
import { readFile } from "fs/promises";
import mime from "mime";
import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/app/actions";
import { fgaClient } from "@/app/authorization";
import { auth0Client } from "@/helpers/auth0";

export const dynamic = "force-dynamic";
export const GET = async function (
  request: NextRequest,
  { params }: { params: { file: string } }
) {
  try {
    const session = await auth0Client.getSession();
    const fileId = params?.file;

    // If we're allowed to see the file, return it
    const { allowed } = await fgaClient.check({
      user: `user:${session?.user?.sub}`,
      relation: "can_view",
      object: `file:${fileId}`,
    });

    if (allowed) {
      const { file, error } = await getFile(params?.file);

      if (file) {
        const filePath = `${process.cwd()}/upload/${file?.fileName}`;
        const mimeType = mime.getType(filePath);
        const data = await readFile(filePath);
        return new NextResponse(data, {
          headers: { "content-type": mimeType ?? "text/plain" },
        });
      }
      return new NextResponse(`Error: ${error}`, {
        status: 500,
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
