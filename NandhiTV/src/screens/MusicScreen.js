import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import VideoCard from '../components/VideoCard';
import SectionHeader from '../components/SectionHeader';
import { Videos } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function MusicScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [mrid, setMrid] = useState([]);
  const [bhajan, setBhajan] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    Promise.all([
      Videos.list({ category: 'mridangam' }),
      Videos.list({ category: 'music-bhajans' }),
      Videos.list({ category: 'student-perf' }),
    ]).then(([m, b, s]) => { setMrid(m); setBhajan(b); setStudents(s); })
      .catch(() => {});
  }, []);

  const openVideo = (video) => navigation.navigate('VideoPlayer', { video });

  const Empty = () => (
    <Text style={{ color: colors.textMuted, paddingVertical: 6 }}>Nothing posted yet.</Text>
  );

  return (
    <FlatList
      style={styles.bg}
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={
        <View style={{ paddingBottom: 30 }}>
          <SectionHeader title="Mridangam Lessons" />
          {mrid.map((v) => <VideoCard key={v.id} video={v} onPress={() => openVideo(v)} />)}
          {mrid.length === 0 && <Empty />}

          <SectionHeader title="Devotional Songs" />
          {bhajan.map((v) => <VideoCard key={v.id} video={v} onPress={() => openVideo(v)} />)}
          {bhajan.length === 0 && <Empty />}

          <SectionHeader title="Student Performances" />
          {students.map((v) => <VideoCard key={v.id} video={v} onPress={() => openVideo(v)} />)}
          {students.length === 0 && <Empty />}
        </View>
      }
      contentContainerStyle={{ padding: 12 }}
    />
  );
}

const makeStyles = (colors) => StyleSheet.create({ bg: { backgroundColor: colors.bg } });
