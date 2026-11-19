import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/session";

/**
 * Edge-safe routing guard. It only checks whether a session cookie is present
 * and reads the unverified "role" claim for redirect purposes. The real
 * verification happens server-side in `getCurrentUser` (Node runtime) and in
 * Firestore security rules — this middleware is UX routing only, not auth.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  const isAdminRoute = pathname.startsWith("/admin");
  const isUsuariaRoute =
    pathname.startsWith("/dia") || pathname.startsWith("/progreso");

  if (!sessionCookie && (isAdminRoute || isUsuariaRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dia/:path*", "/progreso/:path*"],
};
