"use client";

import type { FormEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AsYouType, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import type { Dictionary, Locale, Residence } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";
import { budgetOptions, currencyForCountry, internationalCopy } from "@/lib/international-form";

type FormState = "idle" | "sending" | "success" | "error" | "unavailable";

function normalizeCountrySearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function ContactForm({ copy, locale, residences, countries, selectedResidence }: { copy: Dictionary["contact"]; locale: Locale; residences: Residence[]; countries: { code: CountryCode; name: string }[]; selectedResidence?: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [country, setCountry] = useState<CountryCode | "">("");
  const [countryQuery, setCountryQuery] = useState("");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryActiveIndex, setCountryActiveIndex] = useState(0);
  const autoCountryInitialized = useRef(false);
  const [phone, setPhone] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState<Locale>(locale);
  const [residenceSlug, setResidenceSlug] = useState(selectedResidence || "");
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [messageText, setMessageText] = useState("");
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
  const filteredCountries = useMemo(() => {
    const query = normalizeCountrySearch(countryQuery);
    if (!query) return countries;
    return countries.filter((item) => normalizeCountrySearch(`${item.name} ${item.code}`).includes(query));
  }, [countries, countryQuery]);

  useEffect(() => {
    if (autoCountryInitialized.current || country || typeof navigator === "undefined") return;
    autoCountryInitialized.current = true;
    const language = navigator.language || "";
    const [languageCode, region] = language.split("-");
    const languageDefaults: Record<string, CountryCode> = { pt: "BR", en: "US", es: "ES", de: "DE", fr: "FR", it: "IT", ja: "JP", zh: "CN" };
    const preferredCode = (region?.length === 2 ? region.toUpperCase() : languageDefaults[languageCode]) as CountryCode | undefined;
    const match = countries.find((item) => item.code === preferredCode);
    if (match) {
      setCountry(match.code);
      setCountryQuery(match.name);
      setPhone(`+${getCountryCallingCode(match.code)}`);
    }
  }, [countries, country]);

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
    const countryInput = form.querySelector('[role="combobox"]') as HTMLInputElement;
    countryInput.setCustomValidity(country ? "" : copy.select);
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (rateLoading) return;
    setState("sending");
    const data = Object.fromEntries(new FormData(form).entries());
    const query = new URLSearchParams(window.location.search);
    const residence = residences.find((item) => item.slug === residenceSlug);
    const selectedBudget = options.find((item) => item.id === budget);
    const countryName = countries.find((item) => item.code === country)?.name || country;
    const crmDetails = [
      `${copy.country}: ${countryName}`,
      `${copy.language}: ${localeNames[preferredLanguage]}`,
      `${copy.objective}: ${objective}`,
      `${copy.budget}: ${selectedBudget?.label || ""}`,
      `${copy.timeline}: ${timeline}`,
      `${copy.message}: ${messageText || "-"}`,
    ].join("\n");
    const attribution = Object.fromEntries(["source", "medium", "campaign", "content", "term"].map((key) => [`utm_${key}`, query.get(`utm_${key}`) || ""]));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution, country: countryName, countryCode: country, phone: parsedPhone!.number, preferredLanguage, residence: residenceSlug, objective, budget: selectedBudget?.label, budgetBand: budget, timeline, message: crmDetails, budgetCurrency: displayCurrency, budgetBaseCurrency: "BRL", budgetMinBRL: selectedBudget?.min, budgetMaxBRL: selectedBudget?.max, exchangeRate: rate, exchangeRateDate: displayCurrency === "BRL" ? null : quote.date, locale, residenceStatus: residence?.status || "", originUrl: window.location.href, referrer: document.referrer, submittedAt: new Date().toISOString(), formVersion: "international-v2" }),
      });
      if (response.ok) { setState("success"); form.reset(); setCountry(""); setCountryQuery(""); setPhone(""); setPreferredLanguage(locale); setResidenceSlug(""); setObjective(""); setBudget(""); setTimeline(""); setMessageText(""); }
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
        <label className="country-field">{copy.country}<div className="country-combobox">
          <input type="text" role="combobox" aria-autocomplete="list" aria-controls="country-options" aria-expanded={countryOpen} autoComplete="country-name" placeholder={copy.select} value={countryQuery} required onFocus={() => { setCountryOpen(true); setCountryActiveIndex(0); }} onBlur={(event) => {
            window.setTimeout(() => setCountryOpen(false), 120);
            if (!country) event.currentTarget.setCustomValidity(copy.select);
          }} onChange={(event) => {
            const nextQuery = event.target.value;
            const exact = countries.find((item) => normalizeCountrySearch(item.name) === normalizeCountrySearch(nextQuery) || item.code.toLowerCase() === nextQuery.trim().toLowerCase());
            setCountryQuery(nextQuery);
            setCountryOpen(true);
            setCountryActiveIndex(0);
            setCountry(exact?.code || "");
            setPhone(exact ? `+${getCountryCallingCode(exact.code)}` : "");
            event.currentTarget.setCustomValidity(exact ? "" : copy.select);
            const phoneInput = event.currentTarget.form?.elements.namedItem("phone") as HTMLInputElement | null;
            phoneInput?.setCustomValidity("");
          }} onKeyDown={(event) => {
            if (!countryOpen && (event.key === "ArrowDown" || event.key === "Enter")) { setCountryOpen(true); return; }
            if (event.key === "ArrowDown") { event.preventDefault(); setCountryActiveIndex((index) => Math.min(index + 1, filteredCountries.length - 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setCountryActiveIndex((index) => Math.max(index - 1, 0)); }
            if (event.key === "Enter" && filteredCountries[countryActiveIndex]) { event.preventDefault(); const nextCountry = filteredCountries[countryActiveIndex]; setCountry(nextCountry.code); setCountryQuery(nextCountry.name); setPhone(`+${getCountryCallingCode(nextCountry.code)}`); setCountryOpen(false); event.currentTarget.setCustomValidity(""); }
            if (event.key === "Escape") setCountryOpen(false);
          }} />
          {countryOpen && filteredCountries.length > 0 && <div className="country-options" id="country-options" role="listbox">{filteredCountries.slice(0, 12).map((item, index) => <button type="button" role="option" aria-selected={item.code === country} className={index === countryActiveIndex ? "is-active" : ""} key={item.code} onMouseDown={(event) => event.preventDefault()} onClick={(event) => { const input = event.currentTarget.closest("form")?.querySelector('[role="combobox"]') as HTMLInputElement | null; setCountry(item.code); setCountryQuery(item.name); setPhone(`+${getCountryCallingCode(item.code)}`); setCountryOpen(false); input?.setCustomValidity(""); }}>{item.name}</button>)}</div>}
        </div></label>
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
        <label>{copy.language}<select required value={preferredLanguage} onChange={(event) => setPreferredLanguage(event.target.value as Locale)}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
        <label>{copy.residence}<select required value={residenceSlug} onChange={(event) => setResidenceSlug(event.target.value)}><option value="">{copy.select}</option>{residences.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label>{copy.objective}<select required value={objective} onChange={(event) => setObjective(event.target.value)}><option value="">{copy.select}</option>{copy.objectives.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.budget} ({rateLoading ? currency : displayCurrency})<select required value={budget} onChange={(event) => setBudget(event.target.value)} disabled={!country || rateLoading} aria-describedby={budgetHintId}><option value="">{rateLoading ? international.loading : copy.select}</option>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span id={budgetHintId} className="field-hint" role="status">{rateLoading ? international.loading : rateFailed ? international.fallback : displayCurrency !== "BRL" && quote.date ? `${international.estimate} ${new Intl.DateTimeFormat(locale, { timeZone: "UTC" }).format(new Date(`${quote.date}T00:00:00Z`))}` : ""}</span></label>
        <label>{copy.timeline}<select required value={timeline} onChange={(event) => setTimeline(event.target.value)}><option value="">{copy.select}</option>{copy.timelines.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.message}<textarea rows={2} maxLength={2000} value={messageText} onChange={(event) => setMessageText(event.target.value)} /></label>
      </div>
      <input type="hidden" name="message" value={[`${copy.country}: ${countries.find((item) => item.code === country)?.name || country}`, `${copy.language}: ${localeNames[preferredLanguage]}`, `${copy.objective}: ${objective}`, `${copy.budget}: ${options.find((item) => item.id === budget)?.label || ""}`, `${copy.timeline}: ${timeline}`, `${copy.message}: ${messageText || "-"}`].join("\n")} readOnly />
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /><span>{copy.consent} {copy.privacy} <a href="https://convivaengenharia.com.br/politicas/" target="_blank" rel="noreferrer">{copy.privacyLink}</a>.</span></label>
      <div className="form-submit-row"><button className="button button-dark" type="submit" disabled={state === "sending" || rateLoading}>{state === "sending" ? copy.sending : copy.submit}<span aria-hidden="true">→</span></button><p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p></div>
    </form>
  );
}
