import { LatLng } from '../types';

const R_MI = 3958.8;
const rad = (d: number) => (d * Math.PI) / 180;

export function miles(a: LatLng, b: LatLng): number {
  const dLat = rad(b.latitude - a.latitude);
  const dLng = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * R_MI * Math.asin(Math.sqrt(h));
}

/** Rough drive time: straight-line miles × 1.3 road factor at ~40 mph. */
export const driveMinutes = (mi: number) => Math.round(((mi * 1.3) / 40) * 60);

export function nearest<T>(from: LatLng, items: T[], coord: (t: T) => LatLng) {
  let best: T | undefined;
  let bestMi = Infinity;
  for (const it of items) {
    const d = miles(from, coord(it));
    if (d < bestMi) {
      bestMi = d;
      best = it;
    }
  }
  return { item: best as T, miles: bestMi };
}

export const fmtMi = (mi: number) => (mi < 10 ? mi.toFixed(1) : Math.round(mi).toString()) + ' mi';
export const fmtDrive = (mi: number) => {
  const m = driveMinutes(mi);
  return m < 60 ? `~${m} min` : `~${Math.floor(m / 60)}h ${m % 60}m`;
};
export const fmtPrice = (p: number) =>
  p >= 1_000_000 ? `$${(p / 1_000_000).toFixed(2)}M` : `$${Math.round(p / 1000)}K`;
