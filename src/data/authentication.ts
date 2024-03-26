"use server";
import { getSession } from "@auth0/nextjs-auth0";

export async function isAuthenticated() {
  const session = await getSession();

  return !!session;
}
