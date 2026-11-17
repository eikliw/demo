import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppStateProvider, useApp } from './src/state/AppState';
import { MapScreen } from './src/screens/MapScreen';
import { ListingsScreen } from './src/screens/ListingsScreen';
import { SoccerScreen } from './src/screens/SoccerScreen';
import { SchoolsScreen } from './src/screens/SchoolsScreen';
import { FilterSheet } from './src/components/FilterSheet';
import { ListingDetail } from './src/components/ListingDetail';
import { C } from './src/theme';

type Tab = 'map' | 'homes' | 'soccer' | 'schools';
const TABS: { k: Tab; icon: string; label: string }[] = [
  { k: 'map', icon: '🗺️', label: 'Map' },
  { k: 'homes', icon: '🏠', label: 'Homes' },
  { k: 'soccer', icon: '⚽', label: 'Soccer' },
  { k: 'schools', icon: '🎓', label: 'Schools' },
];

function Shell() {
  const insets = useSafeAreaInsets();
  const { all } = useApp();
  const [tab, setTab] = useState<Tab>('map');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openId, setOpenId] = useState<string>();
  const [focus, setFocus] = useState<{ latitude: number; longitude: number; delta: number; n: number }>();

  const open = all.find((l) => l.id === openId);
  const showOnMap = (latitude: number, longitude: number, delta = 0.15) => {
    setFocus((f) => ({ latitude, longitude, delta, n: (f?.n ?? 0) + 1 }));
    setTab('map');
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Keep every tab mounted so the map keeps its position & state. */}
        <View style={[StyleSheet.absoluteFill, tab !== 'map' && st.hidden]}>
          <MapScreen onOpenFilters={() => setFiltersOpen(true)} onOpenListing={setOpenId} focus={focus} />
        </View>
        <View style={[StyleSheet.absoluteFill, tab !== 'homes' && st.hidden]}>
          <ListingsScreen onOpenFilters={() => setFiltersOpen(true)} onOpenListing={setOpenId} />
        </View>
        <View style={[StyleSheet.absoluteFill, tab !== 'soccer' && st.hidden]}>
          <SoccerScreen onShowOnMap={(lat, lng) => showOnMap(lat, lng, 0.6)} />
        </View>
        <View style={[StyleSheet.absoluteFill, tab !== 'schools' && st.hidden]}>
          <SchoolsScreen />
        </View>
      </View>

      <View style={[st.tabbar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {TABS.map((t) => (
          <Pressable key={t.k} style={st.tab} onPress={() => setTab(t.k)}>
            <Text style={[st.icon, tab !== t.k && { opacity: 0.45 }]}>{t.icon}</Text>
            <Text style={[st.label, tab === t.k && { color: C.brand }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <FilterSheet visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
      <ListingDetail
        listing={open}
        onClose={() => setOpenId(undefined)}
        onShowOnMap={
          open
            ? () => {
                setOpenId(undefined);
                showOnMap(open.coord.latitude, open.coord.longitude, 0.08);
              }
            : undefined
        }
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppStateProvider>
        <Shell />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const st = StyleSheet.create({
  hidden: { opacity: 0, zIndex: -1, pointerEvents: 'none' },
  tabbar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 8 },
  tab: { flex: 1, alignItems: 'center' },
  icon: { fontSize: 20 },
  label: { fontSize: 11, fontWeight: '700', color: C.sub, marginTop: 2 },
});
