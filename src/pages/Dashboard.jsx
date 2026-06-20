import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import useTransactions from '@/hooks/useTransactions'
import { Card, Button } from '@/components/ui'
import { formatCurrency, formatDate } from '@/utils/format'

function Dashboard() {
  const { transactions, fetchTransactions } = useTransactions()

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your financial overview at a glance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg">
              📥
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Income</p>
              <p className="text-2xl font-bold text-income">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-lg">
              📤
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold text-expense">
                {formatCurrency(totals.expense)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
              💰
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card
        title="Recent Transactions"
        subtitle={totals.count > 0 ? `You have ${totals.count} transaction${totals.count !== 1 ? 's' : ''} total` : undefined}
        footer={
          totals.count > 0 ? (
            <Link to="/transactions" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all transactions →
            </Link>
          ) : null
        }
      >
        {recentTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-gray-500 mb-4">No transactions yet. Start tracking your money!</p>
            <Link to="/transactions">
              <Button variant="primary" size="sm">
                Go to Transactions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 -mx-6 -my-5">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-income' : 'text-expense'}`}>
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
