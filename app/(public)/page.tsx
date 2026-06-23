import type { Metadata } from "next";
import { Zap, BarChart2, QrCode, Shield, ArrowRight, Scissors, MousePointer2, ChartNoAxesCombined, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { UrlShortenerForm } from "./_components/url-shortener-form";

// ─── Page-specific SEO Metadata ─────────────────────────────────────
export const metadata: Metadata = {
  title: "Snip — Free URL Shortener with Analytics & QR Codes",
  description:
    "Shorten long URLs instantly. Create branded custom aliases, generate QR codes, and track every click with beautiful analytics. Free forever, no credit card required.",
  openGraph: {
    title: "Snip — Free URL Shortener with Analytics & QR Codes",
    description:
      "Shorten long URLs instantly. Create branded custom aliases, generate QR codes, and track every click with beautiful analytics.",
    url: "/",
  },
  twitter: {
    title: "Snip — Free URL Shortener with Analytics & QR Codes",
    description:
      "Shorten long URLs instantly. Create branded custom aliases, generate QR codes, and track every click with beautiful analytics.",
  },
  alternates: {
    canonical: "/",
  },
};

// ─── JSON-LD Structured Data ────────────────────────────────────────
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Snip",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click",
      description:
        "Shorten, brand, and track your links in one beautiful place.",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"}/dashboard/links?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Snip",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Free URL shortener with custom aliases, QR codes, and click analytics.",
    },
    {
      "@type": "Organization",
      name: "Snip",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click",
      logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"}/icon-512.png`,
    },
  ],
};

// ─── Features Data ──────────────────────────────────────────────────
const features = [
  {
    icon: Zap,
    title: "Instant redirects",
    description:
      "Built on edge infrastructure for lightning-fast redirects anywhere in the world.",
  },
  {
    icon: BarChart2,
    title: "Click analytics",
    description:
      "Track referrers, devices, and locations with beautiful, easy-to-read charts.",
  },
  {
    icon: QrCode,
    title: "QR codes built in",
    description:
      "Generate high-quality QR codes for print, packaging, and presentations instantly.",
  },
  {
    icon: Shield,
    title: "Secure & private",
    description:
      "Password-protect your links, set expiry dates, and control who sees your content.",
  },
];

// ─── How it Works Steps ─────────────────────────────────────────────
const steps = [
  {
    icon: Scissors,
    step: "1",
    title: "Paste your link",
    description: "Drop any long URL into the input field. No sign-up needed for quick shortening.",
  },
  {
    icon: MousePointer2,
    step: "2",
    title: "Customize & share",
    description: "Add a custom alias, password protection, or expiry date. Then share it anywhere.",
  },
  {
    icon: ChartNoAxesCombined,
    step: "3",
    title: "Track performance",
    description: "Watch real-time analytics: clicks, referrers, countries, devices, and more.",
  },
];

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 flex flex-col items-center">
        {/* Navigation */}
        <header className="w-full">
          <Navbar />
        </header>

        {/* Hero */}
        <section
          aria-label="URL shortener"
          className="w-full max-w-[680px] mx-auto px-4 pt-20 pb-16 flex flex-col items-center text-center"
        >
          <HeroSection />
          <UrlShortenerForm />
        </section>

        {/* Social Proof Badges */}
        <section aria-label="Trust signals" className="w-full max-w-[680px] mx-auto px-4 pb-12">
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-sm text-text-secondary shadow-sm">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              Free forever
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-sm text-text-secondary shadow-sm">
              <Shield className="w-3.5 h-3.5 text-primary" />
              No tracking cookies
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-full text-sm text-text-secondary shadow-sm">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Edge-powered speed
            </div>
          </div>
        </section>

        {/* ── Live Platform Analytics Strip ─────────────────────────── */}
        <section aria-label="Platform analytics" className="w-full max-w-[680px] mx-auto px-4 pb-10">
          <Link
            href="/analytics"
            className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#1A1410] to-[#2A2018] border border-[#3D352C] rounded-[16px] px-6 py-5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Live Platform Analytics</p>
                <p className="text-white/50 text-xs mt-0.5">See real-time clicks, countries &amp; device stats across all Snip links</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-btn text-sm font-medium transition-colors shrink-0 group-hover:bg-primary group-hover:text-white">
              View stats
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </section>

        {/* How it Works */}
        <section
          id="how-it-works"
          aria-label="How it works"
          className="w-full max-w-[900px] mx-auto px-4 py-20"
        >
          <div className="text-center mb-14">
            <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] mb-3">
              How it works
            </p>
            <h2 className="font-serif text-[28px] md:text-[36px] text-text-primary leading-tight">
              Three steps to shorter links
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.step} className="relative flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FDF3E7] to-[#F5EFE6] border border-border flex items-center justify-center group-hover:scale-110 group-hover:border-primary/50 transition-all duration-300 shadow-sm">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white text-[13px] font-bold rounded-full flex items-center justify-center shadow-md">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-medium text-text-primary text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          aria-label="Features"
          className="w-full max-w-[900px] mx-auto px-4 py-20"
        >
          <div className="text-center mb-14">
            <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] mb-3">
              Features
            </p>
            <h2 className="font-serif text-[28px] md:text-[36px] text-text-primary leading-tight">
              Everything you need
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface border border-border rounded-card p-6 hover:border-primary transition-colors duration-300 group shadow-card"
              >
                <div className="w-10 h-10 rounded-[8px] bg-[#FDF3E7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-text-primary text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Source Callout */}
        <section
          aria-label="Open source"
          className="w-full max-w-[680px] mx-auto px-4 py-12"
        >
          <div className="bg-gradient-to-br from-[#1A1410] to-[#2D2620] rounded-[20px] p-8 md:p-10 text-center border border-[#3D352C] shadow-xl">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <h2 className="font-serif text-[24px] md:text-[28px] text-white mb-3 leading-tight">
              Built in the open
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-[420px] mx-auto mb-6">
              Snip is open source. Explore the codebase, contribute features,
              or deploy your own instance.
            </p>
            <a
              href="https://github.com/mdsaad31/Snip-URL"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium rounded-btn transition-all text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </section>

        {/* CTA */}
        <section
          aria-label="Get started"
          className="w-full max-w-[680px] mx-auto px-4 py-20 text-center"
        >
          <h2 className="font-serif text-[32px] md:text-[40px] leading-tight text-text-primary mb-4">
            Ready to shorten?
          </h2>
          <p className="text-text-secondary text-base mb-8 max-w-[400px] mx-auto">
            Join thousands of creators and marketers who trust Snip for their
            links.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-base group"
          >
            Get started free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
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
    </>
  );
}
