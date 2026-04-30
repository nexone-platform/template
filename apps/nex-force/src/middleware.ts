import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware — replaces Angular's AuthGuard.
 *
 * Separates two authentication domains:
 *   • Desktop (/dashboard/*, /employees/*, etc.) → redirects to /login
 *   • Mobile  (/mobile/*)                       → redirects to /mobile/register-line
 *
 * Uses an `auth-token` cookie set at login time so the middleware
 * (which runs on the Edge/server) can verify authentication status.
 */

// Paths that never require authentication
const PUBLIC_PATHS = [
    "/login",
    "/register",
    "/forgot-password",
    "/mobile/register-line",
];

// Static / framework paths to ignore
function isStaticOrFramework(pathname: string): boolean {
    return (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    );
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Always allow static assets and API routes
    if (isStaticOrFramework(pathname)) {
        return NextResponse.next();
    }

    // 2. Always allow public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 3. Check for auth cookie
    const authToken = request.cookies.get("auth-token")?.value;

    if (authToken) {
        // Authenticated — allow through
        return NextResponse.next();
    }

    // 4. Not authenticated — redirect based on path domain
    if (pathname.startsWith("/mobile")) {
        // Mobile users → Let client-side LiffAuthProvider handle the auth checks
        // and redirects. Server-side redirecting breaks the LIFF initialization
        // because the URL mismatch causes 'Invalid LIFF ID' errors.
        return NextResponse.next();
    }

    // Desktop users → login page
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
