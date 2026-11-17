import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppState';
import { FLOOD_COLOR, FLOOD_LABEL } from '../lib/flood';
import { fmtMi, fmtPrice } from '../lib/geo';
import { EnrichedListing } from '../types';
import { Badge, Chip, GradeDot, SampleBanner } from '../components/ui';
import { C } from '../theme';

type Sort = 'move' | 'priceAsc' | 'schools' | 'beach' | 'parks';
const SORTS: { k: Sort; label: string; fn: (a: EnrichedListing, b: EnrichedListing) => number }[] = [
  { k: 'move', label: 'Best match', fn: (a, b) => b.moveScore - a.moveScore },
  { k: 'priceAsc', label: 'Price ↑', fn: (a, b) => a.price - b.price },
  { k: 'schools', label: 'Schools', fn: (a, b) => b.schoolScore - a.schoolScore },
  { k: 'beach', label: 'Beach', fn: (a, b) => a.beach.miles - b.beach.miles },
  { k: 'parks', label: 'Theme parks', fn: (a, b) => Math.min(a.disneyMi, a.universalMi) - Math.min(b.disneyMi, b.universalMi) },
];

export function ListingsScreen({ onOpenFilters, onOpenListing }: { onOpenFilters: () => void; onOpenListing: (id: string) => void }) {
  const insets = useSafeAreaInsets();
  const { filtered, activeFilterCount, source } = useApp();
  const [sort, setSort] = useState<Sort>('move');
  const data = useMemo(() => [...filtered].sort(SORTS.find((s) => s.k === sort)!.fn), [filtered, sort]);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 6 }}>
      <View style={st.head}>
        <Text style={st.title}>{filtered.length} homes</Text>
        <Pressable style={st.filterBtn} onPress={onOpenFilters}>
          <Text style={st.filterText}>Filters{activeFilterCount ? ` · ${activeFilterCount}` : ''}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, paddingHorizontal: 12 }}>
        {SORTS.map((s) => (
          <Chip key={s.k} small label={s.label} active={sort === s.k} onPress={() => setSort(s.k)} />
        ))}
      </ScrollView>
      <FlatList
        data={data}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListHeaderComponent={
          source === 'sample' ? <SampleBanner text="Showing generated sample listings. Set EXPO_PUBLIC_RENTCAST_API_KEY for live MLS-style listings. Flood zones are live from FEMA." /> : undefined
        }
        ListEmptyComponent={<Text style={{ color: C.sub, textAlign: 'center', marginTop: 40 }}>No homes match — loosen a filter.</Text>}
        renderItem={({ item: l }) => (
          <Pressable style={st.card} onPress={() => onOpenListing(l.id)}>
            <View style={st.row}>
              <View style={{ flex: 1 }}>
                <Text style={st.price}>{fmtPrice(l.price)}</Text>
                <Text style={st.addr}>{l.address}</Text>
                <Text style={st.sub}>
                  {l.city} · {l.county} Co. · {l.beds} bd · {l.baths} ba · {l.sqft.toLocaleString()} sf
                </Text>
              </View>
              <View style={st.score}>
                <Text style={st.scoreNum}>{l.moveScore}</Text>
                <Text style={st.scoreLbl}>match</Text>
              </View>
            </View>
            <View style={[st.row, { marginTop: 10, flexWrap: 'wrap' }]}>
              <Badge label={l.flood.zone === '…' ? 'Flood: checking…' : `Flood ${l.flood.zone} · ${FLOOD_LABEL[l.flood.risk]}`} color={FLOOD_COLOR[l.flood.risk]} />
              <Badge label={`🏖 ${fmtMi(l.beach.miles)}`} color="#0891b2" />
              <Badge label={`🏰 ${fmtMi(l.disneyMi)}`} color="#7c3aed" />
              <Badge label={`🌐 ${fmtMi(l.universalMi)}`} color="#1d4ed8" />
            </View>
            <View style={[st.row, { marginTop: 6 }]}>
              {(['Elementary', 'Middle', 'High'] as const).map((lvl) =>
                l.schools[lvl] ? (
                  <View key={lvl} style={[st.row, { marginRight: 12 }]}>
                    <GradeDot grade={l.schools[lvl]!.grade} size={20} />
                    <Text style={[st.sub, { marginLeft: 4 }]}>{lvl[0]}</Text>
                  </View>
                ) : null,
              )}
              {l.clubsNearby[0] ? (
                <Text style={[st.sub, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                  ⚽ {l.clubsNearby[0].club.name} · {fmtMi(l.clubsNearby[0].miles)}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '900', color: C.ink },
  filterBtn: { backgroundColor: C.brand, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  filterText: { color: '#fff', fontWeight: '800' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: '900', color: C.ink },
  addr: { fontSize: 14, fontWeight: '600', color: C.ink },
  sub: { fontSize: 12, color: C.sub },
  score: { width: 54, height: 54, borderRadius: 27, backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: 18, fontWeight: '900', color: C.brand },
  scoreLbl: { fontSize: 9, color: C.brand, fontWeight: '700' },
});
