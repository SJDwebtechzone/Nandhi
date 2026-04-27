import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * A decorative divider inspired by South Indian kolam patterns.
 * Uses unicode dots + diamond so we don't need SVG support.
 */
export default function KolamDivider({ style }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={[styles.row, style]}>
      <View style={styles.line} />
      <Text style={styles.glyph}>✦</Text>
      <Text style={styles.dot}>·</Text>
      <Text style={styles.glyph}>◈</Text>
      <Text style={styles.dot}>·</Text>
      <Text style={styles.glyph}>✦</Text>
      <View style={styles.line} />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    paddingHorizontal: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.45,
  },
  glyph: {
    color: colors.gold,
    fontSize: 12,
    marginHorizontal: 4,
  },
  dot: {
    color: colors.saffron,
    fontSize: 18,
    marginHorizontal: 2,
    lineHeight: 18,
  },
});
