import "server-only";
import { withFGA } from "@/helpers/fga";
import { getFile } from "@/store/files";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { readFile } from "fs/promises";
import mime from "mime";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = withApiAuthRequired(async function (request, { params }) {
  try {
    const { user } = await getSession();
    const fileId = params?.file;

    return withFGA(
      async () => {
        try {
          const file = getFile(params?.file);
          const filePath = `${process.cwd()}/upload/${file?.fileName}`;
          const mimeType = mime.getType(filePath);
          const data = await readFile(filePath);
          return new NextResponse(data, {
            headers: { "content-type": mimeType ?? "text/plain" },
          });
        } catch (error) {
          return new NextResponse(`Error: ${error}`, {
            status: 500,
          });
        }
      },
      {
        user: `user:${user?.sub}`,
        relation: "can_view",
        object: `file:${fileId}`,
      },
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
