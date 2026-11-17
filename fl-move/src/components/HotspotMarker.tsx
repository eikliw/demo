import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Region } from '../types';
import { C } from '../theme';

/** Pulsing hot-spot marker; grows and glows while it's the active region. */
export function HotspotMarker({ region, active, onPress }: { region: Region; active: boolean; onPress: () => void }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const grow = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, { toValue: 1, duration: active ? 1100 : 2200, useNativeDriver: true }),
    );
    pulse.setValue(0);
    loop.start();
    Animated.spring(grow, { toValue: active ? 1 : 0, useNativeDriver: true, friction: 5 }).start();
    return () => loop.stop();
  }, [active]);

  return (
    <Marker
      coordinate={region.center}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges
      zIndex={active ? 50 : 10}
    >
      <View style={st.wrap}>
        <Animated.View
          style={[
            st.ring,
            {
              backgroundColor: active ? C.sun : C.brand,
              opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 2.2] }) }],
            },
          ]}
        />
        <Animated.View
          style={[
            st.dot,
            {
              backgroundColor: active ? C.sun : C.brand,
              transform: [{ scale: grow.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }],
            },
          ]}
        >
          <Text style={st.dotText}>★</Text>
        </Animated.View>
        {active ? <Text style={st.label}>{region.name}</Text> : null}
      </View>
    </Marker>
  );
}

const st = StyleSheet.create({
  wrap: { width: 130, height: 76, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 34, height: 34, borderRadius: 17, top: 21 },
  dot: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  dotText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  label: { position: 'absolute', bottom: 0, fontSize: 11, fontWeight: '800', color: C.ink, backgroundColor: '#ffffffdd', paddingHorizontal: 6, borderRadius: 6, overflow: 'hidden' },
});
