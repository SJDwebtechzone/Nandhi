import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../auth/AuthContext';

// Default India country code. Change here for other countries.
const COUNTRY_CODE = '+91';

export default function LoginScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { sendOtp, verifyOtp, signInAsGuest } = useAuth();

  const [step, setStep] = useState('phone');  // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpInputRef = useRef(null);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const validPhone = /^\d{10}$/.test(phone);
  const validOtp   = /^\d{6}$/.test(otp);

  const onSendOtp = async () => {
    if (!validPhone) {
      Alert.alert('Invalid number', 'Please enter a 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const conf = await sendOtp(`${COUNTRY_CODE}${phone}`);
      setConfirmation(conf);
      setStep('otp');
      setCooldown(30);
      // Auto-focus OTP field after a beat
      setTimeout(() => otpInputRef.current?.focus(), 150);
    } catch (e) {
      Alert.alert('Could not send OTP', e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    if (!validOtp) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(confirmation, otp);
      // AuthContext flips status → signedIn, navigator will switch away automatically.
    } catch (e) {
      Alert.alert('Verification failed', e?.message || 'The code is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (cooldown > 0) return;
    setOtp('');
    await onSendOtp();
  };

  const onChangeNumber = () => {
    setStep('phone');
    setOtp('');
    setConfirmation(null);
  };

  const onSkip = async () => {
    await signInAsGuest();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand header */}
        <View style={styles.brandBlock}>
          <View style={styles.logoCircle}>
            <Icon name="flower-tulip" size={48} color={colors.saffron} />
          </View>
          <Text style={styles.brand}>Nandhi TV</Text>
          <Text style={styles.org}>Nandhi Cultural & Charitable Foundation</Text>
          <Text style={styles.tagline}>Temples. Tradition. Devotion.</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {step === 'phone' ? (
            <>
              <Text style={styles.heading}>Enter your mobile number</Text>
              <Text style={styles.sub}>
                We'll send you a one-time password by SMS to verify your number.
              </Text>

              <View style={styles.phoneRow}>
                <View style={styles.ccBox}>
                  <Text style={styles.ccText}>{COUNTRY_CODE}</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={(t) => setPhone(t.replace(/[^\d]/g, '').slice(0, 10))}
                  keyboardType="number-pad"
                  placeholder="10-digit mobile number"
                  placeholderTextColor={colors.textMuted}
                  maxLength={10}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, (!validPhone || loading) && styles.primaryBtnDisabled]}
                disabled={!validPhone || loading}
                onPress={onSendOtp}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.primaryBtnText}>Send OTP</Text>}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.heading}>Enter OTP</Text>
              <Text style={styles.sub}>
                Sent to {COUNTRY_CODE} {phone}.{'  '}
                <Text style={styles.link} onPress={onChangeNumber}>Change</Text>
              </Text>

              <TextInput
                ref={otpInputRef}
                style={styles.otpInput}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/[^\d]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                placeholder="6-digit OTP"
                placeholderTextColor={colors.textMuted}
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.primaryBtn, (!validOtp || loading) && styles.primaryBtnDisabled]}
                disabled={!validOtp || loading}
                onPress={onVerify}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color={colors.white} />
                  : <Text style={styles.primaryBtnText}>Verify & Continue</Text>}
              </TouchableOpacity>

              <TouchableOpacity onPress={onResend} disabled={cooldown > 0} style={styles.resendBtn}>
                <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Skip */}
        <TouchableOpacity style={styles.skipBtn} onPress={onSkip} activeOpacity={0.7}>
          <Text style={styles.skipText}>Skip for now  ›</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  scroll: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },

  // brand
  brandBlock: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: colors.cream,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.goldLight,
    marginBottom: 12,
  },
  brand: {
    fontSize: 28, fontWeight: '800',
    color: colors.saffronDark, letterSpacing: 1,
  },
  org: {
    fontSize: 12, color: colors.textMuted,
    fontWeight: '600', marginTop: 4, textAlign: 'center',
  },
  tagline: {
    fontSize: 12, color: colors.gold,
    fontWeight: '700', marginTop: 6, letterSpacing: 0.5,
  },

  // card
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1, borderColor: colors.border,
    elevation: 2,
  },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text },
  sub:     { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 },
  link:    { color: colors.saffron, fontWeight: '700' },

  // phone input row
  phoneRow: {
    flexDirection: 'row', marginTop: 18,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10, overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  ccBox: {
    paddingHorizontal: 14, paddingVertical: 12,
    backgroundColor: colors.cream,
    borderRightWidth: 1, borderRightColor: colors.border,
    justifyContent: 'center',
  },
  ccText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 1,
  },

  // otp input
  otpInput: {
    marginTop: 18,
    borderWidth: 1, borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.bg,
    paddingVertical: 14, paddingHorizontal: 16,
    fontSize: 20, fontWeight: '700', letterSpacing: 8,
    color: colors.text,
    textAlign: 'center',
  },

  // primary button
  primaryBtn: {
    marginTop: 20,
    backgroundColor: colors.saffron,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 2,
  },
  primaryBtnDisabled: { backgroundColor: colors.border },
  primaryBtnText: { color: colors.white, fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },

  // resend
  resendBtn: { alignItems: 'center', marginTop: 14 },
  resendText: { color: colors.saffron, fontWeight: '700', fontSize: 13 },
  resendTextDisabled: { color: colors.textMuted, fontWeight: '600' },

  // skip
  skipBtn: { alignItems: 'center', marginTop: 24, paddingVertical: 10 },
  skipText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },

  // terms
  terms: {
    textAlign: 'center', color: colors.textMuted,
    fontSize: 11, marginTop: 20, lineHeight: 16,
    paddingHorizontal: 20,
  },
});
