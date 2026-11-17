import { County } from '../types';

/**
 * County school-district grades and statewide rank.
 *
 * SAMPLE VALUES for the prototype. Replace with the latest Florida Department of
 * Education district grades (https://www.fldoe.org/accountability/accountability-reporting/school-grades/)
 * — the FLDOE publishes a downloadable spreadsheet every summer.
 */
export const COUNTIES: Record<string, County> = {
  'St. Johns': { name: 'St. Johns', districtGrade: 'A', rank: 1, avgScore: 94 },
  'Seminole': { name: 'Seminole', districtGrade: 'A', rank: 3, avgScore: 90 },
  'Santa Rosa': { name: 'Santa Rosa', districtGrade: 'A', rank: 4, avgScore: 89 },
  'Sarasota': { name: 'Sarasota', districtGrade: 'A', rank: 2, avgScore: 91 },
  'Collier': { name: 'Collier', districtGrade: 'A', rank: 8, avgScore: 85 },
  'Manatee': { name: 'Manatee', districtGrade: 'B', rank: 18, avgScore: 79 },
  'Brevard': { name: 'Brevard', districtGrade: 'A', rank: 10, avgScore: 84 },
  'Palm Beach': { name: 'Palm Beach', districtGrade: 'A', rank: 12, avgScore: 82 },
  'Broward': { name: 'Broward', districtGrade: 'B', rank: 22, avgScore: 77 },
  'Miami-Dade': { name: 'Miami-Dade', districtGrade: 'A', rank: 14, avgScore: 81 },
  'Orange': { name: 'Orange', districtGrade: 'B', rank: 20, avgScore: 78 },
  'Osceola': { name: 'Osceola', districtGrade: 'B', rank: 38, avgScore: 70 },
  'Lake': { name: 'Lake', districtGrade: 'B', rank: 30, avgScore: 73 },
  'Pasco': { name: 'Pasco', districtGrade: 'B', rank: 26, avgScore: 75 },
  'Hillsborough': { name: 'Hillsborough', districtGrade: 'B', rank: 28, avgScore: 74 },
  'Pinellas': { name: 'Pinellas', districtGrade: 'B', rank: 19, avgScore: 78 },
  'Leon': { name: 'Leon', districtGrade: 'B', rank: 24, avgScore: 76 },
};

export const gradeFromScore = (s: number) =>
  s >= 85 ? 'A' : s >= 72 ? 'B' : s >= 60 ? 'C' : s >= 50 ? 'D' : 'F';

export const GRADE_RANK: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, F: 1 };
