export const locales = ["pt-BR", "en", "es", "de", "fr", "it", "ja", "zh-CN"] as const;
export type Locale = (typeof locales)[number];

export const residenceSlugs = [
  "brise",
  "life-inga",
  "life-camboinhas",
  "conviva-camboinhas",
  "conviva-icarai",
  "conviva-itacoa",
  "nice-camboinhas",
  "conviva-piratininga",
  "conviva-inga",
] as const;

export type ResidenceSlug = (typeof residenceSlugs)[number];
export type ResidenceStatus = "current" | "completed";
export type Item = { title: string; text: string };

export type LocalePack = {
  meta: { title: string; description: string };
  nav: { residences: string; location: string; why: string; contact: string; menu: string; close: string; language: string };
  hero: { note: string; title: string; text: string; cta: string };
  discover: { title: string; text: string; city: string; rio: string; connection: string; profiles: readonly Item[] };
  reasons: { title: string; items: readonly Item[] };
  portfolio: { title: string; current: string; completed: string; view: string; currentStatus: string; completedStatus: string };
  journey: { title: string; text: string; items: readonly Item[] };
  why: { title: string; text: string; items: readonly string[] };
  contact: {
    title: string;
    text: string;
    name: string;
    email: string;
    country: string;
    phone: string;
    language: string;
    residence: string;
    objective: string;
    budget: string;
    timeline: string;
    message: string;
    consent: string;
    privacy: string;
    privacyLink: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
    unavailable: string;
    select: string;
    objectives: readonly string[];
    budgets: readonly string[];
    timelines: readonly string[];
  };
  detail: {
    back: string;
    area: string;
    typology: string;
    status: string;
    investmentTitle: string;
    investmentText: string;
    holidaysTitle: string;
    holidaysText: string;
    galleryTitle: string;
    featuresTitle: string;
    features: readonly string[];
    locationTitle: string;
    locationText: string;
    processTitle: string;
    faqTitle: string;
    faqs: readonly Item[];
    legal: string;
  };
  footer: { statement: string; legal: string; rights: string };
  typologies: readonly string[];
  summaries: readonly string[];
  altPrefix: string;
};

export type Residence = {
  slug: ResidenceSlug;
  name: string;
  neighborhood: string;
  status: ResidenceStatus;
  statusLabel: string;
  typology: string;
  area: string;
  summary: string;
  image: string;
  gallery: readonly string[];
  alt: string;
};

export type Dictionary = Omit<LocalePack, "typologies" | "summaries" | "altPrefix"> & { residences: Residence[] };
