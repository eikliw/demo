import React, { useMemo, useState } from 'react';
import { FlatList, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ALL_LEAGUES, CLUBS, LEAGUE_COLOR } from '../data/clubs';
import { League } from '../types';
import { Badge, Chip, SampleBanner } from '../components/ui';
import { C } from '../theme';

export function SoccerScreen({ onShowOnMap }: { onShowOnMap: (lat: number, lng: number) => void }) {
  const insets = useSafeAreaInsets();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [gender, setGender] = useState<'Any' | 'Boys' | 'Girls'>('Any');

  const data = useMemo(
    () =>
      CLUBS.filter((c) =>
        c.programs.some(
          (p) => (!leagues.length || leagues.includes(p.league)) && (gender === 'Any' || p.gender === gender),
        ),
      ),
    [leagues, gender],
  );
  const toggle = (l: League) => setLeagues((p) => (p.includes(l) ? p.filter((x) => x !== l) : [...p, l]));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 6 }}>
      <Text style={st.title}>Youth soccer</Text>
      <Text style={st.lead}>ECNL (ECNL · Regional League · Pre-ECNL) and MLS NEXT (Homegrown · Academy) clubs in Florida.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 12 }}>
        {ALL_LEAGUES.map((l) => (
          <Chip key={l} small label={l} color={LEAGUE_COLOR[l]} active={leagues.includes(l)} onPress={() => toggle(l)} />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', paddingHorizontal: 12 }}>
        {(['Any', 'Boys', 'Girls'] as const).map((g) => (
          <Chip key={g} small label={g} active={gender === g} onPress={() => setGender(g)} color={C.ink} />
        ))}
      </View>
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListHeaderComponent={
          <SampleBanner text="League memberships shift each season and rankings shown are sample values — verify on theecnl.com, mlssoccer.com/mlsnext and your preferred rankings site." />
        }
        renderItem={({ item: c }) => {
          const byLeague = new Map<League, string[]>();
          c.programs.forEach((p) => byLeague.set(p.league, [...(byLeague.get(p.league) ?? []), p.gender]));
          return (
            <View style={st.card}>
              <View style={st.row}>
                <View style={st.rank}>
                  <Text style={st.rankNum}>#{c.stateRank}</Text>
                  <Text style={st.rankLbl}>FL</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.name}>{c.name}</Text>
                  <Text style={st.sub}>{c.city}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={st.score}>{c.rankScore}</Text>
                  <Text style={st.sub}>rank score</Text>
                </View>
              </View>
              <View style={[st.bar]}>
                <View style={[st.barFill, { width: `${c.rankScore}%` }]} />
              </View>
              <View style={[st.row, { flexWrap: 'wrap', marginTop: 8 }]}>
                {[...byLeague.entries()].map(([lg, gs]) => (
                  <Badge key={lg} label={`${lg} · ${gs.join('/')}`} color={LEAGUE_COLOR[lg]} />
                ))}
              </View>
              <View style={[st.row, { marginTop: 6 }]}>
                <Pressable onPress={() => onShowOnMap(c.coord.latitude, c.coord.longitude)}>
                  <Text style={st.link}>Show on map</Text>
                </Pressable>
                <Pressable
                  style={{ marginLeft: 18 }}
                  onPress={() => Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(c.name + ' soccer ' + c.city + ' FL')}`)}
                >
                  <Text style={st.link}>Club info ↗</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '900', color: C.ink, paddingHorizontal: 12 },
  lead: { fontSize: 13, color: C.sub, paddingHorizontal: 12, marginBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rank: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  rankNum: { color: '#fff', fontWeight: '900', fontSize: 15 },
  rankLbl: { color: '#94a3b8', fontSize: 9, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '800', color: C.ink },
  sub: { fontSize: 12, color: C.sub },
  score: { fontSize: 20, fontWeight: '900', color: C.ink },
  bar: { height: 6, backgroundColor: C.line, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: C.sun, borderRadius: 3 },
  link: { color: C.brand, fontWeight: '700', fontSize: 13 },
});
