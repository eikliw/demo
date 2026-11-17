import { BEACHES, DISNEY, UNIVERSAL } from '../data/places';
import { SCHOOLS } from '../data/schools';
import { CLUBS } from '../data/clubs';
import { GRADE_RANK } from '../data/counties';
import { EnrichedListing, Filters, FloodInfo, Listing, School, SchoolLevel } from '../types';
import { miles, nearest } from './geo';

const LEVELS: SchoolLevel[] = ['Elementary', 'Middle', 'High'];
const FLOOD_SCORE = { minimal: 1, moderate: 0.6, high: 0.1, unknown: 0.6 } as const;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const PENDING_FLOOD: FloodInfo = { zone: '…', risk: 'unknown' };

export function enrich(l: Listing, flood: FloodInfo | undefined): EnrichedListing {
  const beach = nearest(l.coord, BEACHES, (b) => b.coord);
  const disneyMi = miles(l.coord, DISNEY);
  const universalMi = miles(l.coord, UNIVERSAL);

  // "Zoned" school ≈ nearest school of each level (swap in district attendance zones when available).
  const schools: EnrichedListing['schools'] = {};
  for (const level of LEVELS) {
    const pool = SCHOOLS.filter((s) => s.level === level);
    const n = nearest(l.coord, pool, (s) => s.coord);
    if (n.item && n.miles < 25) schools[level] = n.item;
  }
  const got = Object.values(schools) as School[];
  const schoolScore = got.length ? Math.round(got.reduce((a, s) => a + s.score, 0) / got.length) : 0;

  const clubsNearby = CLUBS.map((club) => ({ club, miles: miles(l.coord, club.coord) }))
    .filter((c) => c.miles <= 60)
    .sort((a, b) => a.miles - b.miles);

  const f = flood ?? PENDING_FLOOD;
  const soccer = clubsNearby.reduce(
    (best, c) => Math.max(best, (c.club.rankScore / 100) * clamp01(1 - c.miles / 45)),
    0,
  );
  const moveScore = Math.round(
    100 *
      (0.35 * clamp01((schoolScore - 50) / 50) +
        0.2 * FLOOD_SCORE[f.risk] +
        0.15 * clamp01(1 - beach.miles / 60) +
        0.1 * clamp01(1 - Math.min(disneyMi, universalMi) / 90) +
        0.2 * soccer),
  );

  return {
    ...l,
    beach: { name: beach.item.name, miles: beach.miles },
    disneyMi,
    universalMi,
    schools,
    schoolScore,
    clubsNearby,
    flood: f,
    moveScore,
  };
}

export function passes(l: EnrichedListing, f: Filters): boolean {
  if (l.price > f.maxPrice) return false;
  if (l.beds < f.minBeds) return false;
  if (l.schoolScore < f.minSchoolScore) return false;
  if (f.minSchoolGrade !== 'any') {
    const min = GRADE_RANK[f.minSchoolGrade];
    const all = Object.values(l.schools) as School[];
    if (!all.length || all.some((s) => GRADE_RANK[s.grade] < min)) return false;
  }
  if (f.flood === 'avoidHigh' && l.flood.risk === 'high') return false;
  if (f.flood === 'minimalOnly' && l.flood.risk !== 'minimal') return false;
  if (l.beach.miles > f.maxBeachMi) return false;
  if (l.disneyMi > f.maxDisneyMi) return false;
  if (l.universalMi > f.maxUniversalMi) return false;
  if (f.clubLeagues.length) {
    const ok = l.clubsNearby.some(
      (c) =>
        c.miles <= f.maxClubMi &&
        c.club.programs.some(
          (p) => f.clubLeagues.includes(p.league) && (f.clubGender === 'Any' || p.gender === f.clubGender),
        ),
    );
    if (!ok) return false;
  }
  return true;
}

export const DEFAULT_FILTERS: Filters = {
  maxPrice: 3_000_000,
  minBeds: 0,
  minSchoolScore: 0,
  minSchoolGrade: 'any',
  flood: 'any',
  maxBeachMi: 999,
  maxDisneyMi: 999,
  maxUniversalMi: 999,
  clubLeagues: [],
  clubGender: 'Any',
  maxClubMi: 25,
};
