import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, id, className = '', ...rest },
  ref
) {
  const inputId = id || (label && label.toLowerCase().replace(/\s+/g, '-'))

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full px-3 py-2 text-sm
          border rounded-lg
          text-gray-900 dark:text-white bg-white dark:bg-gray-700
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-0
          transition-colors
          ${error
            ? 'border-red-300 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
          }
          ${className}
        `.trim().replace(/\s+/g, ' ')}
        {...rest}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})

export default Input
