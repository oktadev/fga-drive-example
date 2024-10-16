import { auth0Client } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith(`/auth`);
  const isNextInternalRoute = request.nextUrl.pathname.startsWith("/_next");

  if (!isAuthRoute && !isNextInternalRoute) {
    const session = await auth0Client.getSession();
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return await auth0Client.middleware(request);
}
