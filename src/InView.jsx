import { useEffect, useRef, useState } from 'react'

// Mounts its children only while the block is near the viewport, so heavy
// WebGL canvases lower on the page don't all render at once.
export default function InView({ children, rootMargin = '300px' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => setShow(e.isIntersecting),
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])
  return (
    <div ref={ref} style={{ position: 'absolute', inset: 0 }}>
      {show && children}
    </div>
  )
}
