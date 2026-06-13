export default function StatCard({ label, value, accent = 'brand', suffix = '' }) {
  const accents = {
    brand: 'text-brand',
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    slate: 'text-slate-700',
  }
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <span className={`text-2xl font-bold ${accents[accent] || accents.brand}`}>
        {value}
        {suffix}
      </span>
    </div>
  )
}
