import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Protect /admin and /admin/projects.
 *
 * Login is only available when the user manually visits:
 * /admin/login?value=<ADMIN_LOGIN_SECRET>
 *
 * Never redirect to the secret login URL.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Login page handles its own validation.
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/loginForHarshitBhuju" ||
    pathname.startsWith("/admin/loginForHarshitBhuju/")
  ) {
    return NextResponse.next();
  }

  const isAdminArea =
    pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminArea) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      // Do not reveal the secret login URL.
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};