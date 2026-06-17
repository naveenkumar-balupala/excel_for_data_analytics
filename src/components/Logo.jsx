import ToriiMark from './ToriiMark'

// The TORII wordmark: "TORI" set in the app font, the final "I" rendered as the
// doorway mark, with the "Step IN Stand OUT" tagline beneath. `variant="light"`
// is for dark backgrounds (white text, white stem); the default suits light UI.
export default function Logo({ variant = 'dark', showTagline = true, className = '' }) {
  const light = variant === 'light'
  const textColor = light ? '#ffffff' : '#1e293b' // slate-800
  const stem = light ? '#ffffff' : '#ea580c'

  return (
    <span className={`inline-flex flex-col leading-none ${className}`}>
      <span className="flex items-stretch">
        <span
          className="font-extrabold tracking-tight"
          style={{ color: textColor, fontSize: '1em', lineHeight: 1 }}
        >
          TORI
        </span>
        <ToriiMark className="h-[1.05em] w-[1.05em] -ml-[0.04em]" stem={stem} />
      </span>
      {showTagline && (
        <span
          className="mt-[0.15em] font-semibold tracking-wide"
          style={{ color: textColor, fontSize: '0.26em' }}
        >
          Step <span style={{ color: '#ea580c' }}>IN</span> Stand{' '}
          <span style={{ color: '#ea580c' }}>OUT</span>
        </span>
      )}
    </span>
  )
}
