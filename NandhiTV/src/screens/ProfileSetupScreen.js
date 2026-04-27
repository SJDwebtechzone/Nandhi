import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

export default function ProfileSetupScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user, updateProfile } = useAuth();

  const [name, setName]   = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const validEmail = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSave = name.trim().length >= 2 && validEmail;

  const onSave = async () => {
    if (!canSave) {
      Alert.alert('Check your details',
        !validEmail ? 'That email doesn\'t look right.' : 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() || null });
      // Navigator will automatically drop ProfileSetup from stack since
      // profile_complete is now true.
    } catch (e) {
      Alert.alert('Could not save', e?.response?.data?.error || e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onSkip = async () => {
    // Let them into the app with just the phone — we already have their number.
    // They can fill this in later from settings.
    if (!name.trim()) {
      try {
        setLoading(true);
        await updateProfile({ name: 'Guest', email: null });
      } catch (e) { /* ignore */ }
      finally { setLoading(false); }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.iconWrap}>
          <Icon name="account-circle" size={72} color={colors.saffron} />
        </View>

        <Text style={styles.heading}>Tell us about yourself</Text>
        <Text style={styles.sub}>
          Your details stay private — used only for personalized greetings and donation receipts.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Ramesh Kumar"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            autoFocus
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Email (optional)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>
            Used for 80G donation receipts if you donate.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, (!canSave || loading) && styles.primaryBtnDisabled]}
            disabled={!canSave || loading}
            onPress={onSave}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={colors.white} />
              : <Text style={styles.primaryBtnText}>Continue</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip — I'll fill this in later</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  scroll: { flexGrow: 1, padding: 20, paddingTop: 36 },
  iconWrap: { alignItems: 'center', marginBottom: 10 },

  heading: {
    fontSize: 22, fontWeight: '800',
    color: colors.text, textAlign: 'center',
  },
  sub: {
    fontSize: 13, color: colors.textMuted,
    textAlign: 'center', marginTop: 6,
    paddingHorizontal: 20, lineHeight: 19, marginBottom: 20,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.border,
    elevation: 2,
  },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.5 },
  input: {
    marginTop: 6,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 12, paddingHorizontal: 14,
    fontSize: 15, color: colors.text,
    backgroundColor: colors.bg,
  },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 6 },

  primaryBtn: {
    marginTop: 22,
    backgroundColor: colors.saffron,
    borderRadius: 24, paddingVertical: 14,
    alignItems: 'center', elevation: 2,
  },
  primaryBtnDisabled: { backgroundColor: colors.border },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  skipBtn: { alignItems: 'center', marginTop: 12, paddingVertical: 10 },
  skipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
