import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

// Public pages that should NOT be treated as short codes
const publicPages = ["/pricing", "/about", "/contact", "/blog", "/terms", "/privacy"];

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  const url = req.nextUrl;

  // Short-code redirect logic: single-segment paths that aren't
  // known routes, API calls, auth pages, or static files
  if (
    url.pathname !== "/" &&
    !url.pathname.startsWith("/api") &&
    !url.pathname.startsWith("/dashboard") &&
    !url.pathname.startsWith("/sign-") &&
    !url.pathname.startsWith("/_next") &&
    !publicPages.includes(url.pathname) &&
    !url.pathname.match(/\.[^/]+$/) // Not a static file
  ) {
    const shortCode = url.pathname.substring(1);

    // Rewrite to the internal redirect API route (which handles DB lookup)
    return NextResponse.rewrite(new URL(`/api/redirect/${shortCode}`, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
