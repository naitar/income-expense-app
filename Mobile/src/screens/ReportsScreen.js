import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import useTransactions from '../hooks/useTransactions';
import useCategories from '../hooks/useCategories';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { formatCurrency } from '../utils/format';

const COLORS = { income: '#16a34a', expense: '#ef4444' };
const CHART_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#64748b'];
const screenW = Dimensions.get('window').width - 32;

export default function ReportsScreen() {
  const { transactions, fetchTransactions } = useTransactions();
  const { categories } = useCategories();

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = ['ဇန်', 'ဖေ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူ', 'သြ', 'စက်', 'အောက်', 'နို', 'ဒီ'];
    const data = months.map((m, i) => ({ month: m, income: 0, expense: 0 }));
    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00');
      const idx = d.getMonth();
      if (t.type === 'income') data[idx].income += t.amount;
      else data[idx].expense += t.amount;
    });
    return data;
  }, [transactions]);

  const expenseByCat = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'expense').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const colorMap = {};
    categories.forEach((c) => { colorMap[c.name] = c.color; });
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: colorMap[name] || CHART_COLORS[i % CHART_COLORS.length],
      legendFontColor: '#6b7280', legendFontSize: 12,
    }));
  }, [transactions, categories]);

  const incomeByCat = useMemo(() => {
    const map = {};
    transactions.filter((t) => t.type === 'income').forEach((t) => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const colorMap = {};
    categories.forEach((c) => { colorMap[c.name] = c.color; });
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: colorMap[name] || CHART_COLORS[i % CHART_COLORS.length],
      legendFontColor: '#6b7280', legendFontSize: 12,
    }));
  }, [transactions, categories]);

  const barData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      { data: monthlyData.map((m) => m.income) },
      { data: monthlyData.map((m) => m.expense) },
    ],
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.heading}>အစီရင်ခံစာ</Text>
      <Text style={s.subtitle}>ဝင်ငွေ နှင့် အသုံးစာရင်း ကိန်းဂဏန်းများ</Text>

      <View style={s.cards}>
        <View style={[s.card, s.cardGreen]}>
          <Text style={s.cardLabel}>စုစုပေါင်း ဝင်ငွေ</Text>
          <Text style={[s.cardVal, { color: COLORS.income }]}>{formatCurrency(totals.income)}</Text>
        </View>
        <View style={[s.card, s.cardRed]}>
          <Text style={s.cardLabel}>စုစုပေါင်း အသုံး</Text>
          <Text style={[s.cardVal, { color: COLORS.expense }]}>{formatCurrency(totals.expense)}</Text>
        </View>
        <View style={[s.card, s.cardBlue]}>
          <Text style={s.cardLabel}>လက်ကျန်</Text>
          <Text style={[s.cardVal, { color: totals.balance >= 0 ? COLORS.income : COLORS.expense }]}>
            {formatCurrency(totals.balance)}
          </Text>
        </View>
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>လစဉ် ဝင်ငွေ / အသုံး</Text>
        {transactions.length > 0 ? (
          <BarChart
            data={barData}
            width={screenW}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: '#fff', backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
              decimalCount: 0, color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: () => '#6b7280', barPercentage: 0.5,
            }}
            style={{ borderRadius: 8 }}
          />
        ) : (
          <Text style={s.noData}>အချက်အလက် မရှိသေးပါ</Text>
        )}
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>အသုံး အမျိုးအစားအလိုက်</Text>
        {expenseByCat.length > 0 ? (
          <PieChart data={expenseByCat} width={screenW} height={200}
            accessor="value" backgroundColor="transparent" paddingLeft="0" absolute />
        ) : (
          <Text style={s.noData}>အသုံးစာရင်း မရှိသေးပါ</Text>
        )}
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>ဝင်ငွေ အမျိုးအစားအလိုက်</Text>
        {incomeByCat.length > 0 ? (
          <PieChart data={incomeByCat} width={screenW} height={200}
            accessor="value" backgroundColor="transparent" paddingLeft="0" absolute />
        ) : (
          <Text style={s.noData}>ဝင်ငွေစာရင်း မရှိသေးပါ</Text>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, marginBottom: 20 },
  cards: { gap: 10, marginBottom: 20 },
  card: { borderRadius: 12, padding: 16 },
  cardGreen: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  cardRed: { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca' },
  cardBlue: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  cardLabel: { fontSize: 13, color: '#6b7280' },
  cardVal: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  chartCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  noData: { textAlign: 'center', color: '#9ca3af', paddingVertical: 24, fontSize: 14 },
});
