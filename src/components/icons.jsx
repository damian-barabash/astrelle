// Event icon set — hand-drawn-feel line icons in the site's ink, shared by the
// public calendar and the admin panel. Events store an icon KEY ('vase', 'wine'…);
// legacy events that stored a raw emoji are mapped to the matching icon below.

const P = {
  vase: (
    <>
      <path d="M9.3 2.8h5.4" />
      <path d="M10.4 2.8c0 2-.4 3.1-1.7 4.3C7 8.7 6 10.5 6 12.9c0 3.9 2.7 6.6 6 6.6s6-2.7 6-6.6c0-2.4-1-4.2-2.7-5.8-1.3-1.2-1.7-2.3-1.7-4.3" />
      <path d="M6.6 9.9c-1.4.2-2.4 1-2.4 2.1 0 1 .8 1.8 2 2M17.4 9.9c1.4.2 2.4 1 2.4 2.1 0 1-.8 1.8-2 2" />
      <path d="M9 21.2h6" />
    </>
  ),
  mug: (
    <>
      <path d="M4.8 6.8h10.4v7.9c0 2.2-1.8 3.9-4 3.9H8.8c-2.2 0-4-1.7-4-3.9z" />
      <path d="M15.2 8.8h1.5c1.7 0 3 1.3 3 2.9s-1.3 2.9-3 2.9h-1.5" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 10.6h16c0 4.3-3.1 7.4-8 7.4s-8-3.1-8-7.4z" />
      <path d="M9.6 18v2.2h4.8V18" />
    </>
  ),
  plate: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="4.4" />
    </>
  ),
  wine: (
    <>
      <path d="M8 2.8h8c0 5.1-1.6 7.8-4 7.8s-4-2.7-4-7.8z" />
      <path d="M12 10.6v8.6M8.4 21.2h7.2M8.3 6h7.4" />
    </>
  ),
  film: (
    <>
      <rect x="3.4" y="5" width="17.2" height="14" rx="2.4" />
      <path d="M8 5v14M16 5v14M3.4 9.7h4.6M3.4 14.3h4.6M16 9.7h4.6M16 14.3h4.6" />
    </>
  ),
  paint: (
    <>
      <path d="M12 3.4c4.7 0 8.6 3.2 8.6 7.2 0 2.6-2 4.4-4.4 4.4h-1.9c-1.1 0-1.9.8-1.9 1.9 0 .5.2.9.5 1.3.3.4.5.8.5 1.2 0 .9-.8 1.5-1.7 1.5-4.6-.2-8.3-4-8.3-8.7 0-4.9 3.9-8.8 8.6-8.8z" />
      <circle cx="8.4" cy="9.2" r="0.6" fill="currentColor" />
      <circle cx="12.3" cy="7.4" r="0.6" fill="currentColor" />
      <circle cx="16" cy="9.6" r="0.6" fill="currentColor" />
    </>
  ),
  fire: (
    <>
      <path d="M12 2.8c.5 3-1.2 4.6-2.6 6.1C7.9 10.5 7 12.1 7 13.9a5 5 0 0 0 10 0c0-1.4-.4-2.6-1.3-3.7-.5 1-1.1 1.6-2 1.9.7-2.7-.1-6.4-1.7-9.3z" />
    </>
  ),
  star: (
    <>
      <path d="M12 2.4c.6 6.5 2.9 8.8 9.2 9.4-6.3.6-8.6 2.9-9.2 9.4-.6-6.5-2.9-8.8-9.2-9.4 6.3-.6 8.6-2.9 9.2-9.4z" />
    </>
  ),
  leaf: (
    <>
      <path d="M19.6 4.4c.6 8.5-3.6 14.4-10 14.4-2 0-3.7-.6-5.1-1.7C5.9 10 10.9 5.3 19.6 4.4z" />
      <path d="M4.4 19.6C8 14 12.4 10.4 17 8.4" />
    </>
  ),
  coffee: (
    <>
      <path d="M5.2 8.8h10v6.3c0 2.1-1.7 3.7-3.8 3.7H9c-2.1 0-3.8-1.6-3.8-3.7z" />
      <path d="M15.2 10.4h1.3c1.5 0 2.7 1.1 2.7 2.5s-1.2 2.5-2.7 2.5h-1.3" />
      <path d="M8.6 2.8c-.8 1 .8 1.7 0 2.9M12 2.8c-.8 1 .8 1.7 0 2.9" />
    </>
  ),
  laptop: (
    <>
      <rect x="5" y="5.4" width="14" height="9.6" rx="1.6" />
      <path d="M3 18.6h18L19.3 16H4.7z" />
    </>
  ),
}

// keys offered in the admin picker, in display order
export const ICON_KEYS = ['vase', 'mug', 'bowl', 'plate', 'wine', 'film', 'paint', 'fire', 'star', 'leaf', 'coffee', 'laptop']

// legacy events stored raw emoji — map them onto the icon set
const EMOJI_TO_KEY = {
  '🏺': 'vase', '☕': 'coffee', '☕️': 'coffee', '🍵': 'coffee', '🍷': 'wine', '🎬': 'film',
  '🎨': 'paint', '🖌️': 'paint', '🔥': 'fire', '✨': 'star', '⭐': 'star', '🌿': 'leaf',
  '💻': 'laptop', '🍽️': 'plate', '🥣': 'bowl',
}

export function iconKeyFor(icon, type) {
  if (icon && P[icon]) return icon
  if (icon && EMOJI_TO_KEY[icon]) return EMOJI_TO_KEY[icon]
  return type === 'coworking' ? 'laptop' : 'vase'
}

// Renders the event icon. Unknown custom emoji falls back to rendering it as text.
export function EventIcon({ icon, type, className = '', size }) {
  const key = icon && !P[icon] && !EMOJI_TO_KEY[icon] ? null : iconKeyFor(icon, type)
  if (!key) return <span className={`evicon evicon--emoji ${className}`}>{icon}</span>
  return (
    <svg
      className={`evicon ${className}`}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {P[key]}
    </svg>
  )
}
