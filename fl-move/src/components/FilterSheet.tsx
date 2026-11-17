import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppState';
import { DEFAULT_FILTERS } from '../lib/enrich';
import { ALL_LEAGUES, LEAGUE_COLOR } from '../data/clubs';
import { Filters, League } from '../types';
import { C } from '../theme';
import { Chip } from './ui';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={st.h}>{title}</Text>
      {hint ? <Text style={st.hint}>{hint}</Text> : null}
      <View style={st.wrap}>{children}</View>
    </View>
  );
}

function Options<T>({
  options,
  value,
  onChange,
  label,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  label: (v: T) => string;
}) {
  return (
    <>
      {options.map((o) => (
        <Chip key={String(o)} label={label(o)} active={o === value} onPress={() => onChange(o)} />
      ))}
    </>
  );
}

const ANY = 999;
const miLabel = (v: number) => (v === ANY ? 'Any' : `≤ ${v} mi`);

export function FilterSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { filters, setFilters, filtered, all } = useApp();
  const insets = useSafeAreaInsets();
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setFilters({ ...filters, [k]: v });
  const toggleLeague = (l: League) =>
    set('clubLeagues', filters.clubLeagues.includes(l) ? filters.clubLeagues.filter((x) => x !== l) : [...filters.clubLeagues, l]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[st.root, { paddingTop: 12 }]}>
        <View style={st.header}>
          <Pressable onPress={() => setFilters(DEFAULT_FILTERS)}>
            <Text style={st.reset}>Reset</Text>
          </Pressable>
          <Text style={st.title}>Filters</Text>
          <Pressable onPress={onClose}>
            <Text style={st.done}>Done</Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Section title="Max price">
            <Options options={[400_000, 600_000, 800_000, 1_000_000, 1_500_000, 3_000_000]} value={filters.maxPrice} onChange={(v) => set('maxPrice', v)} label={(v) => (v >= 3_000_000 ? 'Any' : `$${v / 1000}K`)} />
          </Section>
          <Section title="Bedrooms">
            <Options options={[0, 2, 3, 4, 5]} value={filters.minBeds} onChange={(v) => set('minBeds', v)} label={(v) => (v ? `${v}+` : 'Any')} />
          </Section>
          <Section title="School zone" hint="Every zoned school (elem / middle / high) must meet this grade.">
            <Options options={['any', 'A', 'B', 'C'] as const as Filters['minSchoolGrade'][]} value={filters.minSchoolGrade} onChange={(v) => set('minSchoolGrade', v)} label={(v) => (v === 'any' ? 'Any' : v === 'A' ? 'A only' : `${v} or better`)} />
          </Section>
          <Section title="Average school score">
            <Options options={[0, 70, 80, 85, 90]} value={filters.minSchoolScore} onChange={(v) => set('minSchoolScore', v)} label={(v) => (v ? `${v}+` : 'Any')} />
          </Section>
          <Section title="FEMA flood zone" hint="High risk = Special Flood Hazard Area (A/AE/VE) — flood insurance usually required with a mortgage.">
            <Options options={['any', 'avoidHigh', 'minimalOnly'] as Filters['flood'][]} value={filters.flood} onChange={(v) => set('flood', v)} label={(v) => ({ any: 'Any', avoidHigh: 'Avoid high risk', minimalOnly: 'Minimal (Zone X) only' })[v]} />
          </Section>
          <Section title="Distance to beach">
            <Options options={[5, 10, 20, 40, ANY]} value={filters.maxBeachMi} onChange={(v) => set('maxBeachMi', v)} label={miLabel} />
          </Section>
          <Section title="Distance to Disney World">
            <Options options={[15, 30, 60, 100, ANY]} value={filters.maxDisneyMi} onChange={(v) => set('maxDisneyMi', v)} label={miLabel} />
          </Section>
          <Section title="Distance to Universal Orlando">
            <Options options={[15, 30, 60, 100, ANY]} value={filters.maxUniversalMi} onChange={(v) => set('maxUniversalMi', v)} label={miLabel} />
          </Section>
          <Section title="Soccer club nearby" hint="Show homes near at least one club in the selected league(s).">
            {ALL_LEAGUES.map((l) => (
              <Chip key={l} label={l} color={LEAGUE_COLOR[l]} active={filters.clubLeagues.includes(l)} onPress={() => toggleLeague(l)} />
            ))}
          </Section>
          {filters.clubLeagues.length ? (
            <>
              <Section title="Program">
                <Options options={['Any', 'Boys', 'Girls'] as Filters['clubGender'][]} value={filters.clubGender} onChange={(v) => set('clubGender', v)} label={(v) => v} />
              </Section>
              <Section title="Club within">
                <Options options={[10, 15, 25, 40]} value={filters.maxClubMi} onChange={(v) => set('maxClubMi', v)} label={(v) => `${v} mi`} />
              </Section>
            </>
          ) : null}
        </ScrollView>
        <View style={[st.footer, { paddingBottom: insets.bottom + 12 }]}>
          <Pressable style={st.cta} onPress={onClose}>
            <Text style={st.ctaText}>
              Show {filtered.length} of {all.length} homes
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: C.line },
  title: { fontSize: 17, fontWeight: '800', color: C.ink },
  reset: { color: C.sub, fontWeight: '600' },
  done: { color: C.brand, fontWeight: '800' },
  h: { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 4 },
  hint: { fontSize: 12, color: C.sub, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line },
  cta: { backgroundColor: C.brand, borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
