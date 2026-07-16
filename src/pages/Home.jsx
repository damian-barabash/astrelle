import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchGallery } from '../lib/supabase.js'
import { Page, Panel, scrollToBooking } from '../stack.jsx'
import { Hero, Value, Master, HomeFacts, Footer } from '../sections.jsx'
import StudioGallery from '../blocks/StudioGallery.jsx'
import BookingCalendar from '../blocks/BookingCalendar.jsx'

export default function Home() {
  const location = useLocation()
  const [gallery, setGallery] = useState([])
  useEffect(() => {
    let alive = true
    fetchGallery().then((rows) => alive && setGallery(rows)).catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // arriving from another page via a "#booking" link → scroll once the stack laid
  // out; re-aim when the gallery loads (it inserts a panel above the calendar)
  useEffect(() => {
    if (location.hash !== '#booking') return
    const id = setTimeout(scrollToBooking, 80)
    return () => clearTimeout(id)
  }, [location.hash, gallery.length > 0])

  return (
    <Page dep={gallery.length > 0}>
      <Panel><Hero /></Panel>
      <Panel><Value /></Panel>
      <Panel><Master /></Panel>
      {gallery.length > 0 && <Panel><StudioGallery items={gallery} /></Panel>}
      <Panel><BookingCalendar /></Panel>
      <Panel><HomeFacts /></Panel>
      <Panel><Footer /></Panel>
    </Page>
  )
}
