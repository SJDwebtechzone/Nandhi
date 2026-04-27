import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Events } from '../services/api';
import { useTheme } from '../theme/ThemeContext';

export default function EventDetailScreen({ route }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { event } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const register = async () => {
    if (!name.trim()) return Alert.alert('Please enter your name');
    setSubmitting(true);
    try {
      await Events.register(event.id, { name, email, phone });
      Alert.alert('Registered!', 'We will be in touch.');
    } catch (e) {
      Alert.alert('Could not register', 'Please try again later.');
    } finally { setSubmitting(false); }
  };

  return (
    <ScrollView style={styles.bg}>
      {!!event.image_url && <Image source={{ uri: event.image_url }} style={styles.hero} />}
      <View style={styles.body}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.meta}>
          {new Date(event.start_date).toLocaleString()} {event.location ? ` • ${event.location}` : ''}
        </Text>
        {!!event.description && <Text style={styles.desc}>{event.description}</Text>}

        {event.registration_required && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Register</Text>
            <TextInput placeholder="Your name" placeholderTextColor={colors.textMuted} value={name} onChangeText={setName} style={styles.input} />
            <TextInput placeholder="Email" placeholderTextColor={colors.textMuted} value={email} onChangeText={setEmail} style={styles.input}
              keyboardType="email-address" autoCapitalize="none" />
            <TextInput placeholder="Phone" placeholderTextColor={colors.textMuted} value={phone} onChangeText={setPhone} style={styles.input}
              keyboardType="phone-pad" />
            <TouchableOpacity style={styles.btn} onPress={register} disabled={submitting}>
              <Text style={styles.btnText}>{submitting ? 'Submitting...' : 'Register'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const makeStyles = (colors) => StyleSheet.create({
  bg: { backgroundColor: colors.bg, flex: 1 },
  hero: { width: '100%', height: 200, backgroundColor: colors.cream },
  body: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  meta: { color: colors.textMuted, marginTop: 4 },
  desc: { color: colors.text, lineHeight: 20, marginTop: 12 },
  form: { marginTop: 24, backgroundColor: colors.card, padding: 14, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border },
  formTitle: { fontWeight: '800', color: colors.text, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 10,
    color: colors.text },
  btn: { backgroundColor: colors.saffron, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnText: { color: colors.white, fontWeight: '800' },
});
