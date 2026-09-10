import { useEffect, useState } from 'react'
import { fetchGallery } from '../lib/supabase.js'
import { useT } from '../i18n/index.jsx'
import { orderSections } from '../content/edit.jsx'
import { Hero, Formats, Band, Steps, Master, Pricing, Facts, Cta } from '../sections/home.jsx'
import StudioGallery from '../blocks/StudioGallery.jsx'

// Section order can be changed in the visual editor (site_settings.layout.order).
export const HOME_SECTIONS = [
  { id: 'hero', C: Hero },
  { id: 'formats', C: Formats },
  { id: 'band', C: Band },
  { id: 'steps', C: Steps },
  { id: 'master', C: Master },
  { id: 'gallery', C: StudioGallery },
  { id: 'pricing', C: Pricing },
  { id: 'facts', C: Facts },
  { id: 'cta', C: Cta },
]

export default function Home() {
  const { layout } = useT()
  const [gallery, setGallery] = useState([])
  useEffect(() => {
    let alive = true
    fetchGallery().then((rows) => alive && setGallery(rows)).catch(() => {})
    return () => {
      alive = false
    }
  }, [])
  return (
    <>
      {orderSections(HOME_SECTIONS, layout).map(({ id, C }) => (
        <C key={id} items={id === 'gallery' ? gallery : undefined} />
      ))}
    </>
  )
}
