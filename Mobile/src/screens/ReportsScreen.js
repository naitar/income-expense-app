import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import useTransactions from '../hooks/useTransactions';
import useCategories from '../hooks/useCategories';
import { formatCurrency } from '../utils/format';

const COLORS = { income: '#16a34a', expense: '#ef4444', primary: '#2563eb' };
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#a855f7', '#64748b', '#f59e0b'];
const screenW = Dimensions.get('window').width - 32;

function BarChartView({ incomeData, expenseData, labels, maxVal }) {
  const barCount = labels.length;
  const chartH = 180;
  const barAreaH = chartH - 30;
  const barGroupW = (screenW - 32) / barCount;
  const barW = Math.max(4, (barGroupW - 8) / 2);

  return (
    <View style={{ paddingVertical: 8 }}>
      <View style={{ height: chartH, flexDirection: 'row', alignItems: 'flex-end', paddingBottom: 20 }}>
        {labels.map((label, i) => {
          const inH = maxVal > 0 ? (incomeData[i] / maxVal) * barAreaH : 0;
          const exH = maxVal > 0 ? (expenseData[i] / maxVal) * barAreaH : 0;
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
                <View style={{ width: barW, height: Math.max(2, inH), backgroundColor: COLORS.income, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
                <View style={{ width: barW, height: Math.max(2, exH), backgroundColor: COLORS.expense, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
              </View>
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {labels.map((label, i) => (
          <Text key={i} style={bt.barLabel}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

function PieChartView({ data, total, colorKey }) {
  if (!data || data.length === 0) return null;
  return (
    <View style={{ gap: 6 }}>
      {data.map((item, i) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <View key={i} style={pt.row}>
            <View style={[pt.dot, { backgroundColor: item.color }]} />
            <Text style={pt.name} numberOfLines={1}>{item.name}</Text>
            <View style={{ flex: 1 }}>
              <View style={pt.barTrack}>
                <View style={[pt.barFill, { width: `${pct}%`, backgroundColor: item.color }]} />
              </View>
            </View>
            <Text style={pt.pct}>{pct}%</Text>
            <Text style={pt.val}>{formatCurrency(item.value)}</Text>
          </View>
        );
      })}
    </View>
  );
}

export default function ReportsScreen() {
  const { transactions, fetchTransactions } = useTransactions();
  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const labels = ['ဇန်', 'ဖေ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူ', 'သြ', 'စက်', 'အောက်', 'နို', 'ဒီ'];
    const incomeArr = new Array(12).fill(0);
    const expenseArr = new Array(12).fill(0);
    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00');
      if (isNaN(d.getTime())) return;
      const idx = d.getMonth();
      if (idx >= 0 && idx < 12) {
        if (t.type === 'income') incomeArr[idx] += t.amount;
        else expenseArr[idx] += t.amount;
      }
    });
    const maxVal = Math.max(1, ...incomeArr, ...expenseArr);
    return { labels, incomeArr, expenseArr, maxVal };
  }, [transactions]);

  const buildPieData = (type) => {
    const map = {};
    transactions.filter((t) => t.type === type).forEach((t) => {
      const cat = t.category || 'အခြား';
      map[cat] = (map[cat] || 0) + t.amount;
    });
    if (!categories || categories.length === 0) {
      return Object.entries(map).map(([name, value], i) => ({
        name: name.length > 10 ? name.slice(0, 10) + '…' : name,
        value,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }));
    }
    const colorMap = {};
    categories.forEach((c) => {
      if (c && c.name) colorMap[c.name] = c.color || PIE_COLORS[0];
    });
    return Object.entries(map).map(([name, value], i) => ({
      name: name.length > 10 ? name.slice(0, 10) + '…' : name,
      value,
      color: colorMap[name] || PIE_COLORS[i % PIE_COLORS.length],
    }));
  };

  const expenseByCat = useMemo(() => buildPieData('expense'), [transactions, categories]);
  const incomeByCat = useMemo(() => buildPieData('income'), [transactions, categories]);
  const expenseTotal = useMemo(() => expenseByCat.reduce((s, e) => s + e.value, 0), [expenseByCat]);
  const incomeTotal = useMemo(() => incomeByCat.reduce((s, e) => s + e.value, 0), [incomeByCat]);

  const hasTransactions = transactions.length > 0;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>အစီရင်ခံစာ</Text>
      <Text style={s.subtitle}>ဝင်ငွေ နှင့် အသုံးစာရင်း ကိန်းဂဏန်းများ</Text>

      <View style={s.cards}>
        <View style={[s.card, s.cardGreen]}>
          <Text style={s.cardIcon}>📥</Text>
          <Text style={s.cardLabel}>စုစုပေါင်း ဝင်ငွေ</Text>
          <Text style={[s.cardVal, { color: COLORS.income }]}>{formatCurrency(totals.income)}</Text>
        </View>
        <View style={[s.card, s.cardRed]}>
          <Text style={s.cardIcon}>📤</Text>
          <Text style={s.cardLabel}>စုစုပေါင်း အသုံး</Text>
          <Text style={[s.cardVal, { color: COLORS.expense }]}>{formatCurrency(totals.expense)}</Text>
        </View>
        <View style={[s.card, s.cardBlue]}>
          <Text style={s.cardIcon}>💰</Text>
          <Text style={s.cardLabel}>လက်ကျန်</Text>
          <Text style={[s.cardVal, { color: totals.balance >= 0 ? COLORS.income : COLORS.expense }]}>
            {formatCurrency(totals.balance)}
          </Text>
        </View>
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>လစဉ် ဝင်ငွေ / အသုံး</Text>
        <View style={s.legendRow}>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: COLORS.income }]} />
            <Text style={s.legendText}>ဝင်ငွေ</Text>
          </View>
          <View style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: COLORS.expense }]} />
            <Text style={s.legendText}>အသုံး</Text>
          </View>
        </View>
        {hasTransactions ? (
          <BarChartView
            incomeData={monthlyData.incomeArr}
            expenseData={monthlyData.expenseArr}
            labels={monthlyData.labels}
            maxVal={monthlyData.maxVal}
          />
        ) : (
          <View style={s.emptyChart}>
            <Text style={s.emptyText}>အချက်အလက် မရှိသေးပါ</Text>
            <Text style={s.emptySub}>ငွေလွှဲမှတ်တမ်းများ ထည့်ပြီးပါက ဤနေရာတွင် ဂရပ်များ မြင်ရပါမည်</Text>
          </View>
        )}
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>အသုံး အမျိုးအစားအလိုက်</Text>
        <Text style={s.chartSub}>စုစုပေါင်း: {formatCurrency(expenseTotal)}</Text>
        {expenseByCat.length > 0 ? (
          <PieChartView data={expenseByCat} total={expenseTotal} />
        ) : (
          <View style={s.emptyChart}>
            <Text style={s.emptyText}>အသုံးစာရင်း မရှိသေးပါ</Text>
          </View>
        )}
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>ဝင်ငွေ အမျိုးအစားအလိုက်</Text>
        <Text style={s.chartSub}>စုစုပေါင်း: {formatCurrency(incomeTotal)}</Text>
        {incomeByCat.length > 0 ? (
          <PieChartView data={incomeByCat} total={incomeTotal} />
        ) : (
          <View style={s.emptyChart}>
            <Text style={s.emptyText}>ဝင်ငွေစာရင်း မရှိသေးပါ</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  cards: { gap: 10, marginBottom: 20 },
  card: { borderRadius: 12, padding: 16 },
  cardGreen: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  cardRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  cardBlue: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  cardIcon: { fontSize: 20, marginBottom: 6 },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardVal: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  chartCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  chartSub: { fontSize: 12, color: '#9ca3af', marginBottom: 12 },
  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: '#6b7280' },
  emptyChart: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: '#9ca3af', fontSize: 14, marginBottom: 4 },
  emptySub: { color: '#d1d5db', fontSize: 12 },
});

const bt = StyleSheet.create({
  barLabel: { flex: 1, textAlign: 'center', fontSize: 8, color: '#9ca3af', marginTop: 4 },
});

const pt = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  name: { fontSize: 13, color: '#374151', width: 80, flexShrink: 0 },
  barTrack: { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  pct: { fontSize: 12, color: '#6b7280', width: 34, textAlign: 'right', flexShrink: 0 },
  val: { fontSize: 12, fontWeight: '600', color: '#111827', width: 90, textAlign: 'right', flexShrink: 0 },
});
