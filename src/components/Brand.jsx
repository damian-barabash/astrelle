// Brand mark — the real Astrelle logo (sparkles + serif wordmark), PNG/WebP from
// Grafiki/Identyti/2x/LOGO.png, trimmed and resized to 160px height by sharp.
export function Logo({ className = '' }) {
  return (
    <span className={`logo ${className}`}>
      <picture>
        <source srcSet="/assets/logo/astrelle-logo.webp" type="image/webp" />
        <img src="/assets/logo/astrelle-logo.png" alt="Astrelle" draggable="false" />
      </picture>
    </span>
  )
}
