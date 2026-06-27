function TransactionFilter({ filters, onFilterChange, categories = [] }) {
  const hasActiveFilters = filters.search || filters.type !== 'all' || filters.category !== 'all'

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="w-full sm:flex-1 relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="ရှာဖွေရန်..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
      </div>

      {/* Type + Category row on mobile */}
      <div className="flex gap-3 sm:contents">
        {/* Type filter */}
        <select
          value={filters.type}
          onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
          className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            min-w-0"
        >
          <option value="all">အမျိုးအစားအားလုံး</option>
          <option value="income">ဝင်ငွေ</option>
          <option value="expense">အသုံး</option>
        </select>

        {/* Category filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
          className="flex-1 sm:flex-none px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg
            bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            min-w-0"
        >
          <option value="all">အမျိုးအစားအားလုံး</option>
          {categories.map((cat) => (
            <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => onFilterChange({ search: '', type: 'all', category: 'all' })}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="hidden sm:inline">ဖျက်ရန်</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default TransactionFilter
