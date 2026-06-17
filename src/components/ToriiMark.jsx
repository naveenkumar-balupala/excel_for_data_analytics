// The Torii "doorway" mark — three sides of a frame (open at the bottom) with
// an asterisk and an "i" stem. Used standalone and as the final letter of the
// TORII wordmark. `stem` recolors the inner bar for light/dark backgrounds.
export default function ToriiMark({ className = '', stem = '#ea580c', brand = '#ea580c' }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} role="img" aria-label="Torii">
      <path d="M18 88 L18 18 L82 18 L82 88" stroke={brand} strokeWidth="8" strokeLinecap="square" fill="none" />
      <g stroke={brand} strokeWidth="3.5" strokeLinecap="round">
        <line x1="50" y1="28" x2="50" y2="40" />
        <line x1="44.5" y1="31" x2="55.5" y2="37" />
        <line x1="55.5" y1="31" x2="44.5" y2="37" />
      </g>
      <rect x="45.5" y="44" width="9" height="44" rx="1.5" fill={stem} />
    </svg>
  )
}
