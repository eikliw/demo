import { LatLng, Region } from '../types';

export const DISNEY: LatLng = { latitude: 28.3852, longitude: -81.5639 }; // Walt Disney World (resort center)
export const UNIVERSAL: LatLng = { latitude: 28.4721, longitude: -81.469 }; // Universal Orlando Resort

/** Public beach access points around the state. */
export const BEACHES: { name: string; coord: LatLng }[] = [
  { name: 'Pensacola Beach', coord: { latitude: 30.333, longitude: -87.142 } },
  { name: 'Destin', coord: { latitude: 30.385, longitude: -86.495 } },
  { name: 'Panama City Beach', coord: { latitude: 30.176, longitude: -85.805 } },
  { name: 'Clearwater Beach', coord: { latitude: 27.978, longitude: -82.827 } },
  { name: 'St. Pete Beach', coord: { latitude: 27.725, longitude: -82.741 } },
  { name: 'Anna Maria Island', coord: { latitude: 27.531, longitude: -82.733 } },
  { name: 'Siesta Key', coord: { latitude: 27.267, longitude: -82.552 } },
  { name: 'Fort Myers Beach', coord: { latitude: 26.452, longitude: -81.95 } },
  { name: 'Naples Beach', coord: { latitude: 26.142, longitude: -81.808 } },
  { name: 'Jacksonville Beach', coord: { latitude: 30.288, longitude: -81.391 } },
  { name: 'St. Augustine Beach', coord: { latitude: 29.85, longitude: -81.265 } },
  { name: 'Daytona Beach', coord: { latitude: 29.227, longitude: -81.005 } },
  { name: 'New Smyrna Beach', coord: { latitude: 29.025, longitude: -80.917 } },
  { name: 'Cocoa Beach', coord: { latitude: 28.32, longitude: -80.607 } },
  { name: 'Melbourne Beach', coord: { latitude: 28.068, longitude: -80.56 } },
  { name: 'Vero Beach', coord: { latitude: 27.64, longitude: -80.373 } },
  { name: 'Jupiter Beach', coord: { latitude: 26.944, longitude: -80.072 } },
  { name: 'Palm Beach', coord: { latitude: 26.705, longitude: -80.034 } },
  { name: 'Delray Beach', coord: { latitude: 26.461, longitude: -80.06 } },
  { name: 'Fort Lauderdale Beach', coord: { latitude: 26.122, longitude: -80.103 } },
  { name: 'Hollywood Beach', coord: { latitude: 26.011, longitude: -80.117 } },
  { name: 'Miami Beach', coord: { latitude: 25.79, longitude: -80.13 } },
  { name: 'Key Biscayne', coord: { latitude: 25.693, longitude: -80.162 } },
];

/** "Hot spot" relocation regions shown on the map. */
export const REGIONS: Region[] = [
  { id: 'lakenona', name: 'Lake Nona', county: 'Orange', center: { latitude: 28.39, longitude: -81.26 }, blurb: 'Master-planned "medical city" with new schools and fast airport access.', vibe: ['New build', 'Family', 'Theme parks'] },
  { id: 'windermere', name: 'Windermere / Horizon West', county: 'Orange', center: { latitude: 28.47, longitude: -81.6 }, blurb: 'Lakes, top-rated schools, 15 minutes to Disney.', vibe: ['Lakes', 'Top schools', 'Theme parks'] },
  { id: 'lakemary', name: 'Lake Mary / Oviedo', county: 'Seminole', center: { latitude: 28.72, longitude: -81.27 }, blurb: 'Established suburbs with one of the strongest districts in the state.', vibe: ['Top schools', 'Suburban'] },
  { id: 'clermont', name: 'Clermont', county: 'Lake', center: { latitude: 28.55, longitude: -81.75 }, blurb: 'Rolling hills, newer homes, more space for the money.', vibe: ['Value', 'Outdoors'] },
  { id: 'kissimmee', name: 'Celebration / Kissimmee', county: 'Osceola', center: { latitude: 28.32, longitude: -81.54 }, blurb: 'Closest to Disney, wide price range.', vibe: ['Theme parks', 'Value'] },
  { id: 'wesley', name: 'Wesley Chapel', county: 'Pasco', center: { latitude: 28.24, longitude: -82.33 }, blurb: 'Fast-growing Tampa suburb with big youth-sports scene.', vibe: ['New build', 'Sports'] },
  { id: 'tampa', name: 'South Tampa / Westchase', county: 'Hillsborough', center: { latitude: 28.0, longitude: -82.55 }, blurb: 'Urban amenities, Bay access, strong club soccer.', vibe: ['Urban', 'Sports'] },
  { id: 'pinellas', name: 'St. Pete / Clearwater', county: 'Pinellas', center: { latitude: 27.9, longitude: -82.71 }, blurb: 'Gulf beaches and walkable downtowns; check flood zones carefully.', vibe: ['Beach', 'Walkable'] },
  { id: 'lwr', name: 'Lakewood Ranch / Sarasota', county: 'Manatee', center: { latitude: 27.41, longitude: -82.42 }, blurb: 'Top-selling master-planned community near Siesta Key.', vibe: ['Beach', 'New build', 'Top schools'] },
  { id: 'naples', name: 'Naples / Estero', county: 'Collier', center: { latitude: 26.25, longitude: -81.74 }, blurb: 'Upscale Gulf living, golf and beaches.', vibe: ['Beach', 'Luxury'] },
  { id: 'weston', name: 'Weston / Parkland', county: 'Broward', center: { latitude: 26.2, longitude: -80.33 }, blurb: 'South Florida family suburbs and elite youth soccer.', vibe: ['Top schools', 'Sports'] },
  { id: 'boca', name: 'Boca Raton', county: 'Palm Beach', center: { latitude: 26.37, longitude: -80.15 }, blurb: 'Beaches, A-rated schools, higher price point.', vibe: ['Beach', 'Luxury'] },
  { id: 'miami', name: 'Coral Gables / Kendall', county: 'Miami-Dade', center: { latitude: 25.68, longitude: -80.33 }, blurb: 'Big-city culture with MLS NEXT academy access.', vibe: ['Urban', 'Sports'] },
  { id: 'stjohns', name: 'St. Johns / Nocatee', county: 'St. Johns', center: { latitude: 30.1, longitude: -81.45 }, blurb: 'Frequently the #1 ranked school district in Florida.', vibe: ['Top schools', 'Beach', 'New build'] },
  { id: 'viera', name: 'Viera / Melbourne', county: 'Brevard', center: { latitude: 28.22, longitude: -80.72 }, blurb: 'Space Coast jobs, Atlantic beaches, ~1 hr to Orlando.', vibe: ['Beach', 'Value'] },
  { id: 'tally', name: 'Tallahassee', county: 'Leon', center: { latitude: 30.47, longitude: -84.25 }, blurb: 'Capital city, rolling hills, lower prices.', vibe: ['Value', 'College town'] },
  { id: 'navarre', name: 'Navarre / Santa Rosa', county: 'Santa Rosa', center: { latitude: 30.5, longitude: -86.97 }, blurb: 'Panhandle beaches and a highly rated district.', vibe: ['Beach', 'Top schools'] },
];

export const FLORIDA_REGION = {
  latitude: 27.9,
  longitude: -82.6,
  latitudeDelta: 7.5,
  longitudeDelta: 7.5,
};
