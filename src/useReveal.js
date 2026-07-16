import { useEffect, useRef } from 'react'

// Adds .in to elements with .reveal as they scroll into view. Also watches for
// .reveal elements added AFTER mount (async blocks: studio gallery, the
// calendar's upcoming list) — without this they'd stay at opacity 0 forever.
export function useReveal() {
  const root = useRef(null)
  useEffect(() => {
    const scope = root.current || document
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    )
    scope.querySelectorAll('.reveal').forEach((el) => io.observe(el))
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue
          if (n.classList?.contains('reveal') && !n.classList.contains('in')) io.observe(n)
          n.querySelectorAll?.('.reveal:not(.in)').forEach((el) => io.observe(el))
        }
      }
    })
    mo.observe(scope, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
    }
  }, [])
  return root
}
