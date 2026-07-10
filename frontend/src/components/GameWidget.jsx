import { useEffect, useRef, useState } from 'react'
import { Keyboard, Bug } from 'lucide-react'
import { mutedText, btnPrimary, btnSecondary, focusRing } from '../styles/classNames'
import { BUGS, GAME_SECONDS } from '../data/bugs'

const TYPING_TEXT =
  'the quick brown fox jumps over the lazy dog while the morning sun rises slowly over the quiet hills and a gentle breeze moves through the trees'

const MY_SCORE = 105

const SEED_LEADERBOARD = [
  { name: 'yoursss', wpm: 67 },
  { name: 'Sallu bhai', wpm: 68 },
  { name: 'Subham', wpm: 45 },
  { name: 'Mota bhai', wpm: 35 },
]

const STORAGE_KEY = 'typing-test-best-wpm'

function loadBest() {
  const raw = localStorage.getItem(STORAGE_KEY)
  const parsed = Number(raw)
  return raw && Number.isFinite(parsed) ? parsed : null
}

// Standard WPM formula: 5 typed characters = 1 "word", regardless of where the
// actual word boundaries fall - avoids penalizing typos in a way that blocks
// completion entirely.
function calcWpm(typedLength, elapsedMs) {
  const elapsedMinutes = Math.max(elapsedMs / 60000, 1 / 60)
  const words = typedLength / 5
  return Math.max(Math.round(words / elapsedMinutes), 1)
}

function TypingGame() {
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [typed, setTyped] = useState('')
  const [resultWpm, setResultWpm] = useState(null)
  const [best, setBest] = useState(() => loadBest())
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (phase === 'running' && inputRef.current) inputRef.current.focus()
  }, [phase])

  function start() {
    setTyped('')
    setResultWpm(null)
    startTimeRef.current = Date.now()
    setPhase('running')
  }

  function finish(value) {
    const wpm = calcWpm(value.length, Date.now() - startTimeRef.current)
    setResultWpm(wpm)
    setPhase('done')

    setBest((prevBest) => {
      const next = prevBest === null || wpm > prevBest ? wpm : prevBest
      localStorage.setItem(STORAGE_KEY, String(next))
      return next
    })
  }

  function handleChange(e) {
    const value = e.target.value
    setTyped(value)
    if (value.trim().length >= TYPING_TEXT.length) {
      finish(value)
    }
  }

  function reset() {
    setPhase('idle')
    setTyped('')
    setResultWpm(null)
  }

  const typedWords = typed.split(' ')
  const leaderboard =
    best === null
      ? []
      : [...SEED_LEADERBOARD, { name: 'You', wpm: best, isYou: true }].sort((a, b) => b.wpm - a.wpm)

  return (
    <div>
      <p className={`text-sm ${mutedText}`}>
        My score: <span className="font-semibold text-text-primary">{MY_SCORE} WPM</span> - can you beat it?
      </p>

      {phase === 'idle' && (
        <button type="button" onClick={start} className={`mt-4 ${btnPrimary}`}>
          Start typing test
        </button>
      )}

      {phase === 'running' && (
        <div className="mt-4">
          <p className="text-sm leading-relaxed select-none">
            {TYPING_TEXT.split(' ').map((word, i) => {
              const state =
                typedWords[i] === undefined ? 'pending' : typedWords[i] === word ? 'correct' : 'wrong'
              return (
                <span
                  key={i}
                  className={
                    state === 'correct'
                      ? 'text-teal-400'
                      : state === 'wrong'
                        ? 'text-coral-400 underline'
                        : 'text-text-secondary'
                  }
                >
                  {word}{' '}
                </span>
              )
            })}
          </p>
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            rows={3}
            spellCheck={false}
            className="mt-3 w-full rounded-md border border-border-default bg-bg-base text-text-primary text-sm p-3 outline-none focus:border-teal-500"
            placeholder="Start typing..."
          />
          <button
            type="button"
            onClick={() => finish(typed)}
            disabled={typed.trim().length === 0}
            className={`mt-3 text-sm disabled:opacity-40 ${mutedText} hover:text-teal-400 transition duration-fast ease underline underline-offset-2`}
          >
            Finish now
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-4">
          <p className="text-2xl font-semibold font-display text-teal-400">{resultWpm} WPM</p>
          <p className={`mt-1 text-sm ${mutedText}`}>
            {resultWpm >= MY_SCORE ? 'Ok wow, you actually beat me.' : 'Not bad - try again?'}
          </p>
          <button type="button" onClick={reset} className={`mt-3 ${btnSecondary}`}>
            Try again
          </button>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border-subtle">
          <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">Leaderboard</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {leaderboard.map((entry, i) => (
              <li
                key={entry.name}
                className={
                  'flex items-center justify-between rounded-sm px-2 py-1 ' +
                  (entry.isYou ? 'bg-teal-500/10 text-teal-400 font-medium' : 'text-text-primary')
                }
              >
                <span>
                  {i + 1}. {entry.name}
                </span>
                <span>{entry.wpm} WPM</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Same "fix the bug" game as the terminal's `play` command (same BUGS list) -
// type the buggy line exactly, before the clock runs out.
function BugGame() {
  const [phase, setPhase] = useState('idle') // idle | running | done
  const [target, setTarget] = useState(BUGS[0])
  const [typed, setTyped] = useState('')
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const [result, setResult] = useState(null)
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (phase === 'running' && inputRef.current) inputRef.current.focus()
  }, [phase])

  useEffect(() => () => clearInterval(timerRef.current), [])

  function start() {
    setTarget(BUGS[Math.floor(Math.random() * BUGS.length)])
    setTyped('')
    setResult(null)
    setTimeLeft(GAME_SECONDS)
    startTimeRef.current = Date.now()
    setPhase('running')
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          finish(false, typedRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)
  }

  // Kept in a ref too, since the interval closure above can't see fresh state.
  const typedRef = useRef('')
  useEffect(() => {
    typedRef.current = typed
  }, [typed])

  function finish(success, typedValue) {
    clearInterval(timerRef.current)
    const elapsedMin = Math.max((Date.now() - startTimeRef.current) / 1000 / 60, 0.001)
    const words = target.length / 5
    const wpm = Math.round(words / elapsedMin)
    let correct = 0
    for (let i = 0; i < typedValue.length && i < target.length; i++) {
      if (typedValue[i] === target[i]) correct += 1
    }
    const accuracy = typedValue.length ? Math.round((correct / typedValue.length) * 100) : 0
    setResult({ success, wpm, accuracy })
    setPhase('done')
  }

  function handleChange(e) {
    const value = e.target.value
    setTyped(value)
    if (value === target) finish(true, value)
  }

  function reset() {
    setPhase('idle')
    setTyped('')
    setResult(null)
  }

  return (
    <div>
      <p className={`text-sm ${mutedText}`}>Type the buggy line exactly before the clock runs out.</p>

      {phase === 'idle' && (
        <button type="button" onClick={start} className={`mt-4 ${btnPrimary}`}>
          Start fix-the-bug
        </button>
      )}

      {phase === 'running' && (
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <pre className="text-sm font-mono text-coral-400 whitespace-pre-wrap break-words">{target}</pre>
            <span className="shrink-0 ml-3 text-sm font-mono text-text-tertiary">{timeLeft}s</span>
          </div>
          <textarea
            ref={inputRef}
            value={typed}
            onChange={handleChange}
            rows={2}
            spellCheck={false}
            className="mt-3 w-full rounded-md border border-border-default bg-bg-base text-text-primary text-sm font-mono p-3 outline-none focus:border-teal-500"
            placeholder="Type it exactly..."
          />
        </div>
      )}

      {phase === 'done' && result && (
        <div className="mt-4">
          <p className={`text-2xl font-semibold font-display ${result.success ? 'text-teal-400' : 'text-coral-400'}`}>
            {result.success ? 'Bug fixed!' : "Time's up"}
          </p>
          <p className={`mt-1 text-sm ${mutedText}`}>
            WPM: {result.wpm} · Accuracy: {result.accuracy}%
          </p>
          <button type="button" onClick={reset} className={`mt-3 ${btnSecondary}`}>
            Try again
          </button>
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'typing', label: 'Typing test', icon: Keyboard },
  { id: 'bug', label: 'Fix the bug', icon: Bug },
]

// Same two games the terminal's `play` command offers (typing test isn't in
// the terminal, but the bug-fix game uses the exact same BUGS list) - this is
// the one shared widget, embedded on Friend's home page and at /play, instead
// of two disconnected implementations.
export default function GameWidget() {
  const [tab, setTab] = useState('typing')

  return (
    <div className="w-full max-w-xl mx-auto rounded-md border-2 border-[#FBBF24]/40 bg-bg-surface p-6 -rotate-1 shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-1 border border-border-subtle rounded-full p-1 text-sm bg-bg-base w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={
              `flex items-center gap-1.5 px-3 py-1 rounded-full transition duration-base ease ${focusRing} ` +
              (tab === id ? 'bg-[#FBBF24] text-bg-base' : 'text-text-secondary hover:text-[#FBBF24]')
            }
          >
            <Icon size={14} strokeWidth={2} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">{tab === 'typing' ? <TypingGame /> : <BugGame />}</div>
    </div>
  )
}
