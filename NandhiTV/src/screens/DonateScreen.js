import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, Linking } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Donations } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

const presetAmounts = [101, 501, 1001, 2501];

export default function DonateScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [cfg, setCfg] = useState({ upi_id: '', upi_name: '', qr_code_url: null, razorpay_key_id: '' });
  const [amount, setAmount] = useState('501');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { Donations.config().then(setCfg).catch(() => {}); }, []);

  const openUpi = async () => {
    if (!cfg.upi_id) return Alert.alert('UPI not configured');
    const uri = `upi://pay?pa=${encodeURIComponent(cfg.upi_id)}&pn=${encodeURIComponent(cfg.upi_name || 'Nandhi Foundation')}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('Donation')}`;
    const canOpen = await Linking.canOpenURL(uri);
    if (!canOpen) return Alert.alert('No UPI app found');
    Linking.openURL(uri);
    // log pending donation
    Donations.logUpi({ amount: Number(amount), donor_name: name, donor_email: email, donor_phone: phone, message }).catch(() => {});
  };

  const payWithRazorpay = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return Alert.alert('Enter a valid amount');
    if (!cfg.razorpay_key_id) return Alert.alert('Razorpay not configured on server yet');
    setLoading(true);
    try {
      const { order } = await Donations.createRazorpay({
        amount: Number(amount), donor_name: name, donor_email: email, donor_phone: phone, message,
      });
      const options = {
        description: 'Donation to Nandhi Cultural & Charitable Foundation',
        currency: 'INR',
        key: cfg.razorpay_key_id,
        amount: order.amount,
        name: 'Nandhi Foundation',
        order_id: order.id,
        prefill: { email, contact: phone, name },
        theme: { color: colors.saffron },
      };
      const payment = await RazorpayCheckout.open(options);
      await Donations.verifyRazorpay(payment);
      Alert.alert('Thank you!', 'Your donation was received. Om Namah Shivaya 🙏');
    } catch (e) {
      if (e?.code !== 2) Alert.alert('Payment failed', e?.description || 'Please try again');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.bg} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Support our mission 🙏</Text>
      <Text style={styles.sub}>Your donation helps preserve temple heritage & teach Mridangam.</Text>

      <View style={styles.amountRow}>
        {presetAmounts.map((a) => (
          <TouchableOpacity key={a}
            style={[styles.presetBtn, String(a) === amount && styles.presetBtnActive]}
            onPress={() => setAmount(String(a))}>
            <Text style={[styles.presetText, String(a) === amount && styles.presetTextActive]}>
              ₹{a}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Amount (₹)" placeholderTextColor={colors.textMuted} value={amount} onChangeText={setAmount} keyboardType="number-pad" />
      <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Phone" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={[styles.input, { height: 80 }]} placeholder="Message (optional)" placeholderTextColor={colors.textMuted} value={message} onChangeText={setMessage} multiline />

      <TouchableOpacity style={[styles.cta, { backgroundColor: colors.saffron }]} onPress={payWithRazorpay} disabled={loading}>
        <Icon name="credit-card" size={20} color={colors.white} />
        <Text style={styles.ctaText}>{loading ? 'Processing...' : 'Donate via Razorpay'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.cta, { backgroundColor: '#2e7d32' }]} onPress={openUpi}>
        <Icon name="bank-transfer" size={20} color={colors.white} />
        <Text style={styles.ctaText}>Pay via UPI App</Text>
      </TouchableOpacity>

      {!!cfg.qr_code_url && (
        <View style={styles.qrBox}>
          <Text style={styles.qrTitle}>Or scan UPI QR</Text>
          <Image source={{ uri: cfg.qr_code_url }} style={styles.qr} />
          {!!cfg.upi_id && <Text style={styles.upiId}>{cfg.upi_id}</Text>}
        </View>
      )}

      {/* Policy footer */}
      <View style={styles.policyFooter}>
        <Icon name="information-outline" size={14} color={colors.textMuted} />
        <Text style={styles.policyText}>
          By donating you agree to our{' '}
          <Text style={styles.policyLink} onPress={() => navigation?.navigate?.('Terms')}>
            Terms
          </Text>
          {' '}and{' '}
          <Text style={styles.policyLink} onPress={() => navigation?.navigate?.('RefundPolicy')}>
            Refund Policy
          </Text>
          .
        </Text>
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.text },
  sub: { color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  amountRow: { flexDirection: 'row', marginBottom: 10 },
  presetBtn: {
    flex: 1, paddingVertical: 10, marginRight: 6,
    backgroundColor: colors.card, borderRadius: 8, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  presetBtnActive: { backgroundColor: colors.saffron, borderColor: colors.saffron },
  presetText: { fontWeight: '800', color: colors.text },
  presetTextActive: { color: colors.white },
  input: {
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
    color: colors.text,
  },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 10, marginTop: 8,
  },
  ctaText: { color: colors.white, fontWeight: '800', marginLeft: 8 },
  qrBox: { alignItems: 'center', marginTop: 22, backgroundColor: colors.card, padding: 16, borderRadius: 10 },
  qrTitle: { fontWeight: '800', color: colors.text, marginBottom: 10 },
  qr: { width: 200, height: 200, resizeMode: 'contain' },
  upiId: { color: colors.textMuted, marginTop: 6 },

  policyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 6,
    paddingHorizontal: 8,
  },
  policyText: {
    color: colors.textMuted,
    fontSize: 12,
    marginLeft: 6,
    flexShrink: 1,
    textAlign: 'center',
  },
  policyLink: {
    color: colors.saffron,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
