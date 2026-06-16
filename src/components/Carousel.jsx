import { useEffect, useState } from 'react'

// Simple image carousel with auto-advance, prev/next arrows and dot indicators.
// images: array of { src, alt }. Images that fail to load are dropped, and if
// none load a neutral placeholder is shown (so missing files don't break the UI).
export default function Carousel({ images = [], interval = 4000, heightClass = 'h-72 sm:h-96' }) {
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState({})

  const valid = images.filter((img) => !failed[img.src])
  const count = valid.length

  useEffect(() => {
    if (count <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), interval)
    return () => clearInterval(t)
  }, [count, interval])

  // Keep the active index in range as images load/fail.
  useEffect(() => {
    if (index >= count && count > 0) setIndex(0)
  }, [index, count])

  // Render hidden probe <img>s so onError can flag missing files.
  const probes = images.map((img) => (
    <img key={`probe-${img.src}`} src={img.src} alt="" className="hidden" onError={() => setFailed((f) => ({ ...f, [img.src]: true }))} />
  ))

  if (count === 0) {
    return (
      <>
        {probes}
        <div className={`flex w-full items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400 ${heightClass}`}>
          Event photos coming soon
        </div>
      </>
    )
  }

  const go = (i) => setIndex((i + count) % count)

  return (
    <div className={`relative w-full overflow-hidden rounded-xl bg-slate-100 ${heightClass}`}>
      {probes}
      {valid.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          loading="lazy"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white hover:bg-black/60"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next image"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-3 py-2 text-white hover:bg-black/60"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {valid.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to image ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
