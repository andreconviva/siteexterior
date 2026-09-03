"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Dictionary, Locale, Residence } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";

type FormState = "idle" | "sending" | "success" | "error" | "unavailable";

export function ContactForm({ copy, locale, residences, selectedResidence }: { copy: Dictionary["contact"]; locale: Locale; residences: Residence[]; selectedResidence?: string }) {
  const [state, setState] = useState<FormState>("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setState("sending");
    const data = Object.fromEntries(new FormData(form).entries());
    const query = new URLSearchParams(window.location.search);
    const residence = residences.find((item) => item.slug === data.residence);
    const attribution = Object.fromEntries(["source", "medium", "campaign", "content", "term"].map((key) => [`utm_${key}`, query.get(`utm_${key}`) || ""]));
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...attribution, locale, residenceStatus: residence?.status || "", originUrl: window.location.href, referrer: document.referrer, submittedAt: new Date().toISOString(), formVersion: "international-v1" }),
      });
      if (response.ok) { setState("success"); form.reset(); }
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
        <label>{copy.country}<input name="country" autoComplete="country-name" minLength={2} required /></label>
        <label>{copy.phone}<input name="phone" type="tel" autoComplete="tel" minLength={7} required /></label>
        <label>{copy.language}<select name="preferredLanguage" required defaultValue={locale}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
        <label>{copy.residence}<select name="residence" required defaultValue={selectedResidence || ""}><option value="">{copy.select}</option>{residences.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
        <label>{copy.objective}<select name="objective" required defaultValue=""><option value="">{copy.select}</option>{copy.objectives.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.budget}<select name="budget" required defaultValue=""><option value="">{copy.select}</option>{copy.budgets.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>{copy.timeline}<select name="timeline" defaultValue=""><option value="">{copy.select}</option>{copy.timelines.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="form-wide">{copy.message}<textarea name="message" rows={4} maxLength={2000} /></label>
      </div>
      <label className="consent"><input name="consent" type="checkbox" value="yes" required /><span>{copy.consent} {copy.privacy} <a href="https://convivaengenharia.com.br/politicas/" target="_blank" rel="noreferrer">{copy.privacyLink}</a>.</span></label>
      <div className="form-submit-row"><button className="button button-dark" type="submit" disabled={state === "sending"}>{state === "sending" ? copy.sending : copy.submit}<span aria-hidden="true">→</span></button><p className={`form-status ${state}`} role="status" aria-live="polite">{message}</p></div>
    </form>
  );
}
