import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../theme/ThemeContext';
import KolamDivider from '../../components/KolamDivider';

/**
 * Reusable page shell for policy / legal screens.
 * `sections` is an array of { heading: string, body: string | string[] }.
 * Bullet items can be inserted by passing an array of strings as body.
 */
export default function LegalPage({ icon, title, tagline, lastUpdated, sections }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Icon name={icon || 'file-document-outline'} size={28} color={colors.saffronDark} />
        </View>
        <Text style={styles.title}>{title}</Text>
        {!!tagline && <Text style={styles.tagline}>{tagline}</Text>}
        {!!lastUpdated && (
          <Text style={styles.meta}>Last updated: {lastUpdated}</Text>
        )}
      </View>

      <KolamDivider />

      {/* Sections */}
      <View style={styles.body}>
        {sections.map((s, idx) => (
          <View key={idx} style={styles.section}>
            <Text style={styles.heading}>{s.heading}</Text>
            {Array.isArray(s.body) ? (
              s.body.map((line, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.paragraph}>{s.body}</Text>
            )}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Nandhi Cultural &amp; Charitable Foundation
          </Text>
          <Text style={styles.footerMuted}>
            For questions, write to{' '}
            <Text style={styles.email}>support@nandhitv.com</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },

  hero: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconWrap: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: colors.cream,
    borderWidth: 1.5, borderColor: colors.goldLight,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    marginTop: 12,
    fontSize: 20, fontWeight: '800',
    color: colors.text, textAlign: 'center',
  },
  tagline: {
    marginTop: 4,
    fontSize: 12, fontWeight: '600',
    color: colors.textMuted, textAlign: 'center',
    letterSpacing: 0.3,
  },
  meta: {
    marginTop: 8,
    fontSize: 11, fontWeight: '700',
    color: colors.gold, letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  body: { paddingHorizontal: 16 },

  section: {
    marginTop: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
    padding: 14,
  },
  heading: {
    fontSize: 14, fontWeight: '800',
    color: colors.saffronDark,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  paragraph: {
    fontSize: 13.5, lineHeight: 21,
    color: colors.text,
  },

  bulletRow: {
    flexDirection: 'row',
    paddingVertical: 3,
  },
  bulletDot: {
    color: colors.saffron,
    fontSize: 16, lineHeight: 21,
    marginRight: 8,
    fontWeight: '900',
  },
  bulletText: {
    flex: 1,
    fontSize: 13.5, lineHeight: 21,
    color: colors.text,
  },

  footer: {
    marginTop: 22,
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12, fontWeight: '700',
    color: colors.saffronDark, letterSpacing: 0.4,
  },
  footerMuted: {
    marginTop: 4,
    fontSize: 11, color: colors.textMuted,
  },
  email: { color: colors.saffron, fontWeight: '700' },
});
