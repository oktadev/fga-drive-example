import "server-only";
import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";
import { NextRequest, NextResponse } from "next/server";
import { CheckRequestTupleKey } from "@openfga/sdk";

export const fgaClient = new OpenFgaClient({
  apiUrl: process.env.FGA_API_URL,
  storeId: process.env.FGA_STORE_ID,
  authorizationModelId: process.env.FGA_AUTHORIZATION_MODEL_ID,
  credentials: {
    method: CredentialsMethod.ClientCredentials,
    config: {
      apiTokenIssuer: process.env.FGA_API_TOKEN_ISSUER as string,
      apiAudience: process.env.FGA_API_AUDIENCE as string,
      clientId: process.env.FGA_CLIENT_ID as string,
      clientSecret: process.env.FGA_CLIENT_SECRET as string,
    },
  },
});

export type FGARouteHandler = () => Promise<NextResponse<unknown>> | NextResponse<unknown>;
export async function withFGA(
  routeHandler: FGARouteHandler,
  check: CheckRequestTupleKey,
): Promise<NextResponse<unknown>> {
  const permissionCheck = await fgaClient.check(check);

  if (permissionCheck?.allowed) {
    return await routeHandler();
  }

  return new NextResponse("forbidden", {
    status: 403,
  });
}

export async function setupRootFolder(userId: string) {
  const response = await fgaClient.check({
    user: `user:${userId}`,
    relation: "owner",
    object: `folder:${userId}`,
  });

  if (!response.allowed) {
    fgaClient.writeTuples([
      {
        user: `user:${userId}`,
        relation: "owner",
        object: `folder:${userId}`,
      },
    ]);
  }
}

export function stripObjectName(object: string): string | undefined {
  const id = object.match(/(?<=:).*/g);
  return id ? id[0] : undefined;
}
