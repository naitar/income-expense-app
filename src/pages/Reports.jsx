import { useEffect, useMemo, useState } from 'react'
import useTransactions from '@/hooks/useTransactions'
import useCategories from '@/hooks/useCategories'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/utils/format'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// ── Chart colors ─────────────────────────────────────────────
const INCOME_COLOR = '#16a34a'
const EXPENSE_COLOR = '#ef4444'
const BALANCE_COLOR = '#2563eb'
const PIE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6', '#64748b',
  '#f43f5e', '#fb923c',
]

// ── Myanmar month names ─────────────────────────────────────
const MM_MONTHS = ['ဇန်', 'ဖေ', 'မတ်', 'ဧပြီ', 'မေ', 'ဇွန်', 'ဇူ', 'သြ', 'စက်', 'အောက်', 'နို', 'ဒီ']

function Reports() {
  const { transactions, fetchTransactions } = useTransactions()
  const { categories } = useCategories()

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // ── Get available years from transactions ──────────────────
  const availableYears = useMemo(() => {
    const years = new Set()
    transactions.forEach((t) => {
      const y = new Date(t.date + 'T00:00:00').getFullYear()
      years.add(y)
    })
    // always include current year
    years.add(new Date().getFullYear())
    return [...years].sort((a, b) => b - a)
  }, [transactions])

  // ── Monthly summary ────────────────────────────────────────
  const monthlyData = useMemo(() => {
    // Initialize all 12 months with 0
    const months = MM_MONTHS.map((name, i) => ({
      month: name,
      monthIdx: i,
      income: 0,
      expense: 0,
    }))

    transactions.forEach((t) => {
      const d = new Date(t.date + 'T00:00:00')
      if (d.getFullYear() !== selectedYear) return
      const idx = d.getMonth()
      if (t.type === 'income') months[idx].income += t.amount
      else months[idx].expense += t.amount
    })

    return months
  }, [transactions, selectedYear])

  // ── Totals ─────────────────────────────────────────────────
  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    return { income, expense, balance: income - expense }
  }, [transactions])

  // ── Expense by category ────────────────────────────────────
  const expenseByCategory = useMemo(() => {
    const map = {}
    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })

    // Build color map from categories
    const colorMap = {}
    categories.forEach((c) => { colorMap[c.name] = c.color })

    return Object.entries(map)
      .map(([name, value]) => ({ name, value, fill: colorMap[name] || '#ef4444' }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // ── Income by category ─────────────────────────────────────
  const incomeByCategory = useMemo(() => {
    const map = {}
    transactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount
      })

    const colorMap = {}
    categories.forEach((c) => { colorMap[c.name] = c.color })

    return Object.entries(map)
      .map(([name, value]) => ({ name, value, fill: colorMap[name] || '#16a34a' }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, categories])

  // ── Custom tooltip ─────────────────────────────────────────
  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-medium text-gray-900">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  // ── Pie tooltip ────────────────────────────────────────────
  function PieTooltip({ active, payload }) {
    if (!active || !payload?.length) return null
    const d = payload[0]
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.payload.fill }} />
          <span className="text-gray-600">{d.name}:</span>
          <span className="font-medium text-gray-900">{formatCurrency(d.value)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">အစီရင်ခံစာ</h1>
        <p className="text-gray-500 mt-1">ဝင်ငွေ နှင့် အသုံးစာရင်း ကိန်းဂဏန်းများ</p>
      </div>

      {/* ── Summary cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">📥</div>
            <div>
              <p className="text-sm text-gray-500">စုစုပေါင်း ဝင်ငွေ</p>
              <p className="text-2xl font-bold text-income">{formatCurrency(totals.income)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">📤</div>
            <div>
              <p className="text-sm text-gray-500">စုစုပေါင်း အသုံး</p>
              <p className="text-2xl font-bold text-expense">{formatCurrency(totals.expense)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">💰</div>
            <div>
              <p className="text-sm text-gray-500">လက်ကျန်</p>
              <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Monthly bar chart ────────────────────────────────── */}
      <Card
        title="လစဉ် ဝင်ငွေ / အသုံး"
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            {availableYears.map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  y === selectedYear
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        }
      >
        {transactions.length === 0 ? (
          <EmptyChart text="အချက်အလက်များ ထည့်သွင်းပြီးပါက ဤနေရာတွင် ဇယား ပေါ်လာပါမည်။" />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={4} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                  tickFormatter={(v) => v >= 100000 ? `${(v / 100000).toFixed(1)}L` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="income" name="ဝင်ငွေ" fill={INCOME_COLOR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="အသုံး" fill={EXPENSE_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Pie charts row ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expense by category */}
        <Card title="အသုံး အမျိုးအစားအလိုက်" subtitle={expenseByCategory.length === 0 ? 'အချက်အလက်များ ထည့်သွင်းပါ။' : undefined}>
          {expenseByCategory.length === 0 ? (
            <EmptyChart text="အသုံးစာရင်း မရှိသေးပါ။" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {expenseByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => (
                      <span className="text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Income by category */}
        <Card title="ဝင်ငွေ အမျိုးအစားအလိုက်" subtitle={incomeByCategory.length === 0 ? 'အချက်အလက်များ ထည့်သွင်းပါ။' : undefined}>
          {incomeByCategory.length === 0 ? (
            <EmptyChart text="ဝင်ငွေစာရင်း မရှိသေးပါ။" />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                  >
                    {incomeByCategory.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill || PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    wrapperStyle={{ fontSize: 12 }}
                    formatter={(value) => (
                      <span className="text-gray-700">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// ── Empty state ─────────────────────────────────────────────────

function EmptyChart({ text }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center">
      <div className="text-3xl mb-2">📊</div>
      <p className="text-sm text-gray-400 max-w-xs">{text}</p>
    </div>
  )
}

export default Reports
