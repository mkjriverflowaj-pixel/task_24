import { BoltBand } from '@/components/BoltBand';
import { CategoryCards } from '@/components/CategoryCards';
import { Marquee } from '@/components/Marquee';
import { Orbit3D, type OrbitItem } from '@/components/Orbit3D';
import { SpaceCards } from '@/components/SpaceCards';
import { FeatureStrip } from '@/components/FeatureStrip';
import { HeroSlider, type HeroSlide } from '@/components/HeroSlider';
import { HeroStatement } from '@/components/HeroStatement';
import { HelpSection } from '@/components/HelpSection';
import { PromoBanner } from '@/components/PromoBanner';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { SectionHeading } from '@/components/SectionHeading';
import { StatsBar } from '@/components/StatsBar';
import { Testimonials } from '@/components/Testimonials';
import { SmartLinkSection } from '@/components/smartlink/SmartLinkSection';
import { ProductShelf } from '@/components/store/ProductShelf';
import { discountPercent } from '@/lib/format';
import { getMotion } from '@/lib/motion';
import { getAllProducts, getHomeBanner, getHomeCategoryCards, getSpaces, getHomePage, getHomeTiles, getSiteSetting, getTestimonials, mediaUrl } from '@/lib/strapi';

export default async function HomePage() {
  const allMotion = await getMotion();
  const motion = allMotion.home;
  const [home, site, tiles, testimonials, banner, categoryCards, spaceList, allProducts] = await Promise.all([
    getHomePage(),
    getSiteSetting(),
    getHomeTiles(),
    getTestimonials(),
    getHomeBanner(),
    getHomeCategoryCards(),
    getSpaces(),
    getAllProducts(),
  ]);

  // Store shelves: picked from the priced products, no extra setup needed in Strapi.
  const inStock = allProducts.filter((p) => p.price != null && (p.stock == null || p.stock > 0));
  const bestSellers = [...inStock].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0)).slice(0, 4);
  const deals = [...inStock].sort((a, b) => discountPercent(b.price, b.compareAtPrice) - discountPercent(a.price, a.compareAtPrice)).slice(0, 4);
  const newest = [...inStock].sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))).slice(0, 4);

  // Slides live under Strapi's Home Banner; Home Page → Hero slides is only a fallback for older data.
  const heroSource = banner?.heroSlides?.length ? banner.heroSlides : (home.heroSlides ?? []);
  const slides: HeroSlide[] = heroSource.map((slide) => {
    const src = mediaUrl(slide.image);
    return {
      eyebrow: slide.eyebrow,
      heading: slide.heading,
      subheading: slide.subheading,
      buttonLabel: slide.buttonLabel,
      buttonUrl: slide.buttonUrl,
      theme: slide.theme ?? 'red',
      image: src ? { src, alt: slide.image?.alternativeText ?? slide.heading.replace(/\*\*/g, '') } : null,
    };
  });

  // The "Connect with Confidence." slide becomes the big first banner; the other slides follow as the slider.
  const statementIndex = Math.max(0, heroSource.findIndex((slide) => /connect with/i.test(slide.heading)));
  const statement = heroSource[statementIndex];

  // The first banner comes from Strapi's Home Banner; if that is empty it falls back to the "Connect with" hero slide.
  const top = banner ?? statement ?? null;
  const topSrc = mediaUrl(top?.image) ?? mediaUrl(statement?.image) ?? mediaUrl(tiles[0]?.image);
  const topImage = topSrc ? { src: topSrc, alt: top?.heading.replace(/\*\*/g, '') ?? '' } : null;
  const topFlags = banner
    ? { secondaryLabel: banner.secondaryButtonLabel, secondaryUrl: banner.secondaryButtonUrl, scrollHint: banner.scrollHint }
    : { secondaryLabel: 'See the range in 3D', secondaryUrl: '#collections', scrollHint: 'Scroll to power up' };
  // "Made for every space" cards: Strapi → Spaces first (picture, tag, text, link to the space page); the older
  // Home Page → Spaces cards are only a fallback.
  const spaceCards = spaceList.some((space) => space.image)
    ? spaceList.map((space) => ({ id: space.documentId as unknown as number, tag: space.tag, title: space.name, description: space.cardDescription ?? space.description, link: `/spaces/${space.slug}`, image: space.image }))
    : (home.spaces ?? []);
  const promoImage = mediaUrl(home.promoImage);
  const helpImage = mediaUrl(home.helpImage);
  const helpBack = mediaUrl(home.helpImageBack);
  const orbitItems: OrbitItem[] = tiles.flatMap((tile) => {
    const src = mediaUrl(tile.image);
    return src ? [{ id: tile.documentId, title: tile.name, tag: tile.parent?.name ?? "Product range", text: tile.tagline, src, alt: tile.image?.alternativeText ?? tile.name, href: `/products/${tile.slug}` }] : [];
  });

  return (
    <>
      <ScrollProgress />
      {top && <HeroStatement image={topImage} eyebrow={top.eyebrow} heading={top.heading} subheading={top.subheading} buttonLabel={top.buttonLabel} buttonUrl={top.buttonUrl} {...topFlags} />}
      <Marquee items={tiles.map((tile) => tile.name)} seconds={motion.marqueeSeconds} />
      {slides.length > 0 && <HeroSlider slides={slides} autoplay={motion.heroSliderAutoplay} seconds={motion.heroSliderSeconds} />}

      {home.highlights && home.highlights.length > 0 && <FeatureStrip items={home.highlights} />}

      {orbitItems.length >= 4 && <Orbit3D eyebrow={home.orbitEyebrow} title={home.orbitTitle} hint={home.orbitHint} items={orbitItems} autoplay={motion.orbitAutoplay} seconds={motion.orbitSeconds} turnSeconds={motion.orbitTurnSeconds} />}

      <section className="py-8">
        <div className="container-page">
          <Reveal variant="3d-flip">
            <SectionHeading eyebrow={home.categoriesEyebrow} title={home.categoriesTitle ?? ''} subtitle={home.categoriesSubtitle} />
          </Reveal>
          <div className="mt-7">
            <CategoryCards categories={categoryCards.length > 0 ? categoryCards : tiles} />
          </div>
        </div>
      </section>

      {home.promoTitle && (
        <Reveal variant="3d-zoom">
          <PromoBanner
            title={home.promoTitle}
            subtitle={home.promoSubtitle}
            label={home.promoLabel}
            image={promoImage ? { src: promoImage, alt: home.promoImage?.alternativeText ?? '' } : null}
          />
        </Reveal>
      )}

      <ProductShelf eyebrow="Shop now" title="Our **Best Sellers**" subtitle="The products our customers buy the most." products={bestSellers} />
      <ProductShelf eyebrow="Limited time" title="Deals of the **Day**" subtitle="Biggest savings across the range." products={deals} href="/products?sort=discount" tint />

      {home.spaces && home.spaces.length > 0 && (
        <SpaceCards eyebrow={home.spacesEyebrow} title={home.spacesTitle} subtitle={home.spacesSubtitle} cards={spaceCards} />
      )}

      <SmartLinkSection />

      {site.stats && site.stats.length > 0 && (
        <Reveal variant="3d-zoom">
          <StatsBar stats={site.stats} />
        </Reveal>
      )}

      <ProductShelf eyebrow="Just added" title="New **Arrivals**" products={newest} />

      <HelpSection
        eyebrow={home.ctaEyebrow}
        title={home.ctaTitle ?? ''}
        text={home.ctaText}
        label={home.ctaLabel}
        image={helpImage ? { src: helpImage, alt: home.helpImage?.alternativeText ?? '' } : null}
        backImage={helpBack ? { src: helpBack, alt: home.helpImageBack?.alternativeText ?? '' } : null}
        site={site}
      />

      {testimonials.length > 0 && (
        <section className="overflow-hidden bg-[#fff6f7] py-12">
          <div className="container-page">
            <Reveal variant="3d-flip">
              <SectionHeading title="Trusted by **Happy Customers**" />
            </Reveal>
          </div>
          <div className="mt-8">
            <Testimonials items={testimonials} seconds={motion.testimonialsSeconds} />
          </div>
        </section>
      )}

      {home.bannerTitle && <BoltBand title={home.bannerTitle} text={home.bannerText} label={home.bannerLabel} />}
    </>
  );
}
