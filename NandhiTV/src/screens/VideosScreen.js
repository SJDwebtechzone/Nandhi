import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, FlatList, StyleSheet, TouchableOpacity, Text,
  TextInput, RefreshControl, Image, Modal, Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import VideoCard from '../components/VideoCard';
import { Videos, Categories } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const SORTS = [
  { key: 'latest',   label: 'Latest',      params: {}                  },
  { key: 'trending', label: 'Trending',    params: { sort: 'views' }   },
  { key: 'views',    label: 'Most Viewed', params: { sort: 'views' }   },
];

export default function VideosScreen({ navigation, route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const initialQ = route?.params?.q || '';

  const [cats, setCats]         = useState([{ slug: null, name: 'All' }]);
  const [active, setActive]     = useState(null);
  const [list, setList]         = useState([]);
  const [featured, setFeatured] = useState(null);
  const [query, setQuery]       = useState(initialQ);
  const [sortKey, setSortKey]   = useState('latest');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortOpen, setSortOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // react to deep-link search from Home screen
  useEffect(() => {
    if (route?.params?.q !== undefined) setQuery(route.params.q);
  }, [route?.params?.q]);

  const loadCats = useCallback(async () => {
    try {
      const c = await Categories.list();
      setCats([{ slug: null, name: 'All' }, ...c]);
    } catch (e) {}
  }, []);

  const load = useCallback(async () => {
    try {
      const sortCfg = SORTS.find((s) => s.key === sortKey) || SORTS[0];
      const params  = { ...sortCfg.params };
      if (active) params.category = active;
      const [v, f] = await Promise.all([
        Videos.list(params),
        Videos.featured(1).catch(() => []),
      ]);
      setList(v || []);
      setFeatured(f && f[0] ? f[0] : null);
    } catch (e) {
      setList([]);
    }
  }, [active, sortKey]);

  useEffect(() => { loadCats(); }, [loadCats]);
  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((v) =>
      (v.title || '').toLowerCase().includes(q) ||
      (v.description || '').toLowerCase().includes(q) ||
      (v.category_name || '').toLowerCase().includes(q)
    );
  }, [query, list]);

  const openVideo = (video) => navigation.navigate('VideoPlayer', { video });

  const sortLabel = SORTS.find((s) => s.key === sortKey)?.label || 'Latest';
  const showFeatured = !!featured && !query.trim();

  // --- HEADER (fixed above list) ---
  const ListHeader = () => (
    <View>
      {/* Featured banner */}
      {showFeatured && (
        <TouchableOpacity
          style={styles.feature}
          activeOpacity={0.88}
          onPress={() => openVideo(featured)}
        >
          {featured.thumbnail_url
            ? <Image source={{ uri: featured.thumbnail_url }} style={styles.featureImg} />
            : <View style={[styles.featureImg, { backgroundColor: colors.border }]} />}
          <View style={styles.featureOverlay}>
            <View style={styles.featureBadge}>
              <Icon name="star-four-points" size={11} color={colors.white} />
              <Text style={styles.featureBadgeText}>  FEATURED</Text>
            </View>
            <Text numberOfLines={2} style={styles.featureTitle}>{featured.title}</Text>
            <View style={styles.featurePlay}>
              <Icon name="play-circle" size={48} color={colors.white} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Category chips */}
      <FlatList
        data={cats}
        keyExtractor={(c) => c.slug || 'all'}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        style={styles.chipsScroll}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item: c }) => {
          const isActive = c.slug === active;
          return (
            <TouchableOpacity
              onPress={() => setActive(c.slug)}
              style={[styles.chip, isActive && styles.chipActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* Sort + View toggle */}
      <View style={styles.toolRow}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortOpen(true)} activeOpacity={0.7}>
          <Icon name="sort-variant" size={16} color={colors.saffronDark} />
          <Text style={styles.sortText}>  {sortLabel}</Text>
          <Icon name="chevron-down" size={16} color={colors.saffronDark} />
        </TouchableOpacity>

        <Text style={styles.countText}>
          {filtered.length} video{filtered.length === 1 ? '' : 's'}
        </Text>

        <View style={styles.toggleGroup}>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          >
            <Icon name="view-agenda-outline" size={18}
              color={viewMode === 'list' ? colors.white : colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
          >
            <Icon name="view-grid-outline" size={18}
              color={viewMode === 'grid' ? colors.white : colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.bg}>
      {/* Search bar — stays at top of screen */}
      <View style={styles.searchWrap}>
        <Icon name="magnify" size={20} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search videos..."
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

      <FlatList
        key={viewMode} // force re-render when switching numColumns
        data={filtered}
        keyExtractor={(v) => String(v.id)}
        numColumns={viewMode === 'grid' ? 2 : 1}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
        renderItem={({ item }) => (
          <VideoCard
            video={item}
            grid={viewMode === 'grid'}
            onPress={() => openVideo(item)}
          />
        )}
        ListHeaderComponent={<ListHeader />}
        contentContainerStyle={{ padding: 12, paddingBottom: 30 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.saffron} />
        }
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Icon name="video-off-outline" size={60} color={colors.border} />
            <Text style={styles.emptyTitle}>
              {query ? 'No matches found' : 'No videos yet'}
            </Text>
            <Text style={styles.emptySub}>
              {query
                ? `Nothing matched "${query}". Try another keyword.`
                : 'Check back soon — new content coming.'}
            </Text>
          </View>
        }
      />

      {/* Sort modal */}
      <Modal transparent visible={sortOpen} animationType="fade"
        onRequestClose={() => setSortOpen(false)}>
        <Pressable style={styles.sheetBackdrop} onPress={() => setSortOpen(false)}>
          <Pressable style={styles.sheet}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            {SORTS.map((s) => {
              const isSel = s.key === sortKey;
              return (
                <TouchableOpacity
                  key={s.key}
                  style={[styles.sheetRow, isSel && styles.sheetRowActive]}
                  onPress={() => { setSortKey(s.key); setSortOpen(false); }}
                >
                  <Text style={[styles.sheetText, isSel && styles.sheetTextActive]}>{s.label}</Text>
                  {isSel && <Icon name="check" size={18} color={colors.saffron} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },

  // search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 12, marginTop: 12,
    borderRadius: 24, paddingHorizontal: 14, height: 42,
    borderWidth: 1, borderColor: colors.border,
  },
  searchInput: {
    flex: 1, marginLeft: 8, fontSize: 14,
    color: colors.text, paddingVertical: 0,
  },

  // featured banner
  feature: {
    marginTop: 12,
    borderRadius: 14, overflow: 'hidden',
    backgroundColor: colors.card, elevation: 3,
  },
  featureImg: { width: '100%', height: 200 },
  featureOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.32)',
    padding: 12, justifyContent: 'space-between',
  },
  featureBadge: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: colors.saffronDark,
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4,
  },
  featureBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  featureTitle: {
    color: colors.white, fontSize: 18, fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
  featurePlay: { position: 'absolute', right: 12, bottom: 12 },

  // chips
  chipsScroll: { flexGrow: 0 },
  chips: { paddingVertical: 12, paddingHorizontal: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: colors.card, marginRight: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  chipText: { color: colors.text, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: colors.white },

  // tool row (sort + count + view toggle)
  toolRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, marginTop: 4,
  },
  sortBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: colors.goldLight,
    backgroundColor: colors.cream,
  },
  sortText: { color: colors.saffronDark, fontWeight: '700', fontSize: 12 },
  countText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  toggleGroup: {
    flexDirection: 'row',
    borderRadius: 8, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  toggleBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  toggleBtnActive: { backgroundColor: colors.saffron },

  // grid row
  gridRow: { justifyContent: 'space-between', paddingHorizontal: 0 },

  // empty
  emptyWrap: {
    alignItems: 'center', paddingVertical: 60, paddingHorizontal: 40,
  },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '800', color: colors.text },
  emptySub:   { marginTop: 6, fontSize: 13, color: colors.textMuted, textAlign: 'center' },

  // sort modal
  sheetBackdrop: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    paddingVertical: 14, paddingHorizontal: 20,
  },
  sheetTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 6 },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12,
  },
  sheetRowActive: {},
  sheetText: { fontSize: 15, color: colors.text },
  sheetTextActive: { color: colors.saffron, fontWeight: '800' },
});
