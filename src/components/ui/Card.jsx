function Card({ title, subtitle, footer, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 pt-5 pb-3 border-b border-gray-50 dark:border-gray-700">
          {title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-750 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
