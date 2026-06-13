import { useEffect, useRef, useState } from 'react'

// Countdown timer. Calls onExpire() once when it reaches zero.
// durationSeconds is the total test time; the component counts down from it.
export default function Timer({ durationSeconds, onExpire }) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const expiredRef = useRef(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(interval)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire?.()
          }
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const low = remaining <= 60

  return (
    <div className={`rounded-lg px-4 py-2 text-center font-mono text-lg font-bold ${low ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
      ⏱ {mm}:{ss}
    </div>
  )
}
