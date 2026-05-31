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
  title: "Snip — Make every link count",
  description:
    "Shorten, brand, and track your links in one beautiful place. Free forever.",
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
