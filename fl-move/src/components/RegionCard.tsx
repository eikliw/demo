import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { Region, EnrichedListing } from '../types';
import { COUNTIES } from '../data/counties';
import { CLUBS } from '../data/clubs';
import { DISNEY, UNIVERSAL } from '../data/places';
import { fmtMi, fmtPrice, miles } from '../lib/geo';
import { C, shadow } from '../theme';
import { Badge, GradeDot, Stat } from './ui';

/** Animated card that swaps in whenever the map centre drifts over a new hot spot. */
export function RegionCard({ region, listings }: { region?: Region; listings: EnrichedListing[] }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState<Region | undefined>(region);

  useEffect(() => {
    if (region?.id === shown?.id && region) {
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
      return;
    }
    // slide/fade out, swap, then spring back in
    Animated.timing(anim, { toValue: 0, duration: 140, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
      setShown(region);
      if (region) Animated.spring(anim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 70 }).start();
    });
  }, [region?.id]);

  if (!shown) return null;
  const county = COUNTIES[shown.county];
  const near = listings.filter((l) => miles(l.coord, shown.center) < 12);
  const prices = near.map((l) => l.price).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : 0;
  const highFlood = near.filter((l) => l.flood.risk === 'high').length;
  const known = near.filter((l) => l.flood.risk !== 'unknown').length;
  const clubs = CLUBS.filter((c) => miles(c.coord, shown.center) < 25);
  const ecnl = clubs.filter((c) => c.programs.some((p) => p.league.includes('ECNL'))).length;
  const mls = clubs.filter((c) => c.programs.some((p) => p.league.startsWith('MLS'))).length;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        st.card,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
            { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) },
          ],
        },
      ]}
    >
      <View style={st.row}>
        <View style={{ flex: 1 }}>
          <Text style={st.kicker}>HOT SPOT · {shown.county.toUpperCase()} CO.</Text>
          <Text style={st.title}>{shown.name}</Text>
        </View>
        {county ? (
          <View style={{ alignItems: 'center' }}>
            <GradeDot grade={county.districtGrade} size={34} />
            <Text style={st.rank}>#{county.rank} district</Text>
          </View>
        ) : null}
      </View>
      <Text style={st.blurb}>{shown.blurb}</Text>
      <View style={[st.row, { flexWrap: 'wrap', marginTop: 6 }]}>
        {shown.vibe.map((v) => (
          <Badge key={v} label={v} color={C.brand} />
        ))}
      </View>
      <View style={[st.row, { marginTop: 10 }]}>
        <Stat label="Median list" value={median ? fmtPrice(median) : '—'} />
        <Stat label="Disney" value={fmtMi(miles(shown.center, DISNEY))} />
        <Stat label="Universal" value={fmtMi(miles(shown.center, UNIVERSAL))} />
        <Stat label="ECNL / MLS NEXT" value={`${ecnl} / ${mls}`} />
        <Stat label="High flood" value={known ? `${Math.round((highFlood / known) * 100)}%` : '…'} />
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 18, padding: 14, ...shadow },
  row: { flexDirection: 'row', alignItems: 'center' },
  kicker: { fontSize: 10, letterSpacing: 1, color: C.sun, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '800', color: C.ink },
  rank: { fontSize: 10, color: C.sub, marginTop: 2 },
  blurb: { color: C.sub, fontSize: 13, marginTop: 4 },
});
