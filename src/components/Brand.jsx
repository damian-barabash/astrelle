// Brand mark. The original wordmark lived in an SVG that relied on the
// "Montega" font — but an <img>-loaded SVG can't pull web fonts, so the glyphs
// fell back to a default face at fixed x-offsets and the letters drifted apart.
// We render the wordmark as live HTML text (Fraunces) instead — robust
// everywhere — and keep the three sparkles as inline vector paths.

export function StarMark({ className = '' }) {
  return (
    <svg className={`starmark ${className}`} viewBox="0 0 122 185" aria-hidden="true">
      <path d="M0,129.58s42.21.88,41.77-52.76c0,0,5.28,50.12,43.08,50.12,0,0-44.4,3.52-42.42,54.08,0,0,7.25-52.32-42.42-51.44Z" />
      <path d="M87.05,16.59s.44,41.33-38.69,43.96c0,0,37.37-2.64,38.69,43.52,0,0,1.76-43.96,34.29-43.74,0,0-36.05-.66-34.29-43.74Z" />
      <path d="M8.78,26.38S31.64,28.58,32.08,0c0,0-3.52,25.06,19.78,24.18,0,0-22.42-.88-21.54,25.5,0,0,1.32-23.74-21.54-23.3Z" />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return <span className={`wordmark ${className}`}>Astrelle</span>
}

export function Logo({ className = '', star = true }) {
  return (
    <span className={`logo ${className}`}>
      {star && <StarMark className="logo__star" />}
      <Wordmark className="logo__text" />
    </span>
  )
}
