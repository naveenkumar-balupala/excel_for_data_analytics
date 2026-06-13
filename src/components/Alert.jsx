// Reusable inline message banner for success / error / info / warning states.
const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
}

export default function Alert({ type = 'info', children }) {
  if (!children) return null
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type] || styles.info}`}>
      {children}
    </div>
  )
}
