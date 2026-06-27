/**
 * Reusable loading spinner.
 * @param {'sm' | 'md' | 'lg'} size - sm=4x4, md=8x8, lg=12x12
 * @param {string} text - Optional text below the spinner
 * @param {boolean} fullPage - If true, takes full viewport height
 */
function LoadingSpinner({ size = 'md', text, fullPage = false }) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  const spinner = (
    <svg
      className={`animate-spin text-blue-500 ${sizeMap[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  if (fullPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        {spinner}
        {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {spinner}
      {text && <p className="mt-3 text-sm text-gray-500">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
