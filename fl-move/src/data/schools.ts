import { School, SchoolLevel } from '../types';
import { REGIONS } from './places';
import { COUNTIES, gradeFromScore } from './counties';
import { seeded } from '../lib/rand';

/**
 * SAMPLE schools generated around each region so the prototype can show
 * "zoned" schools and grades. To go live, replace `SCHOOLS` with FLDOE
 * school-grade data joined to school locations (NCES EDGE public school
 * geocodes) and district attendance-zone polygons where available.
 */
const LEVELS: SchoolLevel[] = ['Elementary', 'Elementary', 'Elementary', 'Middle', 'Middle', 'High'];
const SUFFIX = ['North', 'South', 'East', 'West', 'Lakes', 'Ridge'];

function build(): School[] {
  const out: School[] = [];
  for (const r of REGIONS) {
    const rnd = seeded('school-' + r.id);
    const base = COUNTIES[r.county]?.avgScore ?? 75;
    const area = r.name.split(/[\/]/)[0].trim();
    LEVELS.forEach((level, i) => {
      const score = Math.max(45, Math.min(99, Math.round(base + (rnd() - 0.45) * 22)));
      out.push({
        id: `${r.id}-${i}`,
        name: `${area} ${SUFFIX[i]} ${level}`,
        level,
        county: r.county,
        coord: {
          latitude: r.center.latitude + (rnd() - 0.5) * 0.14,
          longitude: r.center.longitude + (rnd() - 0.5) * 0.14,
        },
        score,
        grade: gradeFromScore(score) as School['grade'],
      });
    });
  }
  return out;
}

export const SCHOOLS: School[] = build();
