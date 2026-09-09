import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, hasAdminCredentials, verifyAdminSession } from "./lib/admin-auth";

export async function proxy(request: NextRequest) {
  if (!hasAdminCredentials()) return new Response("Admin access is not configured.", { status: 503 });

  const pathname = request.nextUrl.pathname;
  const isPublicAdminRoute = pathname === "/admin/login" || pathname === "/admin/auth";
  const isLogoutRoute = pathname === "/admin/logout";
  const isAuthenticated = await verifyAdminSession(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (isPublicAdminRoute) {
    if (isAuthenticated && pathname === "/admin/login") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next();
  }

  if (!isAuthenticated && !isLogoutRoute) return NextResponse.redirect(new URL("/admin/login", request.url));

  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
