import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, Image, Share, TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LiveBanner from '../components/LiveBanner';
import VideoCard from '../components/VideoCard';
import SectionHeader from '../components/SectionHeader';
import KolamDivider from '../components/KolamDivider';
import HomeBanner from '../components/HomeBanner';
import ThemeToggle from '../components/ThemeToggle';
import { Live, Videos, Announcements } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

// --- helpers ---
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12)  return { time: 'Good Morning', icon: 'weather-sunset-up'   };
  if (h < 17)  return { time: 'Good Afternoon', icon: 'white-balance-sunny' };
  if (h < 20)  return { time: 'Good Evening', icon: 'weather-sunset-down' };
  return       { time: 'Good Night',   icon: 'weather-night'          };
}

const SHARE_MESSAGE =
  'Discover daily darshans, bhajans, and temple events. Download Nandhi TV: [Play Store link]';

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [live, setLive] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [divya, setDivya] = useState([]);
  const [music, setMusic] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');

  const greeting = getGreeting();

  const load = useCallback(async () => {
    try {
      const [l, f, t, a, b, c, ann] = await Promise.all([
        Live.current(),
        Videos.featured(1),
        Videos.trending(10),
        Videos.list({ category: 'latest', limit: 10 }),
        Videos.list({ category: 'divya-desam', limit: 10 }),
        Videos.list({ category: 'music-bhajans', limit: 10 }),
        Announcements.list(),
      ]);
      setLive(l);
      setFeatured(f && f[0] ? f[0] : null);
      setTrending(t);
      setLatest(a); setDivya(b); setMusic(c);
      setAnnouncements(ann);
    } catch (e) { /* backend not reachable */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };
  const openVideo = (video) => navigation.navigate('VideoPlayer', { video });

  const onSearchSubmit = () => {
    const q = query.trim();
    if (!q) return;
    navigation.navigate('Tabs', { screen: 'Videos', params: { q } });
  };

  const onShareApp = async () => {
    try {
      await Share.share({ message: SHARE_MESSAGE, title: 'Nandhi TV' });
    } catch (e) { /* user cancelled */ }
  };

  // Route banner taps to the right section of the app
  const onBannerPress = (banner) => {
    if (!banner) return;
    // DB-driven banners have link_type + link_value
    switch (banner.link_type) {
      case 'video':    return navigation.navigate('VideoPlayer', { video: { id: banner.link_value } });
      case 'live':     return navigation.navigate('Tabs', { screen: 'Live' });
      case 'temple':   return navigation.navigate('TempleList');
      case 'category': return navigation.navigate('Tabs', { screen: 'Videos' });
      case 'url':      return; // could open browser via Linking.openURL if desired
      case 'none':     return;
      default: break;
    }
    // Fallback: default hardcoded banner ids (b1/b2/b3)
    if (banner.id === 'b1' && featured) return openVideo(featured);
    if (banner.id === 'b2')              return navigation.navigate('Tabs', { screen: 'Live' });
    if (banner.id === 'b3')              return navigation.navigate('TempleList');
  };

  return (
    <ScrollView
      style={styles.bg}
      contentContainerStyle={{ paddingBottom: 12 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      overScrollMode="never"
      bounces={false}
      removeClippedSubviews={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.saffron} />}
    >
      {/* Theme toggle (profile avatar is in the orange navigation header) */}
      <View style={styles.topBar}>
        <ThemeToggle />
      </View>

      {/* Greeting block */}
      <View style={styles.greetBlock}>
        <View style={styles.greetRow}>
          <Icon name={greeting.icon} size={22} color={colors.gold} />
          <Text style={styles.greetText}>  {greeting.time}</Text>
        </View>
        <Text style={styles.brand}>Nandhi TV</Text>
        <Text style={styles.org}>Nandhi Cultural & Charitable Foundation</Text>
        <Text style={styles.tagline}>Temples. Tradition. Devotion.</Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={onSearchSubmit}
          placeholder="Search videos, temples, events..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Icon name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Hero banner carousel */}
      <HomeBanner onPress={onBannerPress} />

      <LiveBanner live={live} onPress={() => navigation.navigate('Tabs', { screen: 'Live' })} />

      {/* Daily Darshan card - featured video */}
      {featured && (
        <TouchableOpacity
          style={styles.darshanCard}
          activeOpacity={0.85}
          onPress={() => openVideo(featured)}
        >
          {featured.thumbnail_url ? (
            <Image source={{ uri: featured.thumbnail_url }} style={styles.darshanImage} />
          ) : (
            <View style={[styles.darshanImage, { backgroundColor: colors.border }]} />
          )}
          <View style={styles.darshanOverlay}>
            <View style={styles.darshanBadge}>
              <Icon name="star-four-points" size={12} color={colors.white} />
              <Text style={styles.darshanBadgeText}>  DAILY DARSHAN</Text>
            </View>
            <Text numberOfLines={2} style={styles.darshanTitle}>{featured.title}</Text>
            <View style={styles.darshanPlay}>
              <Icon name="play-circle" size={42} color={colors.white} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick action row */}
      <View style={styles.quickRow}>
        <QuickAction styles={styles} colors={colors} icon="home-city" label="108 Divya Desam"
          onPress={() => navigation.navigate('TempleList')} />
        <QuickAction styles={styles} colors={colors} icon="music-circle"  label="Music"
          onPress={() => navigation.navigate('Music')} />
        <QuickAction styles={styles} colors={colors} icon="hand-heart"    label="Uzhavara Pani"
          onPress={() => navigation.navigate('NgoActivities')} />
        <QuickAction styles={styles} colors={colors} icon="information"   label="About Us"
          onPress={() => navigation.navigate('About')} />
      </View>

      {/* Donate CTA */}
      <TouchableOpacity
        style={styles.donateCta}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Tabs', { screen: 'Donate' })}
      >
        <View style={styles.donateIconWrap}>
          <Icon name="hand-heart" size={28} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.donateTitle}>Support Our Foundation</Text>
          <Text style={styles.donateSub}>Your contribution keeps our mission alive</Text>
        </View>
        <Icon name="chevron-right" size={26} color={colors.white} />
      </TouchableOpacity>

      <KolamDivider />

      {/* Trending */}
      <SectionHeader title="🔥 Trending Now" action="See all"
        onAction={() => navigation.navigate('Tabs', { screen: 'Videos' })} />
      <FlatList horizontal data={trending} keyExtractor={(v) => v.id} showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false} initialNumToRender={4}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => <VideoCard video={item} horizontal onPress={() => openVideo(item)} />}
        ListEmptyComponent={<Text style={styles.empty}>No trending videos yet</Text>} />

      {/* Latest */}
      <SectionHeader title="Latest Videos" action="See all"
        onAction={() => navigation.navigate('Tabs', { screen: 'Videos' })} />
      <FlatList horizontal data={latest} keyExtractor={(v) => v.id} showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false} initialNumToRender={4}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => <VideoCard video={item} horizontal onPress={() => openVideo(item)} />}
        ListEmptyComponent={<Text style={styles.empty}>No videos yet</Text>} />

      <KolamDivider />

      {/* Divya Desam */}
      <SectionHeader title="Divya Desam Series" action="See all"
        onAction={() => navigation.navigate('Devotional')} />
      <FlatList horizontal data={divya} keyExtractor={(v) => v.id} showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false} initialNumToRender={4}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => <VideoCard video={item} horizontal onPress={() => openVideo(item)} />}
        ListEmptyComponent={<Text style={styles.empty}>No videos yet</Text>} />

      {/* Music */}
      <SectionHeader title="Music & Bhajans" action="See all"
        onAction={() => navigation.navigate('Music')} />
      <FlatList horizontal data={music} keyExtractor={(v) => v.id} showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false} initialNumToRender={4}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        renderItem={({ item }) => <VideoCard video={item} horizontal onPress={() => openVideo(item)} />}
        ListEmptyComponent={<Text style={styles.empty}>No videos yet</Text>} />

      <KolamDivider />

      {/* Announcements */}
      <SectionHeader title="Announcements" />
      <View style={{ paddingHorizontal: 12 }}>
        {announcements.length === 0 && <Text style={styles.empty}>No announcements</Text>}
        {announcements.map((a) => (
          <View key={a.id} style={styles.annCard}>
            <Text style={styles.annTitle}>{a.title}</Text>
            <Text style={styles.annBody}>{a.body}</Text>
          </View>
        ))}
      </View>

      {/* Share this app */}
      <TouchableOpacity style={styles.shareBtn} onPress={onShareApp} activeOpacity={0.8}>
        <Icon name="share-variant" size={20} color={colors.saffron} />
        <Text style={styles.shareText}>  Share Nandhi TV with others</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

function QuickAction({ styles, colors, icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.qa} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.qaIconWrap}>
        <Icon name={icon} size={26} color={colors.saffron} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },

  // top bar (theme toggle)
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  // greeting block
  greetBlock: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 6,
    alignItems: 'center',
  },
  greetRow: { flexDirection: 'row', alignItems: 'center' },
  greetText: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  brand: {
    fontSize: 24,
    color: colors.saffronDark,
    fontWeight: '800',
    marginTop: 6,
    letterSpacing: 1,
  },
  org: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '700',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  // search bar
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 16, marginTop: 10,
    borderRadius: 24,
    paddingHorizontal: 14, height: 42,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },

  // daily darshan
  darshanCard: {
    marginHorizontal: 12, marginTop: 10,
    borderRadius: 14, overflow: 'hidden',
    elevation: 3,
    backgroundColor: colors.card,
  },
  darshanImage: { width: '100%', height: 190, resizeMode: 'cover' },
  darshanOverlay: {
    position: 'absolute', left: 0, right: 0, bottom: 0, top: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    justifyContent: 'space-between',
    padding: 12,
  },
  darshanBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.saffronDark,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  darshanBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  darshanTitle: {
    color: colors.white, fontSize: 17, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  darshanPlay: { position: 'absolute', right: 12, bottom: 12 },

  // quick actions
  quickRow: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginHorizontal: 12, marginTop: 12,
    backgroundColor: colors.card, borderRadius: 14, paddingVertical: 14,
    elevation: 1,
  },
  qa: { alignItems: 'center', width: 82 },
  qaIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  qaLabel: { fontSize: 11, color: colors.text, marginTop: 6, textAlign: 'center', fontWeight: '600' },

  // donate
  donateCta: {
    marginHorizontal: 12, marginTop: 14,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.saffron,
    borderRadius: 14, padding: 14,
    elevation: 2,
  },
  donateIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  donateTitle: { color: colors.white, fontSize: 15, fontWeight: '800' },
  donateSub:   { color: colors.white, fontSize: 11, opacity: 0.92, marginTop: 2 },

  empty: { color: colors.textMuted, paddingHorizontal: 14, paddingVertical: 10 },

  annCard: {
    backgroundColor: colors.card, padding: 14, borderRadius: 10, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: colors.gold,
  },
  annTitle: { fontWeight: '800', color: colors.text, marginBottom: 4 },
  annBody: { color: colors.textMuted },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, marginTop: 16,
    backgroundColor: colors.cream,
    borderRadius: 24, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.goldLight,
  },
  shareText: { color: colors.saffronDark, fontWeight: '700', fontSize: 13 },

});
