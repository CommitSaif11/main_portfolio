import { useEffect, useRef, useState } from 'react'

// Tracks whether an element is roughly centered in the viewport (not just
// "visible at all") - the root margin trims the intersection root down to a
// thin band around the vertical center, so isIntersecting only flips true
// once the element crosses into that band. Used for the scroll-through
// "in-focus" glow on content cards, so each card gets its moment of emphasis
// as it passes center, then settles back down once it moves on.
export default function useInFocus() {
  const ref = useRef(null)
  const [inFocus, setInFocus] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setInFocus(entry.isIntersecting),
      { rootMargin: '-38% 0px -38% 0px', threshold: 0 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inFocus]
}
