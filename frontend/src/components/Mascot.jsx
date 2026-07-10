import { useEffect, useRef, useState } from 'react'
import { useMode } from '../context/ModeContext'
import { openChatWidget } from './ChatWidget'
import zoeBody from '../assets/mascots/zoe-body.png'
import zoeVisorTeal from '../assets/mascots/zoe-visor-teal.png'
import zoeVisorWarm from '../assets/mascots/zoe-visor_warm.png'

const SIZE = 140
const EYE_SHIFT_MAX = 7 // px the visor nudges toward the cursor - subtle, not a full head turn
const GREET_DELAY_MS = 900
const GREET_MS = 3600
const HOVER_BUBBLE_MS = 2600

// Delegated hover targets, checked in priority order (first match wins) against
// whatever's under the pointer. Keys line up with each mode's REACTION_LINES.
const HOVER_TARGETS = [
  { key: 'nav', selector: 'nav' },
  { key: 'impact', selector: '#impact' },
  { key: 'tour', selector: '#tour' },
  { key: 'story', selector: '#story' },
  { key: 'personal', selector: '#personal' },
  { key: 'projects', selector: '#projects, a[href^="/projects"]' },
  { key: 'contact', selector: '#contact' },
]

const REACTION_LINES = {
  recruiter: {
    nav: ["That's the site map - jump anywhere from here."],
    impact: ["Here's the highlight reel - proof, not claims."],
    story: ['This is who he is, not just what he shipped.'],
    projects: ["These are the ones I'd lead with."],
    contact: ["This is where you reach out. I don't bite."],
  },
  friend: {
    nav: ['pick a tab, any tab'],
    tour: ["ooh try this part, it's fun"],
    personal: ['this is Saif, off the clock'],
    projects: ['ok he actually built all this, kinda wild'],
    contact: ['say hi here, he actually reads these'],
  },
}

const GREET_LINES = {
  recruiter: "Hi! I'm Zoe.",
  friend: 'Hi!! 👋',
}

// Each visor PNG's glowing pill sits at slightly different pixel bounds within
// its 1024x1024 canvas, so each needs its own crop/scale to land on the same
// face cutout on zoe-body.png (measured directly from the assets).
const VISOR_LAYOUT = {
  teal: { left: '-34.88%', top: '-90.11%', width: '170.1%', height: '297.6%' },
  warm: { left: '-32.04%', top: '-78.43%', width: '164.8%', height: '276.0%' },
}

export default function Mascot() {
  const { mode } = useMode()
  const visorSrc = mode === 'friend' ? zoeVisorWarm : zoeVisorTeal
  const visorLayout = mode === 'friend' ? VISOR_LAYOUT.warm : VISOR_LAYOUT.teal
  const reactionLines = REACTION_LINES[mode] ?? REACTION_LINES.recruiter

  const rootRef = useRef(null)
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 })
  const [greetBubble, setGreetBubble] = useState(null)
  const [hoverBubble, setHoverBubble] = useState(null)
  const [hoveredSelf, setHoveredSelf] = useState(false)
  const lastHoverKeyRef = useRef(null)
  const hoverTimeoutRef = useRef(null)
  const rafPendingRef = useRef(false)

  // Greet shortly after mount - once per page load.
  useEffect(() => {
    const showId = setTimeout(() => {
      setGreetBubble(GREET_LINES[mode] ?? GREET_LINES.recruiter)
      const hideId = setTimeout(() => setGreetBubble(null), GREET_MS)
      return () => clearTimeout(hideId)
    }, GREET_DELAY_MS)
    return () => clearTimeout(showId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Eyes only: small offset toward the cursor, computed from Zoe's fixed
  // on-screen position. The body itself never moves.
  useEffect(() => {
    function onMove(e) {
      if (rafPendingRef.current) return
      rafPendingRef.current = true
      requestAnimationFrame(() => {
        rafPendingRef.current = false
        const rect = rootRef.current?.getBoundingClientRect()
        if (!rect) return
        const cx = rect.left + rect.width / 2
        const cy = rect.top + rect.height / 2
        const dx = e.clientX - cx
        const dy = e.clientY - cy
        const dist = Math.hypot(dx, dy) || 1
        setEyeOffset({
          x: (dx / dist) * EYE_SHIFT_MAX,
          y: (dy / dist) * EYE_SHIFT_MAX,
        })
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Delegated hover reactions - whatever's under the pointer, checked against a
  // curated list of page landmarks, shown as a bubble "through" Zoe rather than
  // a tooltip at the hovered element itself.
  useEffect(() => {
    function onMove(e) {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (!el || rootRef.current?.contains(el)) return

      let matchedKey = null
      for (const target of HOVER_TARGETS) {
        if (el.closest(target.selector)) {
          matchedKey = target.key
          break
        }
      }

      if (matchedKey === lastHoverKeyRef.current) return
      lastHoverKeyRef.current = matchedKey
      clearTimeout(hoverTimeoutRef.current)

      if (!matchedKey || !reactionLines[matchedKey]) {
        setHoverBubble(null)
        return
      }
      const pool = reactionLines[matchedKey]
      setHoverBubble(pool[Math.floor(Math.random() * pool.length)])
      hoverTimeoutRef.current = setTimeout(() => setHoverBubble(null), HOVER_BUBBLE_MS)
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      clearTimeout(hoverTimeoutRef.current)
    }
  }, [reactionLines])

  const bubble = hoverBubble ?? greetBubble

  return (
    <div
      ref={rootRef}
      className="fixed z-[60] pointer-events-none"
      style={{ right: 24, top: '50%', transform: 'translateY(-50%)', width: SIZE, height: SIZE }}
    >
      {bubble && (
        <div className="zoe-bubble absolute bottom-full mb-2 right-0 w-[220px] pointer-events-none">
          <div className="bg-bg-elevated border border-border-default rounded-lg px-3 py-2 text-xs text-text-primary shadow-lg">
            {bubble}
          </div>
        </div>
      )}

      {hoveredSelf && !bubble && (
        <div className="zoe-label absolute bottom-full mb-2 right-1/2 translate-x-1/2 pointer-events-none whitespace-nowrap">
          <div className="bg-bg-elevated border border-border-default rounded-full px-2.5 py-1 text-[11px] font-medium text-text-primary shadow-lg">
            Ask Zoe
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openChatWidget}
        onMouseEnter={() => setHoveredSelf(true)}
        onMouseLeave={() => setHoveredSelf(false)}
        onFocus={() => setHoveredSelf(true)}
        onBlur={() => setHoveredSelf(false)}
        aria-label="Ask Zoe, my AI Assistant"
        className={
          'pointer-events-auto relative w-full h-full cursor-pointer transition-transform duration-fast ease ' +
          (hoveredSelf ? 'scale-110' : 'scale-100') +
          ' focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 rounded-full'
        }
      >
        <div className="zoe-bob relative w-full h-full">
          <img src={zoeBody} alt="" className="absolute inset-0 w-full h-full object-contain select-none" draggable="false" />
          {/* Cropped/scaled to the exact pixel bounds of the black visor cutout on
              zoe-body.png vs. the glowing pill in the visor PNGs (measured directly
              from both assets), so the two layers align without manual guesswork. */}
          <div
            className="absolute overflow-hidden"
            style={{ left: '30.76%', top: '21.09%', width: '38.28%', height: '26.17%' }}
          >
            <img
              src={visorSrc}
              alt=""
              draggable="false"
              className="absolute select-none max-w-none transition-transform duration-fast ease"
              style={{
                ...visorLayout,
                maxWidth: 'none',
                transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
              }}
            />
          </div>
        </div>
      </button>
    </div>
  )
}
