import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COUNTIES } from '../data/counties';
import { SCHOOLS } from '../data/schools';
import { SchoolLevel } from '../types';
import { Chip, GradeDot, SampleBanner } from '../components/ui';
import { C } from '../theme';

type Mode = 'counties' | SchoolLevel;

export function SchoolsScreen() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<Mode>('counties');
  const counties = useMemo(() => Object.values(COUNTIES).sort((a, b) => a.rank - b.rank), []);
  const schools = useMemo(
    () => (mode === 'counties' ? [] : SCHOOLS.filter((s) => s.level === mode).sort((a, b) => b.score - a.score)),
    [mode],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 6 }}>
      <Text style={st.title}>Schools</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginTop: 6 }}>
        {(['counties', 'Elementary', 'Middle', 'High'] as Mode[]).map((m) => (
          <Chip key={m} small label={m === 'counties' ? 'County rankings' : m} active={mode === m} onPress={() => setMode(m)} />
        ))}
      </View>
      {mode === 'counties' ? (
        <FlatList
          data={counties}
          keyExtractor={(c) => c.name}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListHeaderComponent={<SampleBanner text="District grades & ranks are sample values. Swap in the FLDOE annual school-grades release (fldoe.org) for real numbers." />}
          renderItem={({ item: c }) => (
            <View style={st.card}>
              <Text style={st.rank}>#{c.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{c.name} County</Text>
                <View style={st.bar}>
                  <View style={[st.barFill, { width: `${c.avgScore}%` }]} />
                </View>
              </View>
              <Text style={st.score}>{c.avgScore}</Text>
              <GradeDot grade={c.districtGrade} />
            </View>
          )}
        />
      ) : (
        <FlatList
          data={schools}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          ListHeaderComponent={<SampleBanner text="Schools here are generated placeholders around each hot spot. Replace src/data/schools.ts with FLDOE grades + NCES school locations." />}
          renderItem={({ item: s, index }) => (
            <View style={st.card}>
              <Text style={st.rank}>{index + 1}</Text>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{s.name}</Text>
                <Text style={st.sub}>{s.county} County</Text>
              </View>
              <Text style={st.score}>{s.score}</Text>
              <GradeDot grade={s.grade} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: C.ink, paddingHorizontal: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  rank: { width: 38, fontWeight: '900', color: C.sub, fontSize: 15 },
  name: { fontWeight: '800', color: C.ink, fontSize: 15 },
  sub: { fontSize: 12, color: C.sub },
  score: { fontWeight: '900', color: C.ink, fontSize: 16, marginHorizontal: 10 },
  bar: { height: 6, backgroundColor: C.line, borderRadius: 3, marginTop: 6, overflow: 'hidden', marginRight: 8 },
  barFill: { height: 6, backgroundColor: C.good, borderRadius: 3 },
});
