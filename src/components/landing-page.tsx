import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale, Residence } from "@/lib/i18n";
import { ContactForm } from "./contact-form";
import { countryOptions } from "@/lib/international-form";
import { Reveal } from "./reveal";
import { SiteHeader } from "./site-header";

export function LandingPage({ locale, copy }: { locale: Locale; copy: Dictionary }) {
  const current = copy.residences.filter((item) => item.status === "current");
  const completed = copy.residences.filter((item) => item.status === "completed");

  return (
    <>
      <SiteHeader locale={locale} nav={copy.nav} />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <Image className="hero-image" src="/images/hero-sunset-niteroi.webp" alt={copy.hero.note} fill priority sizes="100vw" />
          <div className="hero-shade" />
          <div className="hero-content page-width">
            <p className="hero-note">{copy.hero.note}</p>
            <h1 id="hero-title">{copy.hero.title}</h1>
            <p className="hero-text">{copy.hero.text}</p>
            <a className="button button-light" href="#residences">{copy.hero.cta}<span aria-hidden="true">↓</span></a>
          </div>
        </section>

        <section className="discover section-pad" id="location" aria-labelledby="discover-title">
          <div className="page-width discover-grid">
            <Reveal className="discover-copy">
              <h2 id="discover-title">{copy.discover.title}</h2>
              <p>{copy.discover.text}</p>
            </Reveal>
            <Reveal className="place-visual" delay={0.08}>
              <div className="coast-image"><Image src="/images/niteroi-coast.jpg" alt={`${copy.discover.city}, Brasil`} fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
            </Reveal>
          </div>
          <div className="page-width place-profiles">
            {copy.discover.profiles.map((item, index) => <Reveal key={item.title} className="place-profile" delay={index * 0.05}><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}
          </div>
          {copy.discover.articles?.length ? <div className="page-width discover-growth">
            <Reveal className="growth-copy"><p className="eyebrow">{copy.discover.growthTitle}</p><p>{copy.discover.growthText}</p></Reveal>
            <div className="article-list">{copy.discover.articles.map((article, index) => <Reveal key={article.href} className="article-card" delay={index * 0.05}><p className="article-source">{article.source}</p><a href={article.href} target="_blank" rel="noreferrer">{article.title}<span aria-hidden="true">↗</span></a></Reveal>)}</div>
          </div> : null}
        </section>

        <section className="reasons-section section-pad" aria-labelledby="reasons-title">
          <div className="page-width reasons-grid">
            <Reveal className="reasons-heading"><h2 id="reasons-title">{copy.reasons.title}</h2></Reveal>
            <div className="reasons-list">
              {copy.reasons.items.map((item, index) => <Reveal className="reason" key={item.title} delay={index * 0.05}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></Reveal>)}
            </div>
          </div>
        </section>

        <section className="portfolio-section section-pad" id="residences" aria-labelledby="portfolio-title">
          <div className="page-width">
            <Reveal className="portfolio-heading"><h2 id="portfolio-title">{copy.portfolio.title}</h2></Reveal>
            <p className="collection-label">{copy.portfolio.current}</p>
            <div className="residence-grid">
              {current.map((residence, index) => <ResidenceCard key={residence.slug} residence={residence} locale={locale} action={copy.portfolio.view} featured={index === 0 || index === 3} />)}
            </div>
          </div>
        </section>

        <section className="completed-section section-pad" aria-labelledby="completed-title">
          <div className="page-width completed-layout">
            <Reveal className="completed-heading"><p className="collection-label">{copy.portfolio.completed}</p><h2 id="completed-title">{copy.why.title}</h2><p>{copy.why.text}</p></Reveal>
            <div className="completed-grid">
              {completed.map((residence) => <ResidenceCard key={residence.slug} residence={residence} locale={locale} action={copy.portfolio.view} />)}
            </div>
          </div>
        </section>

        <section className="journey-section section-pad" aria-labelledby="journey-title">
          <div className="page-width">
            <Reveal className="vertical-heading"><h2 id="journey-title">{copy.journey.title}</h2><p>{copy.journey.text}</p></Reveal>
            <div className="journey-line">
              {copy.journey.items.map((item, index) => <Reveal className="journey-item" key={item.title} delay={index * 0.05}><span>{String(index + 1).padStart(2, "0")}</span><h3>{item.title}</h3><p>{item.text}</p></Reveal>)}
            </div>
          </div>
        </section>

        <section className="conviva-section section-pad" id="why-conviva" aria-labelledby="why-title">
          <Image className="conviva-image" src="/images/residences/conviva-camboinhas-2.webp" alt={copy.residences[3].alt} fill sizes="100vw" />
          <div className="conviva-shade" />
          <div className="page-width conviva-content">
            <Reveal><h2 id="why-title">{copy.why.title}</h2><p>{copy.why.text}</p></Reveal>
            <Reveal className="conviva-points" delay={0.08}>{copy.why.items.map((item) => <p key={item}>{item}</p>)}</Reveal>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title">
          <div className="page-width contact-grid">
            <Reveal className="contact-copy"><h2 id="contact-title">{copy.contact.title}</h2><p>{copy.contact.text}</p></Reveal>
            <Reveal className="contact-form-wrap" delay={0.08}><ContactForm copy={copy.contact} locale={locale} residences={copy.residences} countries={countryOptions(locale)} /></Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="page-width footer-main"><Image src="/images/conviva-logo.svg" alt="Conviva" width={164} height={41} /><p>{copy.footer.statement}</p><a className="button button-small button-light" href="#contact">{copy.nav.contact}</a></div>
        <div className="page-width footer-legal"><p>{copy.footer.legal}</p><p>Conviva {new Date().getFullYear()}. {copy.footer.rights}</p></div>
      </footer>
    </>
  );
}

function ResidenceCard({ residence, locale, action, featured = false }: { residence: Residence; locale: Locale; action: string; featured?: boolean }) {
  return (
    <Reveal className={`residence-card ${featured ? "is-featured" : ""}`}>
      <Link href={`/${locale}/residences/${residence.slug}`} className="residence-image" aria-label={`${action}: ${residence.name}`}>
        <Image src={residence.image} alt={residence.alt} fill sizes={featured ? "(max-width: 760px) 100vw, 62vw" : "(max-width: 760px) 100vw, 38vw"} />
      </Link>
      <div className="residence-copy">
        <div><p>{residence.neighborhood}</p><h3>{residence.name}</h3></div>
        <span>{residence.statusLabel}</span>
        <p className="residence-facts">{residence.typology} | {residence.area}</p>
        <p>{residence.summary}</p>
        <Link className="text-link" href={`/${locale}/residences/${residence.slug}`}>{action}<span aria-hidden="true">↗</span></Link>
      </div>
    </Reveal>
  );
}
