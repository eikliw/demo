import React from 'react';
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { EnrichedListing, School } from '../types';
import { COUNTIES } from '../data/counties';
import { LEAGUE_COLOR } from '../data/clubs';
import { FLOOD_COLOR, FLOOD_LABEL } from '../lib/flood';
import { fmtDrive, fmtMi, fmtPrice } from '../lib/geo';
import { C } from '../theme';
import { Badge, GradeDot, SampleBanner, Stat } from './ui';

export function ListingDetail({
  listing,
  onClose,
  onShowOnMap,
}: {
  listing?: EnrichedListing;
  onClose: () => void;
  onShowOnMap?: () => void;
}) {
  const l = listing;
  const county = l ? COUNTIES[l.county] : undefined;
  return (
    <Modal visible={!!l} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      {l ? (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={st.header}>
            <Pressable onPress={onClose}>
              <Text style={st.close}>Close</Text>
            </Pressable>
            {onShowOnMap ? (
              <Pressable onPress={onShowOnMap}>
                <Text style={st.link}>Show on map</Text>
              </Pressable>
            ) : null}
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
            {l.source === 'sample' ? <SampleBanner text="Sample listing for demo purposes. Add a RentCast API key to load live listings." /> : null}
            <Text style={st.price}>{fmtPrice(l.price)}</Text>
            <Text style={st.addr}>{l.address}</Text>
            <Text style={st.sub}>
              {l.city}, FL · {l.county} County · {l.type}
            </Text>
            <View style={[st.card, st.row]}>
              <Stat label="Beds" value={String(l.beds)} />
              <Stat label="Baths" value={String(l.baths)} />
              <Stat label="Sq ft" value={l.sqft ? l.sqft.toLocaleString() : '—'} />
              <Stat label="Move score" value={String(l.moveScore)} />
            </View>

            <Text style={st.h}>Flood zone (FEMA NFHL)</Text>
            <View style={[st.card, st.row]}>
              <View style={[st.floodDot, { backgroundColor: FLOOD_COLOR[l.flood.risk] }]} />
              <View style={{ flex: 1 }}>
                <Text style={st.strong}>
                  {l.flood.zone === '…' ? 'Checking FEMA…' : `Zone ${l.flood.zone} — ${FLOOD_LABEL[l.flood.risk]}`}
                </Text>
                {l.flood.subtype ? <Text style={st.sub}>{l.flood.subtype}</Text> : null}
              </View>
            </View>

            <Text style={st.h}>Getting around</Text>
            <View style={[st.card, st.row]}>
              <Stat label={l.beach.name} value={fmtMi(l.beach.miles)} sub={fmtDrive(l.beach.miles)} />
              <Stat label="Disney World" value={fmtMi(l.disneyMi)} sub={fmtDrive(l.disneyMi)} />
              <Stat label="Universal" value={fmtMi(l.universalMi)} sub={fmtDrive(l.universalMi)} />
            </View>

            <Text style={st.h}>Zoned schools</Text>
            <View style={st.card}>
              {(['Elementary', 'Middle', 'High'] as const).map((lvl) => {
                const s = l.schools[lvl] as School | undefined;
                return (
                  <View key={lvl} style={[st.row, { paddingVertical: 6 }]}>
                    {s ? <GradeDot grade={s.grade} /> : null}
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={st.strong}>{s?.name ?? `No ${lvl.toLowerCase()} school found`}</Text>
                      <Text style={st.sub}>{lvl}</Text>
                    </View>
                    {s ? <Text style={st.score}>{s.score}</Text> : null}
                  </View>
                );
              })}
              {county ? (
                <Text style={[st.sub, { marginTop: 6 }]}>
                  {county.name} County district: grade {county.districtGrade} · ranked #{county.rank} of 67
                </Text>
              ) : null}
            </View>

            <Text style={st.h}>Soccer clubs nearby</Text>
            <View style={st.card}>
              {l.clubsNearby.slice(0, 5).map(({ club, miles }) => (
                <View key={club.id} style={{ paddingVertical: 6 }}>
                  <View style={st.row}>
                    <Text style={[st.strong, { flex: 1 }]}>⚽ {club.name}</Text>
                    <Text style={st.sub}>{fmtMi(miles)}</Text>
                  </View>
                  <View style={[st.row, { flexWrap: 'wrap', marginTop: 4 }]}>
                    {[...new Set(club.programs.map((p) => p.league))].map((lg) => (
                      <Badge key={lg} label={lg} color={LEAGUE_COLOR[lg]} />
                    ))}
                  </View>
                </View>
              ))}
              {!l.clubsNearby.length ? <Text style={st.sub}>No ECNL / MLS NEXT clubs within 60 mi.</Text> : null}
            </View>

            <Pressable
              style={st.cta}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/search?q=${encodeURIComponent(`${l.address} ${l.city} FL for sale`)}`,
                )
              }
            >
              <Text style={st.ctaText}>Search this address online</Text>
            </Pressable>
          </ScrollView>
        </View>
      ) : null}
    </Modal>
  );
}

const st = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: C.line },
  close: { color: C.sub, fontWeight: '700' },
  link: { color: C.brand, fontWeight: '800' },
  price: { fontSize: 30, fontWeight: '900', color: C.ink },
  addr: { fontSize: 17, fontWeight: '700', color: C.ink, marginTop: 2 },
  sub: { fontSize: 12, color: C.sub },
  h: { fontSize: 15, fontWeight: '800', color: C.ink, marginTop: 18, marginBottom: 8 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center' },
  strong: { fontWeight: '700', color: C.ink },
  score: { fontWeight: '800', color: C.ink, fontSize: 16 },
  floodDot: { width: 14, height: 14, borderRadius: 7, marginRight: 10 },
  cta: { marginTop: 20, backgroundColor: C.ink, padding: 14, borderRadius: 14, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '800' },
});
