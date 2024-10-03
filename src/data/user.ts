import { auth0Client } from "@/helpers/auth0";

export async function getUserId(): Promise<string | undefined> {
  const session = await auth0Client.getSession();

  return session?.user?.sub;
}

export async function getUserDTO(): Promise<{
  sub: string;
  name: string;
  picture: string;
}> {
  const session = await auth0Client.getSession();

  return {
    sub: session?.user?.sub ?? "",
    name: session?.user?.name ?? "",
    picture: session?.user?.picture ?? "",
  };
}
