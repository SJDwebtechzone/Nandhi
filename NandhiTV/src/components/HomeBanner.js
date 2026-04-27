import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, Image, FlatList, Dimensions,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { Banners, fullUrl } from '../services/api';

const SCREEN_W = Dimensions.get('window').width;
const BANNER_H = 180;

// Default banner slides. Swap `image` with real temple photos when you have them.
// picsum.photos returns the same image for a given seed, so these are stable.
export const DEFAULT_BANNERS = [
  {
    id: 'b1',
    image: 'https://picsum.photos/seed/nandhi-temple/1200/600',
    title: 'Daily Darshan',
    subtitle: 'Start your day with divine blessings',
    icon: 'star-four-points',
    tint: 'rgba(196,62,0,0.45)', // saffron overlay
  },
  {
    id: 'b2',
    image: 'https://picsum.photos/seed/nandhi-aarti/1200/600',
    title: 'Live Aarti Streams',
    subtitle: 'Join prayers from holy temples',
    icon: 'broadcast',
    tint: 'rgba(43,24,16,0.5)',
  },
  {
    id: 'b3',
    image: 'https://picsum.photos/seed/nandhi-divya-desam/1200/600',
    title: '108 Divya Desam',
    subtitle: 'Sacred temples of Lord Vishnu',
    icon: 'home-city',
    tint: 'rgba(212,175,55,0.45)',
  },
];

export default function HomeBanner({ banners: propBanners, onPress }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const flatRef = useRef(null);
  const [index, setIndex] = useState(0);
  const [fetched, setFetched] = useState(null); // null = not loaded yet

  // Fetch banners from backend on mount (falls back to defaults on failure)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await Banners.list();
        if (!cancelled) setFetched(Array.isArray(list) && list.length ? list : []);
      } catch (e) {
        if (!cancelled) setFetched([]); // API failed -> trigger fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Priority: explicit prop > fetched list > default hardcoded banners
  const banners = propBanners
    || (fetched && fetched.length ? fetched : DEFAULT_BANNERS);

  // Auto-advance every 4s. `animated: false` + disableIntervalMomentum avoids
  // the known Android bug where animated scrollToOffset on a horizontal FlatList
  // nested inside a vertical ScrollView can cause the parent ScrollView to
  // snap to the bottom of its content.
  useEffect(() => {
    if (!banners || banners.length < 2) return;
    const t = setInterval(() => {
      const next = (index + 1) % banners.length;
      try {
        flatRef.current?.scrollToOffset({ offset: next * SCREEN_W, animated: false });
      } catch (e) { /* noop */ }
      setIndex(next);
    }, 4000);
    return () => clearInterval(t);
  }, [index, banners]);

  const onMomentumEnd = useCallback((e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index && i >= 0 && i < banners.length) setIndex(i);
  }, [index, banners.length]);

  return (
    <View style={{ marginTop: 12 }}>
      <FlatList
        ref={flatRef}
        data={banners}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        removeClippedSubviews={false}
        disableIntervalMomentum
        decelerationRate="fast"
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => onPress?.(item)}
            style={styles.slideOuter}
          >
            <View style={styles.slideInner}>
              <Image source={{ uri: fullUrl(item.image_url || item.image) }} style={styles.img} />
              <View style={[styles.tint, { backgroundColor: item.tint_color || item.tint || 'rgba(0,0,0,0.4)' }]} />
              <View style={styles.badge}>
                <Icon name={item.icon || 'star-four-points'} size={12} color={colors.white} />
                <Text style={styles.badgeText}>  NANDHI TV</Text>
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                {!!item.subtitle && (
                  <Text style={styles.subtitle} numberOfLines={2}>{item.subtitle}</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      {/* Pagination dots */}
      <View style={styles.dots}>
        {banners.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  slideOuter: {
    width: SCREEN_W,
    paddingHorizontal: 12,
  },
  slideInner: {
    width: '100%',
    height: BANNER_H,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.card,
    elevation: 3,
  },
  img: { width: '100%', height: '100%' },
  tint: { ...StyleSheet.absoluteFillObject },
  badge: {
    position: 'absolute', top: 14, left: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  textWrap: { position: 'absolute', left: 16, right: 16, bottom: 18 },
  title: {
    color: colors.white, fontSize: 22, fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.white, fontSize: 13,
    marginTop: 4, opacity: 0.95, fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    flexDirection: 'row', justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.border,
    marginHorizontal: 3,
  },
  dotActive: {
    backgroundColor: colors.saffron,
    width: 20,
  },
});
