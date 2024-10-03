import { auth0Client } from "@/helpers/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const isAuthRoute = req.nextUrl.pathname.startsWith(`/auth`);
  const isNextInternalRoute = req.nextUrl.pathname.startsWith("/_next");

  if (!isAuthRoute && !isNextInternalRoute) {
    const session = await auth0Client.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  const auth0Handler = await auth0Client.handler();
  return auth0Handler(req);
}
