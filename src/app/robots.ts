import type { MetadataRoute } from "next";

const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
const base =
  raw && !raw.includes("localhost")
    ? raw
    : "https://www.harshitbhuju.com.np";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
