import { useT } from './i18n/index.jsx'

// Stylised, on-brand "Google-maps-like" card for the studio address.
// Pure SVG — no API key, no external embed.
const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Mała+5a+Warszawa'

export default function StyledMap() {
  const { t } = useT()
  return (
    <a className="map reveal" href={MAPS_URL} target="_blank" rel="noopener noreferrer" aria-label={t('invite.directions')}>
      <svg className="map__svg" viewBox="0 0 600 380" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
        {/* base */}
        <rect width="600" height="380" fill="#ece7df" />
        {/* park / green blocks */}
        <rect x="36" y="40" width="150" height="120" rx="10" fill="#cdddbf" />
        <rect x="420" y="220" width="150" height="130" rx="10" fill="#cdddbf" />
        <circle cx="500" cy="90" r="46" fill="#cdddbf" />
        {/* river */}
        <path d="M-20 300 C 120 250, 200 360, 360 300 S 560 240, 640 290 L 640 400 L -20 400 Z" fill="#bcd3d0" opacity="0.85" />
        {/* roads (casing + fill) */}
        <g stroke="#e3c9ad" strokeWidth="22" fill="none" strokeLinecap="round">
          <path d="M-10 150 L 610 120" />
          <path d="M300 -10 L 260 390" />
          <path d="M-10 250 L 610 230" />
        </g>
        <g stroke="#ffffff" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M-10 150 L 610 120" />
          <path d="M300 -10 L 260 390" />
          <path d="M-10 250 L 610 230" />
        </g>
        {/* small streets */}
        <g stroke="#ffffff" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.9">
          <path d="M120 -10 L 100 390" />
          <path d="M440 -10 L 410 390" />
          <path d="M-10 60 L 610 40" />
        </g>
      </svg>

      {/* pin */}
      <div className="map__pin">
        <span className="map__pulse" />
        <svg viewBox="0 0 32 44" width="34" height="46" aria-hidden="true">
          <path
            d="M16 0C7.7 0 1 6.7 1 15c0 10.5 13 27 14.1 28.3a1.2 1.2 0 0 0 1.8 0C18 42 31 25.5 31 15 31 6.7 24.3 0 16 0Z"
            fill="#7a2e3a"
          />
          <circle cx="16" cy="15" r="6" fill="#f4ebe5" />
        </svg>
      </div>

      {/* label chip */}
      <div className="map__chip">
        <b>Astrelle</b>
        <span>
          {t('invite.address')} · {t('invite.studio')}
        </span>
      </div>

      {/* google-ish chrome */}
      <div className="map__zoom" aria-hidden="true">
        <span>+</span>
        <span>−</span>
      </div>
      <div className="map__cta">{t('invite.directions')} →</div>
    </a>
  )
}
