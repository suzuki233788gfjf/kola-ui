import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Autorise Google à tout lire, sauf les vitrines (elles ne s'affichent que dans le site). */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/preview/", "/preview-vue/"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
