"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { localeNames, locales } from "@/lib/i18n";

export function SiteHeader({ locale, nav }: { locale: Locale; nav: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => { document.documentElement.lang = locale; }, [locale]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const switchLanguage = (nextLocale: Locale) => {
    window.localStorage.setItem("conviva-locale", nextLocale);
    const segments = pathname.split("/");
    segments[1] = nextLocale;
    router.push(`${segments.join("/")}${window.location.hash}`);
    setOpen(false);
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <Link className="brand" href={`/${locale}`} aria-label="Conviva"><Image src="/images/conviva-logo.svg" alt="Conviva" width={158} height={39} priority /></Link>
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? nav.close : nav.menu} onClick={() => setOpen(!open)}><span /><span /></button>
      <div id="site-navigation" className={`nav-shell ${open ? "is-open" : ""}`}>
        <nav className="primary-nav" aria-label={nav.menu}>
          <a href={`/${locale}/#residences`} onClick={() => setOpen(false)}>{nav.residences}</a>
          <a href={`/${locale}/#location`} onClick={() => setOpen(false)}>{nav.location}</a>
          <a href={`/${locale}/#why-conviva`} onClick={() => setOpen(false)}>{nav.why}</a>
        </nav>
        <div className="header-actions">
          <label className="language-select"><span className="sr-only">{nav.language}</span><select value={locale} onChange={(event) => switchLanguage(event.target.value as Locale)}>{locales.map((item) => <option key={item} value={item}>{localeNames[item]}</option>)}</select></label>
          <a className="button button-small" href={`/${locale}/#contact`} onClick={() => setOpen(false)}>{nav.contact}</a>
        </div>
      </div>
    </header>
  );
}
