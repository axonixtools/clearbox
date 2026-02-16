import type { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://clear-box.netlify.app";

export default function robots(): MetadataRoute.Robots {
  const origin = new URL(BASE_URL).origin;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/dashboard"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
