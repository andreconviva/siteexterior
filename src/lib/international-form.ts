import countryToCurrency from "country-to-currency";
import { getCountries, type CountryCode } from "libphonenumber-js";
import type { Locale } from "./content-types";

export const countryCodes = getCountries();

export function currencyForCountry(country: string) {
  const currencies: Record<string, string> = { ...countryToCurrency, AC: "SHP", TA: "GBP" };
  return currencies[country] || "BRL";
}

export function countryOptions(locale: Locale) {
  const names = new Intl.DisplayNames([locale], { type: "region" });
  return countryCodes.map((code: CountryCode) => ({ code, name: names.of(code) || code }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

export const budgetBands = [
  { id: "up-to-500k", min: 0, max: 500000 },
  { id: "500k-1m", min: 500000, max: 1000000 },
  { id: "1m-2m", min: 1000000, max: 2000000 },
  { id: "over-2m", min: 2000000, max: null },
] as const;

export const internationalCopy: Record<Locale, { upTo: string; above: string; loading: string; estimate: string; fallback: string; phoneError: string }> = {
  "pt-BR": { upTo: "Até", above: "Acima de", loading: "Atualizando moeda…", estimate: "Conversão aproximada de BRL · câmbio de", fallback: "Câmbio indisponível. Faixas exibidas em BRL.", phoneError: "Confira o telefone e o código do país." },
  en: { upTo: "Up to", above: "Above", loading: "Updating currency…", estimate: "Approximate conversion from BRL · rate dated", fallback: "Exchange rate unavailable. Ranges shown in BRL.", phoneError: "Check the phone number and country code." },
  es: { upTo: "Hasta", above: "Más de", loading: "Actualizando moneda…", estimate: "Conversión aproximada de BRL · cambio del", fallback: "Cambio no disponible. Rangos en BRL.", phoneError: "Revise el teléfono y el código de país." },
  de: { upTo: "Bis", above: "Über", loading: "Währung wird aktualisiert…", estimate: "Ungefähre Umrechnung aus BRL · Kurs vom", fallback: "Wechselkurs nicht verfügbar. Beträge in BRL.", phoneError: "Bitte Telefonnummer und Landesvorwahl prüfen." },
  fr: { upTo: "Jusqu’à", above: "Plus de", loading: "Actualisation de la devise…", estimate: "Conversion approximative depuis le BRL · taux du", fallback: "Taux indisponible. Montants en BRL.", phoneError: "Vérifiez le numéro et l’indicatif du pays." },
  it: { upTo: "Fino a", above: "Oltre", loading: "Aggiornamento valuta…", estimate: "Conversione indicativa da BRL · cambio del", fallback: "Cambio non disponibile. Importi in BRL.", phoneError: "Controlla il numero e il prefisso internazionale." },
  ja: { upTo: "以下", above: "超", loading: "通貨を更新中…", estimate: "BRLからの概算換算 · 為替レート日", fallback: "為替レートを取得できません。BRLで表示しています。", phoneError: "電話番号と国番号を確認してください。" },
  "zh-CN": { upTo: "不超过", above: "超过", loading: "正在更新货币…", estimate: "由BRL估算换算 · 汇率日期", fallback: "汇率暂不可用，以BRL显示。", phoneError: "请检查电话号码和国家区号。" },
};

export function budgetOptions(locale: Locale, currency: string, rate = 1) {
  const copy = internationalCopy[locale];
  const money = new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol", maximumFractionDigits: 0 });
  const format = (amount: number) => money.format(Math.round(amount * rate));
  return budgetBands.map((band) => ({ ...band, label: band.min === 0
    ? locale === "ja" ? `${format(band.max!)} ${copy.upTo}` : `${copy.upTo} ${format(band.max!)}`
    : band.max === null ? locale === "ja" ? `${format(band.min)} ${copy.above}` : `${copy.above} ${format(band.min)}`
    : `${format(band.min)} – ${format(band.max)}` }));
}
