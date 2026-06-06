import type { Metadata } from "next";
import Link from "next/link";
import { Scissors } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found",
  description:
    "The link you're looking for may have expired, been deactivated, or never existed.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="max-w-[480px] w-full text-center relative z-10">
        
        {/* Large Watermark Number */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[96px] md:text-[140px] font-serif font-bold text-border/40 select-none -z-10">
          404
        </div>

        {/* Floating Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-surface border border-border rounded-full flex items-center justify-center shadow-sm relative">
            <Scissors className="w-8 h-8 text-primary -rotate-45" />
            {/* Cut line decoration */}
            <div className="absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
            <div className="absolute top-1/2 -left-4 w-8 border-t-2 border-dashed border-border" />
          </div>
        </div>

        <h1 className="font-serif text-[32px] text-text-primary mb-4 leading-tight">
          This link has been snipped.
        </h1>
        
        <p className="text-text-secondary text-base mb-10 leading-relaxed max-w-[380px] mx-auto">
          The link may have expired, been deactivated, or never existed. Double-check the URL and try again.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link 
            href="/" 
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-colors text-center"
          >
            Go to homepage
          </Link>
          <Link 
            href="/" 
            className="w-full sm:w-auto px-6 py-3 text-text-secondary hover:bg-[#F5EFE6] hover:text-text-primary font-medium rounded-btn transition-colors text-center"
          >
            Shorten a link
          </Link>
        </div>

        <Link 
          href="/sign-up" 
          className="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1 group"
        >
          Try Snip for free
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </Link>
      </div>
    </main>
  );
}
