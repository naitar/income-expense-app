import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../store/AuthContext';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuth();
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  async function saveProfile() {
    setProfileMsg(''); setProfileError(false); setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (error) throw error;
      setProfileMsg('ပရိုဖိုင်း သိမ်းဆည်းပြီးပါပြီ။');
    } catch (err) {
      setProfileMsg('တစ်ခုခု မှားယွင်းနေပါသည်။'); setProfileError(true);
    } finally { setSaving(false); }
  }

  async function changePassword() {
    setPwMsg(''); setPwError(false);
    if (newPw !== confirmPw) { setPwMsg('စကားဝှက်နှစ်ခု မတူညီပါ။'); setPwError(true); return; }
    if (newPw.length < 6) { setPwMsg('အနည်းဆုံး ၆ လုံး ထည့်ပါ။'); setPwError(true); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      setPwMsg('စကားဝှက် ပြောင်းပြီးပါပြီ။');
      setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwMsg('စကားဝှက် ပြောင်း၍မရပါ။'); setPwError(true);
    } finally { setPwSaving(false); }
  }

  async function handleLogout() {
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>ဆက်တင်များ</Text>
      <Text style={s.subtitle}>ပရိုဖိုင်း နှင့် စကားဝှက် ပြင်ဆင်ရန်</Text>

      <View style={s.card}>
        <Text style={s.cardTitle}>ပရိုဖိုင်း</Text>
        {profileMsg ? (
          <View style={[s.msgBox, profileError ? s.msgErr : s.msgOk]}>
            <Text style={[s.msgText, profileError ? s.msgErrText : s.msgOkText]}>{profileMsg}</Text>
          </View>
        ) : null}
        <Text style={s.lbl}>အမည်</Text>
        <TextInput style={s.inp} value={name} onChangeText={setName} placeholder="သင့်အမည်" />
        <Text style={s.lbl}>အီးမေးလ်</Text>
        <TextInput style={[s.inp, s.inpDisabled]} value={user?.email || ''} editable={false} />
        <TouchableOpacity style={[s.btn, saving && s.btnDisabled]} onPress={saveProfile} disabled={saving}>
          <Text style={s.btnText}>{saving ? 'သိမ်းဆည်းနေသည်...' : 'သိမ်းဆည်းမည်'}</Text>
        </TouchableOpacity>
      </View>

      <View style={s.card}>
        <Text style={s.cardTitle}>စကားဝှက် ပြောင်းရန်</Text>
        {pwMsg ? (
          <View style={[s.msgBox, pwError ? s.msgErr : s.msgOk]}>
            <Text style={[s.msgText, pwError ? s.msgErrText : s.msgOkText]}>{pwMsg}</Text>
          </View>
        ) : null}
        <Text style={s.lbl}>စကားဝှက် အသစ်</Text>
        <TextInput style={s.inp} value={newPw} onChangeText={setNewPw} placeholder="အနည်းဆုံး ၆ လုံး" secureTextEntry />
        <Text style={s.lbl}>စကားဝှက် အတည်ပြုရန်</Text>
        <TextInput style={s.inp} value={confirmPw} onChangeText={setConfirmPw} placeholder="ပြန်ရိုက်ပါ" secureTextEntry />
        <TouchableOpacity style={[s.btn, s.btnOutline, pwSaving && s.btnDisabled]} onPress={changePassword} disabled={pwSaving}>
          <Text style={[s.btnText, s.btnOutlineText]}>{pwSaving ? 'ပြောင်းနေသည်...' : 'စကားဝှက် ပြောင်းမည်'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <Text style={s.logoutText}>ထွက်ရန်</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 14 },
  msgBox: { padding: 10, borderRadius: 8, marginBottom: 12 },
  msgErr: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  msgOk: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  msgText: { fontSize: 13 },
  msgErrText: { color: '#b91c1c' },
  msgOkText: { color: '#15803d' },
  lbl: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inp: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, marginBottom: 14, color: '#111827',
  },
  inpDisabled: { backgroundColor: '#f3f4f6', color: '#9ca3af' },
  btn: { backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  btnOutline: { backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db' },
  btnOutlineText: { color: '#374151' },
  logoutBtn: {
    backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca',
    paddingVertical: 14, borderRadius: 8, alignItems: 'center',
  },
  logoutText: { color: COLORS.expense, fontSize: 15, fontWeight: '600' },
});
