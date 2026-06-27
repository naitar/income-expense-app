/**
 * Reusable empty state display.
 * @param {string} icon - Emoji or icon to display
 * @param {string} title - Bold heading text
 * @param {string} description - Smaller descriptive text
 * @param {React.ReactNode} action - Optional CTA button/link
 * @param {'sm' | 'md' | 'lg'} size - Controls icon and spacing size
 */
function EmptyState({ icon = '📋', title, description, action, size = 'md' }) {
  const sizeMap = {
    sm: { iconBox: 'w-10 h-10 text-lg', icon: 'text-lg', title: 'text-sm', gap: 'mb-2', padY: 'py-6' },
    md: { iconBox: 'w-14 h-14 text-2xl', icon: 'text-2xl', title: 'text-lg', gap: 'mb-3', padY: 'py-10' },
    lg: { iconBox: 'w-16 h-16 text-3xl', icon: 'text-3xl', title: 'text-xl', gap: 'mb-4', padY: 'py-16' },
  }

  const s = sizeMap[size] || sizeMap.md

  return (
    <div className={`flex flex-col items-center justify-center ${s.padY} text-center`}>
      <div className={`${s.iconBox} rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${s.gap}`}>
        <span className={s.icon}>{icon}</span>
      </div>
      {title && <h3 className={`${s.title} font-semibold text-gray-900 dark:text-white mb-1`}>{title}</h3>}
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

export default EmptyState
