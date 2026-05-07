import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

const PROGRAMS = [
  { icon: 'music-circle',           label: 'Karnatic Music Concerts' },
  { icon: 'laptop',                 label: 'Online Music Classes'    },
  { icon: 'om',                     label: 'Online Sloka Classes'    },
];

export default function MusicScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>Nandhi Fine Arts Programs</Text>

      <View style={styles.list}>
        {PROGRAMS.map((p) => (
          <View key={p.label} style={styles.row}>
            <View style={styles.iconWrap}>
              <Icon name={p.icon} size={22} color={colors.saffron} />
            </View>
            <Text style={styles.label}>{p.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) =>
  StyleSheet.create({
    bg: { flex: 1, backgroundColor: colors.bg },
    heading: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 14,
    },
    list: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.cream,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    label: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
  });
