import { useEffect } from 'react'

// Reusable inline message banner for success / error / info / warning states.
// Pass `onClose` to show a dismiss button; pass `autoCloseMs` to clear it
// automatically after a delay (useful for transient success toasts).
const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
}

export default function Alert({ type = 'info', children, onClose, autoCloseMs }) {
  useEffect(() => {
    if (!children || !autoCloseMs || !onClose) return
    const id = setTimeout(onClose, autoCloseMs)
    return () => clearTimeout(id)
  }, [children, autoCloseMs, onClose])

  if (!children) return null
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.info}`} role="status">
      <div className="flex-1">{children}</div>
      {onClose && (
        <button onClick={onClose} aria-label="Dismiss" className="-mr-1 shrink-0 rounded p-0.5 text-lg leading-none opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  )
}
