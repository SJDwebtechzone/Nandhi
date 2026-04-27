import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

export default function LiveBanner({ live, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  if (!live) return null;
  return (
    <TouchableOpacity style={styles.banner} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.dot} />
      <Text style={styles.liveText}>LIVE NOW</Text>
      <Text style={styles.title} numberOfLines={1}>{live.title}</Text>
      <Icon name="play-circle" size={26} color={colors.white} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  banner: {
    backgroundColor: colors.liveRed,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 10,
  },
  dot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.white, marginRight: 8,
  },
  liveText: { color: colors.white, fontWeight: '800', marginRight: 10, letterSpacing: 1 },
  title: { color: colors.white, flex: 1, fontWeight: '600' },
});
