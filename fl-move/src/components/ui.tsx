import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { C, GRADE_COLOR } from '../theme';

export function Chip({
  label,
  active,
  onPress,
  color = C.brand,
  small,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  color?: string;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.chip,
        small && s.chipSmall,
        active ? { backgroundColor: color, borderColor: color } : null,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text style={[s.chipText, small && { fontSize: 12 }, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function Badge({ label, color, style }: { label: string; color: string; style?: ViewStyle }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '1f', borderColor: color + '55' }, style]}>
      <Text style={[s.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

export function GradeDot({ grade, size = 26 }: { grade: string; size?: number }) {
  return (
    <View style={[s.grade, { width: size, height: size, borderRadius: size / 2, backgroundColor: GRADE_COLOR[grade] ?? C.sub }]}>
      <Text style={[s.gradeText, { fontSize: size * 0.5 }]}>{grade}</Text>
    </View>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
      {sub ? <Text style={s.statSub}>{sub}</Text> : null}
    </View>
  );
}

export function SampleBanner({ text }: { text: string }) {
  return (
    <View style={s.banner}>
      <Text style={s.bannerText}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  chipSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { color: C.ink, fontWeight: '600', fontSize: 13 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, marginRight: 6, marginBottom: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  grade: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  gradeText: { color: '#fff', fontWeight: '800' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', color: C.ink },
  statLabel: { fontSize: 11, color: C.sub, marginTop: 2 },
  statSub: { fontSize: 10, color: C.sub },
  banner: { backgroundColor: '#fef3c7', borderRadius: 10, padding: 10, marginBottom: 12 },
  bannerText: { color: '#92400e', fontSize: 12 },
});
