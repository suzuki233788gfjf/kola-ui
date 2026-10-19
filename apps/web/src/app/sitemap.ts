import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/components";
import { SITE_URL } from "@/lib/site";

/** Plan du site pour Google : /sitemap.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/composants", "/demarrer", ...COMPONENTS.filter((c) => c.available).map((c) => `/composants/${c.slug}`)];
  return pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/composants/") ? 0.8 : 0.9,
  }));
}
