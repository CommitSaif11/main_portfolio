import { useEffect, useRef, useState } from 'react'

// Same one-time scroll-triggered entrance as components/Reveal.jsx, but as a
// hook instead of a wrapper - for elements that already need their own ref
// (e.g. cards also tracked by useInFocus) where Reveal can't be used directly
// since it doesn't forward refs. Apply the returned ref plus
// `reveal ${visible ? 'is-visible' : ''}` on the element to match.
export default function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}
