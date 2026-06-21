import { useState, useEffect, useMemo } from 'react'
import useTransactions from '@/hooks/useTransactions'
import { Card, Button } from '@/components/ui'
import TransactionList from '@/components/transactions/TransactionList'
import TransactionForm from '@/components/transactions/TransactionForm'
import TransactionFilter from '@/components/transactions/TransactionFilter'
import ExportButton from '@/components/reports/ExportButton'

function Transactions() {
  const {
    transactions,
    loading,
    error,
    schemaMissing,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
  })

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Client-side filtering
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filters.type !== 'all' && tx.type !== filters.type) return false
      if (filters.category !== 'all' && tx.category !== filters.category) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const desc = (tx.description || '').toLowerCase()
        const cat = (tx.category || '').toLowerCase()
        if (!desc.includes(q) && !cat.includes(q)) return false
      }
      return true
    })
  }, [transactions, filters])

  const handleAdd = () => {
    setEditingTransaction(null)
    setIsFormOpen(true)
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
    } else {
      await addTransaction(data)
    }
  }

  const handleDelete = async (id) => {
    await deleteTransaction(id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 truncate">Transactions</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ExportButton transactions={filteredTransactions} />
          <Button variant="primary" onClick={handleAdd}>
            <svg className="w-5 h-5 sm:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </div>
      </div>

      {/* Schema migration hint */}
      {schemaMissing && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <svg className="w-5 h-5 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              Supabase table &quot;transactions&quot; not found
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              Run the migration in <code className="text-xs bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/001_create_transactions.sql</code> via the Supabase Dashboard SQL Editor.
              Using in-memory storage for now.
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <Button variant="ghost" size="sm" onClick={fetchTransactions}>
            Retry
          </Button>
        </div>
      )}

      {/* Filters */}
      <TransactionFilter filters={filters} onFilterChange={setFilters} />

      {/* Transaction list */}
      <Card>
        {loading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
        ) : (
          <TransactionList
            transactions={filteredTransactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Transaction form modal */}
      <TransactionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setEditingTransaction(null)
        }}
        onSubmit={handleSubmit}
        editTransaction={editingTransaction}
      />
    </div>
  )
}

export default Transactions
