import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center">
      <Link
        href="/sign-up"
        className="group mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-[#FDF3E7] text-primary text-xs font-medium hover:border-primary/60 transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        <span>New: Developer API with full programmatic access</span>
        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <h1 className="font-serif text-[44px] sm:text-[52px] md:text-[60px] leading-[1.1] text-text-primary mb-6 tracking-tight max-w-[700px]">
        Shorten links.{" "}
        <span className="text-primary">Track everything.</span>
      </h1>

      <p className="text-lg md:text-xl text-text-secondary mb-12 max-w-[540px] leading-relaxed">
        The open-source link shortener with custom aliases, QR codes,
        click analytics, and a developer API. Free forever.
      </p>
    </div>
  );
}
