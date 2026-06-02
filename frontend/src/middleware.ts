import { NextResponse, type NextRequest } from "next/server";

const ACCESS_COOKIE = "ilm_access";
const REFRESH_COOKIE = "ilm_refresh";

export function middleware(request: NextRequest) {
  const hasAccess = request.cookies.get(ACCESS_COOKIE)?.value;
  const hasRefresh = request.cookies.get(REFRESH_COOKIE)?.value;
  if (hasAccess || hasRefresh) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname + search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/student/:path*",
    "/instructor/:path*",
    "/admin/:path*",
    "/settings/:path*",
  ],
};
