import type { MetadataRoute } from "next";
import { locales, residenceSlugs } from "@/lib/i18n";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convivaengenharia.com.br";
  const paths = ["", ...residenceSlugs.map((slug) => `/residences/${slug}`)];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(locales.map((locale) => [locale, `${baseUrl}/${locale}${path}`]));
    return locales.map((locale) => ({ url: `${baseUrl}/${locale}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path ? 0.8 : locale === "en" ? 1 : 0.9, alternates: { languages } }));
  });
}
