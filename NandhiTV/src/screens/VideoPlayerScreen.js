import React, { useMemo } from 'react';
import { View, Text, ScrollView, Share, TouchableOpacity, StyleSheet } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

export default function VideoPlayerScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { video } = route.params;

  const onShare = async () => {
    await Share.share({
      message: `${video.title}\nhttps://www.youtube.com/watch?v=${video.youtube_id}`,
    });
  };

  return (
    <ScrollView style={styles.bg}>
      <View style={{ backgroundColor: '#000' }}>
        <YoutubePlayer height={230} videoId={video.youtube_id} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{video.title}</Text>
        {!!video.category_name && <Text style={styles.cat}>{video.category_name}</Text>}
        {!!video.description && <Text style={styles.desc}>{video.description}</Text>}
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
          <Icon name="share-variant" size={18} color={colors.white} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  body: { padding: 16 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  cat:   { color: colors.saffron, marginTop: 4, fontWeight: '700' },
  desc:  { color: colors.textMuted, marginTop: 10, lineHeight: 20 },
  shareBtn: {
    marginTop: 18, backgroundColor: colors.saffron, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
  },
  shareText: { color: colors.white, fontWeight: '700', marginLeft: 6 },
});
