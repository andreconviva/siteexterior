import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResidencePage } from "@/components/residence-page";
import { dictionaries, getResidence, isLocale, locales, residenceSlugs } from "@/lib/i18n";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return locales.flatMap((locale) => residenceSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const residence = getResidence(locale, slug);
  if (!residence) return {};
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://convivaengenharia.com.br";
  const route = `/residences/${residence.slug}`;
  const languages = Object.fromEntries(locales.map((item) => [item, `/${item}${route}`]));
  return {
    metadataBase: new URL(baseUrl),
    title: `${residence.name} | Conviva`,
    description: residence.summary,
    alternates: { canonical: `/${locale}${route}`, languages: { "x-default": `/en${route}`, ...languages } },
    openGraph: { title: `${residence.name} | Conviva`, description: residence.summary, url: `/${locale}${route}`, type: "website", siteName: "Conviva", images: [{ url: residence.image, width: 1800, height: 1200, alt: residence.alt }] },
  };
}

export default async function ResidenceRoute({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const residence = getResidence(locale, slug);
  if (!residence) notFound();
  return <ResidencePage locale={locale} copy={dictionaries[locale]} residence={residence} />;
}
