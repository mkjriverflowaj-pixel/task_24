import type { Core } from '@strapi/strapi';

/**
 * Demo store data: dummy prices (INR), compare-at prices, ratings, review counts and stock for every product, plus extra
 * dummy products so the shop has a fuller range. All of it is SAMPLE content for building and checking the store screens;
 * edit or delete it in Strapi (Content Manager → Product) before going live. Idempotent: only fills products that have no
 * price yet and only creates products that do not exist, so edits made in Strapi are never overwritten.
 *
 * The structure follows common public sample-product datasets (title, description, price, discount, rating, stock, sku,
 * images, category); the values themselves are invented to suit Safonix's own electrical range.
 */

type Spec = [label: string, value: string];
type Def = {
  name: string;
  cat: string;
  price: number;
  mrp: number;
  short: string;
  specs: Spec[];
  badge?: string;
  unit?: string;
  stock?: number;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const hash = (text: string) => {
  let h = 7;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
};

/** Prices of the products that already exist in the catalogue: slug → [price, compare-at price, unit]. */
const existing: Record<string, [number, number, string?]> = {
  'matris-6a-one-way-switch': [65, 85],
  'matris-16a-power-socket': [145, 185],
  'xtreme-10a-two-way-switch': [89, 119],
  'xtreme-fan-regulator': [349, 449],
  'safonix-9w-led-bulb': [79, 99],
  'safonix-12w-led-bulb': [109, 139],
  'safonix-20w-high-wattage-led-bulb': [249, 329],
  'safonix-30w-high-wattage-led-bulb': [379, 479],
  'safonix-12w-round-led-downlight': [299, 399],
  'safonix-15w-square-led-downlight': [349, 449],
  'safonix-t5-led-tubelight-10w': [249, 319],
  'safonix-t5-led-tubelight-20w': [399, 499],
  'safonix-30w-led-flood-light': [649, 849],
  'safonix-50w-led-street-light': [1299, 1649],
  'safonix-1-5-sq-mm-multistrand-wire': [1299, 1599, 'per 90 m coil'],
  'safonix-2-5-sq-mm-multistrand-wire': [2049, 2499, 'per 90 m coil'],
  'safonix-3-core-flexible-cable-1-0-sq-mm': [1849, 2249, 'per 90 m coil'],
  'safonix-3-core-flexible-cable-1-5-sq-mm': [2699, 3199, 'per 90 m coil'],
  'safonix-single-pole-mcb-16a': [185, 239],
  'safonix-double-pole-isolator-32a': [749, 949],
  'safonix-2-pole-elcb-40a': [1899, 2399],
  'safonix-4-pole-elcb-63a': [3899, 4799],
  'zenia-4-way-distribution-board': [899, 1149],
  'zenia-8-way-distribution-board': [1599, 1999],
  'matris-6-way-distribution-board': [1349, 1699],
  'matris-12-way-distribution-board': [2449, 2999],
  'safonix-fresh-air-fan-150-mm': [1299, 1649],
  'safonix-fresh-air-fan-200-mm': [1749, 2199],
  'safonix-ventilation-fan-230-mm': [2349, 2899],
  'safonix-ventilation-fan-300-mm': [3149, 3899],
  'safonix-bldc-ceiling-fan-1200-mm': [3499, 4499],
  'safonix-bldc-ceiling-fan-1400-mm': [3999, 5199],
};

/** A few existing products are shown as low stock / out of stock so those states can be checked. */
const stockOverride: Record<string, number> = {
  'safonix-30w-high-wattage-led-bulb': 0,
  'safonix-4-pole-elcb-63a': 3,
  'safonix-bldc-ceiling-fan-1400-mm': 4,
  'matris-12-way-distribution-board': 0,
};

const coil = 'per 90 m coil';
const extra: Def[] = [
  // Matris modular switches
  { name: 'Matris 6A Two-Way Switch', cat: 'matris-modular-series', price: 79, mrp: 99, short: 'A two-way switch for staircases, passages and bedrooms.', specs: [['Rated current', '6 A'], ['Pole', 'Two-way'], ['Colour', 'White']] },
  { name: 'Matris 6A Bell Push', cat: 'matris-modular-series', price: 69, mrp: 89, short: 'A bell push with a soft rocker for doorbell circuits.', specs: [['Rated current', '6 A'], ['Type', 'Bell push'], ['Colour', 'White']] },
  { name: 'Matris 6A Two-Pin Socket', cat: 'matris-modular-series', price: 75, mrp: 95, short: 'A compact two-pin socket for lamps and chargers.', specs: [['Rated current', '6 A'], ['Type', '2-pin socket'], ['Colour', 'White']] },
  { name: 'Matris 20A Heavy Duty Switch', cat: 'matris-modular-series', price: 119, mrp: 155, short: 'A heavy-duty switch for geysers and air conditioners.', specs: [['Rated current', '20 A'], ['Pole', 'One-way'], ['Colour', 'White']] },
  // Xtreme modular switches
  { name: 'Xtreme 20A One-Way Switch', cat: 'xtreme-modular-series', price: 129, mrp: 165, short: 'A high-capacity switch for power-hungry appliances.', specs: [['Rated current', '20 A'], ['Pole', 'One-way'], ['Colour', 'White']] },
  { name: 'Xtreme 16A Power Socket', cat: 'xtreme-modular-series', price: 189, mrp: 239, badge: 'New', short: 'A shuttered 16A socket with a sleek bevelled plate.', specs: [['Rated current', '16 A'], ['Type', '3-pin socket'], ['Colour', 'White']] },
  { name: 'Xtreme Bell Push', cat: 'xtreme-modular-series', price: 99, mrp: 129, short: 'A firm-click bell push for entrance doors.', specs: [['Rated current', '6 A'], ['Type', 'Bell push'], ['Colour', 'White']] },
  // LED bulbs
  { name: 'Safonix 5W LED Bulb', cat: 'led-bulbs', price: 59, mrp: 79, short: 'A small, efficient bulb for lamps, passages and bathrooms.', specs: [['Wattage', '5 W'], ['Base', 'B22'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 7W LED Bulb', cat: 'led-bulbs', price: 69, mrp: 89, short: 'A soft, even light for bedrooms and kitchens.', specs: [['Wattage', '7 W'], ['Base', 'B22'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 15W LED Bulb', cat: 'led-bulbs', price: 149, mrp: 189, badge: 'Best seller', short: 'A bright bulb for living rooms and larger bedrooms.', specs: [['Wattage', '15 W'], ['Base', 'B22'], ['Colour temperature', '6500 K']] },
  // High wattage bulbs
  { name: 'Safonix 40W High Wattage LED Bulb', cat: 'high-wattage-led-bulbs', price: 499, mrp: 629, short: 'Strong light output for workshops and large halls.', specs: [['Wattage', '40 W'], ['Base', 'B22'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 50W High Wattage LED Bulb', cat: 'high-wattage-led-bulbs', price: 599, mrp: 749, short: 'Our brightest bulb for godowns and open halls.', specs: [['Wattage', '50 W'], ['Base', 'E27'], ['Colour temperature', '6500 K']] },
  // Downlights
  { name: 'Safonix 6W Round LED Downlight', cat: 'downlights', price: 189, mrp: 249, short: 'A slim recessed light for corridors and small rooms.', specs: [['Wattage', '6 W'], ['Cut-out', '90 mm'], ['Colour temperature', '4000 K']] },
  { name: 'Safonix 18W Round LED Downlight', cat: 'downlights', price: 399, mrp: 519, short: 'A wide, even downlight for living rooms and shops.', specs: [['Wattage', '18 W'], ['Cut-out', '170 mm'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 9W Square LED Downlight', cat: 'downlights', price: 259, mrp: 329, short: 'A square panel light with a frosted diffuser.', specs: [['Wattage', '9 W'], ['Cut-out', '120 mm'], ['Colour temperature', '4000 K']] },
  // T5 tubelights
  { name: 'Safonix T5 LED Tubelight 5W', cat: 't5-led-tubelights', price: 169, mrp: 219, short: 'A short batten for shelves, mirrors and cabinets.', specs: [['Wattage', '5 W'], ['Length', '300 mm'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix T5 LED Tubelight 15W', cat: 't5-led-tubelights', price: 329, mrp: 419, short: 'A mid-length batten for kitchens and workspaces.', specs: [['Wattage', '15 W'], ['Length', '900 mm'], ['Colour temperature', '6500 K']] },
  // Flood and street lights
  { name: 'Safonix 10W LED Flood Light', cat: 'flood-lights-and-street-lights', price: 299, mrp: 389, short: 'A compact weather-resistant light for gates and balconies.', specs: [['Wattage', '10 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 20W LED Flood Light', cat: 'flood-lights-and-street-lights', price: 449, mrp: 579, short: 'A wide-beam flood light for yards and shopfronts.', specs: [['Wattage', '20 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 50W LED Flood Light', cat: 'flood-lights-and-street-lights', price: 849, mrp: 1099, badge: 'Outdoor', short: 'A powerful flood light for parking areas and sites.', specs: [['Wattage', '50 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 100W LED Flood Light', cat: 'flood-lights-and-street-lights', price: 1499, mrp: 1949, short: 'High-output flood lighting for large open areas.', specs: [['Wattage', '100 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K']] },
  { name: 'Safonix 30W LED Street Light', cat: 'flood-lights-and-street-lights', price: 899, mrp: 1149, short: 'A slim street light for lanes and compound walls.', specs: [['Wattage', '30 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K']] },
  // Multistrand wires
  { name: 'Safonix 1.0 sq mm Multistrand Wire', cat: 'multistrand-wires', price: 899, mrp: 1149, unit: coil, short: 'A light-gauge copper wire for lighting circuits.', specs: [['Conductor size', '1.0 sq mm'], ['Length', '90 m'], ['Insulation', 'FR PVC']] },
  { name: 'Safonix 4 sq mm Multistrand Wire', cat: 'multistrand-wires', price: 3099, mrp: 3799, unit: coil, short: 'A heavy-gauge wire for air conditioners and geysers.', specs: [['Conductor size', '4 sq mm'], ['Length', '90 m'], ['Insulation', 'FR PVC']] },
  { name: 'Safonix 6 sq mm Multistrand Wire', cat: 'multistrand-wires', price: 4599, mrp: 5599, unit: coil, short: 'A thick copper wire for main supply lines.', specs: [['Conductor size', '6 sq mm'], ['Length', '90 m'], ['Insulation', 'FR PVC']] },
  // Flexible cables
  { name: 'Safonix 2 Core Flexible Cable 1.0 sq mm', cat: 'multicore-copper-flexible-wires', price: 1499, mrp: 1849, unit: coil, short: 'A two-core flexible cable for small appliances.', specs: [['Cores', '2'], ['Conductor size', '1.0 sq mm'], ['Length', '90 m']] },
  { name: 'Safonix 3 Core Flexible Cable 2.5 sq mm', cat: 'multicore-copper-flexible-wires', price: 3999, mrp: 4899, unit: coil, short: 'A rugged three-core cable for pumps and heavy loads.', specs: [['Cores', '3'], ['Conductor size', '2.5 sq mm'], ['Length', '90 m']] },
  // MCBs and isolators
  { name: 'Safonix Single Pole MCB 6A', cat: 'mcb-s-and-isolators', price: 165, mrp: 219, short: 'A miniature circuit breaker for lighting circuits.', specs: [['Rated current', '6 A'], ['Poles', '1'], ['Breaking capacity', '10 kA']] },
  { name: 'Safonix Single Pole MCB 10A', cat: 'mcb-s-and-isolators', price: 175, mrp: 229, short: 'Overload and short-circuit protection for general circuits.', specs: [['Rated current', '10 A'], ['Poles', '1'], ['Breaking capacity', '10 kA']] },
  { name: 'Safonix Single Pole MCB 32A', cat: 'mcb-s-and-isolators', price: 215, mrp: 279, short: 'A higher-rated breaker for air conditioner circuits.', specs: [['Rated current', '32 A'], ['Poles', '1'], ['Breaking capacity', '10 kA']] },
  { name: 'Safonix Double Pole MCB 32A', cat: 'mcb-s-and-isolators', price: 489, mrp: 629, short: 'A double-pole breaker that cuts both live and neutral.', specs: [['Rated current', '32 A'], ['Poles', '2'], ['Breaking capacity', '10 kA']] },
  { name: 'Safonix Triple Pole MCB 32A', cat: 'mcb-s-and-isolators', price: 799, mrp: 1029, short: 'A three-pole breaker for three-phase supply.', specs: [['Rated current', '32 A'], ['Poles', '3'], ['Breaking capacity', '10 kA']] },
  { name: 'Safonix Double Pole Isolator 63A', cat: 'mcb-s-and-isolators', price: 1099, mrp: 1399, short: 'A heavy-duty isolator for the main incoming supply.', specs: [['Rated current', '63 A'], ['Poles', '2'], ['Type', 'Isolator']] },
  // ELCB
  { name: 'Safonix 2 Pole ELCB 25A', cat: 'elcb', price: 1599, mrp: 2049, badge: 'Safety', short: 'An earth leakage breaker for kitchens and bathrooms.', specs: [['Rated current', '25 A'], ['Poles', '2'], ['Sensitivity', '30 mA']] },
  // Distribution boards
  { name: 'Zenia 6 Way Distribution Board', cat: 'zenia-distribution-boards', price: 1249, mrp: 1599, short: 'A tidy board for apartments with a few more circuits.', specs: [['Ways', '6'], ['Material', 'Powder-coated steel'], ['Mounting', 'Surface']] },
  { name: 'Zenia 12 Way Distribution Board', cat: 'zenia-distribution-boards', price: 2099, mrp: 2649, short: 'A larger board for villas and small offices.', specs: [['Ways', '12'], ['Material', 'Powder-coated steel'], ['Mounting', 'Surface']] },
  { name: 'Matris 8 Way Distribution Board', cat: 'matris-distribution-boards', price: 1849, mrp: 2349, short: 'A modern board with a clear cover and tidy cable entry.', specs: [['Ways', '8'], ['Material', 'Polycarbonate'], ['Mounting', 'Flush']] },
  // Fans
  { name: 'Safonix Fresh Air Fan 100 mm', cat: 'fresh-air-fans-12', price: 899, mrp: 1149, short: 'A compact fresh air fan for small bathrooms.', specs: [['Sweep', '100 mm'], ['Speed', '2600 RPM'], ['Voltage', '230 V AC']] },
  { name: 'Safonix Ventilation Fan 380 mm', cat: 'ventilation-fans-8', price: 3799, mrp: 4699, short: 'A large exhaust fan for restaurants and workshops.', specs: [['Sweep', '380 mm'], ['Speed', '1350 RPM'], ['Voltage', '230 V AC']] },
  { name: 'Safonix BLDC Ceiling Fan 900 mm', cat: 'bldc-fans', price: 3199, mrp: 4099, badge: 'Energy saver', short: 'A small-room BLDC fan with remote control.', specs: [['Sweep', '900 mm'], ['Power', '28 W'], ['Voltage', '230 V AC']] },
];

const groupFeatures: Record<string, [string, string][]> = {
  switches: [['Smooth action', 'A firm, quiet rocker feel on every press.'], ['Flame-retardant body', 'Made from polycarbonate that resists heat.'], ['Easy fitting', 'Fits standard modular boxes.']],
  lights: [['Energy saving', 'Gives bright light for far less power.'], ['Flicker-free', 'Steady, comfortable light for the eyes.'], ['Long life', 'Built for years of daily use.']],
  wires: [['Pure copper', 'High-conductivity copper for steady current flow.'], ['FR insulation', 'Flame-retardant PVC covering.'], ['Flexible', 'Easy to pull through conduits.']],
  protection: [['Reliable tripping', 'Cuts the supply fast on overload or fault.'], ['Clear indication', 'Easy to see if it has tripped.'], ['DIN-rail mounting', 'Snaps onto a standard rail.']],
  fans: [['Quiet running', 'Low noise for comfortable rooms.'], ['Strong airflow', 'Moves air steadily and evenly.'], ['Long-life motor', 'Built for continuous use.']],
};
const groupOf = (cat: string) =>
  /switch|series$/.test(cat) && !/distribution/.test(cat) ? 'switches' : /wire/.test(cat) ? 'wires' : /mcb|elcb|distribution/.test(cat) ? 'protection' : /fan/.test(cat) ? 'fans' : 'lights';

export async function applyStoreData(strapi: Core.Strapi) {
  const products = strapi.documents('api::product.product');
  const categories = strapi.documents('api::category.category');

  // 1. extra dummy products (created only when their slug is not there yet)
  const catNames = new Map<string, string>();
  for (const def of extra) {
    const slug = slugify(def.name);
    if (await products.findFirst({ filters: { slug } })) continue;
    const category = (await categories.findFirst({ filters: { slug: def.cat } })) as { documentId: string; name?: string } | null;
    if (!category) continue;
    catNames.set(def.cat, category.name ?? def.cat);
    const sibling = (await products.findFirst({ filters: { category: { slug: def.cat } }, populate: ['images'] })) as { images?: { id: number }[] } | null;
    const group = groupOf(def.cat);
    const h = hash(def.name);
    await products.create({
      data: {
        name: def.name,
        slug,
        sku: `SFX-${def.cat.slice(0, 3).toUpperCase()}-${String(1000 + (h % 9000))}`,
        badge: def.badge ?? null,
        featured: false,
        shortDescription: def.short,
        brief: `${def.name} is part of the Safonix ${catNames.get(def.cat)} range: ${def.short.charAt(0).toLowerCase()}${def.short.slice(1)}`,
        description: [
          `${def.short} The ${def.name} is made in India to Safonix quality standards for homes, shops and offices.`,
          'Every unit is checked before dispatch, and the range is backed by a manufacturer warranty and a 7-day return window.',
        ].join('\n\n'),
        features: groupFeatures[group].map(([title, description]) => ({ title, description })),
        specifications: def.specs.map(([label, value]) => ({ label, value })),
        details: [
          { label: 'Brand', value: 'Safonix' },
          { label: 'Country of origin', value: 'India' },
          { label: 'Warranty', value: '12 months' },
          { label: 'Sold as', value: def.unit ?? 'per piece' },
        ],
        images: (sibling?.images ?? []).map((image) => image.id),
        category: category.documentId,
        price: def.price,
        compareAtPrice: def.mrp,
        unit: def.unit ?? 'per piece',
        rating: Number((3.8 + (h % 11) / 10).toFixed(1)),
        reviewCount: 8 + (h % 420),
        stock: def.stock ?? 12 + (h % 140),
      } as never,
    });
  }

  // 2. prices, ratings and stock for every product that has no price yet (the original catalogue)
  const unpriced = (await products.findMany({ filters: { price: { $null: true } }, pagination: { pageSize: 200 } })) as { documentId: string; slug: string; name: string }[];
  for (const product of unpriced) {
    const known = existing[product.slug];
    const h = hash(product.name);
    const price = known?.[0] ?? 199 + (h % 40) * 25;
    const mrp = known?.[1] ?? Math.round((price * 1.25) / 5) * 5;
    await products.update({
      documentId: product.documentId,
      data: {
        price,
        compareAtPrice: mrp,
        unit: known?.[2] ?? 'per piece',
        rating: Number((3.8 + (h % 11) / 10).toFixed(1)),
        reviewCount: 8 + (h % 420),
        stock: stockOverride[product.slug] ?? 12 + (h % 140),
      } as never,
    });
  }
}
