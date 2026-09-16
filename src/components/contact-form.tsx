"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useState } from "react";
import { AsYouType, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import type { Dictionary, Locale, Residence } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";
import { budgetOptions, currencyForCountry, internationalCopy } from "@/lib/international-form";

type FormState = "idle" | "sending" | "success" | "error" | "unavailable";

export function ContactForm({ copy, locale, residences, countries, selectedResidence }: { copy: Dictionary["contact"]; locale: Locale; residences: Residence[]; countries: { code: CountryCode; name: string }[]; selectedResidence?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [phone, setPhone] = useState("");
  const [budget, setBudget] = useState("");
  const [quote, setQuote] = useState<{ currency: string; rate: number; date: string | null; failed?: boolean }>({ currency: "BRL", rate: 1, date: null });
  const international = internationalCopy[locale];
  const budgetHintId = useId();
  const currency = currencyForCountry(country);
  const rateLoading = currency !== "BRL" && quote.currency !== currency;
  const rateFailed = !rateLoading && currency !== "BRL" && quote.failed;
  const displayCurrency = currency === "BRL" || rateFailed || rateLoading ? "BRL" : currency;
  const rate = displayCurrency === "BRL" ? 1 : quote.rate;
  const options = budgetOptions(locale, displayCurrency, rate);
  const phonePlaceholder = country ? getExampleNumber(country, examples)?.formatInternational() : "+55 11 96123-4567";

  useEffect(() => {
    if (currency === "BRL") return;
    const controller = new AbortController();
    fetch(`/api/exchange-rates?currency=${currency}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Exchange rate unavailable");
        const result = await response.json();
        if (result.currency !== currency || typeof result.rate !== "number" || result.rate <= 0) throw new Error("Invalid exchange rate");
        if (!controller.signal.aborted) setQuote(result);
      })
      .catch(() => { if (!controller.signal.aborted) setQuote({ currency, rate: 1, date: null, failed: true }); });
    return () => controller.abort();
  }, [currency]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsedPhone = parsePhoneNumberFromString(phone, country || undefined);
    const phoneInput = form.elements.namedItem("phone") as HTMLInputElement;
    phoneInput.setCustomValidity(parsedPhone?.isPossible() ? "" : international.phoneError);
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (rateLoading) return;
    setState("sending");
    const data = Object.fromEntries(new FormData(form).entries());
    const query = new URLSearchParams(window.location.search);
    const residence = residences.find((item) => item.slug === data.residence);
    const selectedBudget = options.find((item) => item.id === budget);
    const countryName = countries.find((item) => item.code === country)?.name || country;
    const attribution = Object.fromEntries(["source", "medium", "campaign", "content", "term"].map((key) => [`utm_${key}`, query.get(`utm_${key}`) || ""]));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution, country: countryName, countryCode: country, phone: parsedPhone!.number, budget: selectedBudget?.label, budgetBand: budget, budgetCurrency: displayCurrency, budgetBaseCurrency: "BRL", budgetMinBRL: selectedBudget?.min, budgetMaxBRL: selectedBudget?.max, exchangeRate: rate, exchangeRateDate: displayCurrency === "BRL" ? null : quote.date, locale, residenceStatus: residence?.status || "", originUrl: window.location.href, referrer: document.referrer, submittedAt: new Date().toISOString(), formVersion: "international-v2" }),
      });
      if (response.ok) { setState("success"); form.reset(); setCountry(""); setPhone(""); setBudget(""); }
      else { const result = await response.json().catch(() => null); setState(result?.error === "contact_unavailable" ? "unavailable" : "error"); }
    } catch { setState("error"); }
  }

  const message = state === "success" ? copy.success : state === "unavailable" ? copy.unavailable : state === "error" ? copy.error : "";
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="form-grid">
        <label>{copy.name}<input name="name" autoComplete="name" minLength={2} required /></label>
        <label>{copy.email}<input name="email" type="email" autoComplete="email" required /></label>
        <label>{copy.country}<select name="country" autoComplete="country" value={country} required onChange={(event) => {
          const nextCountry = event.target.value as CountryCode | "";
          setCountry(nextCountry);
          setPhone(nextCountry ? `+${getCountryCallingCode(nextCountry)}` : "");
          const input = event.currentTarget.form?.elements.namedItem("phone") as HTMLInputElement | null;
          input?.setCustomValidity("");
        }}><option value="">{copy.select}</option>{countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}</select></label>
        <label>{copy.phone}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={phone} placeholder={phonePlaceholder} disabled={!country} required maxLength={32} onChange={(event) => {
          event.currentTarget.setCustomValidity("");
          const value = event.target.value;
          const deleting = (event.nativeEvent as InputEvent).inputType?.startsWith("delete");
          setPhone(deleting ? value : new AsYouType(country || undefined).input(value));
        }} onBlur={(event) => {
          const parsed = parsePhoneNumberFromString(phone, country || undefined);
          event.currentTarget.setCustomValidity(parsed?.isPossible() ? "" : international.phoneError);
          if (parsed?.isPossible()) setPhone(parsed.formatInternational());
        }} /></label>
        <label>{copy.language}<select name="preferredLanguage" required defaultValue={locale}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
        <label>{copy.residence}<select name="residence" required defaultValue={selectedResidence || ""}><option value="">{copy.select}</option>{residences.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label>{copy.objective}<select name="objective" required defaultValue=""><option value="">{copy.select}</option>{copy.objectives.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.budget} ({rateLoading ? currency : displayCurrency})<select name="budget" required value={budget} onChange={(event) => setBudget(event.target.value)} disabled={!country || rateLoading} aria-describedby={budgetHintId}><option value="">{rateLoading ? international.loading : copy.select}</option>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span id={budgetHintId} className="field-hint" role="status">{rateLoading ? international.loading : rateFailed ? international.fallback : displayCurrency !== "BRL" && quote.date ? `${international.estimate} ${new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(new Date(`${quote.date}T00:00:00Z`))}` : ""}</span></label>
        <label>{copy.timeline}<select name="timeline" defaultValue=""><option value="">{copy.select}</option>{copy.timelines.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.message}<textarea name="message" rows={2} maxLength={2000} /></label>
      </div>
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /><span>{copy.consent} {copy.privacy} <a href="https://convivaengenharia.com.br/politicas/" target="_blank" rel="noreferrer">{copy.privacyLink}</a>.</span></label>
      <div className="form-submit-row"><button className="button button-dark" type="submit" disabled={state === "sending" || rateLoading}>{state === "sending" ? copy.sending : copy.submit}<span aria-hidden="true">→</span></button><p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p></div>
    </form>
  );
}
