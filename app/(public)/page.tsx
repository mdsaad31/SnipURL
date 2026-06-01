import { Zap, BarChart2, QrCode } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { UrlShortenerForm } from "./_components/url-shortener-form";

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="flex-1 flex flex-col items-center">
      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <section className="w-full max-w-[680px] mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center">
        <HeroSection />
        <UrlShortenerForm />
      </section>

      {/* Features */}
      <section id="features" className="w-full max-w-[800px] mx-auto px-4 py-24">
        <div className="text-center mb-12">
          <h2 className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.1em] mb-4">
            Why Snip?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-card p-6 hover:border-primary transition-colors duration-300 group shadow-card">
            <div className="w-10 h-10 rounded-[8px] bg-[#FDF3E7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-base mb-2">
              Instant redirects
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Built on edge infrastructure for lightning-fast redirects anywhere
              in the world.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-card p-6 hover:border-primary transition-colors duration-300 group shadow-card">
            <div className="w-10 h-10 rounded-[8px] bg-[#FDF3E7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-base mb-2">
              Click analytics
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Track referrers, devices, and locations with beautiful, easy-to-read
              charts.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-card p-6 hover:border-primary transition-colors duration-300 group shadow-card">
            <div className="w-10 h-10 rounded-[8px] bg-[#FDF3E7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-medium text-text-primary text-base mb-2">
              QR codes built in
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              Generate high-quality QR codes for print, packaging, and
              presentations instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full mt-auto py-8 bg-[#F5EFE6] border-t border-border">
        <div className="max-w-[680px] mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={20} height={20} />
            <span className="font-medium text-text-primary text-sm">
              © {currentYear} Snip
            </span>
          </div>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link
              href="/termsofservice"
              className="hover:text-primary font-medium transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacystatement"
              className="hover:text-primary font-medium transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
