import type { MetadataRoute } from "next";
import { COMPONENTS } from "@/lib/components";
import { BLOCS } from "@/lib/blocs";
import { SITE_URL } from "@/lib/site";

/** Plan du site pour Google : /sitemap.xml */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    "",
    "/composants",
    "/blocs",
    "/demarrer",
    ...COMPONENTS.filter((c) => c.available).map((c) => `/composants/${c.slug}`),
    ...BLOCS.map((b) => `/blocs/${b.slug}`),
  ];
  return pages.map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.startsWith("/composants/") || p.startsWith("/blocs/") ? 0.8 : 0.9,
  }));
}
