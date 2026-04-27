import React, { useMemo } from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function TempleDetailScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { temple } = route.params;
  return (
    <ScrollView style={styles.bg}>
      {!!temple.image_url && <Image source={{ uri: temple.image_url }} style={styles.hero} />}
      <View style={styles.body}>
        <Text style={styles.title}>{temple.name}</Text>
        {!!temple.deity && <Text style={styles.subtitle}>{temple.deity}</Text>}
        {!!temple.location && (
          <Text style={styles.meta}>{temple.location}, {temple.state}, {temple.country}</Text>
        )}
        {!!temple.divya_desam_number && (
          <Text style={styles.badge}>Divya Desam #{temple.divya_desam_number}</Text>
        )}
        {!!temple.history && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>History</Text>
            <Text style={styles.sectionText}>{temple.history}</Text>
          </View>
        )}
        {!!temple.significance && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Significance</Text>
            <Text style={styles.sectionText}>{temple.significance}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  hero: { width: '100%', height: 220, backgroundColor: colors.cream },
  body: { padding: 16 },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { color: colors.saffron, marginTop: 4, fontWeight: '700' },
  meta: { color: colors.textMuted, marginTop: 4 },
  badge: {
    alignSelf: 'flex-start', marginTop: 8,
    backgroundColor: colors.gold, color: colors.text,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
    overflow: 'hidden', fontWeight: '700',
  },
  section: { marginTop: 18 },
  sectionTitle: { fontWeight: '800', color: colors.text, marginBottom: 6 },
  sectionText: { color: colors.textMuted, lineHeight: 20 },
});
