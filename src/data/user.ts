import { getSession } from "@auth0/nextjs-auth0";

export async function getUserId(): Promise<string> {
  const session = await getSession();

  return session?.user?.sub;
}

export async function getUserDTO(): Promise<{sub: string, name: string, picture: string}> {
  const session = await getSession();

  return {
    sub: session?.user?.sub,
    name: session?.user?.name,
    picture: session?.user?.picture,
  };
}
