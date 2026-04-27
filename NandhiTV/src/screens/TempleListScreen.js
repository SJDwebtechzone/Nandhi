import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Temples } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function TempleListScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [list, setList] = useState([]);
  useEffect(() => { Temples.list().then(setList).catch(() => {}); }, []);

  return (
    <FlatList
      style={styles.bg}
      data={list}
      keyExtractor={(t) => t.id}
      contentContainerStyle={{ padding: 12 }}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} activeOpacity={0.85}
          onPress={() => navigation.navigate('TempleDetail', { temple: item })}>
          {item.image_url
            ? <Image source={{ uri: item.image_url }} style={styles.img} />
            : <View style={[styles.img, styles.imgPlaceholder]}>
                <Text style={styles.num}>{item.divya_desam_number ?? ''}</Text>
              </View>}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{item.name}</Text>
            {!!item.deity && <Text style={styles.meta}>{item.deity}</Text>}
            {!!item.location && <Text style={styles.meta}>{item.location}, {item.state}</Text>}
          </View>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>Temple list will appear here.</Text>}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  row: {
    backgroundColor: colors.card, flexDirection: 'row', padding: 10, borderRadius: 10,
    marginBottom: 10, borderWidth: 1, borderColor: colors.border,
  },
  img: { width: 74, height: 74, borderRadius: 8, backgroundColor: colors.cream },
  imgPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  num: { color: colors.saffron, fontWeight: '800', fontSize: 20 },
  name: { fontWeight: '800', color: colors.text },
  meta: { color: colors.textMuted, marginTop: 2, fontSize: 12 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 30 },
});
