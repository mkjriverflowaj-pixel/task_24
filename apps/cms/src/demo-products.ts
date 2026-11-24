import path from 'node:path';
import fs from 'node:fs';
import type { Core } from '@strapi/strapi';

/**
 * Placeholder products so the product pages can be designed and checked.
 * All names, descriptions, features and specification values below are DUMMY content:
 * replace or delete them in Strapi (Content Manager → Product) before going live.
 * Runs only while the Products collection is empty, so it never overwrites real entries.
 */

type Spec = [label: string, value: string];
type Demo = {
  name: string;
  badge?: string;
  featured?: boolean;
  short: string;
  description: string[];
  features: [title: string, text: string][];
  specs: Spec[];
};

const imageSets: Record<string, string[]> = {
  switches: ['Switch-png-1.png', '2-1.png'],
  bulbs: ['LED-Bulb.png', 'LED-Penal.png'],
  panels: ['LED-Penal.png', 'LED-Bulb.png'],
  flood: ['Frame-10000045290.png', 'LED-Bulb.png'],
  wires: ['Multistand-Wires.png'],
  mcb: ['MCB.png', 'MCB-Distribution-board-new-2.png'],
  boards: ['MCB-Distribution-board-new-2.png', 'MCB.png'],
  fresh: ['Fresh-Air-fan-New.png', 'Ventilation-Fan-New-2.png'],
  vent: ['Ventilation-Fan-New-2.png', 'Fresh-Air-fan-New.png'],
};

const common: Record<"safety" | "warranty", [string, string]> = {
  safety: ['Tested for safety', 'Dummy text: built and tested to meet standard safety checks.'],
  warranty: ['Warranty', 'Dummy text: backed by a manufacturer warranty.'],
};

const catalog: Record<string, { images: string; items: Demo[] }> = {
  'matris-modular-series': {
    images: 'switches',
    items: [
      { name: 'Matris 6A One-Way Switch', badge: 'Popular', featured: true, short: 'A smooth-action one-way switch with a slim, modern plate.', description: ['Sample description. A one-way switch for everyday lighting circuits with a soft-touch rocker and a clean finish.', 'Replace this text with the real product description from Strapi.'], features: [['Soft-touch rocker', 'Quiet and smooth operation.'], ['Slim plate design', 'Sits flush with the wall.'], common.safety], specs: [['Rated current', '6 A'], ['Rated voltage', '240 V AC'], ['Pole', 'One-way'], ['Material', 'Flame-retardant polycarbonate'], ['Colour', 'White']] },
      { name: 'Matris 16A Power Socket', short: 'A 16A socket with shuttered contacts for safer use.', description: ['Sample description. A heavy-duty socket for appliances with higher power needs.', 'Replace this text with the real product description from Strapi.'], features: [['Shuttered contacts', 'Keeps the openings covered when unused.'], ['High-grade contacts', 'Made for steady current flow.'], common.warranty], specs: [['Rated current', '16 A'], ['Rated voltage', '240 V AC'], ['Type', '3-pin socket'], ['Material', 'Flame-retardant polycarbonate'], ['Colour', 'White']] },
    ],
  },
  'xtreme-modular-series': {
    images: 'switches',
    items: [
      { name: 'Xtreme 10A Two-Way Switch', badge: 'New', featured: true, short: 'A two-way switch for staircases and long corridors.', description: ['Sample description. Control one light from two places with a firm, responsive rocker.', 'Replace this text with the real product description from Strapi.'], features: [['Two-way control', 'Switch the same light from two spots.'], ['Firm click', 'Clear feedback on every press.'], common.safety], specs: [['Rated current', '10 A'], ['Rated voltage', '240 V AC'], ['Pole', 'Two-way'], ['Material', 'Polycarbonate'], ['Colour', 'White']] },
      { name: 'Xtreme Fan Regulator', short: 'A compact step regulator for ceiling fans.', description: ['Sample description. Adjust fan speed in steps with a smooth knob.', 'Replace this text with the real product description from Strapi.'], features: [['Step control', 'Easy speed selection.'], ['Compact module', 'Fits a standard plate.'], common.warranty], specs: [['Rated load', '100 W'], ['Rated voltage', '240 V AC'], ['Steps', '5'], ['Material', 'Polycarbonate'], ['Colour', 'White']] },
    ],
  },
  'led-bulbs': {
    images: 'bulbs',
    items: [
      { name: 'Safonix 9W LED Bulb', badge: 'Best seller', featured: true, short: 'An energy-saving LED bulb for homes and offices.', description: ['Sample description. A bright, low-power bulb that fits standard holders.', 'Replace this text with the real product description from Strapi.'], features: [['Energy saving', 'Uses far less power than older bulbs.'], ['Even light', 'Soft, flicker-free glow.'], common.warranty], specs: [['Wattage', '9 W'], ['Base', 'B22'], ['Colour temperature', '6500 K (cool white)'], ['Input voltage', '175–265 V AC'], ['Life', '25,000 hours (dummy)']] },
      { name: 'Safonix 12W LED Bulb', short: 'A brighter bulb for larger rooms.', description: ['Sample description. More light output for halls and bedrooms.', 'Replace this text with the real product description from Strapi.'], features: [['Brighter output', 'Suited to larger rooms.'], ['Long life', 'Built for steady daily use.'], common.safety], specs: [['Wattage', '12 W'], ['Base', 'B22'], ['Colour temperature', '6500 K (cool white)'], ['Input voltage', '175–265 V AC'], ['Life', '25,000 hours (dummy)']] },
    ],
  },
  'high-wattage-led-bulbs': {
    images: 'bulbs',
    items: [
      { name: 'Safonix 20W High Wattage LED Bulb', short: 'High light output for halls, shops and workspaces.', description: ['Sample description. A high-output bulb for spaces that need strong lighting.', 'Replace this text with the real product description from Strapi.'], features: [['High output', 'Strong light for large areas.'], ['Cool-running body', 'Designed to manage heat.'], common.warranty], specs: [['Wattage', '20 W'], ['Base', 'B22'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Life', '20,000 hours (dummy)']] },
      { name: 'Safonix 30W High Wattage LED Bulb', badge: 'New', short: 'Powerful lighting for large halls and workshops.', description: ['Sample description. Our highest-output bulb in this group.', 'Replace this text with the real product description from Strapi.'], features: [['Very high output', 'Covers wide areas.'], ['Sturdy build', 'Made for demanding use.'], common.safety], specs: [['Wattage', '30 W'], ['Base', 'B22'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Life', '20,000 hours (dummy)']] },
    ],
  },
  downlights: {
    images: 'panels',
    items: [
      { name: 'Safonix 12W Round LED Downlight', badge: 'Popular', featured: true, short: 'A slim recessed light for a clean ceiling look.', description: ['Sample description. A round recessed panel light for false ceilings.', 'Replace this text with the real product description from Strapi.'], features: [['Slim profile', 'Fits shallow false ceilings.'], ['Uniform glow', 'Even light with no hot spots.'], common.warranty], specs: [['Wattage', '12 W'], ['Shape', 'Round'], ['Cut-out', '145 mm'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC']] },
      { name: 'Safonix 15W Square LED Downlight', short: 'A square panel light for modern interiors.', description: ['Sample description. A square recessed light with a frosted diffuser.', 'Replace this text with the real product description from Strapi.'], features: [['Frosted diffuser', 'Soft, glare-free light.'], ['Easy fitting', 'Spring clips for quick install.'], common.safety], specs: [['Wattage', '15 W'], ['Shape', 'Square'], ['Cut-out', '150 mm'], ['Colour temperature', '4000 K'], ['Input voltage', '175–265 V AC']] },
    ],
  },
  't5-led-tubelights': {
    images: 'panels',
    items: [
      { name: 'Safonix T5 LED Tubelight 10W', short: 'A slim batten tubelight for kitchens and corridors.', description: ['Sample description. A compact tube light with simple plug-in connection.', 'Replace this text with the real product description from Strapi.'], features: [['Slim body', 'Easy to fit in tight spots.'], ['Plug-in link', 'Connect several in a row.'], common.warranty], specs: [['Wattage', '10 W'], ['Length', '600 mm'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Body', 'Aluminium and polycarbonate']] },
      { name: 'Safonix T5 LED Tubelight 20W', short: 'A full-length tubelight for brighter spaces.', description: ['Sample description. A longer tube for rooms that need more light.', 'Replace this text with the real product description from Strapi.'], features: [['Longer run', 'More light along the wall.'], ['Low power', 'Efficient everyday use.'], common.safety], specs: [['Wattage', '20 W'], ['Length', '1200 mm'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Body', 'Aluminium and polycarbonate']] },
    ],
  },
  'flood-lights-and-street-lights': {
    images: 'flood',
    items: [
      { name: 'Safonix 30W LED Flood Light', badge: 'Outdoor', featured: true, short: 'A weather-resistant flood light for gates and gardens.', description: ['Sample description. A rugged outdoor light with a wide beam.', 'Replace this text with the real product description from Strapi.'], features: [['Weather resistant', 'Built for outdoor use.'], ['Wide beam', 'Lights a broad area.'], common.warranty], specs: [['Wattage', '30 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Body', 'Die-cast aluminium']] },
      { name: 'Safonix 50W LED Street Light', short: 'A sturdy luminaire for roads and open compounds.', description: ['Sample description. A high-output pole or wall-mounted light.', 'Replace this text with the real product description from Strapi.'], features: [['High output', 'Made for roads and yards.'], ['Rugged housing', 'Handles rain and dust.'], common.safety], specs: [['Wattage', '50 W'], ['Ingress protection', 'IP65'], ['Colour temperature', '6500 K'], ['Input voltage', '175–265 V AC'], ['Body', 'Die-cast aluminium']] },
    ],
  },
  'multistrand-wires': {
    images: 'wires',
    items: [
      { name: 'Safonix 1.5 sq mm Multistrand Wire', badge: 'Best seller', featured: true, short: 'A flexible copper wire for home wiring.', description: ['Sample description. Multistrand copper conductor with flame-retardant PVC insulation.', 'Replace this text with the real product description from Strapi.'], features: [['Flexible conductor', 'Easy to pull through conduits.'], ['Flame-retardant PVC', 'Added protection for wiring.'], common.safety], specs: [['Conductor', 'Copper (multistrand)'], ['Size', '1.5 sq mm'], ['Voltage grade', '1100 V'], ['Insulation', 'FR PVC'], ['Length per coil', '90 m (dummy)']] },
      { name: 'Safonix 2.5 sq mm Multistrand Wire', short: 'A heavier-gauge wire for power circuits.', description: ['Sample description. Suited to circuits with higher loads.', 'Replace this text with the real product description from Strapi.'], features: [['Higher capacity', 'For power points and appliances.'], ['Smooth insulation', 'Easy stripping and routing.'], common.warranty], specs: [['Conductor', 'Copper (multistrand)'], ['Size', '2.5 sq mm'], ['Voltage grade', '1100 V'], ['Insulation', 'FR PVC'], ['Length per coil', '90 m (dummy)']] },
    ],
  },
  'multicore-copper-flexible-wires': {
    images: 'wires',
    items: [
      { name: 'Safonix 3 Core Flexible Cable 1.0 sq mm', short: 'A three-core flexible cable for appliances and extensions.', description: ['Sample description. Three insulated copper cores in a single round sheath.', 'Replace this text with the real product description from Strapi.'], features: [['Three cores', 'Phase, neutral and earth in one cable.'], ['Round sheath', 'Neat and durable.'], common.safety], specs: [['Conductor', 'Copper (flexible)'], ['Cores', '3'], ['Size', '1.0 sq mm'], ['Voltage grade', '1100 V'], ['Sheath', 'PVC']] },
      { name: 'Safonix 3 Core Flexible Cable 1.5 sq mm', short: 'A heavier three-core cable for higher-load appliances.', description: ['Sample description. Suited to equipment that draws more current.', 'Replace this text with the real product description from Strapi.'], features: [['Higher current', 'For heavier appliances.'], ['Flexible build', 'Easy to route and coil.'], common.warranty], specs: [['Conductor', 'Copper (flexible)'], ['Cores', '3'], ['Size', '1.5 sq mm'], ['Voltage grade', '1100 V'], ['Sheath', 'PVC']] },
    ],
  },
  'mcb-s-and-isolators': {
    images: 'mcb',
    items: [
      { name: 'Safonix Single Pole MCB 16A', badge: 'Popular', featured: true, short: 'A miniature circuit breaker for everyday protection.', description: ['Sample description. Protects circuits from overload and short circuit.', 'Replace this text with the real product description from Strapi.'], features: [['Overload protection', 'Trips when the load is too high.'], ['Short-circuit protection', 'Cuts supply quickly on a fault.'], common.safety], specs: [['Poles', '1'], ['Rated current', '16 A'], ['Breaking capacity', '10 kA'], ['Curve', 'C'], ['Mounting', 'DIN rail']] },
      { name: 'Safonix Double Pole Isolator 32A', short: 'A double-pole isolator to cut supply for maintenance.', description: ['Sample description. Isolates a circuit completely when needed.', 'Replace this text with the real product description from Strapi.'], features: [['Double pole', 'Disconnects phase and neutral.'], ['Clear indicator', 'Shows on and off status.'], common.warranty], specs: [['Poles', '2'], ['Rated current', '32 A'], ['Rated voltage', '240 V AC'], ['Mounting', 'DIN rail'], ['Terminal', 'Screw type']] },
    ],
  },
  elcb: {
    images: 'mcb',
    items: [
      { name: 'Safonix 2 Pole ELCB 40A', badge: 'Safety', featured: true, short: 'An earth leakage breaker that guards against shock risk.', description: ['Sample description. Detects leakage current and trips the supply.', 'Replace this text with the real product description from Strapi.'], features: [['Leakage detection', 'Trips on earth leakage.'], ['Test button', 'Check function at any time.'], common.safety], specs: [['Poles', '2'], ['Rated current', '40 A'], ['Sensitivity', '30 mA'], ['Rated voltage', '240 V AC'], ['Mounting', 'DIN rail']] },
      { name: 'Safonix 4 Pole ELCB 63A', short: 'A four-pole earth leakage breaker for three-phase supply.', description: ['Sample description. Protection for three-phase installations.', 'Replace this text with the real product description from Strapi.'], features: [['Four pole', 'Covers three-phase and neutral.'], ['Test button', 'Easy function check.'], common.warranty], specs: [['Poles', '4'], ['Rated current', '63 A'], ['Sensitivity', '30 mA'], ['Rated voltage', '415 V AC'], ['Mounting', 'DIN rail']] },
    ],
  },
  'zenia-distribution-boards': {
    images: 'boards',
    items: [
      { name: 'Zenia 4 Way Distribution Board', featured: true, short: 'A neat enclosure to organize home circuits.', description: ['Sample description. A compact board with space for MCBs and an incomer.', 'Replace this text with the real product description from Strapi.'], features: [['Neat layout', 'Clear space for wiring.'], ['Sturdy enclosure', 'Protects internal parts.'], common.safety], specs: [['Ways', '4'], ['Type', 'Single phase'], ['Rated voltage', '240 V AC'], ['Mounting', 'Surface / flush'], ['Material', 'Powder-coated steel']] },
      { name: 'Zenia 8 Way Distribution Board', short: 'A larger board for apartments and small offices.', description: ['Sample description. More ways for additional circuits.', 'Replace this text with the real product description from Strapi.'], features: [['More ways', 'Room for extra circuits.'], ['Easy access', 'Hinged, easy-open cover.'], common.warranty], specs: [['Ways', '8'], ['Type', 'Single phase'], ['Rated voltage', '240 V AC'], ['Mounting', 'Surface / flush'], ['Material', 'Powder-coated steel']] },
    ],
  },
  'matris-distribution-boards': {
    images: 'boards',
    items: [
      { name: 'Matris 6 Way Distribution Board', badge: 'New', short: 'A modern distribution board with a clean front.', description: ['Sample description. A stylish board with a clear cover and tidy cable entry.', 'Replace this text with the real product description from Strapi.'], features: [['Clear cover', 'See the MCBs at a glance.'], ['Tidy cable entry', 'Knock-outs for easy wiring.'], common.safety], specs: [['Ways', '6'], ['Type', 'Single phase'], ['Rated voltage', '240 V AC'], ['Mounting', 'Surface / flush'], ['Material', 'Powder-coated steel']] },
      { name: 'Matris 12 Way Distribution Board', short: 'A larger board for bigger installations.', description: ['Sample description. Space for additional circuits and an RCCB.', 'Replace this text with the real product description from Strapi.'], features: [['Ample space', 'For MCBs and an RCCB.'], ['Strong build', 'Rigid enclosure.'], common.warranty], specs: [['Ways', '12'], ['Type', 'Single phase'], ['Rated voltage', '240 V AC'], ['Mounting', 'Surface / flush'], ['Material', 'Powder-coated steel']] },
    ],
  },
  'fresh-air-fans-12': {
    images: 'fresh',
    items: [
      { name: 'Safonix Fresh Air Fan 150 mm', badge: 'Popular', featured: true, short: 'A quiet fresh air fan for bathrooms and kitchens.', description: ['Sample description. Moves stale air out of small rooms with low noise.', 'Replace this text with the real product description from Strapi.'], features: [['Quiet running', 'Gentle sound in daily use.'], ['Easy fitting', 'Fits a standard wall cut-out.'], common.warranty], specs: [['Sweep', '150 mm'], ['Power', '25 W'], ['Speed', '2400 RPM'], ['Voltage', '230 V AC'], ['Body', 'ABS plastic']] },
      { name: 'Safonix Fresh Air Fan 200 mm', short: 'A larger fresh air fan for bigger rooms.', description: ['Sample description. A higher-flow model for living areas and kitchens.', 'Replace this text with the real product description from Strapi.'], features: [['Higher air flow', 'Clears larger rooms faster.'], ['Sturdy body', 'Built for daily use.'], common.safety], specs: [['Sweep', '200 mm'], ['Power', '35 W'], ['Speed', '2300 RPM'], ['Voltage', '230 V AC'], ['Body', 'ABS plastic']] },
    ],
  },
  'ventilation-fans-8': {
    images: 'vent',
    items: [
      { name: 'Safonix Ventilation Fan 230 mm', featured: true, short: 'A powerful exhaust fan for shops and kitchens.', description: ['Sample description. A heavy-duty fan with a metal body and strong air flow.', 'Replace this text with the real product description from Strapi.'], features: [['Strong air flow', 'Moves large volumes of air.'], ['Metal body', 'Durable for tough use.'], common.warranty], specs: [['Sweep', '230 mm'], ['Power', '50 W'], ['Speed', '1350 RPM'], ['Voltage', '230 V AC'], ['Body', 'Powder-coated metal']] },
      { name: 'Safonix Ventilation Fan 300 mm', short: 'A large exhaust fan for workshops and halls.', description: ['Sample description. Built for bigger spaces that need steady ventilation.', 'Replace this text with the real product description from Strapi.'], features: [['Large sweep', 'Covers wide spaces.'], ['Balanced blades', 'Smooth, low-vibration running.'], common.safety], specs: [['Sweep', '300 mm'], ['Power', '70 W'], ['Speed', '1350 RPM'], ['Voltage', '230 V AC'], ['Body', 'Powder-coated metal']] },
    ],
  },
  'bldc-fans': {
    images: 'fresh',
    items: [
      { name: 'Safonix BLDC Ceiling Fan 1200 mm', badge: 'Energy saver', featured: true, short: 'A high-efficiency BLDC fan that uses far less power.', description: ['Sample description. A brushless motor fan with remote control.', 'Replace this text with the real product description from Strapi.'], features: [['Low power use', 'Brushless motor saves energy.'], ['Remote control', 'Change speed from your seat.'], common.warranty], specs: [['Sweep', '1200 mm'], ['Power', '28 W'], ['Speed', '350 RPM'], ['Voltage', '230 V AC'], ['Finish', 'Matte white']] },
      { name: 'Safonix BLDC Ceiling Fan 1400 mm', short: 'A larger BLDC fan for big rooms.', description: ['Sample description. More air delivery with the same low power draw.', 'Replace this text with the real product description from Strapi.'], features: [['Larger sweep', 'Better for big rooms.'], ['Silent motor', 'Very quiet operation.'], common.safety], specs: [['Sweep', '1400 mm'], ['Power', '32 W'], ['Speed', '330 RPM'], ['Voltage', '230 V AC'], ['Finish', 'Matte white']] },
    ],
  },
};

export async function applyDemoProducts(strapi: Core.Strapi) {
  const products = strapi.documents('api::product.product');
  if (await products.findFirst({})) return;

  const categories = strapi.documents('api::category.category');
  const uploaded = new Map<string, number>();
  const upload = async (file: string) => {
    const cached = uploaded.get(file);
    if (cached) return cached;
    const filepath = path.join(strapi.dirs.app.root, 'data', 'images', 'products', file);
    const [asset] = await strapi.plugin('upload').service('upload').upload({
      data: { fileInfo: { name: file, alternativeText: file.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') } },
      files: { filepath, originalFilename: file, mimetype: 'image/png', size: fs.statSync(filepath).size },
    });
    uploaded.set(file, asset.id);
    return asset.id as number;
  };

  for (const [slug, group] of Object.entries(catalog)) {
    const category = await categories.findFirst({ filters: { slug } });
    if (!category) continue;
    const imageIds = await Promise.all(imageSets[group.images].map(upload));
    for (const item of group.items) {
      await products.create({
        data: {
          name: item.name,
          slug: item.name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
          sku: `SFX-${slug.slice(0, 3).toUpperCase()}-${String(Math.abs(item.name.length * 37 + item.name.charCodeAt(7))).padStart(4, '0')}`,
          badge: item.badge ?? null,
          featured: item.featured ?? false,
          shortDescription: item.short,
          description: item.description.join('\n\n'),
          features: item.features.map(([title, description]) => ({ title, description })),
          specifications: item.specs.map(([label, value]) => ({ label, value })),
          images: imageIds,
          category: category.documentId,
        } as never,
      });
    }
  }
}


/**
 * Fills the short "About this product" paragraph for products that have none yet (placeholder wording built from
 * each product's own name, group and description). Edit it per product in Strapi: Product → Brief.
 */
export async function applyProductBriefs(strapi: Core.Strapi) {
  const products = strapi.documents('api::product.product');
  const all = (await products.findMany({ populate: ['category'], limit: 300 })) as unknown as {
    documentId: string;
    name: string;
    brief?: string | null;
    description?: string | null;
    category?: { name?: string } | null;
  }[];
  for (const product of all) {
    if (product.brief) continue;
    const firstLine = (product.description ?? '').split(/\n+/)[0].replace(/^Sample description\.\s*/, '').trim();
    const group = product.category?.name ? ` ${product.category.name} range` : ' range';
    const brief = `${product.name} is part of the Safonix${group}.${firstLine ? ` ${firstLine}` : ''}`;
    await products.update({ documentId: product.documentId, data: { brief } as never });
  }
}

/**
 * Fills the "More About the Product" table for products that have none yet. The wording is PLACEHOLDER content built from
 * each product's own code, specifications and features plus generic lines (origin, suitability, manufacturer address).
 * Replace it per product in Strapi: Product → Details. Rows with "As list" switched on show one bullet per line.
 */
export async function applyProductDetails(strapi: Core.Strapi) {
  const NL = String.fromCharCode(10);
  const products = strapi.documents('api::product.product');
  const site = (await strapi.documents('api::site-setting.site-setting').findFirst({ populate: ['addresses'] })) as unknown as { siteName?: string; addresses?: { text: string }[] } | null;
  const address = site?.addresses?.[0]?.text;
  const all = (await products.findMany({ populate: ['category', 'category.parent', 'specifications', 'features', 'details'] as never, limit: 300 })) as unknown as {
    documentId: string;
    sku?: string | null;
    category?: { name?: string; slug?: string; parent?: { slug?: string } | null } | null;
    specifications?: { label: string; value: string }[];
    features?: { title: string; description?: string | null }[];
    details?: unknown[];
  }[];

  const suited = (slug: string) => {
    if (/led|light|downlight|tube|flood/.test(slug)) return 'Residence | Shops | Offices | Hotels | Outdoor areas';
    if (/fan|ventilation/.test(slug)) return 'Residence | Kitchens | Bathrooms | Shops | Offices';
    if (/wire|cable/.test(slug)) return 'Residence | Shops | Offices | Industrial wiring';
    if (/mcb|elcb|distribution|board/.test(slug)) return 'Residence | Offices | Commercial buildings | Industrial plants';
    return 'Residence | Shops | Offices | Hotels';
  };

  for (const product of all) {
    if ((product.details ?? []).length) continue;
    const topSlug = product.category?.parent?.slug ?? product.category?.slug ?? '';
    const rows: { label: string; value: string; asList?: boolean }[] = [];
    if (product.sku) rows.push({ label: 'Product Code', value: product.sku.replace(/-{2,}/g, '-') });
    if (product.category?.name) rows.push({ label: 'Product Range', value: product.category.name });
    const specs = (product.specifications ?? []).map((spec) => spec.label + ': ' + spec.value);
    if (specs.length) rows.push({ label: 'Technical Specifications', value: specs.join('. ') + '.' });
    const features = (product.features ?? []).map((feature) => (feature.description ? feature.title + ' - ' + feature.description : feature.title));
    if (features.length) rows.push({ label: 'Product Features', value: features.join(NL), asList: true });
    rows.push({ label: 'Country of Origin', value: 'India' });
    rows.push({ label: 'Brochure / Data', value: 'Available on request. Please contact our team.' });
    rows.push({ label: 'Warranty', value: 'As per Safonix warranty policy' });
    rows.push({ label: 'Best Suited For', value: suited(topSlug + ' ' + (product.category?.slug ?? '')) });
    if (address) rows.push({ label: 'Name & Address of Manufacturer', value: (site?.siteName ?? 'Safonix India') + ', ' + address });
    await products.update({ documentId: product.documentId, data: { details: rows } as never });
  }
}

/**
 * Turns the short placeholder "About this product" text into a fuller paragraph (placeholder wording built from each
 * product's own name, range, description, features and specifications). Only replaces briefs that still have the short
 * placeholder form, so anything written by hand in Strapi is kept. Edit per product: Product → Brief.
 */
export async function applyLongBriefs(strapi: Core.Strapi) {
  const products = strapi.documents('api::product.product');
  const all = (await products.findMany({ populate: ['category', 'category.parent', 'specifications', 'features'] as never, limit: 300 })) as unknown as {
    documentId: string;
    name: string;
    brief?: string | null;
    shortDescription?: string | null;
    category?: { name?: string; slug?: string; parent?: { slug?: string } | null } | null;
    specifications?: { label: string; value: string }[];
    features?: { title: string; description?: string | null }[];
  }[];

  const suited = (slug: string) => {
    if (/led|light|downlight|tube|flood/.test(slug)) return 'homes, shops, offices, hotels and outdoor areas';
    if (/fan|ventilation/.test(slug)) return 'homes, kitchens, bathrooms, shops and offices';
    if (/wire|cable/.test(slug)) return 'home wiring, shops, offices and industrial installations';
    if (/mcb|elcb|distribution|board/.test(slug)) return 'homes, offices, commercial buildings and industrial plants';
    return 'homes, shops, offices and hotels';
  };
  const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
  const sentence = (text: string) => (/[.!?]$/.test(text.trim()) ? text.trim() : text.trim() + '.');
  const list = (items: string[]) => (items.length < 2 ? items.join('') : items.slice(0, -1).join(', ') + ', and ' + items[items.length - 1]);

  for (const product of all) {
    const current = product.brief ?? '';
    const isShortPlaceholder = current.length < 260 && current.includes(' is part of the Safonix');
    if (current && !isShortPlaceholder) continue;
    const range = product.category?.name ?? 'electrical';
    const slug = (product.category?.parent?.slug ?? '') + ' ' + (product.category?.slug ?? '');
    const specs = (product.specifications ?? []).map((spec) => lower(spec.label) + ' of ' + spec.value);
    const features = (product.features ?? []).map((feature) => lower(feature.title));
    const parts = [
      product.name + ' is a product from the Safonix India ' + range + ' range, designed for use in ' + suited(slug) + '.',
      product.shortDescription ? sentence(product.shortDescription) : '',
      features.length ? 'It is built for everyday reliability, with ' + list(features) + '.' : '',
      specs.length ? 'Its key specifications include a ' + list(specs) + '.' : '',
      'It is made in India and sits alongside the rest of our range of wires and cables, LED lighting, fans, MCBs and distribution boards, and modular switches.',
      'Safonix India works to quality standards including ISI, ISO, BIS and BEE.',
      'For availability, pricing and bulk orders, please contact our team.',
    ].filter(Boolean);
    await products.update({ documentId: product.documentId, data: { brief: parts.join(' ') } as never });
  }
}
