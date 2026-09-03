import { notFound } from "next/navigation";
import { LandingPage } from "@/components/landing-page";
import { dictionaries, isLocale } from "@/lib/i18n";

export default async function LocalePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LandingPage locale={locale} copy={dictionaries[locale]} />;
}
