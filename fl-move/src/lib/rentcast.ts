import { Listing } from '../types';

/**
 * Optional live listings via RentCast (https://www.rentcast.io/api — has a free tier).
 * Put your key in fl-move/.env.local (git-ignored) as:  EXPO_PUBLIC_RENTCAST_API_KEY=xxxx
 * Note: EXPO_PUBLIC_ vars are bundled into the app, so use a key with a low quota
 * or proxy the call through your own server before shipping publicly.
 */
export const RENTCAST_KEY = process.env.EXPO_PUBLIC_RENTCAST_API_KEY;

const CITIES = [
  'Orlando', 'Windermere', 'Lake Mary', 'Clermont', 'Kissimmee', 'Wesley Chapel', 'Tampa',
  'St. Petersburg', 'Sarasota', 'Naples', 'Weston', 'Boca Raton', 'Coral Gables',
  'St. Augustine', 'Melbourne', 'Tallahassee', 'Navarre',
];

type RCListing = {
  id: string;
  formattedAddress?: string;
  addressLine1?: string;
  city?: string;
  county?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  propertyType?: string;
};

export async function fetchRentcastListings(perCity = 15): Promise<Listing[]> {
  if (!RENTCAST_KEY) return [];
  const results = await Promise.allSettled(
    CITIES.map(async (city) => {
      const url =
        `https://api.rentcast.io/v1/listings/sale?city=${encodeURIComponent(city)}` +
        `&state=FL&status=Active&limit=${perCity}`;
      const res = await fetch(url, { headers: { Accept: 'application/json', 'X-Api-Key': RENTCAST_KEY! } });
      if (!res.ok) throw new Error(`RentCast ${res.status}`);
      return (await res.json()) as RCListing[];
    }),
  );
  const out: Listing[] = [];
  for (const r of results) {
    if (r.status !== 'fulfilled') continue;
    for (const l of r.value) {
      if (l.latitude == null || l.longitude == null || !l.price) continue;
      out.push({
        id: 'rc-' + l.id,
        address: l.addressLine1 ?? l.formattedAddress ?? 'Address unavailable',
        city: l.city ?? '',
        county: (l.county ?? '').replace(/ County$/, ''),
        coord: { latitude: l.latitude, longitude: l.longitude },
        price: l.price,
        beds: l.bedrooms ?? 0,
        baths: l.bathrooms ?? 0,
        sqft: l.squareFootage ?? 0,
        type: l.propertyType ?? 'Home',
        source: 'rentcast',
      });
    }
  }
  return out;
}
