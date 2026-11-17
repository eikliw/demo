import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Circle, Marker, WMSTile } from 'react-native-maps';
import { LinearGradientBar } from '../components/LegendBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../state/AppState';
import { DISNEY, FLORIDA_REGION, REGIONS, UNIVERSAL } from '../data/places';
import { CLUBS, isMlsNext } from '../data/clubs';
import { SCHOOLS } from '../data/schools';
import { FLOOD_COLOR, NFHL_WMS_TEMPLATE } from '../lib/flood';
import { computeHeat, HEAT_META, heatColor, MapRegion } from '../lib/heat';
import { fmtPrice, miles } from '../lib/geo';
import { HeatMetric, Region } from '../types';
import { RegionCard } from '../components/RegionCard';
import { HotspotMarker } from '../components/HotspotMarker';
import { Chip, GradeDot } from '../components/ui';
import { C, shadow } from '../theme';

type Layers = { homes: boolean; flood: boolean; heat: boolean; clubs: boolean; schools: boolean };

export function MapScreen({
  onOpenFilters,
  onOpenListing,
  focus,
}: {
  onOpenFilters: () => void;
  onOpenListing: (id: string) => void;
  focus?: { latitude: number; longitude: number; delta: number; n: number };
}) {
  const insets = useSafeAreaInsets();
  const { filtered, all, activeFilterCount, floodProgress, source } = useApp();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<MapRegion>(FLORIDA_REGION);
  const [activeRegion, setActiveRegion] = useState<Region | undefined>();
  const [layers, setLayers] = useState<Layers>({ homes: true, flood: false, heat: true, clubs: true, schools: false });
  const [metric, setMetric] = useState<HeatMetric>('move');
  const lastCheck = useRef(0);

  const zoomedIn = region.latitudeDelta < 1.2;
  const veryZoomedIn = region.latitudeDelta < 0.35;

  // "Hover" detection: as the map moves, find the hot spot under the centre crosshair.
  const pickRegion = useCallback((r: MapRegion) => {
    const center = { latitude: r.latitude, longitude: r.longitude };
    let best: Region | undefined;
    let bestD = Infinity;
    for (const reg of REGIONS) {
      const d = miles(center, reg.center);
      if (d < bestD) {
        bestD = d;
        best = reg;
      }
    }
    // radius scales with zoom so it feels like hovering over the spot
    const threshold = Math.max(8, Math.min(45, r.latitudeDelta * 69 * 0.18));
    setActiveRegion(bestD <= threshold ? best : undefined);
  }, []);

  const onRegionChange = useCallback(
    (r: MapRegion) => {
      const now = Date.now();
      if (now - lastCheck.current < 90) return; // throttle
      lastCheck.current = now;
      pickRegion(r);
    },
    [pickRegion],
  );

  const onRegionChangeComplete = useCallback(
    (r: MapRegion) => {
      setRegion(r);
      pickRegion(r);
    },
    [pickRegion],
  );

  // Fly to a spot when another tab asks (e.g. "Show on map").
  useEffect(() => {
    if (!focus) return;
    const t = setTimeout(
      () =>
        mapRef.current?.animateToRegion(
          { latitude: focus.latitude, longitude: focus.longitude, latitudeDelta: focus.delta, longitudeDelta: focus.delta },
          800,
        ),
      150,
    );
    return () => clearTimeout(t);
  }, [focus?.n]);

  const heat = useMemo(
    () => (layers.heat ? computeHeat(metric, region, filtered) : []),
    [layers.heat, metric, region, filtered],
  );

  const visible = useMemo(() => {
    const pad = 0.6;
    const inView = (c: { latitude: number; longitude: number }) =>
      Math.abs(c.latitude - region.latitude) < region.latitudeDelta * pad &&
      Math.abs(c.longitude - region.longitude) < region.longitudeDelta * pad;
    return {
      homes: zoomedIn ? filtered.filter((l) => inView(l.coord)) : [],
      schools: veryZoomedIn || (zoomedIn && layers.schools) ? SCHOOLS.filter((s) => inView(s.coord)) : [],
    };
  }, [filtered, region, zoomedIn, veryZoomedIn, layers.schools]);

  const toggle = (k: keyof Layers) => setLayers((p) => ({ ...p, [k]: !p[k] }));
  const fly = (r: Region) =>
    mapRef.current?.animateToRegion({ ...r.center, latitudeDelta: 0.45, longitudeDelta: 0.45 }, 900);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={FLORIDA_REGION}
        onRegionChange={onRegionChange}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {layers.flood ? <WMSTile urlTemplate={NFHL_WMS_TEMPLATE} zIndex={1} opacity={0.6} tileSize={256} /> : null}

        {heat.map((c) => (
          <Circle
            key={`${metric}-${c.key}`}
            center={c.coord}
            radius={c.radiusM}
            strokeWidth={0}
            fillColor={heatColor(c.value, c.alpha)}
            zIndex={2}
          />
        ))}

        {!zoomedIn &&
          REGIONS.map((r) => (
            <HotspotMarker key={r.id} region={r} active={activeRegion?.id === r.id} onPress={() => fly(r)} />
          ))}

        <Marker coordinate={DISNEY} title="Walt Disney World" anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={[st.poi, { backgroundColor: '#7c3aed' }]}>
            <Text style={st.poiText}>🏰</Text>
          </View>
        </Marker>
        <Marker coordinate={UNIVERSAL} title="Universal Orlando" anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
          <View style={[st.poi, { backgroundColor: '#1d4ed8' }]}>
            <Text style={st.poiText}>🌐</Text>
          </View>
        </Marker>

        {layers.clubs &&
          CLUBS.map((c) => {
            const mls = c.programs.some((p) => isMlsNext(p.league));
            const ecnl = c.programs.some((p) => p.league.includes('ECNL'));
            return (
              <Marker
                key={c.id}
                coordinate={c.coord}
                title={c.name}
                description={[...new Set(c.programs.map((p) => p.league))].join(' · ') + ` · #${c.stateRank} (sample)`}
                anchor={{ x: 0.5, y: 0.5 }}
                tracksViewChanges={false}
                zIndex={20}
              >
                <View style={[st.club, { borderColor: mls && ecnl ? C.sun : mls ? '#111827' : '#1d4ed8' }]}>
                  <Text style={{ fontSize: 14 }}>⚽</Text>
                </View>
              </Marker>
            );
          })}

        {visible.schools.map((s) => (
          <Marker
            key={s.id}
            coordinate={s.coord}
            title={s.name}
            description={`Grade ${s.grade} · score ${s.score} (sample)`}
            tracksViewChanges={false}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <GradeDot grade={s.grade} size={22} />
          </Marker>
        ))}

        {layers.homes &&
          visible.homes.map((l) => (
            <Marker
              key={l.id}
              coordinate={l.coord}
              onPress={() => onOpenListing(l.id)}
              tracksViewChanges={l.flood.zone === '…'}
              zIndex={30}
            >
              <View style={[st.pricePin, { borderColor: FLOOD_COLOR[l.flood.risk] }]}>
                <Text style={st.pricePinText}>{fmtPrice(l.price)}</Text>
              </View>
            </Marker>
          ))}
      </MapView>

      {/* Crosshair — what you "hover" over */}
      <View pointerEvents="none" style={st.crosshair}>
        <View style={[st.crossDot, activeRegion && { backgroundColor: C.sun, transform: [{ scale: 1.4 }] }]} />
      </View>

      {/* Top controls */}
      <View style={[st.top, { paddingTop: insets.top + 6 }]} pointerEvents="box-none">
        <View style={st.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={st.appTitle}>Move to Florida</Text>
            <Text style={st.appSub}>
              {filtered.length} homes · {source === 'sample' ? 'sample listings' : 'live listings'}
              {floodProgress.done < floodProgress.total
                ? ` · flood zones ${floodProgress.done}/${floodProgress.total}`
                : ''}
            </Text>
          </View>
          <Pressable style={st.filterBtn} onPress={onOpenFilters}>
            <Text style={st.filterText}>Filters{activeFilterCount ? ` · ${activeFilterCount}` : ''}</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <Chip small label="🏠 Homes" active={layers.homes} onPress={() => toggle('homes')} />
          <Chip small label="🔥 Heat map" active={layers.heat} onPress={() => toggle('heat')} color={C.sun} />
          <Chip small label="🌊 FEMA flood" active={layers.flood} onPress={() => toggle('flood')} color="#2563eb" />
          <Chip small label="⚽ Clubs" active={layers.clubs} onPress={() => toggle('clubs')} color="#111827" />
          <Chip small label="🎓 Schools" active={layers.schools} onPress={() => toggle('schools')} color={C.good} />
        </ScrollView>
        {layers.heat ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(Object.keys(HEAT_META) as HeatMetric[]).map((m) => (
              <Chip key={m} small label={HEAT_META[m].label} active={metric === m} onPress={() => setMetric(m)} color={C.ink} />
            ))}
          </ScrollView>
        ) : null}
        {layers.flood && !zoomedIn ? (
          <Text style={st.note}>Zoom in to a city to see FEMA flood-zone shading.</Text>
        ) : null}
      </View>

      {/* Bottom: animated hot-spot card + heat legend */}
      <View style={st.bottom} pointerEvents="box-none">
        {layers.heat ? (
          <View style={st.legend}>
            <Text style={st.legendTitle}>{HEAT_META[metric].label}</Text>
            <LinearGradientBar />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={st.legendLbl}>{HEAT_META[metric].low}</Text>
              <Text style={st.legendLbl}>{HEAT_META[metric].high}</Text>
            </View>
          </View>
        ) : null}
        <RegionCard region={activeRegion} listings={all} />
        {!activeRegion && !zoomedIn ? (
          <View style={st.hint}>
            <Text style={st.hintText}>Drag the map — hot spots light up as you pass over them ✨</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 12, backgroundColor: '#ffffffe6', paddingBottom: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  appTitle: { fontSize: 22, fontWeight: '900', color: C.ink },
  appSub: { fontSize: 12, color: C.sub },
  filterBtn: { backgroundColor: C.brand, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  filterText: { color: '#fff', fontWeight: '800' },
  note: { fontSize: 12, color: '#1d4ed8', marginBottom: 4 },
  bottom: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  legend: { alignSelf: 'flex-start', backgroundColor: '#fff', borderRadius: 12, padding: 8, marginBottom: 8, width: 180, ...shadow },
  legendTitle: { fontSize: 11, fontWeight: '800', color: C.ink, marginBottom: 4 },
  legendLbl: { fontSize: 10, color: C.sub, marginTop: 2 },
  hint: { backgroundColor: '#0f172acc', borderRadius: 12, padding: 10 },
  hintText: { color: '#fff', fontSize: 13, textAlign: 'center' },
  crosshair: { position: 'absolute', top: '50%', left: '50%', marginLeft: -6, marginTop: -6 },
  crossDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff', backgroundColor: C.brand, ...shadow },
  poi: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  poiText: { fontSize: 15 },
  club: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5 },
  pricePin: { backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 2 },
  pricePinText: { fontSize: 11, fontWeight: '800', color: C.ink },
});
