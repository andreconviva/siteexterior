import type { Dictionary, Locale, LocalePack } from "./content-types";
import { locales, residenceSlugs } from "./content-types";
import { en } from "./locales/en";
import { ptBR } from "./locales/pt-BR";
import { de, es, fr, it, ja, zhCN } from "./locales/secondary";
import { residenceBase } from "./residences";

export { locales, residenceSlugs };
export type { Dictionary, Locale, Residence, ResidenceSlug, ResidenceStatus } from "./content-types";

export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);

export const localeNames: Record<Locale, string> = {
  "pt-BR": "PT",
  en: "EN",
  es: "ES",
  de: "DE",
  fr: "FR",
  it: "IT",
  ja: "日本語",
  "zh-CN": "中文",
};

const packs: Record<Locale, LocalePack> = { "pt-BR": ptBR, en, es, de, fr, it, ja, "zh-CN": zhCN };

export const dictionaries = Object.fromEntries(locales.map((locale) => {
  const pack = packs[locale];
  const residences = residenceBase.map((residence, index) => ({
    ...residence,
    typology: pack.typologies[index],
    summary: pack.summaries[index],
    statusLabel: residence.status === "current" ? pack.portfolio.currentStatus : pack.portfolio.completedStatus,
    alt: `${pack.altPrefix} ${residence.name}, ${residence.neighborhood}, Niterói`,
  }));
  const copy = Object.fromEntries(
    Object.entries(pack).filter(([key]) => !["typologies", "summaries", "altPrefix"].includes(key)),
  );
  return [locale, { ...copy, residences }];
})) as Record<Locale, Dictionary>;

export const getResidence = (locale: Locale, slug: string) => dictionaries[locale].residences.find((item) => item.slug === slug);
