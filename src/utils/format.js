/**
 * Format a number as Myanmar Kyat currency string.
 * @param {number} amount
 * @returns {string} e.g. "1,500 MMK"
 */
export function formatCurrency(amount) {
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `${formatted} MMK`
}

/**
 * Format an ISO date string to a short readable form.
 * @param {string} dateStr - ISO date string (e.g. "2026-06-19")
 * @returns {string} e.g. "19 Jun 2026"
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format an ISO date string to a long readable form.
 * @param {string} dateStr - ISO date string
 * @returns {string} e.g. "19 June 2026"
 */
export function formatDateLong(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format an ISO timestamp to relative time.
 * @param {string} timestamp - ISO timestamp
 * @returns {string} e.g. "2 hours ago"
 */
export function formatRelativeTime(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(timestamp.split('T')[0])
}

export const CATEGORIES = [
  'Salary',
  'Freelance',
  'Business',
  'Investment',
  'Food & Dining',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Other',
]
