import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const jetbrainsMono = JetBrains_Mono({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://snipurl.click"
  ),
  title: {
    default: "Snip — Make every link count",
    template: "%s — Snip",
  },
  description:
    "Shorten, brand, and track your links in one beautiful place. Free forever. Custom aliases, QR codes, click analytics, and password-protected links.",
  keywords: [
    "URL shortener",
    "link shortener",
    "short link",
    "custom alias",
    "QR code generator",
    "click analytics",
    "link tracking",
    "branded links",
    "free URL shortener",
    "Snip",
  ],
  authors: [{ name: "Snip" }],
  creator: "Snip",
  publisher: "Snip",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Snip",
    title: "Snip — Make every link count",
    description:
      "Shorten, brand, and track your links in one beautiful place. Free forever.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Snip — Make every link count",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Snip — Make every link count",
    description:
      "Shorten, brand, and track your links in one beautiful place. Free forever.",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${dmSerif.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans bg-background text-text-primary antialiased min-h-screen flex flex-col`}
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid #E8E2D9",
                color: "#1A1410",
                fontFamily: "var(--font-dm-sans)",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
