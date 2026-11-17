export type LatLng = { latitude: number; longitude: number };

export type Region = {
  id: string;
  name: string;
  county: string;
  center: LatLng;
  blurb: string;
  vibe: string[];
};

export type SchoolLevel = 'Elementary' | 'Middle' | 'High';
export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type School = {
  id: string;
  name: string;
  level: SchoolLevel;
  county: string;
  coord: LatLng;
  grade: LetterGrade;
  /** 0-100 composite score (sample until wired to FLDOE data) */
  score: number;
};

export type County = {
  name: string;
  districtGrade: LetterGrade;
  /** statewide rank among 67 FL districts (sample) */
  rank: number;
  avgScore: number;
};

export type League =
  | 'ECNL'
  | 'ECNL RL'
  | 'Pre-ECNL'
  | 'MLS NEXT Homegrown'
  | 'MLS NEXT Academy';

export type Club = {
  id: string;
  name: string;
  city: string;
  coord: LatLng;
  /** leagues offered, with gender */
  programs: { league: League; gender: 'Boys' | 'Girls' }[];
  /** 0-100 sample ranking score */
  rankScore: number;
  /** statewide rank (sample) */
  stateRank: number;
};

export type FloodRisk = 'high' | 'moderate' | 'minimal' | 'unknown';

export type FloodInfo = {
  zone: string; // e.g. AE, VE, X, A
  subtype?: string;
  risk: FloodRisk;
};

export type Listing = {
  id: string;
  address: string;
  city: string;
  county: string;
  coord: LatLng;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  type: string;
  regionId?: string;
  source: 'sample' | 'rentcast';
  photo?: string;
};

export type EnrichedListing = Listing & {
  beach: { name: string; miles: number };
  disneyMi: number;
  universalMi: number;
  schools: { Elementary?: School; Middle?: School; High?: School };
  schoolScore: number;
  clubsNearby: { club: Club; miles: number }[];
  flood: FloodInfo;
  moveScore: number;
};

export type FloodFilter = 'any' | 'avoidHigh' | 'minimalOnly';

export type Filters = {
  maxPrice: number;
  minBeds: number;
  minSchoolScore: number;
  minSchoolGrade: LetterGrade | 'any';
  flood: FloodFilter;
  maxBeachMi: number;
  maxDisneyMi: number;
  maxUniversalMi: number;
  clubLeagues: League[];
  clubGender: 'Any' | 'Boys' | 'Girls';
  maxClubMi: number;
};

export type HeatMetric = 'move' | 'price' | 'schools' | 'flood' | 'soccer';
