import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';
import { Auth } from '../services/api';

export default function ProfileScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, isLoggedIn, isGuest, signOut } = useAuth();

  const confirmLogout = () => {
    Alert.alert(
      'Log out?',
      'You will need to sign in again to access your profile.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This removes your profile from Nandhi TV. You can create a new one later with the same phone number.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Auth.deleteAccount();
            } catch (e) { /* swallow; we still log out */ }
            await signOut();
          },
        },
      ],
    );
  };

  const goToEdit = () => navigation.navigate('ProfileSetup');

  // -- Guest view (not signed in) --
  if (isGuest || !isLoggedIn || !user) {
    return (
      <View style={styles.bg}>
        <View style={styles.guestCard}>
          <Icon name="account-outline" size={56} color={colors.saffron} />
          <Text style={styles.guestHeading}>You're browsing as a guest</Text>
          <Text style={styles.guestSub}>
            Sign in with your mobile number to save your profile, get donation receipts, and
            receive event updates.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={async () => { await signOut(); }}>
            <Text style={styles.primaryBtnText}>Sign in</Text>
          </TouchableOpacity>
        </View>

        <MenuItem
          colors={colors}
          styles={styles}
          icon="information-outline"
          label="About Us"
          onPress={() => navigation.navigate('About')}
        />
        <MenuItem
          colors={colors}
          styles={styles}
          icon="bell-outline"
          label="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <MenuItem
          colors={colors}
          styles={styles}
          icon="shield-lock-outline"
          label="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        <MenuItem
          colors={colors}
          styles={styles}
          icon="file-document-outline"
          label="Terms & Conditions"
          onPress={() => navigation.navigate('Terms')}
        />
        <MenuItem
          colors={colors}
          styles={styles}
          icon="hand-coin-outline"
          label="Refund Policy"
          onPress={() => navigation.navigate('RefundPolicy')}
        />
      </View>
    );
  }

  // -- Signed-in view --
  const initial = (user.name || user.phone || '?').trim().charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.name}>{user.name || 'No name set'}</Text>
        {!!user.phone && <Text style={styles.phone}>{user.phone}</Text>}

        <TouchableOpacity style={styles.editBtn} onPress={goToEdit} activeOpacity={0.85}>
          <Icon name="pencil" size={14} color={colors.saffron} />
          <Text style={styles.editText}>  Edit profile</Text>
        </TouchableOpacity>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account details</Text>

        <DetailRow colors={colors} styles={styles}
          icon="phone" label="Mobile" value={user.phone || '—'} />
        <DetailRow colors={colors} styles={styles}
          icon="email-outline" label="Email" value={user.email || 'Not provided'} />
        {!!user.city && (
          <DetailRow colors={colors} styles={styles}
            icon="map-marker-outline" label="City" value={user.city} />
        )}
        <DetailRow colors={colors} styles={styles}
          icon="shield-check-outline" label="Verified"
          value={user.profile_complete ? 'Profile complete' : 'Incomplete — tap Edit'} />
      </View>

      {/* App menu */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>More</Text>
        <MenuItem colors={colors} styles={styles}
          icon="bell-outline" label="Notifications"
          onPress={() => navigation.navigate('Notifications')} />
        <MenuItem colors={colors} styles={styles}
          icon="information-outline" label="About Us"
          onPress={() => navigation.navigate('About')} />
        <MenuItem colors={colors} styles={styles}
          icon="hand-heart-outline" label="Uzhavara Pani"
          onPress={() => navigation.navigate('NgoActivities')} />
        <MenuItem colors={colors} styles={styles}
          icon="share-variant-outline" label="Share Nandhi TV"
          onPress={() => Linking.openURL('https://play.google.com/store')}
        />
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Legal</Text>
        <MenuItem colors={colors} styles={styles}
          icon="shield-lock-outline" label="Privacy Policy"
          onPress={() => navigation.navigate('PrivacyPolicy')} />
        <MenuItem colors={colors} styles={styles}
          icon="file-document-outline" label="Terms & Conditions"
          onPress={() => navigation.navigate('Terms')} />
        <MenuItem colors={colors} styles={styles}
          icon="hand-coin-outline" label="Refund Policy"
          onPress={() => navigation.navigate('RefundPolicy')} />
      </View>

      {/* Danger zone */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={confirmLogout} activeOpacity={0.85}>
          <Icon name="logout" size={18} color={colors.saffron} />
          <Text style={styles.logoutText}>  Log out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete} activeOpacity={0.85}>
          <Icon name="trash-can-outline" size={16} color={colors.liveRed} />
          <Text style={styles.deleteText}>  Delete account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>Nandhi TV • v1.0</Text>
    </ScrollView>
  );
}

function DetailRow({ colors, styles, icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <Icon name={icon} size={20} color={colors.saffron} />
      <View style={{ flex: 1, marginLeft: 14 }}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuItem({ colors, styles, icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <Icon name={icon} size={20} color={colors.saffron} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Icon name="chevron-right" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },

  // Guest card
  guestCard: {
    margin: 16, padding: 24,
    backgroundColor: colors.card,
    borderRadius: 16, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  guestHeading: {
    fontSize: 17, fontWeight: '800',
    color: colors.text, marginTop: 10, textAlign: 'center',
  },
  guestSub: {
    fontSize: 13, color: colors.textMuted,
    textAlign: 'center', lineHeight: 19, marginTop: 8, marginBottom: 18,
  },

  // Header
  headerCard: {
    alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 28, paddingBottom: 22,
    backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  avatar: {
    width: 86, height: 86, borderRadius: 43,
    backgroundColor: colors.cream,
    borderWidth: 2, borderColor: colors.goldLight,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34, fontWeight: '800',
    color: colors.saffronDark, letterSpacing: 1,
  },
  name: {
    marginTop: 12,
    fontSize: 20, fontWeight: '800',
    color: colors.text,
  },
  phone: {
    marginTop: 4,
    fontSize: 13, color: colors.textMuted, fontWeight: '600',
  },
  editBtn: {
    marginTop: 14, flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: colors.bg,
    borderRadius: 20,
    borderWidth: 1, borderColor: colors.saffron,
  },
  editText: { color: colors.saffron, fontWeight: '700', fontSize: 13 },

  // Section
  section: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionLabel: {
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
    fontSize: 11, fontWeight: '800',
    color: colors.textMuted, letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Detail row
  detailRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  detailLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.4 },
  detailValue: { fontSize: 14, color: colors.text, fontWeight: '600', marginTop: 2 },

  // Menu item
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  menuLabel: { flex: 1, marginLeft: 14, fontSize: 14, color: colors.text, fontWeight: '600' },

  // Primary CTA
  primaryBtn: {
    backgroundColor: colors.saffron,
    borderRadius: 24, paddingVertical: 12, paddingHorizontal: 32,
    alignItems: 'center', elevation: 2,
  },
  primaryBtnText: { color: colors.white, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  // Logout / delete
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  logoutText: { color: colors.saffron, fontWeight: '800', fontSize: 14 },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  deleteText: { color: colors.liveRed, fontWeight: '700', fontSize: 13 },

  version: {
    textAlign: 'center', marginTop: 24,
    color: colors.textMuted, fontSize: 11,
  },
});
