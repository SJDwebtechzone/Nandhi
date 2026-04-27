import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ScrollView } from 'react-native';
import { Ngo } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function NgoActivitiesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [list, setList] = useState([]);
  useEffect(() => { Ngo.list().then(setList).catch(() => {}); }, []);

  return (
    <FlatList
      style={styles.bg}
      data={list}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          {!!item.activity_date && (
            <Text style={styles.date}>{new Date(item.activity_date).toLocaleDateString()}</Text>
          )}
          {!!item.location && <Text style={styles.meta}>📍 {item.location}</Text>}
          {!!item.description && <Text style={styles.desc}>{item.description}</Text>}
          {Array.isArray(item.image_urls) && item.image_urls.length > 0 && (
            <ScrollView horizontal style={{ marginTop: 10 }} showsHorizontalScrollIndicator={false}>
              {item.image_urls.map((u, i) => (
                <Image key={i} source={{ uri: u }} style={styles.photo} />
              ))}
            </ScrollView>
          )}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Activities will be posted here.</Text>}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  card: { backgroundColor: colors.card, padding: 14, borderRadius: 10, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border },
  title: { fontWeight: '800', color: colors.text, fontSize: 15 },
  date:  { color: colors.saffron, marginTop: 4, fontWeight: '700' },
  meta:  { color: colors.textMuted, marginTop: 2 },
  desc:  { color: colors.text, marginTop: 8, lineHeight: 20 },
  photo: { width: 150, height: 110, borderRadius: 8, marginRight: 8, backgroundColor: colors.cream },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
});
