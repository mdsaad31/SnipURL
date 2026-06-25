import type { Metadata } from "next";
import {
  Zap,
  BarChart2,
  QrCode,
  Shield,
  ArrowRight,
  Scissors,
  MousePointer2,
  ChartNoAxesCombined,
  Globe,
  Code2,
  Timer,
  Link2,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "./_components/navbar";
import { HeroSection } from "./_components/hero-section";
import { UrlShortenerForm } from "./_components/url-shortener-form";

export const metadata: Metadata = {
  title: "Snip — Free URL Shortener with Analytics, QR Codes & Developer API",
  description:
    "The open-source URL shortener for developers and marketers. Custom aliases, QR codes, click analytics, password protection, link expiration, and a full REST API. Free forever.",
  openGraph: {
    title: "Snip — Free URL Shortener with Analytics, QR Codes & Developer API",
    description:
      "The open-source URL shortener for developers and marketers. Custom aliases, QR codes, click analytics, password protection, and a full REST API.",
    url: "/",
  },
  twitter: {
    title: "Snip — Free URL Shortener with Analytics, QR Codes & Developer API",
    description:
      "The open-source URL shortener for developers and marketers. Custom aliases, QR codes, click analytics, and a full REST API.",
  },
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Snip",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click",
      description:
        "The open-source URL shortener with analytics, QR codes, and developer API.",
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
      name: "Snip URL Shortener",
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList:
        "URL shortening, Custom aliases, QR code generation, Click analytics, Password protection, Link expiration, Developer API, Bulk operations",
      description:
        "Free URL shortener with custom aliases, QR codes, analytics, password protection, expiration, and a REST API for developers.",
    },
    {
      "@type": "Organization",
      name: "Snip",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click",
      logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"}/icon-512.png`,
      sameAs: ["https://github.com/mdsaad31/Snip-URL"],
    },
    {
      "@type": "WebAPI",
      name: "Snip URL API",
      description:
        "RESTful API for programmatic URL shortening, analytics, and QR code generation.",
      url: "https://docs.snipurl.click",
      documentation: "https://docs.snipurl.click",
      provider: {
        "@type": "Organization",
        name: "Snip",
      },
    },
  ],
};

const features = [
  {
    icon: Zap,
    title: "Lightning-fast redirects",
    description:
      "Edge-powered infrastructure delivers sub-50ms redirects globally. Your links are never slow.",
  },
  {
    icon: BarChart2,
    title: "Detailed analytics",
    description:
      "Track clicks, referrers, countries, cities, devices, browsers, and OS — all in real time.",
  },
  {
    icon: QrCode,
    title: "QR code generator",
    description:
      "Generate customizable QR codes with custom colors, sizes, and error correction levels.",
  },
  {
    icon: Shield,
    title: "Password protection",
    description:
      "Lock sensitive links behind a password. Only people with the code can access your content.",
  },
  {
    icon: Timer,
    title: "Link expiration",
    description:
      "Set links to expire after a date. Perfect for limited-time offers and time-sensitive content.",
  },
  {
    icon: Code2,
    title: "Developer API",
    description:
      "Full REST API with API keys, rate limiting, and SDKs. Build integrations programmatically.",
  },
];

const steps = [
  {
    icon: Link2,
    step: "1",
    title: "Paste your URL",
    description:
      "Drop any long URL into the input. No sign-up needed for instant shortening.",
  },
  {
    icon: MousePointer2,
    step: "2",
    title: "Customize & share",
    description:
      "Add a branded alias, set a password, or choose an expiry. Then share it anywhere.",
  },
  {
    icon: ChartNoAxesCombined,
    step: "3",
    title: "Track performance",
    description:
      "Watch real-time analytics: clicks, countries, devices, and referrer breakdown.",
  },
];

const apiExample = `// Create a short link via the API
const response = await fetch('https://snipurl.click/api/v1/links', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer snip_live_your_key_here',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://example.com/blog/my-article',
    custom_alias: 'my-article',
    expires_at: '2025-12-31T23:59:59Z'
  })
});

const { data } = await response.json();
console.log(data.short_url); // https://snipurl.click/my-article`;

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 flex flex-col items-center overflow-x-hidden">
        <header className="w-full">
          <Navbar />
        </header>

        {/* Hero */}
        <section
          aria-label="URL shortener"
          className="w-full max-w-[720px] mx-auto px-4 pt-16 sm:pt-24 pb-12 flex flex-col items-center text-center"
        >
          <HeroSection />
          <UrlShortenerForm />
        </section>

        {/* Trust Signals */}
        <section aria-label="Trust signals" className="w-full max-w-[720px] mx-auto px-4 pb-16">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "Free forever", icon: CheckCircle2 },
              { label: "No tracking cookies", icon: Shield },
              { label: "Open source", icon: Code2 },
              { label: "Edge-powered", icon: Zap },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-3.5 py-2 bg-surface border border-border rounded-full text-xs sm:text-sm text-text-secondary"
              >
                <badge.icon className="w-3.5 h-3.5 text-primary shrink-0" />
                {badge.label}
              </div>
            ))}
          </div>
        </section>

        {/* Platform Analytics Banner */}
        <section aria-label="Platform analytics" className="w-full max-w-[720px] mx-auto px-4 pb-20">
          <Link
            href="/analytics"
            className="group flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-[#1A1410] to-[#2A2018] border border-[#3D352C] rounded-[18px] px-6 py-5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">Live Platform Analytics</p>
                <p className="text-white/50 text-xs mt-0.5">
                  Real-time clicks, countries & device stats across all Snip links
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg text-sm font-medium transition-all shrink-0 group-hover:bg-primary group-hover:text-white group-hover:border-primary">
              View stats
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </section>

        {/* How it Works */}
        <section
          id="how-it-works"
          aria-label="How it works"
          className="w-full bg-[#F9F6F1] border-y border-border py-20 sm:py-24"
        >
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
                How it works
              </p>
              <h2 className="font-serif text-[30px] sm:text-[36px] md:text-[42px] text-text-primary leading-tight">
                Three steps. Zero friction.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {steps.map((step) => (
                <div
                  key={step.step}
                  className="relative flex flex-col items-center text-center bg-surface rounded-2xl p-8 border border-border shadow-card group hover:border-primary/40 transition-all duration-300"
                >
                  <div className="relative mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#FDF3E7] border border-primary/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-semibold text-text-primary text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          aria-label="Features"
          className="w-full py-20 sm:py-24"
        >
          <div className="max-w-[1100px] mx-auto px-4">
            <div className="text-center mb-16">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
                Features
              </p>
              <h2 className="font-serif text-[30px] sm:text-[36px] md:text-[42px] text-text-primary leading-tight mb-4">
                Everything you need to manage links
              </h2>
              <p className="text-text-secondary text-base max-w-[500px] mx-auto">
                From simple shortening to powerful analytics and programmatic access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-surface border border-border rounded-2xl p-7 hover:border-primary/40 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#FDF3E7] border border-primary/15 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary text-base mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Developer API Section */}
        <section
          id="api"
          aria-label="Developer API"
          className="w-full bg-gradient-to-b from-[#1A1410] to-[#0F0B08] py-20 sm:py-24"
        >
          <div className="max-w-[1000px] mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
                Developer API
              </p>
              <h2 className="font-serif text-[30px] sm:text-[36px] md:text-[42px] text-white leading-tight mb-4">
                Build with the Snip API
              </h2>
              <p className="text-white/60 text-base max-w-[480px] mx-auto">
                Full REST API with authentication, rate limiting, and comprehensive documentation.
                Create links, fetch analytics, and generate QR codes programmatically.
              </p>
            </div>

            <div className="bg-[#0D0A07] border border-[#2A2018] rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2A2018] bg-[#141010]">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#27CA40]" />
                <span className="ml-3 text-xs text-white/40 font-mono">create-link.js</span>
              </div>
              <pre className="p-5 sm:p-6 overflow-x-auto text-[12px] sm:text-[13px] leading-relaxed">
                <code className="text-white/80 font-mono whitespace-pre">{apiExample}</code>
              </pre>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <a
                href="https://docs.snipurl.click"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-all text-sm shadow-lg shadow-primary/20"
              >
                Read the docs
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/dashboard/api-keys"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium rounded-btn transition-all text-sm"
              >
                Get your API key
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section aria-label="Open source" className="w-full py-20 sm:py-24">
          <div className="max-w-[720px] mx-auto px-4">
            <div className="bg-gradient-to-br from-[#1A1410] to-[#2D2620] rounded-[24px] p-8 md:p-12 text-center border border-[#3D352C] shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <h2 className="font-serif text-[26px] md:text-[32px] text-white mb-4 leading-tight">
                Open source & free
              </h2>
              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-[440px] mx-auto mb-8">
                Snip is fully open source. Star us on GitHub, contribute features,
                report bugs, or self-host your own instance.
              </p>
              <a
                href="https://github.com/mdsaad31/Snip-URL"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium rounded-btn transition-all text-sm"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Star on GitHub
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          aria-label="Get started"
          className="w-full bg-[#F9F6F1] border-y border-border py-20 sm:py-24 text-center"
        >
          <div className="max-w-[600px] mx-auto px-4">
            <h2 className="font-serif text-[34px] sm:text-[40px] md:text-[48px] leading-tight text-text-primary mb-5">
              Ready to shorten?
            </h2>
            <p className="text-text-secondary text-base md:text-lg mb-10 max-w-[440px] mx-auto leading-relaxed">
              Join thousands of developers and marketers using Snip for their links.
              No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-medium rounded-btn transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-base group shadow-md shadow-primary/15"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="https://docs.snipurl.click"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-surface border border-border text-text-primary font-medium rounded-btn transition-all duration-200 hover:border-primary/50 text-base"
              >
                Read the docs
                <ExternalLink className="w-4 h-4 text-text-secondary" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full py-10 bg-surface border-t border-border">
          <div className="max-w-[1100px] mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-text-primary text-sm">
                  Snip
                </span>
                <span className="text-text-tertiary text-sm">
                  © {currentYear}
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-text-secondary">
                <Link href="/analytics" className="hover:text-primary transition-colors">
                  Analytics
                </Link>
                <a href="https://docs.snipurl.click" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  API Docs
                </a>
                <a href="https://github.com/mdsaad31/Snip-URL" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  GitHub
                </a>
                <Link href="/termsofservice" className="hover:text-primary transition-colors">
                  Terms
                </Link>
                <Link href="/privacystatement" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
