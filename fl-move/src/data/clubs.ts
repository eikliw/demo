import { Club, League } from '../types';

/**
 * Florida youth soccer clubs with ECNL (ECNL / ECNL Regional League / Pre-ECNL)
 * and MLS NEXT (Homegrown / Academy division) programs.
 *
 * ⚠️ Club league memberships change every season, and `rankScore` /
 * `stateRank` are SAMPLE numbers for the prototype. Verify memberships at
 * theecnl.com and mlssoccer.com/mlsnext, and wire rankings to a source you
 * trust (e.g. GotSport / Youth Soccer Rankings) before relying on them.
 */
const B = 'Boys' as const;
const G = 'Girls' as const;
const p = (league: League, ...genders: ('Boys' | 'Girls')[]) => genders.map((gender) => ({ league, gender }));

const RAW: Omit<Club, 'stateRank'>[] = [
  { id: 'ocsc', name: 'Orlando City SC Academy', city: 'Orlando', coord: { latitude: 28.541, longitude: -81.389 }, programs: [...p('MLS NEXT Homegrown', B)], rankScore: 95 },
  { id: 'intermiami', name: 'Inter Miami CF Academy', city: 'Fort Lauderdale', coord: { latitude: 26.193, longitude: -80.161 }, programs: [...p('MLS NEXT Homegrown', B)], rankScore: 96 },
  { id: 'img', name: 'IMG Academy', city: 'Bradenton', coord: { latitude: 27.441, longitude: -82.582 }, programs: [...p('MLS NEXT Academy', B)], rankScore: 92 },
  { id: 'weston', name: 'Weston FC', city: 'Weston', coord: { latitude: 26.1, longitude: -80.39 }, programs: [...p('MLS NEXT Academy', B), ...p('ECNL', G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', G)], rankScore: 90 },
  { id: 'chargers', name: 'Chargers SC', city: 'Clearwater', coord: { latitude: 27.98, longitude: -82.75 }, programs: [...p('MLS NEXT Academy', B), ...p('ECNL RL', G)], rankScore: 84 },
  { id: 'tbu', name: 'Tampa Bay United', city: 'Tampa', coord: { latitude: 28.06, longitude: -82.58 }, programs: [...p('ECNL', B, G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', B, G), ...p('MLS NEXT Academy', B)], rankScore: 89 },
  { id: 'kraze', name: 'Florida Kraze Krush', city: 'Winter Springs', coord: { latitude: 28.69, longitude: -81.27 }, programs: [...p('ECNL', B, G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', B, G)], rankScore: 88 },
  { id: 'fpfc', name: 'Florida Premier FC', city: 'Tampa / Lutz', coord: { latitude: 28.15, longitude: -82.46 }, programs: [...p('ECNL', B, G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', G)], rankScore: 86 },
  { id: 'jfc', name: 'Jacksonville FC', city: 'Jacksonville', coord: { latitude: 30.25, longitude: -81.55 }, programs: [...p('ECNL', B, G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', B, G), ...p('MLS NEXT Academy', B)], rankScore: 87 },
  { id: 'fwfc', name: 'Florida West FC', city: 'Fort Myers', coord: { latitude: 26.55, longitude: -81.85 }, programs: [...p('ECNL', G), ...p('ECNL RL', B, G)], rankScore: 80 },
  { id: 'fesa', name: 'Florida Elite Soccer Academy', city: 'Naples', coord: { latitude: 26.2, longitude: -81.77 }, programs: [...p('ECNL', G), ...p('ECNL RL', G), ...p('MLS NEXT Academy', B)], rankScore: 81 },
  { id: 'rush', name: 'Florida Rush', city: 'Clermont', coord: { latitude: 28.53, longitude: -81.73 }, programs: [...p('ECNL', B, G), ...p('ECNL RL', B, G), ...p('Pre-ECNL', B, G)], rankScore: 85 },
  { id: 'fu', name: 'Florida United', city: 'Boca Raton', coord: { latitude: 26.37, longitude: -80.13 }, programs: [...p('ECNL', G), ...p('ECNL RL', G), ...p('Pre-ECNL', G)], rankScore: 83 },
  { id: 'kendall', name: 'Kendall SC', city: 'Miami', coord: { latitude: 25.68, longitude: -80.36 }, programs: [...p('MLS NEXT Academy', B)], rankScore: 82 },
  { id: 'brevard', name: 'Space Coast United', city: 'Viera', coord: { latitude: 28.24, longitude: -80.73 }, programs: [...p('ECNL RL', G)], rankScore: 70 },
  { id: 'gulfcoast', name: 'Gulf Coast Texans', city: 'Pensacola', coord: { latitude: 30.47, longitude: -87.2 }, programs: [...p('ECNL', G), ...p('ECNL RL', B, G)], rankScore: 76 },
];

/** stateRank derived from rankScore order. */
export const CLUBS: Club[] = [...RAW]
  .sort((a, b) => b.rankScore - a.rankScore)
  .map((c, i) => ({ ...c, stateRank: i + 1 }));

export const ALL_LEAGUES: League[] = ['ECNL', 'ECNL RL', 'Pre-ECNL', 'MLS NEXT Homegrown', 'MLS NEXT Academy'];

export const LEAGUE_COLOR: Record<League, string> = {
  ECNL: '#1d4ed8',
  'ECNL RL': '#3b82f6',
  'Pre-ECNL': '#93c5fd',
  'MLS NEXT Homegrown': '#111827',
  'MLS NEXT Academy': '#6b21a8',
};

export const isMlsNext = (l: League) => l.startsWith('MLS NEXT');
