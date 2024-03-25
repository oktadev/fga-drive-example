import "server-only";
import { createFile, StoredFile, getFiles } from "@/store/files";
import { getFileHash } from "@/helpers/hash";
import { Hash } from "crypto";
import { writeFile } from "fs/promises";
import { extname } from "path";
import { v4 as uuidv4 } from "uuid";
import { withApiAuthRequired, getSession } from "@auth0/nextjs-auth0";
import { fgaClient, stripObjectName, withFGA } from "@/helpers/fga";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const GET = withApiAuthRequired(async function (request: NextRequest) {
  try {
    const { user } = await getSession();
    const parent = request.nextUrl.searchParams.get("parent") || user?.sub;
    return withFGA(
      async () => {
        try {
          const files = getFiles({ parent });
          const { responses: fgaResponses } = await fgaClient.batchCheck(
            files.map((file) => {
              return {
                user: `user:${user.sub}`,
                object: `file:${file?.id}`,
                relation: "can_view",
              };
            }),
          );
          const filteredFiles = fgaResponses
            .map((check) =>
              check.allowed
                ? files.find(
                    (file) =>
                      file?.id === stripObjectName(check._request.object),
                  )
                : undefined,
            )
            .filter(Boolean);
          return new NextResponse(JSON.stringify(filteredFiles), {
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
    const parent = request.nextUrl.searchParams.get("parent") || user?.sub;
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return new NextResponse(JSON.stringify({ success: false }), {
        status: 200,
      });
    }

    return withFGA(
      async (request) => {
        try {
          const fileBytes: ArrayBuffer = await file.arrayBuffer();
          const fileBuffer: Buffer = Buffer.from(fileBytes);
          const fileID = uuidv4();
          const fileHash: Hash = getFileHash(fileBuffer);
          const fileExtension: string = extname(file.name);
          const filePath: string = `${process.cwd()}/upload/${fileHash.toString()}${fileExtension}`;
          const fileSize: number = Buffer.byteLength(fileBuffer);
          const uploadedFile: StoredFile = {
            id: fileID,
            name: file.name,
            lastModified: file.lastModified,
            fileName: `${fileHash}${fileExtension}`,
            owner: { sub: user.sub, name: user.name },
            size: fileSize,
            parent: parent,
          };

          await writeFile(filePath, fileBuffer);
          await fgaClient.writeTuples([
            {
              user: `user:${user.sub}`,
              relation: "owner",
              object: `file:${fileID}`,
            },
            {
              user: `folder:${parent}`,
              relation: "parent",
              object: `file:${fileID}`,
            },
          ]);
          createFile(uploadedFile);
          return new NextResponse(JSON.stringify(uploadedFile), {
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
        relation: "can_create_file",
        object: `folder:${parent}`,
      },
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
