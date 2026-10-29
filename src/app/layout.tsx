import type { Metadata, Viewport } from "next";
import { Literata, Schibsted_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { TopBar } from "@/components/shell/TopBar";
import { TabBar } from "@/components/shell/TabBar";
import "./globals.css";

const ui = Schibsted_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

const reading = Literata({
  variable: "--font-reading",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.SIGNAL_SITE_URL
  ? new URL(process.env.SIGNAL_SITE_URL)
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : undefined;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "SIGNAL", template: "%s · SIGNAL" },
  description: "Know what matters. Understand why. Speak with confidence.",
  applicationName: "SIGNAL",
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: "SIGNAL",
    title: "SIGNAL",
    description: "Daily business intelligence for an Australian importer. One story that matters, explained in plain words.",
    locale: "en_AU",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIGNAL",
    description: "Daily business intelligence for an Australian importer. One story that matters, explained in plain words.",
  },
};

export const viewport: Viewport = {
  themeColor: "#231e4b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={`${ui.variable} ${reading.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:text-navy focus:px-3 focus:py-2 focus:rounded-md focus:shadow-2"
        >
          Skip to content
        </a>
        <TopBar />
        <main id="main" className="flex-1 flex flex-col pb-20 md:pb-0">
          {children}
        </main>
        <TabBar />
      </body>
    </html>
  );
}
