import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, Modal,
  StyleSheet, Alert, RefreshControl,
} from 'react-native';
import useTransactions from '../hooks/useTransactions';
import useCategories from '../hooks/useCategories';
import { formatCurrency, formatDate } from '../utils/format';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };

export default function TransactionsScreen() {
  const { transactions, loading, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const { categories } = useCategories();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ search: '', type: 'all', category: 'all' });
  const [form, setForm] = useState({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== 'all' && tx.type !== filters.type) return false;
      if (filters.category !== 'all' && tx.category !== filters.category) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!(tx.description || '').toLowerCase().includes(q) && !(tx.category || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  const filteredCats = useMemo(
    () => categories.filter((c) => c.type === form.type),
    [categories, form.type]
  );

  function openForm(tx) {
    setFormError('');
    if (tx) {
      setEditing(tx);
      setForm({ type: tx.type, amount: String(tx.amount), category: tx.category, description: tx.description || '', date: tx.date });
    } else {
      setEditing(null);
      setForm({ type: 'expense', amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0] });
    }
    setModalVisible(true);
  }

  async function handleSubmit() {
    setFormError('');
    const amt = Number(form.amount);
    if (!amt || amt < 1) { setFormError('ငွေပမာဏ ထည့်ပါ။'); return; }
    if (!form.category) { setFormError('အမျိုးအစား ရွေးပါ။'); return; }
    if (!form.date) { setFormError('ရက်စွဲ ထည့်ပါ။'); return; }
    const payload = { ...form, amount: amt };
    if (editing) {
      await updateTransaction(editing.id, payload);
    } else {
      await addTransaction(payload);
    }
    setModalVisible(false);
  }

  function handleDelete(id) {
    Alert.alert('ဖျက်မှာသေချာပါသလား?', '', [
      { text: 'မလုပ်တော့', style: 'cancel' },
      { text: 'ဖျက်မည်', style: 'destructive', onPress: () => deleteTransaction(id) },
    ]);
  }

  return (
    <View style={s.container}>
      <View style={s.header}>
        <View>
          <Text style={s.heading}>ငွေလွှဲမှတ်တမ်း</Text>
          <Text style={s.subtitle}>စုစုပေါင်း {transactions.length} ခု</Text>
        </View>
        <TouchableOpacity style={s.addBtn} onPress={() => openForm(null)}>
          <Text style={s.addBtnText}>+ အသစ်</Text>
        </TouchableOpacity>
      </View>

      <View style={s.filters}>
        <TextInput style={s.search} placeholder="ရှာဖွေရန်..." value={filters.search}
          onChangeText={(v) => setFilters({ ...filters, search: v })} />
        <View style={s.filterRow}>
          <TouchableOpacity style={[s.filterChip, filters.type === 'all' && s.filterChipActive]}
            onPress={() => setFilters({ ...filters, type: 'all' })}>
            <Text style={[s.filterChipText, filters.type === 'all' && s.filterChipTextActive]}>အားလုံး</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.filterChip, filters.type === 'income' && s.filterChipActive]}
            onPress={() => setFilters({ ...filters, type: 'income' })}>
            <Text style={[s.filterChipText, filters.type === 'income' && s.filterChipTextActive]}>ဝင်ငွေ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.filterChip, filters.type === 'expense' && s.filterChipActive]}
            onPress={() => setFilters({ ...filters, type: 'expense' })}>
            <Text style={[s.filterChipText, filters.type === 'expense' && s.filterChipTextActive]}>အသုံး</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTransactions} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.row} onPress={() => openForm(item)} onLongPress={() => handleDelete(item.id)}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{item.description || item.category}</Text>
              <Text style={s.rowMeta}>{item.category} · {formatDate(item.date)}</Text>
            </View>
            <Text style={[s.rowAmount, { color: item.type === 'income' ? COLORS.income : COLORS.expense }]}>
              {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📋</Text>
              <Text style={s.emptyText}>မှတ်တမ်း မရှိသေးပါ</Text>
            </View>
          ) : null
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modal}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{editing ? 'ပြင်ဆင်ရန်' : 'အသစ်ထည့်ရန်'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={s.typeToggle}>
              <TouchableOpacity
                style={[s.typeBtn, form.type === 'expense' && { backgroundColor: COLORS.expense }]}
                onPress={() => setForm({ ...form, type: 'expense', category: '' })}
              >
                <Text style={[s.typeText, form.type === 'expense' && { color: 'white' }]}>အသုံး</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.typeBtn, form.type === 'income' && { backgroundColor: COLORS.income }]}
                onPress={() => setForm({ ...form, type: 'income', category: '' })}
              >
                <Text style={[s.typeText, form.type === 'income' && { color: 'white' }]}>ဝင်ငွေ</Text>
              </TouchableOpacity>
            </View>

            <Text style={s.lbl}>ငွေပမာဏ</Text>
            <TextInput style={s.inp} value={form.amount} onChangeText={(v) => setForm({ ...form, amount: v })}
              placeholder="ငွေပမာဏ" keyboardType="numeric" />

            <Text style={s.lbl}>အမျိုးအစား</Text>
            <View style={s.catWrap}>
              {filteredCats.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={[s.catChip, form.category === c.name && { backgroundColor: c.color }]}
                  onPress={() => setForm({ ...form, category: c.name })}
                >
                  <Text style={[s.catChipText, form.category === c.name && { color: 'white' }]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={s.lbl}>မှတ်ချက်</Text>
            <TextInput style={s.inp} value={form.description} onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="ဘာအတွက်လဲ?" />

            <Text style={s.lbl}>ရက်စွဲ</Text>
            <TextInput style={s.inp} value={form.date} onChangeText={(v) => setForm({ ...form, date: v })}
              placeholder="YYYY-MM-DD" />

            {formError ? <Text style={s.err}>{formError}</Text> : null}

            <View style={s.modalActions}>
              <TouchableOpacity style={s.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={s.cancelText}>မလုပ်တော့</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.saveBtn, { backgroundColor: form.type === 'income' ? COLORS.income : COLORS.expense }]} onPress={handleSubmit}>
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
  filters: { paddingHorizontal: 16, marginBottom: 8 },
  search: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 8, fontSize: 14, backgroundColor: 'white', marginBottom: 8,
  },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb' },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  filterChipTextActive: { color: 'white' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  rowTitle: { fontSize: 15, fontWeight: '500', color: '#111827' },
  rowMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#9ca3af' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
  modalClose: { fontSize: 20, color: '#9ca3af' },
  typeToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center' },
  typeText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  lbl: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  inp: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, marginBottom: 14,
  },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#e5e7eb' },
  catChipText: { fontSize: 13, color: '#374151' },
  err: { color: COLORS.expense, fontSize: 13, marginBottom: 12 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#e5e7eb', alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '500', color: '#374151' },
  saveBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { fontSize: 14, fontWeight: '600', color: 'white' },
});
