import type { MetadataRoute } from "next";

import { SITE_URL, absoluteUrl } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/student",
          "/instructor",
          "/settings",
          "/checkout",
          "/api",
        ],
      },
    ],
    sitemap: absoluteUrl("sitemap.xml"),
    host: SITE_URL,
  };
}
