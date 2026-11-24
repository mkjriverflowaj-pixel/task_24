import type { Core } from '@strapi/strapi';
import seed from '../data/seed.json';
import { applyHomeDesign } from './home-design';
import { applyStoreData } from './store-demo';
import { applyDemoProducts, applyLongBriefs, applyProductBriefs, applyProductDetails } from './demo-products';

const publicActions = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::product.product.find',
  'api::product.product.findOne',
  'api::faq.faq.find',
  'api::faq.faq.findOne',
  'api::legal-page.legal-page.find',
  'api::legal-page.legal-page.findOne',
  'api::site-setting.site-setting.find',
  'api::home-page.home-page.find',
  'api::home-banner.home-banner.find',
  'api::footer.footer.find',
  'api::animation-setting.animation-setting.find',
  'api::space.space.find',
  'api::space.space.findOne',
  'api::about-page.about-page.find',
  'api::products-page.products-page.find',
  'api::contact-page.contact-page.find',
  'api::testimonial.testimonial.find',
  'api::testimonial.testimonial.findOne',
  'api::contact-submission.contact-submission.create',
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

async function openPublicPermissions(strapi: Core.Strapi) {
  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!role) return;

  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  for (const action of publicActions) {
    const existing = await permissionQuery.findOne({ where: { action, role: role.id } });
    if (!existing) await permissionQuery.create({ data: { action, role: role.id } });
  }
}

async function seedContent(strapi: Core.Strapi) {
  const existing = await strapi.documents('api::site-setting.site-setting').findFirst();
  if (existing) return;

  await strapi.documents('api::site-setting.site-setting').create({ data: seed.siteSetting });
  const { heroSlides: _heroSlides, ...homeData } = seed.homePage;
  await strapi.documents('api::home-page.home-page').create({ data: homeData as never });
  await strapi.documents('api::about-page.about-page').create({ data: seed.aboutPage });

  const categories = strapi.documents('api::category.category');
  let order = 0;
  for (const top of seed.categories) {
    const parent = await categories.create({
      data: {
        name: top.name,
        slug: slugify(top.name),
        tagline: top.tagline,
        order: order++,
      },
    });
    let childOrder = 0;
    for (const child of top.children as { name: string; tagline?: string }[]) {
      await categories.create({
        data: {
          name: child.name,
          slug: slugify(child.name),
          tagline: child.tagline,
          order: childOrder++,
          parent: parent.documentId,
        },
      });
    }
  }

  let faqOrder = 0;
  for (const faq of seed.faqs) {
    await strapi.documents('api::faq.faq').create({ data: { ...faq, order: faqOrder++ } });
  }
  for (const page of seed.legalPages) {
    await strapi.documents('api::legal-page.legal-page').create({ data: page });
  }
}

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await openPublicPermissions(strapi);
    await seedContent(strapi);
    await applyHomeDesign(strapi);
    await applyDemoProducts(strapi);
    await applyProductBriefs(strapi);
    await applyProductDetails(strapi);
    await applyLongBriefs(strapi);
    await applyStoreData(strapi);
  },
};
