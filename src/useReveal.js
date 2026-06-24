import { useEffect, useRef } from 'react'

// Adds .in to elements with .reveal as they scroll into view.
export function useReveal() {
  const root = useRef(null)
  useEffect(() => {
    const els = (root.current || document).querySelectorAll('.reveal')
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
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return root
}
