"use client";

import Link from "next/link";
import { Scissors } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="w-full max-w-[680px] mx-auto flex items-center justify-between py-6 px-4 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <Link href="/" className="flex items-center gap-2">
        <Scissors className="w-5 h-5 text-primary" strokeWidth={2.5} />
        <span className="font-sans font-semibold text-text-primary text-xl tracking-tight">
          Snip
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
        <Link
          href="#features"
          className="hover:text-primary transition-colors"
        >
          Features
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {isSignedIn ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors mr-2"
            >
              Dashboard
            </Link>
            <UserButton
              appearance={{
                elements: { userButtonAvatarBox: "w-8 h-8" },
              }}
            />
          </>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors hidden sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2.5 rounded-btn transition-colors"
            >
              Get started free
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
