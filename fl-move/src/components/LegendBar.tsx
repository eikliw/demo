import React from 'react';
import { View } from 'react-native';
import { heatColor } from '../lib/heat';

/** Gradient bar built from slices — avoids an extra native dependency. */
export function LinearGradientBar({ steps = 24 }: { steps?: number }) {
  return (
    <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' }}>
      {Array.from({ length: steps }, (_, i) => (
        <View key={i} style={{ flex: 1, backgroundColor: heatColor(i / (steps - 1), 1) }} />
      ))}
    </View>
  );
}
