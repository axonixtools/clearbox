import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://clear-box.netlify.app";
const APP_BASE_URL = new URL(APP_URL);
const SITE_NAME = "ClearBox";
const DEFAULT_TITLE = "ClearBox | AI Inbox Cleaner for Gmail";
const DEFAULT_DESCRIPTION =
  "Clean unread Gmail at scale with AI triage, bulk actions, and a privacy-first workflow.";
const SOCIAL_IMAGE_ALT = "ClearBox social preview image";
const SOCIAL_IMAGE_VERSION = "20260216";
const OPEN_GRAPH_IMAGE_URL = `${APP_URL}/opengraph-image?v=${SOCIAL_IMAGE_VERSION}`;
const TWITTER_IMAGE_URL = `${APP_URL}/twitter-image?v=${SOCIAL_IMAGE_VERSION}`;
const GOOGLE_TAG_ID = "G-6307QD91HZ";
const GOOGLE_TAG_ADDITIONAL_ID = "G-FB0284P4PL";

export const viewport: Viewport = {
  themeColor: "#f5f8f6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: APP_BASE_URL,
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: "%s | ClearBox",
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Gmail cleaner",
    "inbox cleanup",
    "AI email assistant",
    "bulk archive Gmail",
    "inbox zero tool",
  ],
  authors: [{ name: SITE_NAME, url: APP_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: OPEN_GRAPH_IMAGE_URL,
        width: 1200,
        height: 630,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    site: "@axonixtools",
    creator: "@axonixtools",
    images: [
      {
        url: TWITTER_IMAGE_URL,
        alt: SOCIAL_IMAGE_ALT,
      },
    ],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: APP_URL,
        logo: `${APP_URL}/favicon.svg`,
        sameAs: ["https://x.com/axonixtools", "https://github.com/axonixtools"],
      },
      {
        "@type": "WebSite",
        name: SITE_NAME,
        url: APP_URL,
        description: DEFAULT_DESCRIPTION,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url: APP_URL,
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: DEFAULT_DESCRIPTION,
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GOOGLE_TAG_ID}');
              gtag('config', '${GOOGLE_TAG_ADDITIONAL_ID}');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${manrope.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
