"use server";
import { getSession } from "@auth0/nextjs-auth0";

export async function getUserId() {
  const { user } = await getSession();

  return user?.sub;
}

export async function getUserDTO() {
  const { user } = await getSession();

  return {
    sub: user?.sub,
    name: user?.name,
    picture: user?.picture,
  };
}
