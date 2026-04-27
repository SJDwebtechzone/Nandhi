import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import VideoCard from '../components/VideoCard';
import SectionHeader from '../components/SectionHeader';
import { Videos } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function DevotionalScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [videos, setVideos] = useState([]);

  useEffect(() => {
    Videos.list({ category: 'divya-desam' }).then(setVideos).catch(() => {});
  }, []);

  return (
    <FlatList
      style={styles.bg}
      ListHeaderComponent={
        <View>
          <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('TempleList')}>
            <Icon name="temple-hindu" size={28} color={colors.saffron} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.tileTitle}>108 Divya Desam</Text>
              <Text style={styles.tileSub}>Temple listing & history</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('NgoActivities')}>
            <Icon name="hand-heart" size={28} color={colors.saffron} />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <Text style={styles.tileTitle}>Uzhavara Pani</Text>
              <Text style={styles.tileSub}>Our NGO service activities</Text>
            </View>
            <Icon name="chevron-right" size={24} color={colors.textMuted} />
          </TouchableOpacity>

          <SectionHeader title="Divya Desam Series" />
        </View>
      }
      data={videos}
      keyExtractor={(v) => v.id}
      renderItem={({ item }) => (
        <VideoCard video={item} onPress={() => navigation.navigate('VideoPlayer', { video: item })} />
      )}
      contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg },
  tile: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card, padding: 14, borderRadius: 10, marginBottom: 10,
    marginHorizontal: 2, borderWidth: 1, borderColor: colors.border,
  },
  tileTitle: { fontWeight: '800', color: colors.text, fontSize: 15 },
  tileSub: { color: colors.textMuted, marginTop: 2 },
});
