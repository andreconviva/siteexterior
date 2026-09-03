import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionaries, isLocale, locales } from "@/lib/i18n";
import "../globals.css";

type LayoutProps = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export async function generateMetadata({ params }: Omit<LayoutProps, "children">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = dictionaries[locale];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convivaengenharia.com.br";
  const languages = Object.fromEntries(locales.map((item) => [item, `/${item}`]));
  return {
    metadataBase: new URL(baseUrl),
    title: copy.meta.title,
    description: copy.meta.description,
    icons: { icon: "/images/favicon.webp" },
    alternates: { canonical: `/${locale}`, languages: { "x-default": "/en", ...languages } },
    openGraph: { title: copy.meta.title, description: copy.meta.description, type: "website", locale, url: `/${locale}`, siteName: "Conviva", images: [{ url: "/images/residences/brise-1.webp", width: 1800, height: 1200, alt: copy.residences[0].alt }] },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convivaengenharia.com.br";
  const schema = { "@context": "https://schema.org", "@type": "RealEstateAgent", name: "Conviva Engenharia", url: `${baseUrl}/${locale}`, areaServed: { "@type": "City", name: "Niterói" } };
  return <html lang={locale}><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} /></body></html>;
}
