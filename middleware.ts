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

    // Skip paths with multiple segments (e.g. /abc/challenge)
    if (shortCode.includes("/")) {
      return NextResponse.next();
    }

    const rewriteUrl = new URL(`/api/redirect/${shortCode}`, req.url);
    const response = NextResponse.rewrite(rewriteUrl);

    // Forward geo information to the API route via headers.
    // These are available in middleware on Vercel and edge runtimes.
    const geo = req.geo;
    if (geo?.country) {
      response.headers.set("x-geo-country", geo.country);
    }
    if (geo?.city) {
      response.headers.set("x-geo-city", geo.city);
    }

    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
