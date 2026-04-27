import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Live } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function LiveScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setLive(await Live.current()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 60000); return () => clearInterval(t); }, [load]);

  const onShare = async () => {
    if (!live) return;
    await Share.share({
      message: `Watch Nandhi TV LIVE: ${live.title}\nhttps://www.youtube.com/watch?v=${live.youtube_video_id}`,
    });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.saffron} /></View>;

  if (!live) {
    return (
      <View style={styles.center}>
        <Icon name="broadcast-off" size={60} color={colors.textMuted} />
        <Text style={styles.offlineTitle}>We're not live right now</Text>
        <Text style={styles.offlineText}>Enable notifications to get pinged when we go live.</Text>
      </View>
    );
  }

  return (
    <View style={styles.bg}>
      <View style={styles.player}>
        <YoutubePlayer
          height={230}
          play={true}
          videoId={live.youtube_video_id}
        />
      </View>

      <View style={styles.info}>
        <View style={styles.liveRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
        <Text style={styles.title}>{live.title}</Text>
        {!!live.description && <Text style={styles.desc}>{live.description}</Text>}

        <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
          <Icon name="share-variant" size={18} color={colors.white} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg },
  player: { backgroundColor: '#000' },
  info: { padding: 16 },
  liveRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.liveRed, marginRight: 6 },
  liveText: { color: colors.liveRed, fontWeight: '800', letterSpacing: 1 },
  title: { fontSize: 18, fontWeight: '800', color: colors.text },
  desc: { color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  shareBtn: {
    marginTop: 18, backgroundColor: colors.saffron, alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8,
  },
  shareText: { color: colors.white, fontWeight: '700', marginLeft: 6 },
  offlineTitle: { fontWeight: '800', fontSize: 16, marginTop: 12, color: colors.text },
  offlineText: { color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
