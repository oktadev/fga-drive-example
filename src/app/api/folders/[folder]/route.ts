import "server-only";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { getFolder } from "@/store/folders";
import { withFGA } from "@/helpers/fga";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = withApiAuthRequired(async function (request, { params }) {
  try {
    const { user } = await getSession();
    const folder = getFolder(params?.folder);

    return withFGA(
      () => {
        try {
          if (params?.folder === user?.sub) {
            return new NextResponse(JSON.stringify({}), { status: 200 });
          }
          return new NextResponse(JSON.stringify(folder), { status: 200 });
        } catch (error) {
          return new NextResponse(`Error: ${error}`, {
            status: 500,
          });
        }
      },
      {
        user: `user:${user.sub}`,
        object: `folder:${params?.folder}`,
        relation: "can_view",
      },
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
