import TransactionItem from './TransactionItem'

function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-4">
          📋
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions yet</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Click the &quot;Add Transaction&quot; button above to start tracking your income and expenses.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {transactions.map((transaction) => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default TransactionList
