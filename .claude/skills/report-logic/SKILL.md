# Skill: report-logic

## Purpose
Monthly summary, category breakdown, Recharts data format
တွေ define ထားသည်။

## When to use
- Dashboard summary cards ရေးသောအခါ
- Chart components ရေးသောအခါ
- useReport hook ရေးသောအခါ

## Summary Calculation
income  = transactions.filter(t => t.type==='income').reduce(sum)
expense = transactions.filter(t => t.type==='expense').reduce(sum)
balance = income - expense

## Monthly Bar Chart Data Format
[
  { month: 'ဇန်', income: 500000, expense: 320000 },
  { month: 'ဖေ',  income: 480000, expense: 290000 },
]

## Category Pie Chart Data Format
[
  { name: 'ထမင်းစားခ', value: 150000, color: '#f97316' },
  { name: 'သယ်ယူပို့ဆောင်', value: 80000, color: '#3b82f6' },
]

## Chart Colors
income:  '#16a34a'
expense: '#ef4444'
balance: '#2563eb'