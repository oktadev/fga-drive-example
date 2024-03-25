import "server-only";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { createFolder, getFolders } from "@/store/folders";
import { fgaClient, stripObjectName, withFGA } from "@/helpers/fga";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";
export const GET = withApiAuthRequired(async function (request: NextRequest) {
  try {
    const { user } = await getSession();
    const parent = request.nextUrl.searchParams.get("parent") || user?.sub;
    return withFGA(
      async (request) => {
        try {
          const folders = getFolders({ parent });
          const { responses: fgaResponses } = await fgaClient.batchCheck(
            folders.map((folder) => {
              return {
                user: `user:${user.sub}`,
                object: `folder:${folder?.id}`,
                relation: "can_view",
              };
            }),
          );
          const filteredFolders = fgaResponses
            .map((check) =>
              check.allowed
                ? folders.find(
                    (folder) =>
                      folder?.id === stripObjectName(check._request.object),
                  )
                : undefined,
            )
            .filter(Boolean);
          return new NextResponse(JSON.stringify(filteredFolders), {
            status: 200,
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
        object: `folder:${parent}`,
      },
      request,
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});

export const POST = withApiAuthRequired(async function (request: NextRequest) {
  try {
    const { user } = await getSession();
    const body = await request.json();
    return withFGA(
      async () => {
        try {
          const folderId = uuidv4();
          createFolder({
            id: folderId,
            name: body?.name,
            owner: {
              name: user?.name,
              sub: user?.sub,
            },
            parent: body?.parent,
          });
          await fgaClient.writeTuples([
            {
              user: `user:${user.sub}`,
              relation: "owner",
              object: `folder:${folderId}`,
            },
            {
              user: `folder:${body?.parent}`,
              relation: "parent",
              object: `folder:${folderId}`,
            },
          ]);
          return new NextResponse("ok", {
            status: 200,
          });
        } catch (error) {
          return new NextResponse(`${error}`, {
            status: 500,
          });
        }
      },
      {
        user: `user:${user.sub}`,
        object: `folder:${body.parent}`,
        relation: "can_create_folder",
      },
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
