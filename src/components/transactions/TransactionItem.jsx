import { formatCurrency, formatDate } from '@/utils/format'

const categoryIcons = {
  Salary: '💼',
  Freelance: '💻',
  Business: '🏢',
  Investment: '📈',
  'Food & Dining': '🍽️',
  Transport: '🚗',
  Shopping: '🛍️',
  'Bills & Utilities': '🧾',
  Entertainment: '🎬',
  Healthcare: '🏥',
  Education: '📚',
  Other: '📌',
}

function TransactionItem({ transaction, onEdit, onDelete }) {
  const { type, amount, category, description, date } = transaction
  const icon = categoryIcons[category] || '📌'

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      onDelete(transaction.id)
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
      {/* Icon — hide on very small screens */}
      <div className="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center text-lg">
        {icon}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {description || category}
          </p>
          <span
            className={`hidden sm:inline flex-shrink-0 text-xs font-medium px-1.5 py-0.5 rounded ${
              type === 'income'
                ? 'bg-green-50 dark:bg-green-900/30 text-income'
                : 'bg-red-50 dark:bg-red-900/30 text-expense'
            }`}
          >
            {category}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          <span className="sm:hidden text-gray-500 dark:text-gray-400 font-medium">{category}</span>
          <span className="sm:hidden mx-1.5">·</span>
          {formatDate(date)}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${
            type === 'income' ? 'text-income' : 'text-expense'
          }`}
        >
          {type === 'income' ? '+' : '-'} {formatCurrency(amount)}
        </p>
      </div>

      {/* Actions — compact on mobile */}
      <div className="flex-shrink-0 flex items-center gap-0.5 sm:gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(transaction)}
          className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded transition-colors"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        </button>
        <button
          onClick={handleDelete}
          className="p-1 sm:p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TransactionItem
