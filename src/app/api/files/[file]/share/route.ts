import "server-only";
import { auth0ManagementClient } from "@/helpers/auth0Management";
import { fgaClient, withFGA } from "@/helpers/fga";
import { getSession, withApiAuthRequired } from "@auth0/nextjs-auth0";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const POST = withApiAuthRequired(async function (request, { params }) {
  try {
    const { user } = await getSession();

    return await withFGA(
      async () => {
        try {
          const { email } = await request.json();
          const users = await auth0ManagementClient.usersByEmail.getByEmail({
            email,
            fields: "user_id",
          });

          if (users.data.length > 0) {
            await fgaClient.writeTuples([
              {
                user: `user:${users.data[0].user_id}`,
                relation: "viewer",
                object: `file:${params.file}`,
              },
            ]);
            return new NextResponse("ok", {
              status: 200,
            });
          }

          return new NextResponse(
            "A user with this email address does not exist",
            {
              status: 400,
            },
          );
        } catch (error) {
          return new NextResponse(`Error: ${error}`, {
            status: 500,
          });
        }
      },
      {
        user: `user:${user?.sub}`,
        relation: "can_share",
        object: `file:${params?.file}`,
      },
    );
  } catch (error) {
    return new NextResponse(`Error: ${error}`, {
      status: 500,
    });
  }
});
