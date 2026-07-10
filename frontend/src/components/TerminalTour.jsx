import { useEffect, useRef, useState } from 'react'

function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

// Animated "terminal" panel that types out each line one character at a time,
// hacker-movie style, instead of a static list - loops back to the start after
// a pause once it's printed everything. Always the matrix-green hacker look
// regardless of the active site theme (recruiter teal / friend coral), since
// this is specifically evoking the real terminal, not the page's own palette.
// Each line can be a plain string, or { text, highlight } for the one entry
// (the chatbot callout) that should stand out from the rest in amber.
export default function TerminalTour({ prompt = 'saif@portfolio ~ %', lines, title = 'tour.sh' }) {
  const containerRef = useRef(null)
  const inView = useInView(containerRef)
  const [printed, setPrinted] = useState([])
  const [typing, setTyping] = useState('')
  const lineIndexRef = useRef(0)
  const charIndexRef = useRef(0)
  const timeoutRef = useRef(null)

  const items = lines.map((l) => (typeof l === 'string' ? { text: l, highlight: false } : l))

  useEffect(() => {
    if (!inView) return undefined

    function step() {
      const lineIndex = lineIndexRef.current
      if (lineIndex >= items.length) {
        timeoutRef.current = setTimeout(() => {
          lineIndexRef.current = 0
          charIndexRef.current = 0
          setPrinted([])
          setTyping('')
          step()
        }, 3200)
        return
      }

      const text = items[lineIndex].text
      const charIndex = charIndexRef.current

      if (charIndex >= text.length) {
        setPrinted((prev) => [...prev, items[lineIndex]])
        setTyping('')
        lineIndexRef.current += 1
        charIndexRef.current = 0
        timeoutRef.current = setTimeout(step, 500)
        return
      }

      charIndexRef.current += 1
      setTyping(text.slice(0, charIndexRef.current))
      timeoutRef.current = setTimeout(step, 18)
    }

    timeoutRef.current = setTimeout(step, 400)
    return () => clearTimeout(timeoutRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, lines])

  const isDone = lineIndexRef.current >= items.length
  const currentItem = items[lineIndexRef.current]

  return (
    <div ref={containerRef} className="w-full max-w-xl mx-auto text-left select-none">
      <div className="rounded-lg border border-[#00FF9C]/30 bg-[#0A100D] shadow-[0_0_40px_rgba(0,255,156,0.12)] overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#00FF9C]/15 bg-[#10160F]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7043]/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FBBF24]/70" aria-hidden="true" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF9C]/70" aria-hidden="true" />
          <span className="ml-3 text-xs font-mono text-[#00CC7A]/70">{title}</span>
        </div>
        <div className="px-5 py-5 font-mono text-sm min-h-[13rem]">
          {printed.map((item, i) => (
            <p key={i} className={item.highlight ? 'text-[#FFD24D] font-semibold' : 'text-[#00FF9C]'}>
              <span className="text-[#00CC7A]/70">{prompt}</span> {item.highlight ? '★ ' : ''}
              {item.text}
            </p>
          ))}
          {!isDone && currentItem && (
            <p className={currentItem.highlight ? 'text-[#FFD24D] font-semibold' : 'text-[#00FF9C]'}>
              <span className="text-[#00CC7A]/70">{prompt}</span> {currentItem.highlight ? '★ ' : ''}
              {typing}
              <span className="terminal-cursor">▍</span>
            </p>
          )}
          {isDone && (
            <p className="text-[#00FF9C]">
              <span className="text-[#00CC7A]/70">{prompt}</span> <span className="terminal-cursor">▍</span>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
