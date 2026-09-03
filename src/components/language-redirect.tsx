"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { locales, type Locale } from "@/lib/i18n";

const detectLocale = (): Locale => {
  const saved = window.localStorage.getItem("conviva-locale");
  if (saved && locales.includes(saved as Locale)) return saved as Locale;
  const language = (navigator.languages?.[0] || navigator.language || "en").toLowerCase();
  if (language.startsWith("pt")) return "pt-BR";
  if (language.startsWith("zh")) return "zh-CN";
  const prefix = language.split("-")[0] as Locale;
  return locales.includes(prefix) ? prefix : "en";
};

export function LanguageRedirect() {
  useEffect(() => { window.location.replace(`/${detectLocale()}${window.location.hash}`); }, []);
  return <main className="redirect-page"><Image src="/images/conviva-logo.svg" alt="Conviva" width={154} height={38} priority /><p>Opening Conviva in your language...</p><nav aria-label="Choose a language"><Link href="/pt-BR">Português</Link><Link href="/en">English</Link><Link href="/es">Español</Link><Link href="/de">Deutsch</Link><Link href="/fr">Français</Link><Link href="/it">Italiano</Link><Link href="/ja">日本語</Link><Link href="/zh-CN">中文</Link></nav></main>;
}
