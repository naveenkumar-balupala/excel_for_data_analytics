export default function Loader({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
