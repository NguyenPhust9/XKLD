import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, adminCookieOptions, createAdminSession, isValidAdminLogin } from "../../../lib/admin-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isValidAdminLogin(username, password)) return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  const token = await createAdminSession();
  if (!token) return NextResponse.redirect(new URL("/admin/login?error=config", request.url), 303);

  const response = NextResponse.redirect(new URL("/admin", request.url), 303);
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminCookieOptions);
  return response;
}
