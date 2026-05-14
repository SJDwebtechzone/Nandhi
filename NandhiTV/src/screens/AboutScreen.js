import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { About } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function AboutScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [info, setInfo] = useState(null);
  useEffect(() => { About.get().then(setInfo).catch(() => {}); }, []);

  const Social = ({ icon, url }) => (
    <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(url)}>
      <Icon name={icon} size={22} color={colors.saffron} />
    </TouchableOpacity>
  );

  const Block = ({ title, text, icon }) => (
    <View style={styles.block}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
        <Icon name={icon} size={18} color={colors.saffron} />
        <Text style={[styles.blockTitle, { marginLeft: 6 }]}>{title}</Text>
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );

  if (!info) return <View style={styles.bg} />;

  // Support both the admin schema (title/body/mission/vision/contact_address/top-level socials)
  // and the older keys (foundation_name/foundation_about/mission_statement/vision_statement/address/social_links).
  const heading = info.title || info.foundation_name || 'About Us';
  const aboutBody = info.body || info.foundation_about;
  const mission = info.mission || info.mission_statement;
  const vision = info.vision || info.vision_statement;
  const address = info.contact_address || info.address;

  const social = info.social_links || {};
  const youtube   = info.youtube   || social.youtube;
  const facebook  = info.facebook  || social.facebook;
  const instagram = info.instagram || social.instagram;
  const twitter   = info.twitter   || social.twitter;
  const website   = info.website   || social.website;
  const whatsapp  = social.whatsapp;

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.heading}>{heading}</Text>
      {!!aboutBody && <Text style={styles.body}>{aboutBody}</Text>}

      {!!info.founder_name && (
        <View style={styles.founderCard}>
          {!!info.founder_image_url && (
            <Image source={{ uri: info.founder_image_url }} style={styles.founderImg} />
          )}
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.founderName}>{info.founder_name}</Text>
            <Text style={styles.founderRole}>Founder</Text>
            {!!info.founder_bio && <Text style={styles.founderBio}>{info.founder_bio}</Text>}
          </View>
        </View>
      )}

      {!!mission && (
        <Block title="Our Mission" text={mission} icon="target" />
      )}
      {!!vision && (
        <Block title="Our Vision"  text={vision}  icon="eye-outline" />
      )}

      {(info.contact_email || info.contact_phone || address) && (
        <View style={styles.contact}>
          <Text style={styles.blockTitle}>Contact</Text>
          {!!info.contact_email && <Text style={styles.contactRow}>✉️ {info.contact_email}</Text>}
          {!!info.contact_phone && <Text style={styles.contactRow}>📞 {info.contact_phone}</Text>}
          {!!address            && <Text style={styles.contactRow}>📍 {address}</Text>}
        </View>
      )}

      <View style={styles.socialRow}>
        {youtube   && <Social icon="youtube"   url={youtube} />}
        {facebook  && <Social icon="facebook"  url={facebook} />}
        {instagram && <Social icon="instagram" url={instagram} />}
        {twitter   && <Social icon="twitter"   url={twitter} />}
        {whatsapp  && <Social icon="whatsapp"  url={whatsapp} />}
        {website   && <Social icon="web"       url={website} />}
      </View>
    </ScrollView>
  );
}


const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  body:    { color: colors.text, lineHeight: 20 },
  founderCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    padding: 14, borderRadius: 10, marginTop: 18, borderWidth: 1, borderColor: colors.border,
  },
  founderImg: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cream },
  founderName: { fontWeight: '800', color: colors.text, fontSize: 15 },
  founderRole: { color: colors.saffron, fontWeight: '700', marginTop: 2 },
  founderBio:  { color: colors.textMuted, marginTop: 6, fontSize: 12 },
  block: { marginTop: 18, backgroundColor: colors.card, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border },
  blockTitle: { fontWeight: '800', color: colors.text },
  contact: { marginTop: 18 },
  contactRow: { color: colors.textMuted, marginTop: 6 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  socialBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card,
    alignItems: 'center', justifyContent: 'center', marginHorizontal: 6,
    borderWidth: 1, borderColor: colors.border },
});
