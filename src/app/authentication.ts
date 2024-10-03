import "server-only";
import { auth0Client } from "@/helpers/auth0";

export async function isAuthenticated(): Promise<boolean> {
  const session = await auth0Client.getSession();

  return !!session;
}
