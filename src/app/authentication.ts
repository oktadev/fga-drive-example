import "server-only";
import { getSession } from "@auth0/nextjs-auth0";

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();

  return !!session;
}
