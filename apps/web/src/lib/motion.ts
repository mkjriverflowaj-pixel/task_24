import { cache } from 'react';
import { getAnimationSettings, mediaUrl } from './strapi';

export type Motion = {
  home: {
    orbitAutoplay: boolean;
    orbitSeconds: number;
    orbitTurnSeconds: number;
    heroSliderAutoplay: boolean;
    heroSliderSeconds: number;
    marqueeSeconds: number;
    testimonialsSeconds: number;
    clickSparks: boolean;
    preloader: boolean;
  };
  about: { valuesAutoplay: boolean; valuesSeconds: number; productSliderAutoplay: boolean; productSliderSeconds: number };
  smartLink: { heroStory: boolean; heroTilt: boolean; qrEffect: boolean; qrSeconds: number; heroLottie: string | null };
};

const defaults: Motion = {
  home: { orbitAutoplay: true, orbitSeconds: 4, orbitTurnSeconds: 2.3, heroSliderAutoplay: true, heroSliderSeconds: 4, marqueeSeconds: 22, testimonialsSeconds: 60, clickSparks: true, preloader: true },
  about: { valuesAutoplay: true, valuesSeconds: 4, productSliderAutoplay: true, productSliderSeconds: 3.8 },
  smartLink: { heroStory: true, heroTilt: true, qrEffect: true, qrSeconds: 5.3, heroLottie: null },
};

const num = (value: unknown, fallback: number, min: number, max: number) => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const flag = (value: unknown, fallback: boolean) => (typeof value === 'boolean' ? value : fallback);

/**
 * Animation Settings from Strapi merged over built-in defaults (so a missing or half-filled entry never breaks anything).
 * "All animations" switched off turns every timer, effect and intro off at once.
 */
export const getMotion = cache(async (): Promise<Motion> => {
  const raw = await getAnimationSettings();
  const h = raw?.home ?? {};
  const a = raw?.about ?? {};
  const s = raw?.smartLink ?? {};
  const on = flag(raw?.allAnimations, true);
  return {
    home: {
      orbitAutoplay: on && flag(h.orbitAutoplay, defaults.home.orbitAutoplay),
      orbitSeconds: num(h.orbitSeconds, defaults.home.orbitSeconds, 1.5, 30),
      orbitTurnSeconds: num(h.orbitTurnSeconds, defaults.home.orbitTurnSeconds, 0.6, 6),
      heroSliderAutoplay: on && flag(h.heroSliderAutoplay, defaults.home.heroSliderAutoplay),
      heroSliderSeconds: num(h.heroSliderSeconds, defaults.home.heroSliderSeconds, 2, 30),
      marqueeSeconds: num(h.marqueeSeconds, defaults.home.marqueeSeconds, 5, 120),
      testimonialsSeconds: num(h.testimonialsSeconds, defaults.home.testimonialsSeconds, 10, 240),
      clickSparks: on && flag(h.clickSparks, defaults.home.clickSparks),
      preloader: on && flag(h.preloader, defaults.home.preloader),
    },
    about: {
      valuesAutoplay: on && flag(a.valuesAutoplay, defaults.about.valuesAutoplay),
      valuesSeconds: num(a.valuesSeconds, defaults.about.valuesSeconds, 1.5, 30),
      productSliderAutoplay: on && flag(a.productSliderAutoplay, defaults.about.productSliderAutoplay),
      productSliderSeconds: num(a.productSliderSeconds, defaults.about.productSliderSeconds, 1.5, 30),
    },
    smartLink: {
      heroStory: on && flag(s.heroStory, defaults.smartLink.heroStory),
      heroTilt: on && flag(s.heroTilt, defaults.smartLink.heroTilt),
      qrEffect: on && flag(s.qrEffect, defaults.smartLink.qrEffect),
      qrSeconds: num(s.qrSeconds, defaults.smartLink.qrSeconds, 2, 20),
      heroLottie: mediaUrl(s.heroLottie ?? null),
    },
  };
});
