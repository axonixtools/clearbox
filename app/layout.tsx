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
const GOOGLE_TAG_ID = "G-6307QD91HZ";

export const viewport: Viewport = {
  themeColor: "#f5f8f6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: APP_BASE_URL,
  title: {
    default: "ClearBox - Elite Email Cleaning and Inbox Zero Tool",
    template: "%s | ClearBox",
  },
  description:
    "The professional AI-powered tool to roast your inbox and clear unwanted emails. Achieve Inbox Zero in minutes. Secure, private, and efficient email management.",
  keywords: [
    "inbox zero",
    "email cleaner",
    "unsubscribe tool",
    "gmail cleaner",
    "email management software",
    "bulk unsubscribe",
    "secure email tool",
    "privacy focused email cleaner",
    "AI email assistant",
    "reduce email clutter",
  ],
  authors: [{ name: "ClearBox Team", url: APP_URL }],
  creator: "ClearBox Team",
  publisher: "ClearBox Inc.",
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
    title: "ClearBox - Elite Email Cleaning and Inbox Zero Tool",
    description:
      "Transform your inbox with ClearBox. The secure, AI-driven solution for bulk unsubscribing and achieving Inbox Zero.",
    url: APP_URL,
    siteName: "ClearBox",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ClearBox Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearBox - Elite Email Cleaning and Inbox Zero Tool",
    description:
      "Transform your inbox with ClearBox. The secure, AI-driven solution for bulk unsubscribing and achieving Inbox Zero.",
    creator: "@axonixtools",
    images: ["/og-image.png"],
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
    "@type": "SoftwareApplication",
    name: "ClearBox",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "A secure, AI-powered tool to help users clean their email inboxes and unsubscribe from unwanted newsletters.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      ratingCount: "1250",
    },
    publisher: {
      "@type": "Organization",
      name: "ClearBox Inc.",
      url: APP_URL,
    },
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
