import { NextRequest, NextResponse } from "next/server";
import { countryCodes, currencyForCountry } from "@/lib/international-form";

const currencies = new Set(countryCodes.map(currencyForCountry));

export async function GET(request: NextRequest) {
  const currency = request.nextUrl.searchParams.get("currency") || "BRL";
  if (!currencies.has(currency)) return NextResponse.json({ error: "invalid_currency" }, { status: 400 });
  if (currency === "BRL") return NextResponse.json({ currency, rate: 1, date: null });
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rates?base=BRL&quotes=${currency}`, {
      next: { revalidate: 3600 }, signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error("Exchange rate unavailable");
    const rows = await response.json();
    const quote = Array.isArray(rows) ? rows.find((row) => row.base === "BRL" && row.quote === currency) : null;
    if (!quote || typeof quote.rate !== "number" || !Number.isFinite(quote.rate) || quote.rate <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(quote.date)) throw new Error("Invalid exchange rate");
    return NextResponse.json({ currency, rate: quote.rate, date: quote.date }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
  } catch {
    return NextResponse.json({ error: "rate_unavailable" }, { status: 503 });
  }
}
