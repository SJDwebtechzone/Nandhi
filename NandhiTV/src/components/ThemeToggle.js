import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

/**
 * Theme toggle — cycles system → light → dark → system
 * Icon shows current mode:
 *   system → 'theme-light-dark'
 *   light  → 'white-balance-sunny'
 *   dark   → 'weather-night'
 */
export default function ThemeToggle({ size = 36, style }) {
  const { mode, colors, toggle } = useTheme();

  const iconName =
    mode === 'light' ? 'white-balance-sunny' :
    mode === 'dark'  ? 'weather-night' :
                       'theme-light-dark';

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        styles.btn,
        {
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: colors.cream,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Icon name={iconName} size={size * 0.55} color={colors.saffronDark} />
      {mode === 'system' && (
        <View style={[styles.dot, { backgroundColor: colors.gold, borderColor: colors.card }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dot: {
    position: 'absolute',
    top: 2, right: 2,
    width: 8, height: 8, borderRadius: 4,
    borderWidth: 1,
  },
});
