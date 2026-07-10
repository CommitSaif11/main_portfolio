import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Trophy,
  Medal,
  Building2,
  Rocket,
  Cpu,
  Network,
  Server,
  Boxes,
  Bug,
  Sparkles,
  Joystick,
  CircleDot,
  BedDouble,
  Smartphone,
  Shield,
  Clapperboard,
} from 'lucide-react'

export const IMPACT_ITEMS = {
  recruiter: [
    { icon: Trophy, text: 'SIH 2025 Finalist' },
    { icon: Medal, text: 'MLH Hackathon - 2nd Place' },
    { icon: Building2, text: 'Samsung PRISM Intern (Samsung R&D Institute India)' },
    { icon: Rocket, text: '6+ AI-Integrated Full-Stack Projects Shipped' },
  ],
  friend: [
    {
      icon: Server,
      text: 'Achievement unlocked: convinced a bank-grade fraud model to run on a free-tier server without crying',
    },
    { icon: Boxes, text: "Built more side projects than I've finished video games" },
    { icon: Bug, text: "Once debugged a rate-limit error for 3 hours before realizing I typo'd the API key" },
    { icon: Trophy, text: "Also, actual SIH 2025 Finalist, in case you didn't believe any of the above" },
    {
      icon: Cpu,
      text: 'Built a 4-agent LLM pipeline for malware analysis (ThreatLens) - Triage, Analyst, Synthesizer, Reporter',
    },
    { icon: Network, text: '99.1% AUC-ROC fraud model with sub-50ms live scoring API (MuleNet)' },
    { icon: Sparkles, text: 'Curiously tries everything, actually finishes... some things' },
    { icon: Joystick, text: 'Played Red Dead Redemption 2 and got completely, unapologetically addicted' },
    { icon: CircleDot, text: "Plays pool casually - and loses casually too, but with great form" },
    {
      icon: BedDouble,
      text: 'Once stayed up 24+ hours vibe-coding, then did DSA, gym, and badminton, cooked a meal, and slept for 48 hours straight',
    },
    { icon: Shield, text: 'Certified Marvel & Spider-Man mega-fan - has opinions about every phase, will share them unprompted' },
    { icon: Clapperboard, text: 'Watches literally anything anyone recommends - webseries, anime, movies, zero filter' },
    { icon: Smartphone, text: 'Professional doomscroller - can lose 2 hours to reels without noticing time passed' },
  ],
}

// One color per achievement, cycling in a fixed order and looping every 4.
// Violet and amber are used only in this component - everywhere else stays teal/coral.
const COLORS = [
  {
    name: 'teal',
    text: 'text-[#2DD4BF]',
    border: 'border-[#2DD4BF]/40',
    glow: 'shadow-[0_0_50px_rgba(45,212,191,0.5)]',
    dotActive: 'bg-[#2DD4BF]',
    bg: 'bg-[#2DD4BF]/15',
  },
  {
    name: 'coral',
    text: 'text-[#FF7043]',
    border: 'border-[#FF7043]/40',
    glow: 'shadow-[0_0_50px_rgba(255,112,67,0.5)]',
    dotActive: 'bg-[#FF7043]',
    bg: 'bg-[#FF7043]/15',
  },
  {
    name: 'violet',
    text: 'text-[#A78BFA]',
    border: 'border-[#A78BFA]/40',
    glow: 'shadow-[0_0_50px_rgba(167,139,250,0.5)]',
    dotActive: 'bg-[#A78BFA]',
    bg: 'bg-[#A78BFA]/15',
  },
  {
    name: 'amber',
    text: 'text-[#FBBF24]',
    border: 'border-[#FBBF24]/40',
    glow: 'shadow-[0_0_50px_rgba(251,191,36,0.5)]',
    dotActive: 'bg-[#FBBF24]',
    bg: 'bg-[#FBBF24]/15',
  },
]

const CYCLE_MS = 3000

function useInView(ref) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
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

// Parses a leading number (int or decimal) plus its suffix, e.g. "99.1% AUC..." -> ['99.1', '% AUC...']
function splitLeadingNumber(text) {
  const match = text.match(/^(\d+(?:\.\d+)?)(.*)$/s)
  if (!match) return null
  return { raw: match[1], rest: match[2], decimals: match[1].includes('.') ? match[1].split('.')[1].length : 0 }
}

function useCountUpText(text, active) {
  const parsed = splitLeadingNumber(text)
  const [display, setDisplay] = useState(parsed ? `0${parsed.rest}` : text)

  useEffect(() => {
    if (!parsed) {
      setDisplay(text)
      return undefined
    }
    if (!active) {
      setDisplay(`0${parsed.rest}`)
      return undefined
    }

    const target = parseFloat(parsed.raw)
    const duration = 1100
    const start = performance.now()
    let raf

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(`${(target * eased).toFixed(parsed.decimals)}${parsed.rest}`)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, active])

  return display
}

// One coverflow "slot": center/prev/next/hidden, each with its own x-offset/
// scale/blur/opacity so the strip reads as a genuine 3-card filmstrip with
// depth. Cards are a fixed width (not full-container width) and positioned via
// inline transform (centered with left-1/2 + translateX(-50% + offset)) so the
// prev/next cards land in real, wide-open space beside the center card instead
// of being clipped to a sliver by a same-width container.
const CARD_WIDTH_PX = 288 // matches the w-72 class on CoverflowCard
const SLOT_CONFIG = {
  center: { x: 0, scale: 1, opacity: 1, blurPx: 0, z: 20 },
  prev: { x: -240, scale: 0.78, opacity: 0.55, blurPx: 3, z: 10 },
  next: { x: 240, scale: 0.78, opacity: 0.55, blurPx: 3, z: 10 },
  hidden: { x: 0, scale: 0.5, opacity: 0, blurPx: 6, z: 0 },
}

function CoverflowCard({ item, color, slot, active, countUp, onClick }) {
  const Icon = item.icon
  const displayText = useCountUpText(item.text, countUp)
  const cfg = SLOT_CONFIG[slot]

  return (
    <button
      type="button"
      onClick={onClick}
      aria-hidden={slot !== 'center'}
      tabIndex={slot === 'center' ? 0 : -1}
      style={{
        width: CARD_WIDTH_PX,
        transform: `translateX(calc(-50% + ${cfg.x}px)) scale(${cfg.scale})`,
        opacity: cfg.opacity,
        filter: cfg.blurPx ? `blur(${cfg.blurPx}px)` : 'none',
        zIndex: cfg.z,
        transition: 'transform 500ms ease-out, opacity 500ms ease-out, filter 500ms ease-out',
        pointerEvents: slot === 'hidden' ? 'none' : 'auto',
      }}
      className={
        'absolute top-0 left-1/2 h-full flex flex-col items-center justify-center text-center px-6 py-10 ' +
        'rounded-2xl border ' +
        color.bg +
        ' ' +
        color.border +
        ' ' +
        (active ? color.glow : '')
      }
    >
      <Icon className={color.text} size={64} strokeWidth={1.5} aria-hidden="true" />
      <p className={`mt-5 text-base sm:text-lg font-semibold font-display max-w-sm ${color.text}`}>
        {displayText}
      </p>
    </button>
  )
}

// Recruiter: a coverflow-style carousel - the active achievement sits large and
// sharp at center, with the previous/next achievements peeking in blurred from
// either edge, so advancing (auto or manual) reads as a filmstrip sliding through.
function RecruiterImpact({ items }) {
  const containerRef = useRef(null)
  const inView = useInView(containerRef)

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef(null)
  const wheelCooldownRef = useRef(false)

  useEffect(() => {
    indexRef.current = index
  }, [index])

  const goTo = useCallback(
    (next) => {
      setIndex(((next % items.length) + items.length) % items.length)
    },
    [items.length],
  )

  useEffect(() => {
    if (paused) return undefined
    intervalRef.current = setInterval(() => {
      goTo(indexRef.current + 1)
    }, CYCLE_MS)
    return () => clearInterval(intervalRef.current)
  }, [paused, goTo])

  // Mouse wheel / trackpad scroll over the carousel advances through the
  // achievements instead of scrolling the page - a native (non-passive)
  // listener is needed since React's onWheel can't reliably preventDefault.
  // Cooldown keeps one scroll gesture (which fires many wheel events) from
  // firing off a dozen index changes at once.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return undefined
    function handleWheel(e) {
      e.preventDefault()
      if (wheelCooldownRef.current) return
      wheelCooldownRef.current = true
      goTo(indexRef.current + (e.deltaY > 0 ? 1 : -1))
      setTimeout(() => {
        wheelCooldownRef.current = false
      }, 450)
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [goTo])

  const n = items.length
  const prevIndex = (index - 1 + n) % n
  const nextIndex = (index + 1) % n

  function slotFor(i) {
    if (i === index) return 'center'
    if (i === prevIndex) return 'prev'
    if (i === nextIndex) return 'next'
    return 'hidden'
  }

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="w-full max-w-3xl mx-auto select-none"
    >
      <span className="block text-center text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary mb-4">
        Impact
      </span>

      {/* Wider than the cards themselves (max-w-3xl vs a 288px card) on purpose -
          that's the space the prev/next cards peek into. Without this extra room
          the clip box was the same width as the card, so the blurred neighbors
          got clipped down to an invisible sliver instead of actually showing. */}
      <div className="relative h-56 sm:h-60 overflow-hidden">
        {items.map((item, i) => (
          <CoverflowCard
            key={item.text}
            item={item}
            color={COLORS[i % COLORS.length]}
            slot={slotFor(i)}
            active={i === index}
            countUp={inView && i === index}
            onClick={() => goTo(i === prevIndex ? index - 1 : i === nextIndex ? index + 1 : i)}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((it, i) => {
          const dotColor = COLORS[i % COLORS.length]
          const active = i === index
          return (
            <button
              key={it.text}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show achievement ${i + 1} of ${items.length}`}
              aria-current={active}
              className={
                'rounded-full transition-all duration-300 ease ' +
                (active ? 'w-6 h-2 ' + dotColor.dotActive : 'w-2 h-2 bg-border-subtle hover:bg-text-tertiary')
              }
            />
          )
        })}
      </div>
    </div>
  )
}

// Tiny synthesized SFX for the card board - no audio assets needed. Every call is
// wrapped in try/catch since Web Audio can be blocked by autoplay policy; sound is
// a nice-to-have and must never break rendering if it fails.
let sharedAudioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioCtx = window.AudioContext || window.webkitAudioContext
  if (!AudioCtx) return null
  if (!sharedAudioCtx) sharedAudioCtx = new AudioCtx()
  return sharedAudioCtx
}

// Browsers only allow audio to actually play once the context is 'running', which
// requires a user gesture. resume() must be called (and awaited) - calling it and
// immediately scheduling sound in the same tick silently produces no audio in some
// browsers, so every sound goes through this to make sure the context is live first.
function withAudioContext(callback) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'running') {
    callback(ctx)
    return
  }
  ctx.resume().then(() => callback(ctx)).catch(() => {})
}

const CARD_SOUND_SRC = '/cards_sound.mp3'

// Unlocks/warms audio playback on the very first interaction anywhere on the page,
// so later scroll-triggered sounds (which aren't themselves a user gesture) are
// allowed to play. Primes both the synthesized SFX context and the card sound file.
export function unlockCardAudio() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {})

  try {
    const el = new Audio(CARD_SOUND_SRC)
    el.volume = 0
    el.play()
      .then(() => el.pause())
      .catch(() => {})
  } catch {
    // ignore - audio is best-effort
  }
}

// The actual "card lands on the board" sound - plays the provided mp3. A fresh
// Audio instance per call so overlapping/staggered notes don't cut each other off.
function playCardLandSound() {
  try {
    const audio = new Audio(CARD_SOUND_SRC)
    audio.volume = 1.0
    audio.play().catch(() => {})
  } catch {
    // ignore - audio is best-effort
  }
}

function playCardHoverTick() {
  withAudioContext((ctx) => {
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.04)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.06)
    } catch {
      // ignore - audio is best-effort
    }
  })
}

// A short "resistance creak" played while someone tries (and fails) to drag a note.
function playCurseCreak() {
  withAudioContext((ctx) => {
    try {
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(90, now)
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.18)
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0.05, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now)
      osc.stop(now + 0.2)
    } catch {
      // ignore - audio is best-effort
    }
  })
}

// A quick, self-contained bounce pulse played via the Web Animations API on
// hover-enter. Deliberately kept separate from the CSS `card-toss` keyframe
// (which drives the entrance) so hovering can never re-trigger the toss-in.
function playHoverBouncePulse(el) {
  if (!el?.animate) return
  el.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.16)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1.1)' },
    ],
    { duration: 360, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
  )
}

// Shown when someone tries to drag a note off the board - the notes don't want to move.
const CURSE_QUOTES = [
  '"Don\'t lift what isn\'t yours... or you\'ll awaken the curse." - Madara, probably',
  '"I\'m gonna be the one to move this note!" - Luffy (he did not move the note)',
  '"With great power comes great responsibility - put. it. back." - your friendly neighborhood Spider-Man',
  '"Throughout heaven and earth, this note alone is unmovable." - Gojo, unbothered',
  '"Perfectly balanced. Stop ruining it." - Thanos, mildly annoyed',
  '"A shinobi never touches what isn\'t theirs. Unless it\'s a scroll." - Kakashi, judging you',
  '"I am Iron Man. This achievement stays exactly where it is." - Tony, from inside the suit',
  '"Whatever you\'re doing, it\'s cursed now." - Itachi, tired of this',
  '"That which is pinned to the board shall remain pinned." - Levi, mid clean-up',
  '"Bold of you to assume this note respects free will." - Doctor Strange, seeing 14,000,605 futures',
]

const NOTE_ROTATIONS = [-6, 4, -3, 7, -8, 5]

// Hand-scattered corkboard positions (percent of the board's own width/height) -
// deliberately messy and overlapping in both directions, not a tidy grid or row.
const BOARD_POSITIONS = [
  { x: 3, y: 6 },
  { x: 34, y: 0 },
  { x: 60, y: 10 },
  { x: 22, y: 24 },
  { x: 48, y: 30 },
  { x: 2, y: 46 },
  { x: 66, y: 40 },
  { x: 30, y: 54 },
  { x: 12, y: 70 },
  { x: 52, y: 66 },
  { x: 68, y: 72 },
]

// Rough "thrown from a deck" starting vectors - varied directions/distances/spins
// so the notes don't all fly in from the same place.
const TOSS_VECTORS = [
  { x: -170, y: -70, rot: -55 },
  { x: 160, y: -50, rot: 50 },
  { x: -140, y: 90, rot: 65 },
  { x: 150, y: 110, rot: -60 },
  { x: -210, y: 10, rot: 35 },
  { x: 190, y: -110, rot: -40 },
  { x: -110, y: -120, rot: 45 },
  { x: 130, y: 60, rot: -30 },
]

// A "cursed" sticky note: it can be dragged, but resists heavily (the further you
// pull, the less it actually moves) and throws up a pop-culture warning once you
// try hard enough, then springs back to its resting spot on release.
const DRAG_QUOTE_THRESHOLD = 22
const DRAG_MAX_WIGGLE = 70

function AchievementNote({ item, index, rotation, toss, color, inView, position }) {
  const Icon = item.icon
  const elRef = useRef(null)
  const startRef = useRef({ x: 0, y: 0 })
  const quoteShownRef = useRef(false)
  const quoteTimeoutRef = useRef(null)

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [quote, setQuote] = useState(null)

  useEffect(() => () => clearTimeout(quoteTimeoutRef.current), [])

  function handlePointerDown(e) {
    elRef.current?.setPointerCapture?.(e.pointerId)
    startRef.current = { x: e.clientX, y: e.clientY }
    quoteShownRef.current = false
    clearTimeout(quoteTimeoutRef.current)
    setDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragging) return
    const rawDx = e.clientX - startRef.current.x
    const rawDy = e.clientY - startRef.current.y
    const rawDist = Math.hypot(rawDx, rawDy)

    // Resists at first, but loosens up enough that a determined pull can drag a
    // note clear of whatever it's overlapping so you can actually read it.
    const damp = 1 / (1 + rawDist / 90)
    const dx = Math.max(-DRAG_MAX_WIGGLE, Math.min(DRAG_MAX_WIGGLE, rawDx * damp * 0.7))
    const dy = Math.max(-DRAG_MAX_WIGGLE, Math.min(DRAG_MAX_WIGGLE, rawDy * damp * 0.7))
    setDragOffset({ x: dx, y: dy })

    if (rawDist > DRAG_QUOTE_THRESHOLD && !quoteShownRef.current) {
      quoteShownRef.current = true
      setQuote(CURSE_QUOTES[Math.floor(Math.random() * CURSE_QUOTES.length)])
      playCurseCreak()
    }
  }

  function handlePointerUp() {
    setDragging(false)
    setDragOffset({ x: 0, y: 0 })
    clearTimeout(quoteTimeoutRef.current)
    quoteTimeoutRef.current = setTimeout(() => setQuote(null), 2200)
  }

  return (
    <div
      ref={elRef}
      onMouseEnter={(e) => {
        playCardHoverTick()
        playHoverBouncePulse(e.currentTarget)
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={
        'group absolute w-32 sm:w-40 rounded-md border-2 px-3.5 py-3.5 sm:px-4 sm:py-4 bg-bg-surface cursor-grab active:cursor-grabbing touch-none ' +
        color.border +
        ' ' +
        color.bg +
        ' shadow-[0_6px_14px_rgba(0,0,0,0.35)] ' +
        'hover:rotate-0! hover:scale-110 hover:z-20 hover:shadow-[0_10px_24px_rgba(0,0,0,0.45)] ' +
        (inView ? ' card-toss' : ' opacity-0')
      }
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: dragging ? 50 : 10 - (index % 4),
        transform: inView ? undefined : `rotate(${rotation}deg)`,
        translate: `${dragOffset.x}px ${dragOffset.y}px`,
        transition: `transform 300ms ease${dragging ? '' : ', translate 450ms cubic-bezier(0.34, 1.56, 0.64, 1)'}`,
        animationDelay: inView ? `${index * 90}ms` : undefined,
        '--toss-x': `${toss.x}px`,
        '--toss-y': `${toss.y}px`,
        '--toss-rot': `${toss.rot}deg`,
        '--final-rot': `${rotation}deg`,
      }}
    >
      <Icon className={color.text} size={28} strokeWidth={1.75} aria-hidden="true" />
      <p className="mt-2 text-xs font-medium text-text-primary leading-snug">{item.text}</p>

      {quote && (
        <div
          role="status"
          className="quote-bubble absolute -top-3 left-1/2 w-48 rounded-md border border-border-default bg-bg-elevated px-3 py-2 text-[11px] leading-snug text-text-primary shadow-2xl z-30 pointer-events-none"
        >
          {quote}
        </div>
      )}
    </div>
  )
}

// Friend: a sticky-note corkboard - all achievements shown at once, scattered and
// tilted, no cycling. They toss in like a hand-dealt deck of cards on scroll, hover
// straightens a note and brings it to the front, and dragging one is met with heavy
// resistance and a cursed pop-culture warning.
function FriendImpact({ items }) {
  const containerRef = useRef(null)
  const inView = useInView(containerRef)

  const rotations = useMemo(
    () => items.map((_, i) => NOTE_ROTATIONS[i % NOTE_ROTATIONS.length]),
    [items],
  )

  useEffect(() => {
    if (!inView) return undefined
    // Sync the landing "thud" with each card's bounce, roughly 55% into its toss animation.
    const timers = items.map((_, i) => setTimeout(() => playCardLandSound(), i * 90 + 460))
    return () => timers.forEach(clearTimeout)
  }, [inView, items])

  // Warm up the audio context on the first interaction anywhere on the page, since
  // the scroll-triggered landing sound above isn't itself a user gesture.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockCardAudio, { once: true })
    window.addEventListener('keydown', unlockCardAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockCardAudio)
      window.removeEventListener('keydown', unlockCardAudio)
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto select-none">
      <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary mb-6">
        Impact (a very official corkboard - try moving one, I dare you)
      </p>
      <div className="relative h-[420px] sm:h-[480px] mx-4">
        {items.map((item, i) => (
          <AchievementNote
            key={item.text}
            item={item}
            index={i}
            rotation={rotations[i]}
            toss={TOSS_VECTORS[i % TOSS_VECTORS.length]}
            color={COLORS[i % COLORS.length]}
            inView={inView}
            position={BOARD_POSITIONS[i % BOARD_POSITIONS.length]}
          />
        ))}
      </div>
    </div>
  )
}

export default function HoverImpact({ mode = 'recruiter' }) {
  const items = IMPACT_ITEMS[mode] ?? IMPACT_ITEMS.recruiter

  if (mode === 'friend') return <FriendImpact items={items} />
  return <RecruiterImpact items={items} />
}
