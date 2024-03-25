import { fgaClient, stripObjectName } from "@/helpers/fga";
import { getFiles } from "@/store/files";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = withApiAuthRequired(async function (request: NextRequest) {
  try {
    const { user } = await getSession();

    try {
      const sharedFiles = await fgaClient.listObjects({
        user: `user:${user?.sub}`,
        relation: "is_shared",
        type: "file",
      });
      const files = getFiles({
        subset: sharedFiles?.objects?.map((file) => stripObjectName(file)),
      });

      return new NextResponse(JSON.stringify(files), {
        status: 200,
      });
    } catch (error) {
      return new NextResponse(`Error: ${error}`, {
        status: 500,
      });
    }
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
