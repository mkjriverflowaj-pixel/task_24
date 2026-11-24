import fs from 'node:fs';
import path from 'node:path';
import type { Core } from '@strapi/strapi';
import seed from '../data/seed.json';

const homeTiles = [
  { slug: 'modular-switches', image: 'Switch-png-1.png' },
  { slug: 'xtreme-modular-series', image: '2-1.png' },
  { slug: 'wire-and-cables', image: 'Multistand-Wires.png' },
  { slug: 'led-lighting', image: 'LED-Bulb.png' },
  { slug: 'downlights', image: 'LED-Penal.png' },
  { slug: 'flood-lights-and-street-lights', image: 'Frame-10000045290.png' },
  { slug: 'mcb-s-and-isolators', image: 'MCB.png' },
  { slug: 'zenia-distribution-boards', image: 'MCB-Distribution-board-new-2.png' },
  { slug: 'fans', image: 'Fresh-Air-fan-New.png' },
  { slug: 'fresh-air-and-ventilation-fans', image: 'Ventilation-Fan-New-2.png' },
];

// Short highlights shown on each range page. Every line only restates what the category taglines already say.
const rangeHighlights: Record<string, { title: string; description: string }[]> = {
  'modular-switches': [
    { title: 'Sleek designs', description: 'Designs made for modern living spaces.' },
    { title: 'Advanced technology', description: 'Switches built with advanced technology.' },
  ],
  'led-lighting': [
    { title: 'Energy-efficient', description: 'Lighting solutions that help save energy.' },
    { title: 'Brighter, greener future', description: 'Lighting made for a brighter, greener future.' },
  ],
  'wire-and-cables': [
    { title: 'Durable', description: 'Wires made for long-lasting electrical solutions.' },
    { title: 'FR wires', description: 'Durable FR wires for everyday electrical use.' },
    { title: 'Eco-friendly', description: 'Eco-friendly wires for responsible building.' },
  ],
  'mcbs-and-dbs': [
    { title: 'Reliable circuit protection', description: 'Dependable protection for your circuits.' },
    { title: 'Enhanced safety', description: 'Safer, better-managed power.' },
  ],
  'fresh-air-and-ventilation-fans': [
    { title: 'Powerful ventilation', description: 'Ventilation solutions with strong performance.' },
    { title: 'Cleaner, healthier spaces', description: 'Fresh air for healthier rooms.' },
  ],
  fans: [
    { title: 'High performance', description: 'High-performance fans for everyday use.' },
    { title: 'Fresh and comfortable', description: 'Comfortable, fresh ventilation.' },
  ],
};

const rangeImages = ['range-led.png', 'range-ventilation.png', 'range-mcb.png', 'range-switches.png', 'range-wires.png'];

const menuCategories = ['modular-switches', 'led-lighting', 'wire-and-cables', 'mcbs-and-dbs', 'fresh-air-and-ventilation-fans'];

// Sub-categories listed under each menu category, in menu order (name overrides match the live site's menu).
const menuSubcategories = [
  { slug: 'matris-modular-series', order: 0 },
  { slug: 'xtreme-modular-series', order: 1 },
  { slug: 'downlights', order: 0 },
  { slug: 'flood-lights-and-street-lights', order: 1 },
  { slug: 'led-bulbs', order: 2 },
  { slug: 'multistrand-wires', order: 0 },
  { slug: 'matris-distribution-boards', order: 0 },
  { slug: 'mcb-s-and-isolators', order: 1, name: 'MCBs & Isolators' },
  { slug: 'fresh-air-fans-12', order: 0, name: 'Fresh Air Fans' },
  { slug: 'ventilation-fans-8', order: 1, name: 'Ventilation Fans' },
];

const heroImages = [
  { file: 'hero-products.png', alt: 'Safonix electrical product range' },
  { file: 'hero-switch.png', alt: 'Safonix smart range modular switches' },
];

const heroText = seed.homePage.heroSlides.map((slide) => ({ ...slide, subheading: 'subheading' in slide ? slide.subheading : null }));

const stats = [
  { value: 25, suffix: '+', label: 'Years in Industry.', unit: 'years' },
  { value: 500, suffix: '+', label: 'Products Available.', unit: 'Products' },
  { value: 1, suffix: 'L+', label: 'Trusted Homes.', unit: 'Households' },
];

async function uploadImage(strapi: Core.Strapi, relativePath: string, alt: string) {
  const filepath = path.join(strapi.dirs.app.root, 'data', 'images', relativePath);
  const originalFilename = path.basename(relativePath);
  const [uploaded] = await strapi.plugin('upload').service('upload').upload({
    data: { fileInfo: { name: originalFilename, alternativeText: alt } },
    files: { filepath, originalFilename, mimetype: originalFilename.endsWith('.jpg') ? 'image/jpeg' : 'image/png', size: fs.statSync(filepath).size },
  });
  return uploaded;
}

/** Idempotent content set-up for the home page: tiles, tile images, hero slides and stats. */
export async function applyHomeDesign(strapi: Core.Strapi) {
  const categories = strapi.documents('api::category.category');
  for (const [index, tile] of homeTiles.entries()) {
    const category = await categories.findFirst({ filters: { slug: tile.slug }, populate: ['image'] });
    if (!category) continue;
    const data: Record<string, unknown> = {};
    if (category.homeOrder == null) data.homeOrder = index;
    if (!category.image) data.image = (await uploadImage(strapi, path.join('products', tile.image), category.name ?? tile.slug)).id;
    if (Object.keys(data).length) await categories.update({ documentId: category.documentId, data: data as never });
  }

  const inMenu = await categories.findFirst({ filters: { showInMenu: true } });
  if (!inMenu) {
    for (const slug of menuCategories) {
      const category = await categories.findFirst({ filters: { slug } });
      if (category) await categories.update({ documentId: category.documentId, data: { showInMenu: true } as never });
    }
  }

  const subInMenu = await categories.findFirst({ filters: { showInMenu: true, parent: { documentId: { $notNull: true } } } });
  if (!subInMenu) {
    for (const item of menuSubcategories) {
      const category = await categories.findFirst({ filters: { slug: item.slug } });
      if (!category) continue;
      const data: Record<string, unknown> = { showInMenu: true, order: item.order };
      if (item.name) data.name = item.name;
      await categories.update({ documentId: category.documentId, data: data as never });
    }
  }

  for (const [slug, highlights] of Object.entries(rangeHighlights)) {
    const category = await categories.findFirst({ filters: { slug }, populate: ['highlights'] });
    if (category && !((category as { highlights?: unknown[] }).highlights ?? []).length) {
      await categories.update({ documentId: category.documentId, data: { highlights } as never });
    }
  }

  const accessories = await categories.findFirst({ filters: { slug: 'accessories' } });
  if (accessories && (accessories as { showInProducts?: boolean | null }).showInProducts == null) {
    await categories.update({ documentId: accessories.documentId, data: { showInProducts: false } as never });
  }

  const homePages = strapi.documents('api::home-page.home-page');
  const home = await homePages.findFirst({ populate: { highlights: true, whyItems: true, helpImageBack: true } });
  // "Solutions for every space" section: four cards built from our own product groups (placeholder pictures are the
  // existing product photos). Added once, while the section is still empty; edit everything in Strapi afterwards.
  if (home) {
    const current = home as { spaces?: unknown[]; spacesTitle?: string | null };
    if (!(current.spaces ?? []).length && !current.spacesTitle) {
      const cards = [
        { tag: 'Homes', title: 'Living Spaces', description: 'Modular switches, LED lighting and fans for comfortable, stylish homes.', link: '/products/modular-switches', file: 'Switch-png-1.png', alt: 'Modular switches' },
        { tag: 'Workplaces', title: 'Offices & Shops', description: 'LED downlights and tubelights for bright, well-lit workspaces.', link: '/products/led-lighting', file: 'LED-Penal.png', alt: 'LED panel downlight' },
        { tag: 'Protection', title: 'Safe Power Distribution', description: 'MCBs, isolators and distribution boards for reliable circuit protection.', link: '/products/mcbs-and-dbs', file: 'MCB-Distribution-board-new-2.png', alt: 'Distribution board' },
        { tag: 'Outdoors', title: 'Outdoor & Industrial', description: 'Robust flood lights and street lights for demanding outdoor areas.', link: '/products/flood-lights-and-street-lights', file: 'Frame-10000045290.png', alt: 'LED flood light' },
      ];
      const spaces = [];
      for (const card of cards) {
        const image = await uploadImage(strapi, path.join('products', card.file), card.alt);
        spaces.push({ tag: card.tag, title: card.title, description: card.description, link: card.link, image: image.id });
      }
      await homePages.update({
        documentId: home.documentId,
        data: {
          spacesEyebrow: 'Made for every space',
          spacesTitle: 'Solutions for **Every Space**',
          spacesSubtitle: 'From living rooms to workplaces and outdoor areas, explore Safonix electricals built for the way you use each space.',
          spaces,
        } as never,
      });
    }
  }

  // The black side of the spinning "Need help?" badge (the front side is the existing helpImage).
  if (home && !(home as { helpImageBack?: unknown }).helpImageBack) {
    const bulb = await uploadImage(strapi, 'help-back-bulb.png', 'LED bulb');
    await homePages.update({ documentId: home.documentId, data: { helpImageBack: bulb.id } as never });
  }

  if (home && !(home as { whyItems?: unknown[] }).whyItems?.length) {
    const h = seed.homePage;
    await homePages.update({
      documentId: home.documentId,
      data: {
        categoriesEyebrow: h.categoriesEyebrow,
        categoriesTitle: h.categoriesTitle,
        promoTitle: h.promoTitle,
        promoSubtitle: h.promoSubtitle,
        promoLabel: h.promoLabel,
        whyEyebrow: h.whyEyebrow,
        whyTitle: h.whyTitle,
        whyItems: h.whyItems,
        bannerTitle: h.bannerTitle,
        bannerText: h.bannerText,
        bannerLabel: h.bannerLabel,
      } as never,
    });
  }

  const settings = strapi.documents('api::site-setting.site-setting');
  const site = await settings.findFirst({ populate: ['stats'] });
  if (site && ((site as { stats?: { unit?: string | null }[] }).stats ?? []).some((stat) => !stat.unit)) {
    await settings.update({ documentId: site.documentId, data: { stats } as never });
  }

  // Paragraph shown under the logo in the footer (editable in Strapi: Site Setting → Footer text).
  const currentFooter = (site as { footerText?: string | null } | null)?.footerText;
  if (site && (!currentFooter || currentFooter.startsWith('Backed by over two decades'))) {
    await settings.update({
      documentId: site.documentId,
      data: {
        footerText:
          'Founded in 2016 and backed by industry experience dating back to 1998, the company focuses on delivering ISI- and ISO-certified electrical goods across India.',
      } as never,
    });
  }

  const social = site as { instagramUrl?: string | null; xUrl?: string | null } | null;
  if (site && (!social?.instagramUrl || !social?.xUrl)) {
    await settings.update({
      documentId: site.documentId,
      data: {
        instagramUrl: social?.instagramUrl ?? seed.siteSetting.instagramUrl,
        xUrl: social?.xUrl ?? seed.siteSetting.xUrl,
      } as never,
    });
  }

  const faqs = strapi.documents('api::faq.faq');
  const existingFaqs = await faqs.findMany({ limit: 100 });
  for (const [order, faq] of seed.faqs.entries()) {
    if (!existingFaqs.some((item) => item.question === faq.question)) await faqs.create({ data: { ...faq, order } });
  }

  const testimonials = strapi.documents('api::testimonial.testimonial');
  if (!(await testimonials.findFirst())) {
    for (const [order, item] of seed.testimonials.entries()) await testimonials.create({ data: { ...item, order } });
  }

  if (home) {
    const highlights = (home as { highlights?: { description?: string | null }[] }).highlights ?? [];
    if (highlights[0]?.description === 'ISI, ISO, BIS and BEE standards.') {
      await homePages.update({ documentId: home.documentId, data: { highlights: seed.homePage.highlights } as never });
    }
  }

  const aboutPages = strapi.documents('api::about-page.about-page');
  const about = await aboutPages.findFirst({ populate: ['image', 'valuesImage', 'rangeItems'] });
  if (about) {
    const data: Record<string, unknown> = {};
    const filled = about as { rangeItems?: unknown[]; certificationsClosing?: string | null; certificationsSubtitle?: string | null; valuesIntro?: string | null };
    if (!about.image) data.image = (await uploadImage(strapi, 'about-customer-satisfaction.jpg', 'Customer satisfaction rating')).id;
    if (!(about.intro ?? '').includes('**')) data.intro = seed.aboutPage.intro;
    if (!filled.rangeItems?.length) {
      const items = [];
      for (const [index, item] of seed.aboutPage.rangeItems.entries()) {
        items.push({ label: item.label, image: (await uploadImage(strapi, path.join('about', rangeImages[index]), item.label)).id });
      }
      data.rangeItems = items;
    }
    if (!filled.certificationsClosing) data.certificationsClosing = seed.aboutPage.certificationsClosing;
    if (!filled.certificationsSubtitle) data.certificationsSubtitle = seed.aboutPage.certificationsSubtitle;
    if (!filled.valuesIntro) data.valuesIntro = seed.aboutPage.valuesIntro;
    if (!(about as { valuesImage?: unknown }).valuesImage) {
      data.valuesImage = (await uploadImage(strapi, path.join('about', 'values-india-map.jpg'), 'Map of India')).id;
    }
    if (Object.keys(data).length) await aboutPages.update({ documentId: about.documentId, data: data as never });
  }

  const legalPages = strapi.documents('api::legal-page.legal-page');
  const terms = await legalPages.findFirst({ filters: { slug: 'terms-and-conditions' } });
  const seedTerms = seed.legalPages.find((page) => page.slug === 'terms-and-conditions');
  if (terms && seedTerms && !terms.content?.includes('###')) {
    await legalPages.update({ documentId: terms.documentId, data: { title: seedTerms.title, content: seedTerms.content } });
  }

  const contactPages = strapi.documents('api::contact-page.contact-page');
  const contactPage = await contactPages.findFirst({ populate: ['heroImage'] });
  if (!contactPage) {
    const heroImage = await uploadImage(strapi, 'contact-hero.jpg', 'Headset and microphone beside a laptop');
    await contactPages.create({ data: { ...seed.contactPage, heroImage: heroImage.id } as never });
  } else if (!(contactPage as { mapCoordinates?: string | null }).mapCoordinates) {
    await contactPages.update({ documentId: contactPage.documentId, data: { mapCoordinates: seed.contactPage.mapCoordinates } as never });
  }

  if (contactPage && !(contactPage as { heroImage?: unknown }).heroImage) {
    const heroImage = await uploadImage(strapi, 'contact-hero.jpg', 'Headset and microphone beside a laptop');
    await contactPages.update({ documentId: contactPage.documentId, data: { heroImage: heroImage.id } as never });
  }

  const productsPages = strapi.documents('api::products-page.products-page');
  const productsPage = await productsPages.findFirst({ populate: ['heroImage'] });
  if (!productsPage) {
    const heroImage = await uploadImage(strapi, 'products-hero.jpg', 'White three-switch panel on a wall beside green plants');
    await productsPages.create({ data: { ...seed.productsPage, heroImage: heroImage.id } as never });
  } else if (!(productsPage as { heroImage?: unknown }).heroImage) {
    const heroImage = await uploadImage(strapi, 'products-hero.jpg', 'White three-switch panel on a wall beside green plants');
    await productsPages.update({ documentId: productsPage.documentId, data: { heroImage: heroImage.id } as never });
  }

  // The "MCBs & DBs" category has no picture of its own: reuse the "MCBs & Distribution Boards" photo from the About page.
  const mcbs = await categories.findFirst({ filters: { slug: 'mcbs-and-dbs' }, populate: ['image'] });
  if (mcbs && !mcbs.image) {
    const aboutWithRange = await strapi.documents('api::about-page.about-page').findFirst({ populate: { rangeItems: { populate: ['image'] } } });
    const items = (aboutWithRange as { rangeItems?: { label: string; image?: { id: number } | null }[] } | null)?.rangeItems ?? [];
    const photo = items.find((item) => item.label.includes('MCB'))?.image;
    if (photo) await categories.update({ documentId: mcbs.documentId, data: { image: photo.id } as never });
  }

  // "Our Journey" timeline on the About page. Only facts stated on safonixindia.com: the founder's industry experience
  // since 1998, the company's founding in 2016, and today's product ranges, certifications and locations.
  // Added once, while the section is empty; edit or extend it in Strapi (About Page → Journey).
  const aboutForJourney = await strapi.documents('api::about-page.about-page').findFirst({});
  if (aboutForJourney && !(aboutForJourney as { journeyTitle?: string | null }).journeyTitle) {
    await strapi.documents('api::about-page.about-page').update({
      documentId: aboutForJourney.documentId,
      data: {
        journeyEyebrow: 'Our story',
        journeyTitle: 'Our Journey & **Heritage**',
        journeySubtitle: 'From a founder’s experience in the electrical industry to a trusted Indian electrical brand.',
        journey: [
          { year: '1998', title: 'Roots in the electrical industry', description: 'Our founder begins serving the electrical industry, building the hands-on experience that Safonix India is built on.' },
          { year: '2016', title: 'Safonix India is founded', description: 'Safonix India emerges from a vision to redefine quality in the electrical industry.' },
          {
            year: 'Today',
            title: 'Five ranges, certified quality',
            description: 'Wires and cables, LED lighting, ventilation and fresh air fans, MCBs and distribution boards, and modular switches, backed by ISI, ISO, BIS and BEE quality standards, with offices in Jaipur and Vasai.',
            current: true,
          },
        ],
      } as never,
    });
  }

  // Fuller journey supplied by the site owner (replaces the first three-step placeholder timeline once).
  const journeyRows = aboutForJourney as { documentId: string; journey?: { title?: string }[] } | null;
  if (journeyRows && (journeyRows.journey ?? []).length === 0) {
    const withJourney = await strapi.documents('api::about-page.about-page').findFirst({ populate: ['journey'] });
    const existing = (withJourney as { journey?: { title?: string }[] } | null)?.journey ?? [];
    if (withJourney && existing.length === 3 && existing[0]?.title === 'Roots in the electrical industry') {
      await strapi.documents('api::about-page.about-page').update({
        documentId: withJourney.documentId,
        data: {
          journey: [
            { year: '1998', title: 'Industry Roots', description: 'The founder began working in the Indian electrical goods sector, building nearly two decades of technical and market expertise prior to launching the brand.' },
            { year: '2016', title: 'Company Foundation', description: 'Safonix India was formally established to manufacture and supply certified electrical products for residential and commercial spaces.' },
            { year: '2018', title: 'Jaipur Wholesale Hub Expansion', description: 'Operations expanded in Mansarovar, Jaipur, establishing a dedicated local distribution and wholesale base for electrical equipment.' },
            { year: 'Certified', title: 'Quality & Regulatory Certifications', description: 'The brand achieved compliance across major Indian and international standards, including ISI, ISO, BIS (Bureau of Indian Standards) and BEE (Bureau of Energy Efficiency).' },
            { year: 'Growth', title: 'Product Line Diversification', description: 'Safonix grew from basic wiring and distribution components into a full-catalog supplier offering modular switches (Matris and Xtreme series), LED lighting, multistrand wires, MCBs, distribution boards and ventilation fans.' },
            { year: 'Digital', title: 'Digital & Loyalty Ecosystem', description: 'The company launched the Safonix Smart Link mobile app, introducing QR-code reward tracking and digital wallet redemption for dealers and electricians.', current: true },
          ],
        } as never,
      });
    }
  }

  // About Us banner picture: swap the original customer-satisfaction photo for the quality-control illustration.
  // Only done while the banner still has the original, so a picture chosen later in Strapi is kept.
  const aboutWithImage = await strapi.documents('api::about-page.about-page').findFirst({ populate: ['image'] });
  const currentBanner = (aboutWithImage as { image?: { name?: string } | null } | null)?.image;
  if (aboutWithImage && currentBanner?.name?.startsWith('about-customer-satisfaction')) {
    const banner = await uploadImage(strapi, 'about-quality-control.jpg', 'Quality control illustration with certification icons');
    await strapi.documents('api::about-page.about-page').update({ documentId: aboutWithImage.documentId, data: { image: banner.id } as never });
  }

  // "Facilities & Capabilities" and "Leadership" sections on the About page. Placeholder content built only from facts
  // on safonixindia.com and the owner's own notes (locations, standards, product ranges, founder experience since 1998,
  // support hours). Replace with real details (machinery, names, quotes) in Strapi: About Page. Added once, while empty.
  const aboutForSections = await strapi.documents('api::about-page.about-page').findFirst({});
  if (aboutForSections && !(aboutForSections as { capabilitiesTitle?: string | null }).capabilitiesTitle) {
    await strapi.documents('api::about-page.about-page').update({
      documentId: aboutForSections.documentId,
      data: {
        capabilitiesEyebrow: 'Where we work',
        capabilitiesTitle: 'Our Facilities & **Capabilities**',
        capabilitiesText: 'Operating from Jaipur and Vasai, Safonix India supplies certified electrical products across five product ranges.',
        capabilities: [
          { icon: 'factory', title: 'Jaipur Hub', description: 'Our Mansarovar base in Jaipur serves as a dedicated distribution and wholesale hub for electrical equipment.', bullets: ['Mansarovar, Jaipur, Rajasthan', 'Local distribution and wholesale'].join(String.fromCharCode(10)) },
          { icon: 'box', title: 'Vasai Unit', description: 'Our second location, in Vasai (E), Palghar, Maharashtra.', bullets: ['Blue Bell Industrial Estate', 'KT Industrial Park'].join(String.fromCharCode(10)) },
          { icon: 'shield', title: 'Quality Standards', description: 'Products are developed to meet major Indian quality and energy-efficiency standards.', bullets: ['ISI and BIS', 'ISO', 'BEE (energy efficiency)'].join(String.fromCharCode(10)) },
          { icon: 'gear', title: 'Full Product Range', description: 'From wires and cables to modular switches, one supplier for everyday electrical needs.', bullets: ['Modular switches and LED lighting', 'MCBs and distribution boards', 'Wires, cables and ventilation fans'].join(String.fromCharCode(10)) },
        ],
        leadersEyebrow: 'Our people',
        leadersTitle: 'Leadership & **Governance**',
        leadersText: 'Guided by industry experience dating back to 1998, with quality and customer care at the centre.',
        leaders: [
          { icon: 'user', role: 'Founder', unit: 'SAFONIX INDIA', text: 'Safonix India grew out of the founder’s experience of serving the electrical industry since 1998.', badge: 'Industry experience since 1998' },
          { icon: 'shield', role: 'Quality & Compliance', unit: 'STANDARDS', text: 'Products are developed to meet ISI, BIS, ISO and BEE quality standards.', badge: 'ISI · BIS · ISO · BEE' },
          { icon: 'headset', role: 'Customer Support', unit: 'SERVICE', text: 'Our team is available for product enquiries and support on working days.', badge: 'Mon–Sat, 10:00 AM – 7:00 PM' },
        ],
      } as never,
    });
  }

  // FAQ labels and icons for the new card style. Only fills FAQs that have no label yet; edit in Strapi: Faq → Tag / Icon.
  const faqDocs = strapi.documents('api::faq.faq');
  const allFaqs = (await faqDocs.findMany({ limit: 100 })) as unknown as { documentId: string; question: string; tag?: string | null }[];
  const faqLabels: [RegExp, string, string][] = [
    [/register/i, 'Registration', 'user'],
    [/earn/i, 'Rewards', 'gift'],
    [/redeem/i, 'Redeeming points', 'wallet'],
    [/contact/i, 'Support', 'headset'],
    [/feedback/i, 'Feedback', 'chat'],
  ];
  for (const faq of allFaqs) {
    if (faq.tag) continue;
    const match = faqLabels.find(([pattern]) => pattern.test(faq.question));
    if (match) await faqDocs.update({ documentId: faq.documentId, data: { tag: match[1], icon: match[2] } as never });
  }

  // FAQ heading on the Contact page (the questions themselves are the Faq entries). Added once; edit in Strapi: Contact Page.
  const contactForFaq = await strapi.documents('api::contact-page.contact-page').findFirst({});
  if (contactForFaq && !(contactForFaq as { faqTitle?: string | null }).faqTitle) {
    await strapi.documents('api::contact-page.contact-page').update({
      documentId: contactForFaq.documentId,
      data: {
        faqEyebrow: 'Frequently asked questions',
        faqTitle: 'Got Questions? We Have **Answers.**',
        faqSubtitle: 'Quick answers about the Safonix app, rewards and how to reach us.',
      } as never,
    });
  }

  // Contact page FAQ: the four questions and answers supplied by the site owner. Only questions marked "On contact page"
  // appear there (Strapi: Faq → On contact page); the full list stays on the FAQs page.
  const contactFaqs = [
    {
      question: 'How do I apply for a Safonix dealership or distributorship?',
      answer: 'To become an authorized Safonix distributor or dealer, select the "Dealership" inquiry type in our contact form or email us directly at sales@safonixindia.com. Our business development team will send over our dealer criteria, margin structure, and initiate onboarding within 48 hours.',
      tag: 'Dealership', icon: 'user',
    },
    {
      question: 'What is the standard delivery timeframe for industrial orders?',
      answer: 'Standard catalog units are dispatched from our Vasai Industrial Unit or Jaipur warehouse within 3 to 7 business days across India. Custom-engineered machinery, tailored conveyors, and automated modules generally require 2 to 4 weeks depending on technical specifications.',
      tag: 'Delivery', icon: 'box',
    },
    {
      question: 'Do you provide on-site product demonstrations?',
      answer: 'Yes! We offer live video demonstrations with our engineering desk or in-person trials at our Jaipur testing facility. For commercial enterprise projects, our field engineers can visit your plant for site inspection and feasibility analysis.',
      tag: 'Demonstrations', icon: 'gear',
    },
    {
      question: 'What warranty and after-sales support do you provide?',
      answer: 'All Safonix industrial systems come with an inclusive comprehensive 5-Year Warranty Guarantee covering manufacturing defects and critical core mechanisms. We maintain complete spare part inventories and a nationwide technical service team.',
      tag: 'Warranty', icon: 'shield',
    },
  ];
  const faqStore = strapi.documents('api::faq.faq');
  const currentFaqRows = (await faqStore.findMany({ limit: 100 })) as unknown as { question: string }[];
  for (const [index, item] of contactFaqs.entries()) {
    if (currentFaqRows.some((faq) => faq.question === item.question)) continue;
    await faqStore.create({ data: { ...item, order: 10 + index, onContactPage: true } as never });
  }
  const contactForSubtitle = await strapi.documents('api::contact-page.contact-page').findFirst({});
  const currentSubtitle = (contactForSubtitle as { faqSubtitle?: string | null } | null)?.faqSubtitle ?? '';
  if (contactForSubtitle && currentSubtitle.startsWith('Quick answers about the Safonix app')) {
    await strapi.documents('api::contact-page.contact-page').update({
      documentId: contactForSubtitle.documentId,
      data: { faqSubtitle: 'Everything you need to know about partnering with Safonix and ordering machinery.' } as never,
    });
  }

  // Extra slides that rotate next to the India map in the About page values section (About Page → Values slides).
  // The map itself is always the first slide; add more pictures here. Seeded once with the Safonix poster.
  const aboutWithSlides = await strapi.documents('api::about-page.about-page').findFirst({ populate: ['valuesSlides'] });
  if (aboutWithSlides && !((aboutWithSlides as { valuesSlides?: unknown[] }).valuesSlides ?? []).length) {
    const poster = await uploadImage(strapi, 'about-poster.png', 'Safonix India poster: Powering Everyday Confidence');
    await strapi.documents('api::about-page.about-page').update({
      documentId: aboutWithSlides.documentId,
      data: { valuesSlides: [{ title: 'Safonix India at a glance', image: poster.id }] } as never,
    });
  }

  // India map picture: swap the original JPG (white background) for a copy with a transparent background, so it sits
  // cleanly on the coloured panel. Only done while the original is still in place.
  const aboutWithMap = await strapi.documents('api::about-page.about-page').findFirst({ populate: ['valuesImage'] });
  const currentMap = (aboutWithMap as { valuesImage?: { name?: string } | null } | null)?.valuesImage;
  if (aboutWithMap && currentMap?.name?.startsWith('values-india-map') && currentMap.name.endsWith('.jpg')) {
    const transparentMap = await uploadImage(strapi, path.join('about', 'values-india-map.png'), 'Map of India');
    await strapi.documents('api::about-page.about-page').update({ documentId: aboutWithMap.documentId, data: { valuesImage: transparentMap.id } as never });
  }

  // Headings for the 3D product ring on the home page (Strapi: Home Page → Orbit eyebrow / title / hint). Added once.
  const homeForOrbit = await strapi.documents('api::home-page.home-page').findFirst({});
  if (homeForOrbit && !(homeForOrbit as { orbitTitle?: string | null }).orbitTitle) {
    await strapi.documents('api::home-page.home-page').update({
      documentId: homeForOrbit.documentId,
      data: { orbitEyebrow: 'Explore in 3D', orbitTitle: 'Turn the range, **see every angle**', orbitHint: 'Scroll or drag to spin · click the front product to zoom' } as never,
    });
  }

  // The ring now revolves with the mouse (no scroll pinning), so its hint text changes. Only replaces the original wording.
  const homeForHint = (await strapi.documents('api::home-page.home-page').findFirst({})) as { documentId: string; orbitHint?: string | null } | null;
  if (homeForHint?.orbitHint?.startsWith('Scroll or drag to spin')) {
    await strapi.documents('api::home-page.home-page').update({
      documentId: homeForHint.documentId,
      data: { orbitHint: 'Move the mouse left or right (or drag) to revolve · click the front product to open it' } as never,
    });
  }

  // Each About-page range card opens its product group. Only cards without a link yet are filled in.
  const rangeLinks: Record<string, string> = {
    'LED Lighting': '/products/led-lighting',
    'Ventilation & Fresh Air Fans': '/products/fresh-air-and-ventilation-fans',
    'MCBs & Distribution Boards': '/products/mcbs-and-dbs',
    'Modular Switches': '/products/modular-switches',
    'Wires & Cables': '/products/wire-and-cables',
  };
  const aboutForLinks = await strapi.documents('api::about-page.about-page').findFirst({ populate: { rangeItems: { populate: ['image'] } } });
  const rangeItems = (aboutForLinks as { rangeItems?: { label: string; link?: string | null; image?: { id: number } | null }[] } | null)?.rangeItems ?? [];
  if (aboutForLinks && rangeItems.some((item) => !item.link && rangeLinks[item.label])) {
    await strapi.documents('api::about-page.about-page').update({
      documentId: aboutForLinks.documentId,
      data: { rangeItems: rangeItems.map((item) => ({ label: item.label, link: item.link ?? rangeLinks[item.label] ?? null, image: item.image?.id })) } as never,
    });
  }

  // Home banner (Strapi: Home Banner): the big first banner AND the hero slider slides that follow it. Created once with the
  // current content; edit everything in Strapi afterwards.
  const banners = strapi.documents('api::home-banner.home-banner');
  let bannerDoc = (await banners.findFirst({ populate: ['heroSlides'] })) as { documentId: string; heroSlides?: unknown[] } | null;
  if (!bannerDoc) {
    const wiring = await uploadImage(strapi, 'hero-wiring-display.png', 'Safonix wires, sockets, switches and MCB');
    bannerDoc = (await banners.create({
      data: {
        eyebrow: 'PREMIUM ELECTRICAL SOLUTIONS',
        heading: 'Connect with **Confidence.**',
        subheading: 'High-performance wires, reliable sockets and switches for a safer, smarter home.',
        buttonLabel: 'Shop Now',
        buttonUrl: '/products',
        secondaryButtonLabel: 'See the range in 3D',
        secondaryButtonUrl: '#collections',
        scrollHint: 'Scroll to power up',
        image: wiring.id,
      } as never,
    })) as { documentId: string; heroSlides?: unknown[] };
  }
  if (bannerDoc && !(bannerDoc.heroSlides ?? []).length) {
    const collection = await uploadImage(strapi, 'hero-switch-collection.png', 'Safonix modern wall switches and sockets');
    const wiring = await uploadImage(strapi, 'hero-wiring-display.png', 'Safonix wires, sockets, switches and MCB');
    const lighting = await uploadImage(strapi, 'hero-lighting-ventilation.png', 'Safonix LED lighting, ceiling fan and ventilation fans');
    const first = heroText[0];
    await banners.update({
      documentId: bannerDoc.documentId,
      data: {
        heroSlides: [
          { eyebrow: first.eyebrow, heading: first.heading, subheading: first.subheading, buttonLabel: first.buttonLabel, buttonUrl: first.buttonUrl, theme: first.theme, image: collection.id },
          { eyebrow: 'PREMIUM ELECTRICAL SOLUTIONS', heading: 'Connect with **Confidence.**', subheading: 'High-performance wires, reliable sockets and switches for a safer, smarter home.', buttonLabel: 'Shop Now', buttonUrl: '/products', theme: heroText[1]?.theme ?? 'black', image: wiring.id },
          { eyebrow: 'LIGHTING · FANS · VENTILATION', heading: 'Brighter Homes. **Fresher Air.**', subheading: 'LED lighting, fans and ventilation solutions for comfortable everyday living.', buttonLabel: 'Explore Lighting', buttonUrl: '/products/led-lighting', theme: 'warm', image: lighting.id },
        ],
      } as never,
    });
  }

  // About page "Our Values" dial (Strapi: About Page → Value items). Seeded once from the text already on the page.
  const aboutForValues = (await strapi.documents('api::about-page.about-page').findFirst({ populate: ['values', 'leaders', 'valueItems'] })) as {
    documentId: string;
    valuesEyebrow?: string | null;
    certificationsSubtitle?: string | null;
    certificationsText?: string | null;
    values?: { title: string; description?: string | null }[];
    leaders?: { role: string; text?: string | null }[];
    valueItems?: unknown[];
  } | null;
  if (aboutForValues && !(aboutForValues.valueItems ?? []).length) {
    const v = aboutForValues.values ?? [];
    const l = aboutForValues.leaders ?? [];
    const items = [
      v[1] && { label: 'Our promise', title: v[1].title, text: v[1].description ?? '', art: 'promise' },
      l[1] && { label: 'Quality first', title: l[1].role, text: l[1].text ?? '', art: 'quality' },
      aboutForValues.certificationsSubtitle && { label: 'Safety', title: aboutForValues.certificationsSubtitle, text: aboutForValues.certificationsText ?? '', art: 'safety' },
      l[2] && { label: 'Customer care', title: l[2].role, text: l[2].text ?? '', art: 'care' },
      v[0] && { label: 'Made in India', title: v[0].title, text: v[0].description ?? '', art: 'india' },
    ].filter(Boolean);
    await strapi.documents('api::about-page.about-page').update({
      documentId: aboutForValues.documentId,
      data: { valuesEyebrow: 'What we stand for', valuesCtaLabel: 'Explore Our Products', valuesCtaUrl: '/products', valueItems: items } as never,
    });
  }


  // Footer (Strapi: Footer). Created once with the current wording; the paragraph starts from Site Settings → Footer text.
  const footers = strapi.documents('api::footer.footer');
  if (!(await footers.findFirst({}))) {
    const settings = (await strapi.documents('api::site-setting.site-setting').findFirst({})) as { footerText?: string | null; tagline?: string | null } | null;
    await footers.create({
      data: {
        description: settings?.footerText ?? settings?.tagline ?? null,
        quickLinksTitle: 'Quick Links',
        quickLinks: [
          { label: 'Home', url: '/' },
          { label: 'Products', url: '/products' },
          { label: 'Safonix Smart Link', url: '/#smart-link' },
          { label: 'About Us', url: '/about-us' },
          { label: 'Contact Us', url: '/contact-us' },
        ],
        usefulLinksTitle: 'Useful Links',
        usefulLinks: [{ label: 'Support', url: '/faqs' }],
        showLegalPages: true,
        followTitle: 'Follow Us',
        contactTitle: 'Get In Touch',
        copyrightName: 'Safonix',
        copyrightUrl: 'https://safonixindia.com/',
        copyrightSuffix: '. All Rights Reserved.',
        creditLabel: 'Website Design By',
        creditName: 'Nextdynamix',
        creditUrl: 'https://nextdynamix.com/',
        creditSuffix: 'Tech (OPC) Pvt. Ltd.',
      } as never,
    });
  }

  // Spaces (Strapi: Spaces). Each space lists the product groups that suit it; the "Made for every space" cards on the home
  // page open these pages. Created once with a sensible starting set; edit the groups in Strapi afterwards.
  const spaces = strapi.documents('api::space.space');
  if (!(await spaces.findFirst({}))) {
    type Seed = { name: string; slug: string; tag: string; description: string; groups: string[] };
    const seeds: Seed[] = [
      { name: 'Living Spaces', slug: 'living-spaces', tag: 'Homes', description: 'Switches, lighting, fans and wiring for living rooms, bedrooms and kitchens.', groups: ['modular-switches', 'led-lighting', 'fans', 'fresh-air-and-ventilation-fans', 'wire-and-cables'] },
      { name: 'Offices & Shops', slug: 'offices-and-shops', tag: 'Workplaces', description: 'Bright, reliable and safe electricals for offices, shops and showrooms.', groups: ['led-lighting', 'modular-switches', 'mcbs-and-dbs', 'wire-and-cables', 'fresh-air-and-ventilation-fans'] },
      { name: 'Safe Power Distribution', slug: 'safe-power-distribution', tag: 'Protection', description: 'Protection and distribution gear that keeps every circuit safe.', groups: ['mcbs-and-dbs', 'wire-and-cables'] },
      { name: 'Outdoor & Industrial', slug: 'outdoor-and-industrial', tag: 'Outdoors', description: 'Tough lighting, ventilation and distribution for outdoor and industrial sites.', groups: ['flood-lights-and-street-lights', 'mcbs-and-dbs', 'wire-and-cables', 'fresh-air-and-ventilation-fans'] },
    ];
    for (const [index, item] of seeds.entries()) {
      const ids: string[] = [];
      for (const slug of item.groups) {
        const found = await strapi.documents('api::category.category').findFirst({ filters: { slug } });
        if (found) ids.push(found.documentId);
      }
      await spaces.create({ data: { name: item.name, slug: item.slug, tag: item.tag, description: item.description, order: index, categories: ids } as never });
    }
  }

  // The four home "Made for every space" cards used to open a single product group. Point each one at its space page instead,
  // but only while the card still has the original link, so any link edited in Strapi is left alone.
  const spaceLinks: Record<string, string> = {
    '/products/modular-switches': '/spaces/living-spaces',
    '/products/led-lighting': '/spaces/offices-and-shops',
    '/products/mcbs-and-dbs': '/spaces/safe-power-distribution',
    '/products/flood-lights-and-street-lights': '/spaces/outdoor-and-industrial',
  };
  type SpaceRow = { tag?: string | null; title: string; description?: string | null; link?: string | null; image?: { id: number } | null };
  const homeForSpaces = (await strapi.documents('api::home-page.home-page').findFirst({ populate: { spaces: { populate: ['image'] } } })) as { documentId: string; spaces?: SpaceRow[] } | null;
  const spaceRows = homeForSpaces?.spaces ?? [];
  if (homeForSpaces && spaceRows.some((row) => row.link && spaceLinks[row.link])) {
    await strapi.documents('api::home-page.home-page').update({
      documentId: homeForSpaces.documentId,
      data: { spaces: spaceRows.map((row) => ({ tag: row.tag, title: row.title, description: row.description, link: row.link && spaceLinks[row.link] ? spaceLinks[row.link] : row.link, image: row.image?.id })) } as never,
    });
  }

  // Animation settings (Strapi: Animation Settings). Created once with the values the site already uses, so nothing changes
  // until you edit them.
  const motion = strapi.documents('api::animation-setting.animation-setting');
  if (!(await motion.findFirst({}))) {
    await motion.create({
      data: {
        allAnimations: true,
        home: { orbitAutoplay: true, orbitSeconds: 4, orbitTurnSeconds: 2.3, heroSliderAutoplay: true, heroSliderSeconds: 4, marqueeSeconds: 22, testimonialsSeconds: 60, clickSparks: true, preloader: true },
        about: { valuesAutoplay: true, valuesSeconds: 4, productSliderAutoplay: true, productSliderSeconds: 3.8 },
        smartLink: { heroStory: true, heroTilt: true, qrEffect: true, qrSeconds: 5.3 },
      } as never,
    });
  }

  // "Accessories" has no pictures or products yet. Take it out of every space and keep it hidden from menus (once; if you
  // set "Show in menu" on it later in Strapi, it is left alone).
  const accessoriesGroup = (await categories.findFirst({ filters: { slug: 'accessories' } })) as { documentId: string; showInMenu?: boolean | null } | null;
  if (accessoriesGroup && accessoriesGroup.showInMenu == null) {
    const linked = (await strapi.documents('api::space.space').findMany({ populate: ['categories'] })) as { documentId: string; categories?: { documentId: string }[] }[];
    for (const space of linked) {
      if ((space.categories ?? []).some((item) => item.documentId === accessoriesGroup.documentId)) {
        await strapi.documents('api::space.space').update({ documentId: space.documentId, data: { categories: { disconnect: [accessoriesGroup.documentId] } } as never });
      }
    }
    await categories.update({ documentId: accessoriesGroup.documentId, data: { showInMenu: false } as never });
  }

  // "Explore Our Categories" on the home page (Strapi: Categories → "Home categories order"). Sub-groups that already sit under a
  // main group (Xtreme Modular Series under Modular Switches) are left out and Ventilation Fans takes that place. Set once; the 3D
  // product ring keeps using "Home order" and is not affected.
  const categoryList = strapi.documents('api::category.category');
  const alreadySet = await categoryList.findFirst({ filters: { categoriesOrder: { $notNull: true } } as never });
  if (!alreadySet) {
    const vent = (await categoryList.findFirst({ filters: { slug: 'ventilation-fans-8' }, populate: ['image'] })) as { documentId: string; tagline?: string | null; image?: unknown } | null;
    if (vent) {
      const data: Record<string, unknown> = {};
      if (!vent.image) data.image = (await uploadImage(strapi, path.join('products', 'ventilation-fans.jpg'), 'Safonix ventilation fan')).id;
      if (!vent.tagline) data.tagline = 'Powerful ventilation solutions for cleaner and healthier spaces.';
      if (Object.keys(data).length) await categoryList.update({ documentId: vent.documentId, data: data as never });
    }
    const order = ['modular-switches', 'ventilation-fans-8', 'wire-and-cables', 'led-lighting', 'downlights', 'flood-lights-and-street-lights', 'mcb-s-and-isolators', 'zenia-distribution-boards', 'fans'];
    for (const [index, slug] of order.entries()) {
      const found = await categoryList.findFirst({ filters: { slug } });
      if (found) await categoryList.update({ documentId: found.documentId, data: { categoriesOrder: index } as never });
    }
  }

  // The home "Made for every space" cards now read Strapi → Spaces. Fill each space's picture and card text from the older
  // Home Page → Spaces card with the same title, only where the space has none yet.
  type OldCard = { title: string; description?: string | null; image?: { id: number } | null };
  const homeForCards = (await strapi.documents('api::home-page.home-page').findFirst({ populate: { spaces: { populate: ['image'] } } })) as { spaces?: OldCard[] } | null;
  const oldCards = homeForCards?.spaces ?? [];
  const spaceDocs = (await strapi.documents('api::space.space').findMany({ populate: ['image'] })) as { documentId: string; name: string; image?: unknown; cardDescription?: string | null }[];
  for (const space of spaceDocs) {
    const card = oldCards.find((item) => item.title === space.name);
    if (!card) continue;
    const data: Record<string, unknown> = {};
    if (!space.image && card.image) data.image = card.image.id;
    if (!space.cardDescription && card.description) data.cardDescription = card.description;
    if (Object.keys(data).length) await strapi.documents('api::space.space').update({ documentId: space.documentId, data: data as never });
  }
}
