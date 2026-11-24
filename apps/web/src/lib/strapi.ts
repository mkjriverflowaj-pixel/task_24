const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';

export type Media = { url: string; alternativeText?: string | null; width?: number; height?: number };

export type Category = {
  documentId: string;
  name: string;
  slug: string;
  tagline?: string | null;
  description?: string | null;
  order: number;
  homeOrder?: number | null;
  categoriesOrder?: number | null;
  showInMenu?: boolean;
  showInProducts?: boolean | null;
  highlights?: Feature[];
  image?: Media | null;
  parent?: Category | null;
  children?: Category[];
  products?: Product[];
};

export type Product = {
  documentId: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  brief?: string | null;
  description?: string | null;
  featured?: boolean;
  sku?: string | null;
  /** Medusa variant to put in the cart. */
  variantId?: string | null;
  badge?: string | null;
  /** Store fields (Strapi → Product): price in INR, the higher "was" price, rating out of 5, reviews, stock, unit. */
  price?: number | null;
  compareAtPrice?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  createdAt?: string;
  stock?: number | null;
  unit?: string | null;
  features?: Feature[];
  specifications?: { id?: number; label: string; value: string }[] | null;
  details?: { id: number; label: string; value?: string | null; asList?: boolean | null }[];
  images?: Media[] | null;
  category?: Category | null;
};

export type SiteSetting = {
  siteName: string;
  tagline?: string;
  footerText?: string | null;
  phone?: string;
  email?: string;
  officeHours?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  addresses?: { id: number; label?: string; text: string }[];
  stats?: { id: number; value: number; suffix?: string; label: string; unit?: string | null }[];
};

export type Feature = { id: number; title: string; description?: string | null };

export type HeroSlideData = {
  id: number;
  heading: string;
  eyebrow?: string | null;
  subheading?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  theme?: 'red' | 'black' | 'warm' | null;
  image?: Media | null;
};

export type HomeBanner = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  image?: Media | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  secondaryButtonLabel?: string | null;
  secondaryButtonUrl?: string | null;
  scrollHint?: string | null;
  heroSlides?: HeroSlideData[];
};

export type ValueItemData = { id: number; label: string; title: string; text?: string | null; art?: 'promise' | 'quality' | 'safety' | 'care' | 'india' | null; image?: Media | null };

export type FooterData = {
  description?: string | null;
  quickLinksTitle?: string | null;
  quickLinks?: { id: number; label: string; url: string }[];
  usefulLinksTitle?: string | null;
  usefulLinks?: { id: number; label: string; url: string }[];
  showLegalPages?: boolean | null;
  followTitle?: string | null;
  contactTitle?: string | null;
  copyrightName?: string | null;
  copyrightUrl?: string | null;
  copyrightSuffix?: string | null;
  creditLabel?: string | null;
  creditName?: string | null;
  creditUrl?: string | null;
  creditSuffix?: string | null;
};

export type Space = {
  documentId: string;
  name: string;
  slug: string;
  tag?: string | null;
  description?: string | null;
  /** Short text on the home page card (falls back to description). */
  cardDescription?: string | null;
  image?: Media | null;
  order?: number | null;
  categories?: Category[];
};

export type AnimationSettingData = {
  allAnimations?: boolean | null;
  home?: Record<string, number | boolean | null> | null;
  about?: Record<string, number | boolean | null> | null;
  smartLink?: (Record<string, number | boolean | null | Media> & { heroLottie?: Media | null }) | null;
};

export type SpaceCard = { id: number; tag?: string | null; title: string; description?: string | null; link?: string | null; image?: Media | null };

export type HomePage = {
  heroSlides?: HeroSlideData[];
  categoriesEyebrow?: string;
  categoriesTitle?: string;
  categoriesSubtitle?: string;
  highlights?: Feature[];
  ctaTitle?: string;
  ctaEyebrow?: string;
  ctaText?: string;
  helpImage?: Media | null;
  helpImageBack?: Media | null;
  ctaLabel?: string;
  promoTitle?: string;
  promoSubtitle?: string;
  promoLabel?: string;
  promoImage?: Media | null;
  whyEyebrow?: string;
  whyTitle?: string;
  whyItems?: Feature[];
  bannerTitle?: string;
  bannerText?: string;
  bannerLabel?: string;
  orbitEyebrow?: string | null;
  orbitTitle?: string | null;
  orbitHint?: string | null;
  spacesEyebrow?: string | null;
  spacesTitle?: string | null;
  spacesSubtitle?: string | null;
  spaces?: SpaceCard[];
};

export type Milestone = { id: number; year: string; title: string; description?: string | null; current?: boolean | null };

export type Capability = { id: number; icon?: string | null; title: string; description?: string | null; bullets?: string | null };
export type Leader = { id: number; icon?: string | null; role: string; unit?: string | null; text?: string | null; badge?: string | null };

export type AboutPage = {
  heading: string;
  intro?: string;
  image?: Media | null;
  rangeTitle?: string;
  rangeSubtitle?: string;
  certificationsTitle?: string;
  certificationsText?: string;
  certifications?: { id: number; name: string; fullName?: string }[];
  certificationsSubtitle?: string;
  certificationsClosing?: string;
  rangeItems?: { id: number; label: string; link?: string | null; image?: Media | null }[];
  valuesTitle?: string;
  valuesIntro?: string;
  valuesImage?: Media | null;
  values?: Feature[];
  journeyEyebrow?: string | null;
  journeyTitle?: string | null;
  journeySubtitle?: string | null;
  journey?: Milestone[];
  valuesSlides?: { id: number; title?: string | null; image?: Media | null }[];
  valuesEyebrow?: string | null;
  valuesCtaLabel?: string | null;
  valuesCtaUrl?: string | null;
  valueItems?: ValueItemData[];
  capabilitiesEyebrow?: string | null;
  capabilitiesTitle?: string | null;
  capabilitiesText?: string | null;
  capabilities?: Capability[];
  leadersEyebrow?: string | null;
  leadersTitle?: string | null;
  leadersText?: string | null;
  leaders?: Leader[];
};

export type Testimonial = { documentId: string; title: string; quote: string; name: string; company?: string | null; photo?: Media | null; videoUrl?: string | null };

export type ContactPage = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  heroImage?: Media | null;
  sectionTitle?: string;
  sectionSubtitle?: string;
  helpTitle?: string;
  helpText?: string;
  helpLabel?: string;
  mapTitle?: string;
  mapCoordinates?: string;
  faqEyebrow?: string | null;
  faqTitle?: string | null;
  faqSubtitle?: string | null;
};

export type ProductsPage = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  heroImage?: Media | null;
};

export type Faq = { documentId: string; question: string; answer: string; tag?: string | null; icon?: string | null; onContactPage?: boolean | null };
export type LegalPage = { documentId: string; title: string; slug: string; content: string };

export function mediaUrl(media?: Media | null): string | null {
  if (!media?.url) return null;
  return media.url.startsWith('http') ? media.url : `${BASE}${media.url}`;
}

async function request<T>(path: string, query: Record<string, string> = {}): Promise<T> {
  const url = new URL(`/api/${path}`, BASE);
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Strapi ${res.status} for ${url.pathname}`);
  return (await res.json()).data as T;
}

export const getSiteSetting = () =>
  request<SiteSetting>('site-setting', { 'populate[0]': 'addresses', 'populate[1]': 'stats' });

export const getHomePage = () =>
  request<HomePage>('home-page', {
    'populate[0]': 'highlights',
    'populate[1]': 'promoImage',
    'populate[2]': 'whyItems',
    'populate[3]': 'helpImage',
    'populate[4]': 'helpImageBack',
    'populate[5]': 'spaces',
    'populate[6]': 'spaces.image',
  });

export const getAboutPage = () =>
  request<AboutPage>('about-page', {
    'populate[0]': 'image',
    'populate[1]': 'certifications',
    'populate[2]': 'values',
    'populate[3]': 'rangeItems',
    'populate[4]': 'rangeItems.image',
    'populate[5]': 'valuesImage',
    'populate[6]': 'journey',
    'populate[7]': 'capabilities',
    'populate[8]': 'leaders',
    'populate[9]': 'valuesSlides',
    'populate[10]': 'valuesSlides.image',
    'populate[11]': 'valueItems',
    'populate[12]': 'valueItems.image',
  });

/** The site footer (Strapi: Footer). Null when it has not been filled in, and the footer then uses its built-in wording. */
export const getFooter = () => request<FooterData>('footer', { 'populate[0]': 'quickLinks', 'populate[1]': 'usefulLinks' }).catch(() => null);

/** The big first banner on the home page (Strapi: Home Banner). Null when it has not been filled in. */
export const getHomeBanner = () => request<HomeBanner>('home-banner', { 'populate[0]': 'image', 'populate[1]': 'heroSlides', 'populate[2]': 'heroSlides.image' }).catch(() => null);

export const getTestimonials = () =>
  request<Testimonial[]>('testimonials', { sort: 'order', 'populate[0]': 'photo', 'pagination[pageSize]': '50' });

export const getContactPage = () => request<ContactPage>('contact-page', { 'populate[0]': 'heroImage' });

export const getProductsPage = () => request<ProductsPage>('products-page', { 'populate[0]': 'heroImage' });

export const getFaqs = () => request<Faq[]>('faqs', { sort: 'order', 'pagination[pageSize]': '100' });

export const getLegalPages = () => request<LegalPage[]>('legal-pages', { 'pagination[pageSize]': '50' });

export async function getLegalPage(slug: string) {
  const pages = await request<LegalPage[]>('legal-pages', { 'filters[slug][$eq]': slug });
  return pages[0] ?? null;
}

export const getTopCategories = () =>
  request<Category[]>('categories', {
    'filters[parent][$null]': 'true',
    sort: 'order',
    'populate[0]': 'image',
    'populate[1]': 'children',
    'pagination[pageSize]': '50',
  });

export const getHomeTiles = () =>
  request<Category[]>('categories', {
    'filters[homeOrder][$notNull]': 'true',
    sort: 'homeOrder',
    'populate[0]': 'image',
    'pagination[pageSize]': '50',
  });

/** The cards in "Explore Our Categories" (Strapi: Categories → Home categories order). Empty means: fall back to the Home order list. */
export const getHomeCategoryCards = () =>
  request<Category[]>('categories', {
    'filters[categoriesOrder][$notNull]': 'true',
    sort: 'categoriesOrder',
    'populate[0]': 'image',
    'pagination[pageSize]': '50',
  }).catch(() => [] as Category[]);

/** Top-level categories switched on with "Show in menu" in Strapi; these fill the nav dropdown. */
export const getMenuCategories = () =>
  request<Category[]>('categories', {
    'filters[parent][$null]': 'true',
    'filters[showInMenu][$eq]': 'true',
    sort: 'order',
    'populate[0]': 'children',
    'pagination[pageSize]': '50',
  });

export async function getCategory(slug: string) {
  const categories = await request<Category[]>('categories', {
    'filters[slug][$eq]': slug,
    'populate[0]': 'image',
    'populate[1]': 'parent',
    'populate[2]': 'children',
    'populate[3]': 'children.image',
    'populate[4]': 'products',
    'populate[5]': 'products.images',
    'populate[6]': 'highlights',
  });
  return categories[0] ?? null;
}

/** Products come from Medusa (see lib/medusa.ts): same names as before, so pages did not change. */
export { getAllProducts, getProduct, getProductsInCategory, getRelatedProducts } from './medusa';

/** Animation Settings (Strapi). Null when it cannot be read; the site then uses its built-in defaults. */
export const getAnimationSettings = () =>
  request<AnimationSettingData>('animation-setting', { 'populate[0]': 'home', 'populate[1]': 'about', 'populate[2]': 'smartLink', 'populate[3]': 'smartLink.heroLottie' }).catch(() => null);

/** All spaces, in the order set in Strapi (empty if Strapi has none or cannot be reached). */
export const getSpaces = () => request<Space[]>('spaces', { sort: 'order', 'populate[0]': 'image', 'pagination[pageSize]': '50' }).catch(() => [] as Space[]);

/** One space with the product groups chosen for it. */
export async function getSpace(slug: string) {
  const spaces = await request<Space[]>('spaces', {
    'filters[slug][$eq]': slug,
    'populate[0]': 'categories',
    'populate[1]': 'categories.image',
    'populate[2]': 'categories.children',
    'populate[3]': 'image',
  }).catch(() => [] as Space[]);
  return spaces[0] ?? null;
}

export const getAllCategorySlugs = () =>
  request<Pick<Category, 'slug'>[]>('categories', { 'fields[0]': 'slug', 'pagination[pageSize]': '100' });
