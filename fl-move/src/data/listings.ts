import { Listing } from '../types';
import { REGIONS } from './places';
import { seeded } from '../lib/rand';

/** Typical single-family price level per region (sample, for generated listings). */
const BASE_PRICE: Record<string, number> = {
  lakenona: 640_000, windermere: 780_000, lakemary: 560_000, clermont: 470_000, kissimmee: 430_000,
  wesley: 460_000, tampa: 720_000, pinellas: 560_000, lwr: 690_000, naples: 980_000,
  weston: 890_000, boca: 920_000, miami: 860_000, stjohns: 650_000, viera: 450_000,
  tally: 330_000, navarre: 420_000,
};

const STREETS = ['Palm', 'Heron', 'Cypress', 'Magnolia', 'Osprey', 'Sabal', 'Pelican', 'Live Oak', 'Seagrape', 'Egret', 'Mangrove', 'Citrus'];
const SUFFIX = ['Dr', 'Ln', 'Ct', 'Way', 'Blvd', 'Cir', 'Trl'];
const TYPES = ['Single Family', 'Single Family', 'Single Family', 'Townhouse', 'Condo'];

/** Deterministic SAMPLE listings around each region (used when no RentCast key is set). */
export function sampleListings(perRegion = 12): Listing[] {
  const out: Listing[] = [];
  for (const r of REGIONS) {
    const rnd = seeded('listing-' + r.id);
    const base = BASE_PRICE[r.id] ?? 500_000;
    for (let i = 0; i < perRegion; i++) {
      const type = TYPES[Math.floor(rnd() * TYPES.length)];
      const beds = type === 'Condo' ? 1 + Math.floor(rnd() * 3) : 3 + Math.floor(rnd() * 3);
      const baths = Math.max(1, beds - 1 + (rnd() > 0.5 ? 0.5 : 0) + (rnd() > 0.7 ? 1 : 0));
      const sqft = Math.round((beds * 520 + rnd() * 900) / 10) * 10;
      const price = Math.round((base * (0.55 + rnd() * 0.95) * (sqft / 2200)) / 5000) * 5000;
      const num = 100 + Math.floor(rnd() * 9800);
      out.push({
        id: `${r.id}-${i}`,
        address: `${num} ${STREETS[Math.floor(rnd() * STREETS.length)]} ${SUFFIX[Math.floor(rnd() * SUFFIX.length)]}`,
        city: r.name.split('/')[0].trim(),
        county: r.county,
        coord: {
          latitude: r.center.latitude + (rnd() - 0.5) * 0.16,
          longitude: r.center.longitude + (rnd() - 0.5) * 0.16,
        },
        price: Math.max(180_000, price),
        beds,
        baths,
        sqft,
        type,
        regionId: r.id,
        source: 'sample',
      });
    }
  }
  return out;
}
