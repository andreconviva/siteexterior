import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import { budgetBands, countryCodes } from "@/lib/international-form";

const attempts = new Map<string, { count: number; reset: number }>();
function limited(ip: string) {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.reset < now) { attempts.set(ip, { count: 1, reset: now + 60_000 }); return false; }
  current.count += 1;
  return current.count > 5;
}
function text(value: unknown, max = 300) { return typeof value === "string" ? value.trim().slice(0, max) : ""; }

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  const source = body as Record<string, unknown>;
  if (text(source.website, 200)) return NextResponse.json({ ok: true });

  const payload = {
    countryCode: text(source.countryCode, 2),
    budgetCurrency: text(source.budgetCurrency, 3),
    budgetBand: text(source.budgetBand, 30),
    budgetBaseCurrency: "BRL",
    budgetMinBRL: budgetBands.find((band) => band.id === source.budgetBand)?.min,
    budgetMaxBRL: budgetBands.find((band) => band.id === source.budgetBand)?.max,
    exchangeRate: typeof source.exchangeRate === "number" && Number.isFinite(source.exchangeRate) && source.exchangeRate > 0 ? source.exchangeRate : null,
    exchangeRateDate: text(source.exchangeRateDate, 10),
    name: text(source.name, 100), email: text(source.email, 200), country: text(source.country, 100), phone: text(source.phone, 60), preferredLanguage: text(source.preferredLanguage, 10), residence: text(source.residence, 80), residenceStatus: text(source.residenceStatus, 20), objective: text(source.objective, 100), investmentRange: text(source.budget, 100), decisionTimeline: text(source.timeline, 100), message: text(source.message, 2000), locale: text(source.locale, 10), originUrl: text(source.originUrl, 800), referrer: text(source.referrer, 800), submittedAt: text(source.submittedAt, 40), formVersion: text(source.formVersion, 40), utm: { source: text(source.utm_source, 200), medium: text(source.utm_medium, 200), campaign: text(source.utm_campaign, 200), content: text(source.utm_content, 200), term: text(source.utm_term, 200) },
  };
  const valid = payload.name.length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) && payload.country.length >= 2 && payload.phone.length >= 7 && payload.residence.length >= 2 && payload.objective.length >= 2 && payload.investmentRange.length >= 2 && isLocale(payload.locale) && text(source.consent, 5) === "yes";
  if (!valid) return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  if (payload.formVersion === "international-v2" && (!countryCodes.some((code) => code === payload.countryCode) || !isPossiblePhoneNumber(payload.phone) || !budgetBands.some((band) => band.id === payload.budgetBand) || !/^[A-Z]{3}$/.test(payload.budgetCurrency))) {
    return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  }

  const endpoint = process.env.FACILITA_CAPTURE_URL;
  if (!endpoint) return NextResponse.json({ error: "contact_unavailable" }, { status: 503 });
  try {
    const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", ...(process.env.FACILITA_API_TOKEN ? { Authorization: `Bearer ${process.env.FACILITA_API_TOKEN}` } : {}) }, body: JSON.stringify(payload), signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return NextResponse.json({ error: "contact_unavailable" }, { status: 503 });
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "contact_unavailable" }, { status: 503 }); }
}
