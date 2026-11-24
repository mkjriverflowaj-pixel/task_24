/** Prices are shown in Indian rupees, with Indian digit grouping (1,29,900). */
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const inrExact = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatPrice = (value: number) => inr.format(value);
export const formatPriceExact = (value: number) => inrExact.format(value);

/** Whole rupees when there are no paise, otherwise two decimals (a 10% coupon can give 5.90). */
export const money = (value: number) => (Number.isInteger(value) ? inr.format(value) : inrExact.format(value));

/** Whole-number percentage saved when a compare-at price is higher than the price; 0 otherwise. */
export const discountPercent = (price?: number | null, compareAt?: number | null) =>
  price != null && compareAt != null && compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

/** Strapi sends decimals as numbers, but be safe if a string slips through. */
export const toNumber = (value: unknown): number | null => {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

/** Delivery rules for the demo store. */
export const FREE_SHIPPING_FROM = 999;
export const SHIPPING_FEE = 49;
export const shippingFor = (subtotal: number) => (subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE);
