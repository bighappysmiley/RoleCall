import { NextRequest, NextResponse } from "next/server";
import { getAuth, isAuthConfigured } from "@/lib/auth/server";

export default async function proxy(request: NextRequest) {
  if (!isAuthConfigured()) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  return getAuth().middleware({ loginUrl: "/login" })(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
  ],
};
