import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../store/AuthContext';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };

export default function LoginScreen() {
  const { signIn, signUp } = useAuth();
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (cooldown > 0) {
      timer.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
      return () => clearTimeout(timer.current);
    }
  }, [cooldown]);

  function isRateLimit(msg) {
    const m = (msg || '').toLowerCase();
    return m.includes('rate limit') || m.includes('too many') || m.includes('429');
  }

  function translateError(msg) {
    const m = (msg || '').toLowerCase();
    if (m.includes('invalid login credentials') || m.includes('invalid_credentials'))
      return 'အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။';
    if (m.includes('already registered') || m.includes('already exists'))
      return 'ဤအီးမေးလ်ဖြင့် မှတ်ပုံတင်ပြီးသား ဖြစ်ပါသည်။';
    if (m.includes('email not confirmed'))
      return 'အီးမေးလ် အတည်မပြုရသေးပါ။';
    if (isRateLimit(m))
      return 'ကြိုးစားမှု များလွန်းပါသည်။ ၆၀ စက္ကန့် စောင့်ပါ။';
    if (m.includes('weak password'))
      return 'စကားဝှက် အားနည်းပါသည်။';
    return msg || 'တစ်ခုခု မှားယွင်းနေပါသည်။';
  }

  async function onLogin() {
    setServerError(''); setServerSuccess('');
    if (!email) { setServerError('အီးမေးလ် ထည့်ပါ။'); return; }
    if (!password) { setServerError('စကားဝှက် ထည့်ပါ။'); return; }
    setSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setServerError(translateError(error.message));
        if (isRateLimit(error.message)) setCooldown(60);
      }
    } catch {
      setServerError('အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပါ။');
    } finally {
      setSubmitting(false);
    }
  }

  async function onRegister() {
    setServerError(''); setServerSuccess('');
    if (password !== confirmPassword) { setServerError('စကားဝှက်နှစ်ခု မတူညီပါ။'); return; }
    if (password.length < 6) { setServerError('စကားဝှက် အနည်းဆုံး ၆ လုံး။'); return; }
    setSubmitting(true);
    try {
      const { data, error } = await signUp(email, password, { full_name: name });
      if (error) {
        setServerError(translateError(error.message));
        if (isRateLimit(error.message)) setCooldown(60);
        return;
      }
      if (data?.session) return;
      setServerSuccess('မှတ်ပုံတင်ပြီးပါပြီ။ အီးမေးလ် စစ်ဆေးပါ။');
      setTab('login');
    } catch {
      setServerError('အင်တာနက်ချိတ်ဆက်မှု စစ်ဆေးပါ။');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.logoWrap}>
          <View style={s.logo}>
            <Text style={s.logoText}>IE</Text>
          </View>
          <Text style={s.title}>Income Expense</Text>
          <Text style={s.subtitle}>ဝင်ငွေ / အသုံးစာရင်း မှတ်တမ်း</Text>
        </View>

        <View style={s.card}>
          <View style={s.tabs}>
            <TouchableOpacity
              style={[s.tab, tab === 'login' && s.tabActive]}
              onPress={() => { setTab('login'); setServerError(''); setServerSuccess(''); }}
            >
              <Text style={[s.tabText, tab === 'login' && s.tabTextActive]}>ဝင်ရန်</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.tab, tab === 'register' && s.tabActive]}
              onPress={() => { setTab('register'); setServerError(''); setServerSuccess(''); }}
            >
              <Text style={[s.tabText, tab === 'register' && s.tabTextActive]}>မှတ်ပုံတင်ရန်</Text>
            </TouchableOpacity>
          </View>

          {serverError ? <View style={s.errBox}><Text style={s.errText}>{serverError}</Text></View> : null}
          {serverSuccess ? <View style={s.okBox}><Text style={s.okText}>{serverSuccess}</Text></View> : null}

          {tab === 'login' ? (
            <View style={s.form}>
              <Text style={s.label}>အီးမေးလ်</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail}
                placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Text style={s.label}>စကားဝှက်</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                placeholder="••••••••" secureTextEntry />
              <TouchableOpacity
                style={[s.btn, (cooldown > 0 || submitting) && s.btnDisabled]}
                onPress={onLogin}
                disabled={cooldown > 0 || submitting}
              >
                <Text style={s.btnText}>
                  {cooldown > 0 ? `${cooldown} စက္ကန့် စောင့်ပါ...` : submitting ? 'ခေတ္တစောင့်ပါ...' : 'ဝင်ရန်'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={s.form}>
              <Text style={s.label}>အမည်</Text>
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="မောင်မောင်" />
              <Text style={s.label}>အီးမေးလ်</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail}
                placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Text style={s.label}>စကားဝှက်</Text>
              <TextInput style={s.input} value={password} onChangeText={setPassword}
                placeholder="အနည်းဆုံး ၆ လုံး" secureTextEntry />
              <Text style={s.label}>စကားဝှက် အတည်ပြုရန်</Text>
              <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword}
                placeholder="စကားဝှက်ကို ပြန်ရိုက်ပါ" secureTextEntry />
              <TouchableOpacity
                style={[s.btn, s.btnRegister, (cooldown > 0 || submitting) && s.btnDisabled]}
                onPress={onRegister}
                disabled={cooldown > 0 || submitting}
              >
                <Text style={s.btnText}>
                  {cooldown > 0 ? `${cooldown} စက္ကန့် စောင့်ပါ...` : submitting ? 'ခေတ္တစောင့်ပါ...' : 'မှတ်ပုံတင်ရန်'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={s.footer}>Income Expense App v1.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 16, paddingVertical: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 56, height: 56, borderRadius: 16, backgroundColor: COLORS.income,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  logoText: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000',
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '500', color: '#6b7280' },
  tabTextActive: { color: COLORS.primary },
  errBox: { margin: 16, marginBottom: 0, padding: 12, backgroundColor: '#fef2f2',
    borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
  errText: { color: '#b91c1c', fontSize: 13 },
  okBox: { margin: 16, marginBottom: 0, padding: 12, backgroundColor: '#f0fdf4',
    borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  okText: { color: '#15803d', fontSize: 13 },
  form: { padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, color: '#111827', marginBottom: 14,
  },
  btn: {
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 8,
    alignItems: 'center', marginTop: 4,
  },
  btnRegister: { backgroundColor: COLORS.income },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: 'white', fontSize: 16, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 24 },
});
