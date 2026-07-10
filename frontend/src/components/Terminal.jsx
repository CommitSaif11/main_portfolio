import { useEffect, useRef, useState } from 'react'
import { useMode } from '../context/ModeContext'
import projects from '../data/projects.json'
import about from '../data/about.json'
import SKILLS from '../data/skills.json'
import { BUGS, GAME_SECONDS } from '../data/bugs'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const NETWORK_ERROR_MESSAGE = "Couldn't reach the server just now - try again in a moment."

const TIMELINE = [
  { hash: 'a1e9f02', date: '2020-05', msg: 'Class X (CBSE), Eastern Railway High School - 95.2%' },
  { hash: 'b3c7d18', date: '2022-05', msg: 'Class XII (CBSE), Hem Sheela Model School - 89.2%' },
  { hash: 'c9021ab', date: '2023-08', msg: 'feat: start B.E. AI & ML, Cambridge Institute of Technology' },
  { hash: 'd41f5e6', date: '2024-11', msg: 'feat(connecthub): async full-stack social platform shipped' },
  { hash: 'e7702bc', date: '2025-02', msg: 'feat(fitnessai): pose-estimation form checker shipped' },
  { hash: 'f10a9dd', date: '2025-05', msg: 'feat(mulenet): fraud intelligence platform, AUC-ROC 99.1%' },
  { hash: '0b8c4ef', date: '2025-07', msg: 'feat(threatlens): APK malware analysis platform shipped' },
  { hash: '19d3a55', date: '2025-10', msg: 'chore: Oracle OCI GenAI + AI Vector Search certifications' },
  { hash: '2ef6b70', date: '2025-12', msg: 'feat(siliconseal): SIH 2025 national finals, defense-sector client' },
  { hash: '3a45c81', date: '2026-01', msg: 'feat: start Samsung PRISM internship, Samsung R&D Institute India' },
]

const OPEN_EVENT = 'terminal:open'

export function openTerminal() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

function projectBySlug(slug) {
  const target = slug.toLowerCase()
  return projects.find((p) => p.id.toLowerCase() === target || p.name.toLowerCase() === target)
}

function helpText() {
  return [
    'Available commands:',
    '  help                    show this list',
    '  about                   who Saif is',
    '  projects                list all projects',
    '  skills                  tech stack',
    '  contact                 how to reach him',
    '  cd projects/<name>      enter a project directory',
    '  cat readme              print the current project\'s summary',
    '  ask "<question>"        ask the RAG chatbot',
    '  git log --oneline       career timeline',
    '  play                    fix-the-bug typing game',
    '  clear                   clear the screen',
  ]
}

let nextId = 1

export default function Terminal() {
  const { mode } = useMode()
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState([{ id: nextId++, type: 'output', text: "Type 'help' to get started." }])
  const [input, setInput] = useState('')
  const [cwd, setCwd] = useState('~')
  const [cmdHistory, setCmdHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(null)
  const [game, setGame] = useState(null)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)
  const gameTimerRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  // Flips the whole site into the matrix-green "hacker" palette the moment the
  // terminal opens (the same accent developer mode used to have), so opening it
  // is unmistakably a mode-shift, not just another modal.
  useEffect(() => {
    if (open) {
      document.documentElement.setAttribute('data-terminal-open', 'true')
    } else {
      document.documentElement.removeAttribute('data-terminal-open')
    }
    return () => document.documentElement.removeAttribute('data-terminal-open')
  }, [open])

  useEffect(() => {
    function onOpen() {
      setOpen(true)
    }
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_EVENT, onOpen)
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lines])

  useEffect(() => {
    function onKeyDown(e) {
      const isToggleCombo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      const tag = document.activeElement?.tagName
      const isTypingElsewhere = tag === 'INPUT' || tag === 'TEXTAREA'
      const isTilde = e.key === '~' && !isTypingElsewhere

      if (isToggleCombo || isTilde) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  useEffect(() => () => clearInterval(gameTimerRef.current), [])

  function print(text, type = 'output') {
    setLines((prev) => [...prev, ...text.map((t) => ({ id: nextId++, type, text: t }))])
  }

  function startGame() {
    const target = BUGS[Math.floor(Math.random() * BUGS.length)]
    setGame({ target, startTime: Date.now(), timeLeft: GAME_SECONDS })
    print([
      'FIX THE BUG BEFORE IT SHIPS - type the line exactly, press Enter when done.',
      `> ${target}`,
      `You have ${GAME_SECONDS} seconds. Go.`,
    ])
    clearInterval(gameTimerRef.current)
    gameTimerRef.current = setInterval(() => {
      setGame((g) => {
        if (!g) return g
        const timeLeft = g.timeLeft - 1
        if (timeLeft <= 0) {
          clearInterval(gameTimerRef.current)
          print(["Time's up! The bug shipped to production. Type 'play' to try again."])
          return null
        }
        return { ...g, timeLeft }
      })
    }, 1000)
  }

  function finishGame(success) {
    clearInterval(gameTimerRef.current)
    setGame((g) => {
      if (!g) return g
      const elapsedMin = Math.max((Date.now() - g.startTime) / 1000 / 60, 0.001)
      const words = g.target.length / 5
      const wpm = Math.round(words / elapsedMin)
      const typed = input
      let correct = 0
      for (let i = 0; i < typed.length && i < g.target.length; i++) {
        if (typed[i] === g.target[i]) correct += 1
      }
      const accuracy = typed.length ? Math.round((correct / typed.length) * 100) : 0
      print([
        success ? 'Bug fixed. Deploy approved.' : 'Not quite - bug shipped anyway.',
        `WPM: ${wpm}  Accuracy: ${accuracy}%`,
      ])
      return null
    })
  }

  async function runAsk(question) {
    const loadingId = nextId++
    setLines((prev) => [...prev, { id: loadingId, type: 'output', text: 'Thinking…' }])
    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, mode: mode ?? 'recruiter' }),
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      const answerLines = [
        data.used_fallback ? '[offline mode - degraded response]' : null,
        data.answer,
        data.sources?.length ? `sources: ${data.sources.join(', ')}` : null,
      ].filter(Boolean)
      setLines((prev) => prev.map((l) => (l.id === loadingId ? { ...l, text: answerLines.join('\n') } : l)))
    } catch {
      setLines((prev) =>
        prev.map((l) => (l.id === loadingId ? { ...l, type: 'error', text: NETWORK_ERROR_MESSAGE } : l)),
      )
    }
  }

  function runCommand(raw) {
    const trimmed = raw.trim()
    if (!trimmed) return

    const [cmd, ...rest] = trimmed.split(/\s+/)
    const lower = cmd.toLowerCase()
    const argLine = trimmed.slice(cmd.length).trim()

    switch (lower) {
      case 'help':
        print(helpText())
        break
      case 'about':
        print([about.summary, '', about.what_i_do])
        break
      case 'projects':
        print(projects.map((p) => `${p.id.padEnd(14)} ${p.tagline}`))
        break
      case 'skills':
        print(Object.entries(SKILLS).map(([k, v]) => `${k}: ${v.join(', ')}`))
        break
      case 'contact':
        print([
          'Email:    alamsaif1107@gmail.com',
          'LinkedIn: https://www.linkedin.com/in/md-saif-alam-18426b311/',
          'GitHub:   https://github.com/CommitSaif11',
          "(or use the /contact page, or the chat widget)",
        ])
        break
      case 'clear':
        setLines([])
        break
      case 'cd': {
        const arg = rest[0]
        if (!arg || arg === '~') {
          setCwd('~')
          break
        }
        const match = arg.match(/^projects\/(.+)$/)
        if (!match) {
          print([`cd: no such directory: ${arg}`], 'error')
          break
        }
        const project = projectBySlug(match[1])
        if (!project) {
          print([`cd: no such project: ${match[1]}`], 'error')
          break
        }
        setCwd(`~/projects/${project.id}`)
        break
      }
      case 'cat': {
        if (argLine !== 'readme') {
          print([`cat: ${argLine || 'readme'}: no such file`], 'error')
          break
        }
        const match = cwd.match(/^~\/projects\/(.+)$/)
        if (!match) {
          print(['cat: readme: not inside a project directory'], 'error')
          break
        }
        const project = projectBySlug(match[1])
        print([
          `# ${project.name}`,
          project.tagline,
          '',
          `Built for: ${project.built_for}`,
          `Stack: ${project.tech_stack.join(', ')}`,
          '',
          ...project.impact_metrics.map((m) => `- ${m}`),
          '',
          project.github ? `github: ${project.github}` : null,
          project.live_demo ? `demo: ${project.live_demo}` : null,
        ].filter(Boolean))
        break
      }
      case 'ask': {
        const match = trimmed.match(/^ask\s+"(.+)"$/i)
        if (!match) {
          print(['usage: ask "<question>"'], 'error')
          break
        }
        runAsk(match[1])
        break
      }
      case 'git':
        if (argLine === 'log --oneline') {
          print(TIMELINE.map((t) => `${t.hash}  ${t.date}  ${t.msg}`))
        } else {
          print(["git: command not found in this timeline"], 'error')
        }
        break
      case 'play':
        startGame()
        break
      default:
        print([`command not found, type 'help'`], 'error')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const value = input

    if (game) {
      print([`> ${value}`], 'input')
      finishGame(value === game.target)
      setInput('')
      return
    }

    print([`${cwd} $ ${value}`], 'input')
    if (value.trim()) {
      setCmdHistory((prev) => [...prev, value])
    }
    setHistoryIndex(null)
    runCommand(value)
    setInput('')
  }

  function handleKeyDown(e) {
    if (game) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (cmdHistory.length === 0) return
      const nextIndex = historyIndex === null ? cmdHistory.length - 1 : Math.max(historyIndex - 1, 0)
      setHistoryIndex(nextIndex)
      setInput(cmdHistory[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === null) return
      const nextIndex = historyIndex + 1
      if (nextIndex >= cmdHistory.length) {
        setHistoryIndex(null)
        setInput('')
      } else {
        setHistoryIndex(nextIndex)
        setInput(cmdHistory[nextIndex])
      }
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-base/80 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Terminal"
    >
      <div className="w-full max-w-2xl h-[min(560px,80vh)] bg-bg-elevated text-teal-400 font-mono text-sm rounded-lg shadow-2xl flex flex-col overflow-hidden border border-teal-500/30">
        <div className="flex items-center justify-between px-4 py-2 border-b border-teal-500/20 text-teal-500 text-xs">
          <span>saif@portfolio: {cwd}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="hover:text-teal-200 transition duration-fast ease focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 focus-visible:outline-offset-2 rounded-sm"
          >
            close (Esc)
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {lines.map((l) => (
            <pre
              key={l.id}
              className={
                'whitespace-pre-wrap break-words ' +
                (l.type === 'error' ? 'text-red-400' : l.type === 'input' ? 'text-teal-200' : 'text-teal-400')
              }
            >
              {l.text}
            </pre>
          ))}
          {game && (
            <p className="text-coral-400">time left: {game.timeLeft}s</p>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-2 border-t border-teal-500/20">
          <span>{game ? '>' : `${cwd} $`}</span>
          <label htmlFor="terminal-input" className="sr-only">
            Terminal command input
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent outline-none text-teal-200"
            autoComplete="off"
            spellCheck="false"
            aria-label="Terminal command input"
          />
          <span className="terminal-cursor">▍</span>
        </form>
      </div>
    </div>
  )
}
