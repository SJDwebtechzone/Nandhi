import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Events } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const filters = [
  { key: null, label: 'All' },
  { key: 'program', label: 'Programs' },
  { key: 'temple-visit', label: 'Temple Visits' },
  { key: 'ngo-activity', label: 'NGO' },
];

export default function EventsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [type, setType] = useState(null);
  const [list, setList] = useState([]);

  const load = useCallback(async () => {
    try {
      const events = await Events.list({ upcoming: 1, ...(type ? { type } : {}) });
      setList(events);
    } catch (e) { setList([]); }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return (
    <View style={styles.bg}>
      <View style={styles.chips}>
        {filters.map((f) => {
          const active = f.key === type;
          return (
            <TouchableOpacity key={f.label}
              onPress={() => setType(f.key)}
              style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={list}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} activeOpacity={0.85}
            onPress={() => navigation.navigate('EventDetail', { event: item })}>
            <View style={styles.dateBox}>
              <Text style={styles.dateDay}>{new Date(item.start_date).getDate()}</Text>
              <Text style={styles.dateMon}>
                {new Date(item.start_date).toLocaleString('en', { month: 'short' })}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
              {!!item.location && (
                <View style={styles.metaRow}>
                  <Icon name="map-marker" size={14} color={colors.textMuted} />
                  <Text style={styles.meta}>{item.location}</Text>
                </View>
              )}
              <View style={styles.metaRow}>
                <Icon name="tag" size={14} color={colors.textMuted} />
                <Text style={styles.meta}>{item.event_type}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming events right now.</Text>}
      />
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  chips: { flexDirection: 'row', padding: 10, flexWrap: 'wrap' },
  chip: { backgroundColor: colors.card, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    marginRight: 8, marginBottom: 6, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  chipText: { fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.white },
  card: { flexDirection: 'row', backgroundColor: colors.card, borderRadius: 10, padding: 12,
    marginBottom: 10, borderLeftWidth: 4, borderLeftColor: colors.saffron },
  dateBox: { width: 60, height: 60, backgroundColor: colors.cream, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center' },
  dateDay: { fontSize: 22, fontWeight: '800', color: colors.saffron },
  dateMon: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase' },
  title: { fontWeight: '800', color: colors.text, fontSize: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { color: colors.textMuted, marginLeft: 4, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
});
