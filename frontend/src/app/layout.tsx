import type { Metadata } from "next";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

import { QueryProvider } from "@/components/providers/query-provider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/seo/site";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    // The brand suffix is derived from SITE_NAME so renaming the site is a
    // one-line change in lib/seo/site.ts. Pages set only their short title
    // (e.g. "Kurslar") and this appends " — IlmHub" once.
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME }],
  keywords: [
    "IlmHub",
    "IT kurslar",
    "onlayn ta'lim",
    "dasturlash kurslari",
    "O'zbekiston",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "uz_UZ",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // Image is provided by the file-based `opengraph-image.tsx` convention.
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Preload the most-used Sora weights to avoid FOUT on above-the-fold text.
// React 19 hoists these <link> tags into <head>.
const PRELOADED_FONTS = [
  "/fonts/Sora-Regular.ttf",
  "/fonts/Sora-SemiBold.ttf",
  "/fonts/Sora-Bold.ttf",
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="font-sans antialiased bg-bg-1 text-fg-1">
        {PRELOADED_FONTS.map((href) => (
          <link
            key={href}
            rel="preload"
            href={href}
            as="font"
            type="font/ttf"
            crossOrigin="anonymous"
          />
        ))}
        <QueryProvider>
          <NuqsAdapter>{children}</NuqsAdapter>
        </QueryProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
