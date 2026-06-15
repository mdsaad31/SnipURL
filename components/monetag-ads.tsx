"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

export function MonetagAds() {
  const pathname = usePathname();

  // Define essential pages where ads should NOT be loaded
  const excludedPaths = [
    "/dashboard/settings",
    "/dashboard/account",
    "/sign-in",
    "/sign-up",
    "/termsofservice",
    "/privacystatement",
  ];

  // Helper to determine if we should show ads on the current path
  const shouldShowAds = () => {
    if (!pathname) return false;

    // Exclude API routes and Next.js internals
    if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
      return false;
    }

    // Exclude password challenge/redirect pages
    if (pathname.endsWith("/challenge")) {
      return false;
    }

    // Check if the current path starts with any excluded path
    const isExcluded = excludedPaths.some((path) => pathname.startsWith(path));
    return !isExcluded;
  };

  if (!shouldShowAds()) {
    return null;
  }

  return (
    <>
      {/* Vignette Banner Ad Zone */}
      <Script
        id="monetag-vignette"
        src={"https://" + "n6wxm" + ".com/vignette.min.js"}
        data-zone="11148501"
        strategy="afterInteractive"
      />
      {/* In-Page Push Ad Zone */}
      <Script
        id="monetag-inpage-push"
        src={"https://" + "nap5k" + ".com/tag.min.js"}
        data-zone="11150726"
        strategy="afterInteractive"
      />
    </>
  );
}
