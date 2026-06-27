import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  StyleSheet, Alert,
} from 'react-native';
import useCategories from '../hooks/useCategories';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };
const COLOR_OPTIONS = [
  '#22c55e','#16a34a','#15803d','#ef4444','#dc2626','#b91c1c','#f97316','#ea580c','#c2410c',
  '#eab308','#ca8a04','#3b82f6','#2563eb','#1d4ed8','#8b5cf6','#7c3aed','#ec4899','#db2777',
  '#6366f1','#14b8a6','#0d9488','#64748b',
];

export default function CategoriesScreen() {
  const { categories, loading, addCategory, updateCategory, deleteCategory } = useCategories();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#6366f1' });
  const [formError, setFormError] = useState('');

  const incomeCats = categories.filter((c) => c.type === 'income');
  const expenseCats = categories.filter((c) => c.type === 'expense');

  function openForm(cat) {
    setFormError('');
    if (cat) {
      setEditing(cat);
      setForm({ name: cat.name, type: cat.type, color: cat.color });
    } else {
      setEditing(null);
      setForm({ name: '', type: 'expense', color: '#6366f1' });
    }
    setModalVisible(true);
  }

  async function handleSave() {
    if (!form.name.trim()) { setFormError('အမျိုးအစား အမည် ထည့်ပါ။'); return; }
    const payload = { name: form.name.trim(), type: form.type, color: form.color };
    if (editing) {
      await updateCategory(editing.id, payload);
    } else {
      await addCategory(payload);
    }
    setModalVisible(false);
  }

  function handleDelete(cat) {
    Alert.alert(`"${cat.name}" ကို ဖျက်မှာ သေချာပါသလား။`, '', [
      { text: 'မလုပ်တော့', style: 'cancel' },
      { text: 'ဖျက်မည်', style: 'destructive', onPress: () => deleteCategory(cat.id) },
    ]);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.heading}>အမျိုးအစားများ</Text>
          <Text style={s.subtitle}>ဝင်ငွေ နှင့် အသုံး အမျိုးအစားများ စီမံရန်</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => openForm(null)}>
          <Text style={s.addBtnText}>+ အသစ်</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={[
          { type: 'header', label: '📥 ဝင်ငွေ' },
          ...incomeCats,
          { type: 'header', label: '📤 အသုံး' },
          ...expenseCats,
        ]}
        keyExtractor={(item, i) => item.id || `h-${i}`}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>{item.label}</Text>
              </View>
            );
          }
          return (
            <View style={s.row}>
              <View style={[s.dot, { backgroundColor: item.color }]} />
              <Text style={s.name}>{item.name}</Text>
              <View style={s.actions}>
                <TouchableOpacity onPress={() => openForm(item)}>
                  <Text style={s.editBtn}>ပြင်ရန်</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)}>
                  <Text style={s.delBtn}>ဖျက်ရန်</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <Text style={s.modalTitle}>{editing ? `ပြင်ဆင်ရန် — ${editing.name}` : 'အမျိုးအစားအသစ်'}</Text>

            <Text style={s.lbl}>အမည်</Text>
            <TextInput style={s.inp} value={form.name} onChangeText={(v) => setForm({ ...form, name: v })}
              placeholder="ဥပမာ — စားသောက်" />

            <Text style={s.lbl}>အမျိုးအစား</Text>
            <View style={s.typeToggle}>
              <TouchableOpacity
                style={[s.typeBtn, form.type === 'expense' && { backgroundColor: COLORS.expense }]}
                onPress={() => setForm({ ...form, type: 'expense' })}
              >
                <Text style={[s.typeText, form.type === 'expense' && { color: 'white' }]}>အသုံး</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.typeBtn, form.type === 'income' && { backgroundColor: COLORS.income }]}
                onPress={() => setForm({ ...form, type: 'income' })}
              >
                <Text style={[s.typeText, form.type === 'income' && { color: 'white' }]}>ဝင်ငွေ</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.lbl}>အရောင်</Text>
            <View style={s.colorPalette}>
              {COLOR_OPTIONS.map((c) => (
                <TouchableOpacity
                  key={c} style={[s.colorBox, { backgroundColor: c }, form.color === c && s.colorActive]}
                  onPress={() => setForm({ ...form, color: c })}
                />
              ))}
            </View>

            {formError ? <Text style={s.err}>{formError}</Text> : null}

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>မလုပ်တော့</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                <Text style={s.saveText}>{editing ? 'သိမ်းမည်' : 'ထည့်မည်'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 2 },
  addBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  addBtnText: { color: 'white', fontSize: 14, fontWeight: '600' },
  sectionHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  name: { flex: 1, fontSize: 15, color: '#111827' },
  actions: { flexDirection: 'row', gap: 12 },
  editBtn: { fontSize: 13, color: COLORS.primary },
  delBtn: { fontSize: 13, color: COLORS.expense },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 16 },
  lbl: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inp: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, marginBottom: 14,
  },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center' },
  typeText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  colorPalette: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  colorBox: { width: 30, height: 30, borderRadius: 6 },
  colorActive: { borderWidth: 2, borderColor: '#111827' },
  err: { color: COLORS.expense, fontSize: 13, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: COLORS.primary, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '600', color: 'white' },
});
