import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Analytics } from "@vercel/analytics/next";

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

export const viewport: Viewport = {
  themeColor: "#f5f8f6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://clearbox.email"),
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
  authors: [{ name: "ClearBox Team", url: "https://clearbox.email" }],
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
    url: "https://clearbox.email",
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
      url: "https://clearbox.email",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_AD_CLIENT_ID"
          crossOrigin="anonymous"
          strategy="afterInteractive"
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
        <Analytics />
      </body>
    </html>
  );
}
