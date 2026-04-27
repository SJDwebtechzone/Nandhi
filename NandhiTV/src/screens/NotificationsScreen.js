import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Notifications } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [list, setList] = useState([]);
  useEffect(() => { Notifications.list().then(setList).catch(() => {}); }, []);

  return (
    <FlatList
      style={styles.bg}
      data={list}
      keyExtractor={(n) => n.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.time}>{new Date(item.sent_at).toLocaleString()}</Text>
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  card: { backgroundColor: colors.card, padding: 14, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: colors.saffron },
  title: { fontWeight: '800', color: colors.text },
  body: { color: colors.text, marginTop: 4 },
  time: { color: colors.textMuted, marginTop: 6, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
});
