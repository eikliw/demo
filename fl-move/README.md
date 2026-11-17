# Move to Florida (Expo Go)

A relocation explorer for Florida: homes on a map, filtered by school zone, FEMA flood zone,
distance to the beach / Disney World / Universal Orlando, and proximity to ECNL and MLS NEXT
youth soccer clubs. Hot spots pulse and an info card animates in as you drag the map over them,
and a heat-map layer shades the state by move score, price/sq ft, school scores, flood risk or
elite-soccer access.

## Run it

```bash
cd fl-move
npm install
npx expo start        # scan the QR code with Expo Go (SDK 58)
```

## Tabs

| Tab | What it shows |
| --- | --- |
| **Map** | Pulsing hot-spot regions (drag the crosshair over one → animated region card), heat map with 5 metrics, FEMA flood overlay (zoom into a city), clubs ⚽, schools (letter grades), Disney 🏰 / Universal 🌐, price pins outlined by flood risk |
| **Homes** | Filtered listings sorted by match score, price, schools, beach or theme-park distance |
| **Soccer** | ECNL / ECNL RL / Pre-ECNL and MLS NEXT Homegrown / Academy clubs, boys/girls, with state rank |
| **Schools** | County district rankings and school lists by level with grades/scores |

## Data sources

| Data | Status | Where to change it |
| --- | --- | --- |
| Flood zones | **Live**: FEMA National Flood Hazard Layer (point query and WMS tiles, no key) | `src/lib/flood.ts` |
| Beach / Disney / Universal distances | Live math (straight-line, drive time estimated) | `src/data/places.ts`, `src/lib/geo.ts` |
| Listings | **Sample** by default. Live via RentCast if `EXPO_PUBLIC_RENTCAST_API_KEY` is set in `.env.local` | `src/lib/rentcast.ts`, `src/data/listings.ts` |
| Schools & county rankings | **Sample/placeholder**. Replace with FLDOE school grades + NCES school locations | `src/data/schools.ts`, `src/data/counties.ts` |
| Soccer clubs | Real club names, but league memberships and rankings need verifying each season | `src/data/clubs.ts` |

"Zoned school" is approximated as the nearest school of each level. Real attendance zones are
published per district as GIS polygons and can replace that lookup in `src/lib/enrich.ts`.
