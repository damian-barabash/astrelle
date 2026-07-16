import { useEffect, useRef, useState } from 'react'
import { useT } from './i18n/index.jsx'
import { useReveal } from './useReveal.js'

// One stacked block: a tall .panel (scroll runway) whose .panel__pin sticks to
// the viewport while .panel__inner translates up to reveal the block's content;
// the next .panel overlaps this one (negative margin) and rides up over it.
export function Panel({ children }) {
  return (
    <div className="panel">
      <div className="panel__pin">
        <div className="panel__inner">{children}</div>
      </div>
    </div>
  )
}

// Scroll to the booking calendar on the home page, landing on the SETTLED spot
// (in the capture-stack the calendar's raw position lands mid-cover).
export function scrollToBooking() {
  const cal = document.getElementById('booking')
  if (!cal) return
  if (document.documentElement.classList.contains('stacked')) {
    const bookingPanel = cal.closest('.panel')
    const panels = Array.from(document.querySelectorAll('.content > .panel'))
    let top = 0
    for (const p of panels) {
      if (p === bookingPanel) break
      top += p.querySelector('.panel__inner').scrollHeight
    }
    const inner = bookingPanel.querySelector('.panel__inner')
    const calTop = cal.getBoundingClientRect().top - inner.getBoundingClientRect().top
    // clamp to the booking panel's "read" phase so we stay pinned & clean
    const read = Math.max(0, inner.scrollHeight - window.innerHeight)
    const offset = Math.min(Math.max(0, calTop - 96), read)
    window.scrollTo({ top: Math.max(0, top + offset), behavior: 'smooth' })
  } else {
    cal.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// Capture-stack controller. On desktop + motion-safe it adds `.stacked` to
// the root and, per block: sizes the panel to (content height + one viewport of
// "ride"), pins it, and on scroll translates the inner up. On touch devices only
// the hero (if the page has one) pins — mug freeze→lift — and the rest scrolls
// natively. Pages without a hero scroll natively on touch.
export function useStack(dep) {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const wide = window.matchMedia('(min-width: 941px)')
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const content = document.querySelector('.content')
    if (!content) return
    const docEl = document.documentElement
    let panels = []
    let mode = 'none' // 'full' | 'hero' | 'none'
    let raf = 0
    let ro = null
    // Frozen viewport height for touch: in-app browsers (Instagram etc.) grow/shrink
    // the viewport while scrolling as their chrome collapses; re-measuring on every
    // resize made the hero (and the 3D mug) visibly inflate mid-scroll. On touch we
    // measure once and only re-measure when the WIDTH changes (rotation, real resize).
    let vhPx = 0
    let lastW = 0

    const clearAll = () => {
      docEl.classList.remove('stacked', 'stacked-hero')
      docEl.style.removeProperty('--vh')
      panels.forEach((p) => {
        p.style.height = ''
        const inner = p.querySelector('.panel__inner')
        if (inner) inner.style.transform = ''
        const pin = p.querySelector('.panel__pin')
        if (pin) pin.style.transform = ''
      })
      ro?.disconnect()
    }

    // hero geometry (shared by both modes): cupY = mug bottom, r = full-cover scroll point
    const measureHero = (vh) => {
      const hero = panels[0]
      if (!hero) return
      const inner = hero.querySelector('.panel__inner')
      const ih = inner.scrollHeight
      hero.style.height = ih + vh + 'px' // pin runway = one viewport
      const stage = hero.querySelector('.hero__stage')
      const stageTop = stage ? stage.getBoundingClientRect().top - inner.getBoundingClientRect().top : 0
      hero.dataset.cupy = String(stage ? stageTop + stage.offsetHeight * 0.8 : vh * 0.55)
      hero.dataset.r = String(ih) // = heroHeight - vh
    }
    const moveHero = () => {
      const hero = panels[0]
      if (!hero) return
      const inner = hero.querySelector('.panel__inner')
      const cupY = +hero.dataset.cupy || 0
      const r = +hero.dataset.r || 0
      const a = r - cupY // phase-1 length: scroll until cover reaches the mug
      const sy = -hero.getBoundingClientRect().top
      const lift = Math.min(Math.max(sy - a, 0), cupY)
      inner.style.transform = 'translateY(' + -lift + 'px)'
    }

    const layout = () => {
      // keep the frozen height on touch unless the width changed (see note above)
      if (mode === 'hero' && vhPx && window.innerWidth === lastW) {
        // vhPx stays frozen
      } else {
        vhPx = window.innerHeight
      }
      lastW = window.innerWidth
      const vh = vhPx
      // drive the pin/margin heights from the measured viewport so CSS (var(--vh))
      // and the JS transforms agree — critical on mobile where 100vh ≠ innerHeight.
      docEl.style.setProperty('--vh', vh + 'px')
      if (mode === 'hero') {
        measureHero(vh)
        return
      }
      const hasHero = !!panels[0]?.querySelector('.hero__stage')
      panels.forEach((p, i) => {
        const inner = p.querySelector('.panel__inner')
        const ih = inner.scrollHeight // >= vh via min-height:100vh
        const read = Math.max(0, ih - vh)
        const ride = i === panels.length - 1 ? 0 : vh // last block: nothing covers it
        p.style.height = ih + ride + 'px'
        p.dataset.read = String(read)
        p.dataset.ride = String(ride)
        if (i === 0 && hasHero) {
          const stage = p.querySelector('.hero__stage')
          const stageTop = stage.getBoundingClientRect().top - inner.getBoundingClientRect().top
          p.dataset.cupy = String(stageTop + stage.offsetHeight * 0.8)
          p.dataset.r = String(ih + ride - vh) // = ih ≈ vh
          p.dataset.hero = '1'
        } else {
          delete p.dataset.hero
        }
      })
    }
    const update = () => {
      raf = 0
      if (mode === 'hero') {
        moveHero()
        return
      }
      panels.forEach((p, i) => {
        const inner = p.querySelector('.panel__inner')
        if (i === 0 && p.dataset.hero === '1') {
          const cupY = +p.dataset.cupy || 0
          const r = +p.dataset.r || 0
          const a = r - cupY
          const sy = -p.getBoundingClientRect().top
          const lift = Math.min(Math.max(sy - a, 0), cupY)
          inner.style.transform = 'translateY(' + -lift + 'px)'
          return
        }
        const read = +p.dataset.read || 0
        const ride = +p.dataset.ride || 0
        const top = p.getBoundingClientRect().top
        const scrolled = Math.min(Math.max(-top, 0), read + ride)
        const readT = Math.min(scrolled, read) // scroll the content through
        const lift = Math.max(0, scrolled - read) * 0.42 // drift up while covered
        inner.style.transform = 'translateY(' + -(readT + lift) + 'px)'
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    const relayout = () => {
      if (mode === 'none') return
      // in-app browser chrome collapse fires height-only resizes — ignore them on touch
      if (mode === 'hero' && vhPx && window.innerWidth === lastW) return
      layout()
      update()
    }
    const setup = () => {
      cancelAnimationFrame(raf)
      raf = 0
      clearAll()
      vhPx = 0
      lastW = 0
      panels = Array.from(content.querySelectorAll(':scope > .panel'))
      if (calm.matches) {
        mode = 'none'
        panels = []
        return
      }
      if (fine.matches && wide.matches) {
        mode = 'full'
        docEl.classList.add('stacked')
        layout()
        update()
        ro = new ResizeObserver(relayout)
        panels.forEach((p) => ro.observe(p.querySelector('.panel__inner')))
      } else if (content.querySelector('.hero__stage')) {
        mode = 'hero'
        docEl.classList.add('stacked-hero')
        layout()
        update()
        ro = new ResizeObserver(relayout)
        const hi = panels[0]?.querySelector('.panel__inner')
        if (hi) ro.observe(hi)
      } else {
        // touch page without a hero — plain native scroll
        mode = 'none'
        panels = []
      }
    }
    setup()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', relayout)
    window.addEventListener('load', relayout)
    fine.addEventListener('change', setup)
    wide.addEventListener('change', setup)
    calm.addEventListener('change', setup)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', relayout)
      window.removeEventListener('load', relayout)
      fine.removeEventListener('change', setup)
      wide.removeEventListener('change', setup)
      calm.removeEventListener('change', setup)
      cancelAnimationFrame(raf)
      clearAll()
    }
  }, [dep]) // re-run when the panel set changes (e.g. studio gallery appears)
}

// Shared page shell: reveal animations, capture-stack, soft cross-fade on language
// change. Each page renders its blocks as <Panel> children (ending with the footer).
export function Page({ dep = false, children }) {
  const root = useReveal()
  const { lang } = useT()
  useStack(dep)
  const [fading, setFading] = useState(false)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setFading(true)
    const id = setTimeout(() => setFading(false), 240)
    return () => clearTimeout(id)
  }, [lang])
  return (
    <div ref={root}>
      <main className={`content ${fading ? 'content--fading' : ''}`}>{children}</main>
    </div>
  )
}
