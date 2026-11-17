import { FloodInfo, FloodRisk, LatLng } from '../types';

/**
 * FEMA National Flood Hazard Layer (NFHL) — free, public, no key required.
 * Layer 28 = "Flood Hazard Zones".
 * Docs: https://hazards.fema.gov/femaportal/wps/portal/NFHLWMS
 */
const NFHL_REST = 'https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query';

/** WMS tile template for react-native-maps <WMSTile>. */
export const NFHL_WMS_TEMPLATE =
  'https://hazards.fema.gov/arcgis/services/public/NFHL/MapServer/WMSServer' +
  '?service=WMS&version=1.1.1&request=GetMap&layers=28&styles=&format=image/png&transparent=true' +
  '&srs=EPSG:3857&width={width}&height={height}&bbox={minX},{minY},{maxX},{maxY}';

export function riskForZone(zone: string, subtype?: string): FloodRisk {
  const z = zone.toUpperCase();
  if (z.startsWith('V') || z.startsWith('A')) return 'high'; // Special Flood Hazard Area
  if (z === 'X' && subtype && /0\.2 PCT|500|SHADED|LEVEE/i.test(subtype)) return 'moderate';
  if (z === 'B') return 'moderate';
  if (z === 'X' || z === 'C') return 'minimal';
  if (z === 'D') return 'unknown';
  return 'unknown';
}

export const FLOOD_LABEL: Record<FloodRisk, string> = {
  high: 'High risk (SFHA)',
  moderate: 'Moderate',
  minimal: 'Minimal',
  unknown: 'Unknown',
};

export const FLOOD_COLOR: Record<FloodRisk, string> = {
  high: '#dc2626',
  moderate: '#f59e0b',
  minimal: '#16a34a',
  unknown: '#9ca3af',
};

const cache = new Map<string, FloodInfo>();
const key = (c: LatLng) => `${c.latitude.toFixed(5)},${c.longitude.toFixed(5)}`;

export async function lookupFlood(c: LatLng, signal?: AbortSignal): Promise<FloodInfo> {
  const k = key(c);
  const hit = cache.get(k);
  if (hit) return hit;
  const url =
    `${NFHL_REST}?geometry=${c.longitude},${c.latitude}` +
    '&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects' +
    '&outFields=FLD_ZONE,ZONE_SUBTY,SFHA_TF&returnGeometry=false&f=json';
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`FEMA ${res.status}`);
  const json = await res.json();
  const attrs = json?.features?.[0]?.attributes;
  // No polygon at the point: outside mapped hazard areas → treat as minimal (Zone X).
  const info: FloodInfo = attrs
    ? { zone: attrs.FLD_ZONE, subtype: attrs.ZONE_SUBTY ?? undefined, risk: riskForZone(attrs.FLD_ZONE, attrs.ZONE_SUBTY) }
    : { zone: 'X', risk: 'minimal' };
  cache.set(k, info);
  return info;
}

/** Run lookups with limited concurrency, reporting each result as it lands. */
export async function lookupMany(
  items: { id: string; coord: LatLng }[],
  onResult: (id: string, info: FloodInfo) => void,
  concurrency = 4,
  signal?: AbortSignal,
) {
  let i = 0;
  const worker = async () => {
    while (i < items.length && !signal?.aborted) {
      const it = items[i++];
      try {
        onResult(it.id, await lookupFlood(it.coord, signal));
      } catch {
        if (!signal?.aborted) onResult(it.id, { zone: '?', risk: 'unknown' });
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
}
