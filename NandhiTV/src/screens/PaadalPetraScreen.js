import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

export default function PaadalPetraScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Icon name="temple-hindu" size={72} color={colors.saffron} />
      <Text style={[styles.title, { color: colors.saffronDark }]}>
        276 Paadal Petra Thalam
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Icon name="calendar-clock" size={32} color={colors.gold} />
        <Text style={[styles.msg, { color: colors.text }]}>
          Content will be available from June 1st.
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          Stay tuned for the sacred journey through all 276 Divya Desams sung by the Alvar saints.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  msg: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  sub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
});