import React, { useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';

const SCREEN_W = Dimensions.get('window').width;
const GRID_CARD_W = (SCREEN_W - 36) / 2; // padding(12) + gap(12) + padding(12)

function formatDuration(sec) {
  if (!sec || sec <= 0) return null;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

function formatViews(n) {
  n = Number(n) || 0;
  if (n < 1000) return `${n} view${n === 1 ? '' : 's'}`;
  if (n < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}K views`;
  return `${(n / 1_000_000).toFixed(1)}M views`;
}

function timeAgo(iso) {
  if (!iso) return '';
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60)        return 'just now';
  if (d < 3600)      return `${Math.floor(d / 60)}m ago`;
  if (d < 86400)     return `${Math.floor(d / 3600)}h ago`;
  if (d < 604800)    return `${Math.floor(d / 86400)}d ago`;
  if (d < 2592000)   return `${Math.floor(d / 604800)}w ago`;
  if (d < 31536000)  return `${Math.floor(d / 2592000)}mo ago`;
  return `${Math.floor(d / 31536000)}y ago`;
}

export default function VideoCard({ video, onPress, horizontal, grid }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const duration = formatDuration(video.duration_seconds);
  const views    = formatViews(video.view_count);
  const when     = timeAgo(video.published_at);

  const cardStyle = [
    styles.card,
    horizontal && styles.cardHorizontal,
    grid && styles.cardGrid,
  ];
  const thumbStyle = [
    styles.thumb,
    horizontal && styles.thumbHorizontal,
    grid && styles.thumbGrid,
  ];

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
      <View>
        <Image source={{ uri: video.thumbnail_url }} style={thumbStyle} />
        {/* Play icon overlay */}
        <View style={styles.playWrap} pointerEvents="none">
          <Icon name="play-circle" size={grid || horizontal ? 36 : 48} color="rgba(255,255,255,0.9)" />
        </View>
        {/* Duration badge */}
        {!!duration && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{video.title}</Text>
        <View style={styles.metaRow}>
          {!!video.category_name && (
            <>
              <Text style={styles.cat} numberOfLines={1}>{video.category_name}</Text>
              <Text style={styles.dot}>•</Text>
            </>
          )}
          <Text style={styles.meta} numberOfLines={1}>{views}</Text>
          {!!when && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.meta} numberOfLines={1}>{when}</Text>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHorizontal: { width: 220, marginRight: 12, marginBottom: 0 },
  cardGrid:       { width: GRID_CARD_W, marginBottom: 14 },

  thumb:           { width: '100%', height: 200, backgroundColor: colors.cream },
  thumbHorizontal: { height: 125 },
  thumbGrid:       { height: 110 },

  playWrap: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute', right: 6, bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.78)',
    borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  durationText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  body: { padding: 10 },
  title: { fontWeight: '700', color: colors.text, fontSize: 14, lineHeight: 19 },
  metaRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 6, flexWrap: 'wrap',
  },
  cat:  { color: colors.saffron, fontSize: 11, fontWeight: '700' },
  meta: { color: colors.textMuted, fontSize: 11 },
  dot:  { color: colors.textMuted, fontSize: 11, marginHorizontal: 5 },
});
