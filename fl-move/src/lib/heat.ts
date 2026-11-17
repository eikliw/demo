import { CLUBS } from '../data/clubs';
import { SCHOOLS } from '../data/schools';
import { EnrichedListing, HeatMetric, LatLng } from '../types';
import { miles } from './geo';

export type MapRegion = { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number };
export type HeatCell = { key: string; coord: LatLng; value: number; alpha: number; radiusM: number };

export const HEAT_META: Record<HeatMetric, { label: string; low: string; high: string }> = {
  move: { label: 'Move score', low: 'Lower', high: 'Best fit' },
  price: { label: 'Price / sq ft', low: 'Cheaper', high: 'Pricier' },
  schools: { label: 'School scores', low: 'Lower', high: 'Higher' },
  flood: { label: 'Flood risk', low: 'Minimal', high: 'High' },
  soccer: { label: 'Elite soccer access', low: 'Few clubs', high: 'Many top clubs' },
};

type Pt = { c: LatLng; v: number };

function points(metric: HeatMetric, listings: EnrichedListing[]): Pt[] {
  switch (metric) {
    case 'move':
      return listings.map((l) => ({ c: l.coord, v: l.moveScore / 100 }));
    case 'price':
      return listings
        .filter((l) => l.sqft > 0)
        .map((l) => ({ c: l.coord, v: Math.min(1, Math.max(0, (l.price / l.sqft - 150) / 450)) }));
    case 'schools':
      return SCHOOLS.map((s) => ({ c: s.coord, v: (s.score - 50) / 50 }));
    case 'flood':
      return listings
        .filter((l) => l.flood.risk !== 'unknown')
        .map((l) => ({ c: l.coord, v: l.flood.risk === 'high' ? 1 : l.flood.risk === 'moderate' ? 0.5 : 0 }));
    case 'soccer':
      return CLUBS.map((c) => ({ c: c.coord, v: (c.rankScore / 100) * (0.6 + c.programs.length * 0.05) }));
  }
}

/** Grid over the visible map, inverse-distance-weighted (or kernel density for soccer). */
export function computeHeat(metric: HeatMetric, region: MapRegion, listings: EnrichedListing[]): HeatCell[] {
  const pts = points(metric, listings);
  if (!pts.length) return [];
  const nx = 12;
  const ny = 18;
  const dLng = region.longitudeDelta / nx;
  const dLat = region.latitudeDelta / ny;
  const cellMi = Math.max(dLat * 69, 0.5);
  const reach = Math.max(cellMi * 2.5, 6); // miles of influence
  const cells: HeatCell[] = [];
  const lat0 = region.latitude - region.latitudeDelta / 2;
  const lng0 = region.longitude - region.longitudeDelta / 2;

  for (let i = 0; i <= nx; i++) {
    for (let j = 0; j <= ny; j++) {
      const c = { latitude: lat0 + j * dLat, longitude: lng0 + i * dLng };
      let wSum = 0;
      let vSum = 0;
      let closest = Infinity;
      for (const p of pts) {
        // cheap bounding pre-check before haversine
        if (Math.abs(p.c.latitude - c.latitude) * 69 > reach) continue;
        const d = miles(c, p.c);
        if (d > reach) continue;
        closest = Math.min(closest, d);
        if (metric === 'soccer') {
          vSum += p.v * (1 - d / reach);
        } else {
          const w = 1 / Math.max(d, 0.3) ** 2;
          wSum += w;
          vSum += w * p.v;
        }
      }
      if (closest === Infinity) continue;
      const value = metric === 'soccer' ? Math.min(1, vSum / 1.4) : vSum / wSum;
      const alpha = 0.18 + 0.32 * (1 - closest / reach);
      cells.push({
        key: `${i}-${j}`,
        coord: c,
        value: Math.max(0, Math.min(1, value)),
        alpha,
        radiusM: cellMi * 1609 * 0.85,
      });
    }
  }
  return cells;
}

const STOPS: [number, [number, number, number]][] = [
  [0, [37, 99, 235]],
  [0.35, [16, 185, 129]],
  [0.6, [250, 204, 21]],
  [0.8, [249, 115, 22]],
  [1, [220, 38, 38]],
];

export function heatColor(v: number, alpha: number) {
  for (let k = 1; k < STOPS.length; k++) {
    const [p1, c1] = STOPS[k];
    const [p0, c0] = STOPS[k - 1];
    if (v <= p1) {
      const t = (v - p0) / (p1 - p0);
      const m = (a: number, b: number) => Math.round(a + (b - a) * t);
      return `rgba(${m(c0[0], c1[0])},${m(c0[1], c1[1])},${m(c0[2], c1[2])},${alpha.toFixed(2)})`;
    }
  }
  return `rgba(220,38,38,${alpha})`;
}

export const HEAT_GRADIENT = STOPS.map(([, c]) => `rgb(${c.join(',')})`);
