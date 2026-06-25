"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X } from "lucide-react";
import { useAuth, UserButton } from "@clerk/nextjs";

export function Navbar() {
  const { isSignedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="w-full sticky top-0 bg-background/90 backdrop-blur-md z-50 border-b border-transparent [&.scrolled]:border-border transition-colors">
      <div className="max-w-[1100px] mx-auto flex items-center justify-between py-4 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-sans font-bold text-text-primary text-lg tracking-tight">
            Snip
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <Link href="#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="hover:text-primary transition-colors">
            How it Works
          </Link>
          <Link href="#api" className="hover:text-primary transition-colors">
            API
          </Link>
          <a
            href="https://docs.snipurl.click"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Docs
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-primary transition-colors"
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
                className="hidden sm:inline-flex bg-primary hover:bg-primary-hover text-white text-sm font-medium px-5 py-2.5 rounded-btn transition-colors shadow-sm"
              >
                Get started free
              </Link>
            </>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <Link href="#features" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-lg transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-lg transition-colors">
            How it Works
          </Link>
          <Link href="#api" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-lg transition-colors">
            API
          </Link>
          <a href="https://docs.snipurl.click" target="_blank" rel="noopener noreferrer" className="block py-2.5 px-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-[#FDF3E7] rounded-lg transition-colors">
            Docs
          </a>
          {!isSignedIn && (
            <div className="pt-3 border-t border-border mt-3 flex gap-3">
              <Link href="/sign-in" className="flex-1 text-center py-2.5 text-sm font-medium text-text-secondary border border-border rounded-btn hover:border-primary transition-colors">
                Sign in
              </Link>
              <Link href="/sign-up" className="flex-1 text-center py-2.5 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-btn transition-colors">
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
