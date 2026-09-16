import Image from "next/image";
import Link from "next/link";
import type { Dictionary, Locale, Residence } from "@/lib/i18n";
import { ContactForm } from "./contact-form";
import { countryOptions } from "@/lib/international-form";
import { Reveal } from "./reveal";
import { SiteHeader } from "./site-header";

export function ResidencePage({ locale, copy, residence }: { locale: Locale; copy: Dictionary; residence: Residence }) {
  return (
    <>
      <SiteHeader locale={locale} nav={copy.nav} />
      <main>
        <section className="residence-hero" aria-labelledby="residence-title">
          <Image className="hero-image" src={residence.image} alt={residence.alt} fill priority sizes="100vw" />
          <div className="hero-shade" />
          <div className="page-width residence-hero-content">
            <Link className="back-link" href={`/${locale}/#residences`}>← {copy.detail.back}</Link>
            <p>{residence.neighborhood} | {residence.statusLabel}</p>
            <h1 id="residence-title">{residence.name}</h1>
            <p className="residence-summary">{residence.summary}</p>
            <a className="button button-light" href="#contact">{copy.nav.contact}<span aria-hidden="true">↓</span></a>
          </div>
        </section>
        <section className="facts-strip" aria-label={copy.detail.status}><div className="page-width facts-grid"><div><span>{copy.detail.typology}</span><strong>{residence.typology}</strong></div><div><span>{copy.detail.area}</span><strong>{residence.area}</strong></div><div><span>{copy.detail.status}</span><strong>{residence.statusLabel}</strong></div></div></section>
        <section className="detail-story section-pad"><div className="page-width story-grid"><Reveal className="story-copy"><h2>{copy.detail.investmentTitle}</h2><p>{copy.detail.investmentText}</p></Reveal><Reveal className="story-image" delay={0.08}><Image src={residence.gallery[1]} alt={`${residence.alt} 2`} fill sizes="(max-width: 760px) 100vw, 50vw" /></Reveal><Reveal className="story-image story-image-secondary"><Image src={residence.gallery[2]} alt={`${residence.alt} 3`} fill sizes="(max-width: 760px) 100vw, 42vw" /></Reveal><Reveal className="story-copy story-copy-secondary" delay={0.08}><h2>{copy.detail.holidaysTitle}</h2><p>{copy.detail.holidaysText}</p></Reveal></div></section>
        <section className="gallery-section section-pad" aria-labelledby="gallery-title"><div className="page-width"><Reveal><h2 id="gallery-title">{copy.detail.galleryTitle}</h2></Reveal><div className="gallery-grid">{residence.gallery.map((image, index) => <Reveal className={`gallery-image gallery-${index + 1}`} key={image} delay={index * 0.04}><Image src={image} alt={`${residence.alt} ${index + 1}`} fill sizes="(max-width: 760px) 100vw, 50vw" /></Reveal>)}</div></div></section>
        <section className="feature-section section-pad"><div className="page-width feature-layout"><Reveal><h2>{copy.detail.featuresTitle}</h2></Reveal><div className="feature-list">{copy.detail.features.map((item, index) => <Reveal key={item} className="feature-row" delay={index * 0.05}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></Reveal>)}</div></div></section>
        <section className="location-band section-pad"><Image src="/images/niteroi-coast.jpg" alt={`${copy.discover.city}, Brasil`} fill sizes="100vw" /><div className="location-band-shade" /><Reveal className="page-width location-band-copy"><h2>{copy.detail.locationTitle}</h2><p>{copy.detail.locationText}</p></Reveal></section>
        <section className="faq-section section-pad" aria-labelledby="faq-title"><div className="page-width faq-layout"><Reveal><h2 id="faq-title">{copy.detail.faqTitle}</h2><p>{copy.detail.legal}</p></Reveal><div className="faq-list">{copy.detail.faqs.map((item) => <details key={item.title}><summary>{item.title}</summary><p>{item.text}</p></details>)}</div></div></section>
        <section className="contact-section section-pad" id="contact" aria-labelledby="contact-title"><div className="page-width contact-grid"><Reveal className="contact-copy"><h2 id="contact-title">{copy.contact.title}</h2><p>{copy.contact.text}</p></Reveal><Reveal className="contact-form-wrap" delay={0.08}><ContactForm copy={copy.contact} locale={locale} residences={copy.residences} countries={countryOptions(locale)} selectedResidence={residence.slug} /></Reveal></div></section>
      </main>
      <footer className="site-footer"><div className="page-width footer-main"><Image src="/images/conviva-logo.svg" alt="Conviva" width={164} height={41} /><p>{copy.footer.statement}</p><a className="button button-small button-light" href="#contact">{copy.nav.contact}</a></div><div className="page-width footer-legal"><p>{copy.footer.legal}</p><p>Conviva {new Date().getFullYear()}. {copy.footer.rights}</p></div></footer>
    </>
  );
}
