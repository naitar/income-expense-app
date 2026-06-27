import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import useTransactions from '../hooks/useTransactions';
import { formatCurrency, formatDate } from '../utils/format';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };

export default function DashboardScreen({ navigation }) {
  const { transactions, loading, fetchTransactions } = useTransactions();

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const recent = useMemo(() => transactions.slice(0, 5), [transactions]);

  return (
    <FlatList
      data={recent}
      keyExtractor={(item) => item.id}
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchTransactions} />}
      ListHeaderComponent={
        <View>
          <Text style={s.heading}>Dashboard</Text>
          <Text style={s.subtitle}>ဝင်ငွေ နှင့် အသုံးစာရင်း ခြုံငုံကြည့်ရှုရန်</Text>

          <View style={s.cards}>
            <View style={[s.card, s.cardGreen]}>
              <Text style={s.cardIcon}>📥</Text>
              <Text style={s.cardLabel}>စုစုပေါင်း ဝင်ငွေ</Text>
              <Text style={[s.cardAmount, { color: COLORS.income }]}>{formatCurrency(totals.income)}</Text>
            </View>
            <View style={[s.card, s.cardRed]}>
              <Text style={s.cardIcon}>📤</Text>
              <Text style={s.cardLabel}>စုစုပေါင်း အသုံး</Text>
              <Text style={[s.cardAmount, { color: COLORS.expense }]}>{formatCurrency(totals.expense)}</Text>
            </View>
            <View style={[s.card, s.cardBlue]}>
              <Text style={s.cardIcon}>💰</Text>
              <Text style={s.cardLabel}>လက်ကျန်</Text>
              <Text style={[s.cardAmount, { color: totals.balance >= 0 ? COLORS.income : COLORS.expense }]}>
                {formatCurrency(totals.balance)}
              </Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>နောက်ဆုံး ငွေလွှဲမှတ်တမ်းများ</Text>
          {recent.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyIcon}>📝</Text>
              <Text style={s.emptyText}>ငွေလွှဲမှတ်တမ်း မရှိသေးပါ</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('Transactions')}>
                <Text style={s.emptyBtnText}>မှတ်တမ်းထည့်ရန်</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      }
      renderItem={({ item }) => (
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.rowTitle}>{item.description || item.category}</Text>
            <Text style={s.rowMeta}>{item.category} · {formatDate(item.date)}</Text>
          </View>
          <Text style={[s.rowAmount, { color: item.type === 'income' ? COLORS.income : COLORS.expense }]}>
            {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>
      )}
      ListFooterComponent={
        transactions.length > 5 ? (
          <TouchableOpacity style={s.viewAll} onPress={() => navigation.navigate('Transactions')}>
            <Text style={s.viewAllText}>မှတ်တမ်းအားလုံး ကြည့်ရန် →</Text>
          </TouchableOpacity>
        ) : null
      }
    />
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  cards: { gap: 12 },
  card: { borderRadius: 12, padding: 16, marginBottom: 0 },
  cardGreen: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  cardRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  cardBlue: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  cardIcon: { fontSize: 20, marginBottom: 8 },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardAmount: { fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginTop: 24, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyIcon: { fontSize: 32, marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 12 },
  emptyBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  emptyBtnText: { color: 'white', fontSize: 14, fontWeight: '500' },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: 1, borderColor: '#f3f4f6',
  },
  rowTitle: { fontSize: 14, fontWeight: '500', color: '#111827' },
  rowMeta: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rowAmount: { fontSize: 14, fontWeight: '600' },
  viewAll: { paddingVertical: 16, alignItems: 'center' },
  viewAllText: { fontSize: 14, color: COLORS.primary, fontWeight: '500' },
});
