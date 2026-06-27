import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useTransactions from '@/hooks/useTransactions'
import { Card, Button, LoadingSpinner, EmptyState } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils/format'

function Dashboard() {
  const { transactions, loading, fetchTransactions } = useTransactions()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    return {
      income,
      expense,
      balance: income - expense,
      count: transactions.length,
    }
  }, [transactions])

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5)
  }, [transactions])

  if (loading && transactions.length === 0) {
    return <LoadingSpinner fullPage text="ခေတ္တစောင့်ပါ..." />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">ဝင်ငွေ နှင့် အသုံးစာရင်း ခြုံငုံကြည့်ရှုရန်</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📥</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">စုစုပေါင်း ဝင်ငွေ</p>
              <p className="text-xl sm:text-2xl font-bold text-income truncate">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">📤</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">စုစုပေါင်း အသုံး</p>
              <p className="text-xl sm:text-2xl font-bold text-expense truncate">
                {formatCurrency(totals.expense)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">💰</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 dark:text-gray-400">လက်ကျန်</p>
              <p className={`text-xl sm:text-2xl font-bold truncate ${totals.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card
        title="နောက်ဆုံး ငွေလွှဲမှတ်တမ်းများ"
        subtitle={totals.count > 0 ? `စုစုပေါင်း ${totals.count} ခု` : undefined}
        footer={
          totals.count > 0 ? (
            <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              မှတ်တမ်းအားလုံး ကြည့်ရန် →
            </Link>
          ) : null
        }
      >
        {recentTransactions.length === 0 ? (
          <EmptyState
            icon="📝"
            title="ငွေလွှဲမှတ်တမ်း မရှိသေးပါ"
            description="ဝင်ငွေ နှင့် အသုံးစာရင်း စတင်မှတ်တမ်းတင်ပါ။"
            action={
              <Link to="/transactions">
                <Button variant="primary" size="sm">
                  မှတ်တမ်းထည့်ရန်
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-700 -mx-6 -my-5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ml-3 ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
                  {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default Dashboard
