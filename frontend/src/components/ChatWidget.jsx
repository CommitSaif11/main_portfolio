import { useState, useRef, useEffect } from 'react'
import { Bot, Maximize2, Minimize2, Minus, X } from 'lucide-react'
import { useMode } from '../context/ModeContext'
import { focusRing } from '../styles/classNames'

const OPEN_EVENT = 'chat:open'

// Lets other components (e.g. the "Ask Zoe" hero CTA) open the widget itself
// instead of routing to /contact - mirrors Terminal's openTerminal() pattern.
export function openChatWidget() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const NETWORK_ERROR_MESSAGE =
  "Couldn't reach the server just now - try again in a moment."

const BOT_NAME = 'Zoe'

// Shown as clickable chips the moment the widget opens with no history yet -
// gives people something to click instead of staring at a blank input.
const INITIAL_SUGGESTIONS = {
  recruiter: [
    "What's he looking for?",
    'Walk me through MuleNet',
    'Is he open to relocating?',
    "What's his strongest project?",
  ],
  friend: [
    'What does Saif do for fun?',
    "What's the weirdest project he's built?",
    'Roast his code',
    "What's he actually looking for in a job?",
  ],
}

// Pattern-based follow-ups keyed by which source chunk got cited in the answer -
// simple and deterministic rather than another LLM round trip.
const FOLLOWUP_BY_SOURCE = {
  'project_mulenet.md': ['How does the SHAP explainability work?', 'What was the hardest part of that project?'],
  'project_siliconseal.md': ['How does the YOLOv8 + PaddleOCR pipeline work?', 'What made it a SIH finalist?'],
  'project_threatlens.md': ['How do the 4 LLM agents talk to each other?', 'What kind of malware does it catch?'],
  'project_sbifinverse.md': ['How does the "Aria" agent decide when to reach out?', "What's the tech stack behind it?"],
  'project_connecthub.md': ['What auth setup did he use?', 'What was his role on this one?'],
  'project_fitnessai.md': ['How does the pose estimation work?', 'What model is it built on?'],
  'about.md': ["What's he looking for next?", 'Is he open to remote roles?'],
  'resume.md': ['What certifications does he have?', "What's his strongest skill?"],
  'faq.md': ["What's his availability?", 'Does he need visa sponsorship?'],
}

const DEFAULT_FOLLOWUP = ["What's his strongest project?", 'What has he built recently?']

function followUpsForSources(sources) {
  const chips = []
  for (const source of sources) {
    for (const chip of FOLLOWUP_BY_SOURCE[source] ?? []) {
      if (!chips.includes(chip)) chips.push(chip)
    }
  }
  return (chips.length > 0 ? chips : DEFAULT_FOLLOWUP).slice(0, 3)
}

const LAUNCHER_LABEL = {
  recruiter: `Ask ${BOT_NAME}, my AI Assistant`,
  friend: `Ask ${BOT_NAME} about Saif`,
}

// A small pool per mode so the opening line isn't the same every time.
const GREETINGS = {
  recruiter: [
    `Hi, I'm ${BOT_NAME} - Saif's AI assistant. Ask me about his experience, skills, or fit for a role.`,
    `Hey, ${BOT_NAME} here. Happy to walk you through Saif's background - what are you hiring for?`,
    `Hi there! I'm ${BOT_NAME}. Try "What has Saif built?" or "Is he open to remote roles?"`,
    `${BOT_NAME} here, on call for Saif's resume questions. Ask away.`,
    `Hi! I'm ${BOT_NAME} - grounded in Saif's actual project data, not guesses. What do you want to know?`,
  ],
  friend: [
    `Hey, I'm ${BOT_NAME}! Ask me anything about Saif - I won't judge (much).`,
    `${BOT_NAME} here. Curious about Saif? Ask away, I know where the bodies (side projects) are buried.`,
    `Hi! I'm ${BOT_NAME}, Saif's chatbot sidekick. Try "what has Saif built?"`,
    `Hey hey, ${BOT_NAME} here. Go on, ask me something about Saif.`,
    `${BOT_NAME} reporting for duty. Ask me anything - I'm surprisingly candid.`,
  ],
}

export default function ChatWidget() {
  const { mode } = useMode()
  const [open, setOpen] = useState(false)
  const [maximized, setMaximized] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const listRef = useRef(null)
  const launcherLabel = LAUNCHER_LABEL[mode] ?? LAUNCHER_LABEL.recruiter

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading])

  // Lets the "Ask Zoe" hero CTA (and anything else) open the widget in full,
  // rather than routing away to /contact.
  useEffect(() => {
    function handleOpen() {
      setOpen(true)
      setMinimized(false)
    }
    window.addEventListener(OPEN_EVENT, handleOpen)
    return () => window.removeEventListener(OPEN_EVENT, handleOpen)
  }, [])

  // Pick a fresh random greeting + the mode-appropriate initial chips each time
  // the widget opens with no history yet.
  useEffect(() => {
    if (open && messages.length === 0) {
      const pool = GREETINGS[mode] ?? GREETINGS.recruiter
      setGreeting(pool[Math.floor(Math.random() * pool.length)])
      setSuggestions(INITIAL_SUGGESTIONS[mode] ?? INITIAL_SUGGESTIONS.recruiter)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  async function sendMessage(e, chipText) {
    e?.preventDefault()
    const text = (chipText ?? input).trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setSuggestions([])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, mode: mode ?? 'recruiter' }),
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      const sources = data.sources ?? []
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.answer,
          sources,
          usedFallback: !!data.used_fallback,
        },
      ])
      setSuggestions(followUpsForSources(sources))
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: NETWORK_ERROR_MESSAGE, error: true },
      ])
      setSuggestions(DEFAULT_FOLLOWUP)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Coral is reserved for this launcher's pulse/glow - the single most "come click me" element on the site */}
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v)
          setMinimized(false)
        }}
        aria-label={launcherLabel}
        aria-expanded={open}
        className={
          `fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full bg-coral-500 text-bg-base text-sm font-medium px-5 py-3 shadow-lg chat-widget-glow ` +
          `transition duration-base ease hover:bg-coral-400 hover:scale-[1.02] ${focusRing} focus-visible:outline-coral-400`
        }
      >
        <Bot size={18} strokeWidth={2} aria-hidden="true" />
        {open ? 'Close chat' : launcherLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Ask ${BOT_NAME} about Saif`}
          className={
            'fixed z-[60] border border-border-default bg-bg-elevated shadow-2xl flex flex-col overflow-hidden transition-[width,height] duration-base ease ' +
            (maximized
              ? 'bottom-6 right-6 rounded-lg w-[min(720px,calc(100vw-2rem))] h-[min(85vh,800px)]'
              : 'bottom-24 right-6 rounded-lg w-[min(360px,calc(100vw-2rem))] ' +
                (minimized ? 'h-auto' : 'h-[min(480px,calc(100vh-8rem))]'))
          }
        >
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle">
            <span className="flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-teal-500/15 text-teal-400">
              <Bot size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm font-display text-text-primary">{BOT_NAME}</p>
              {!minimized && (
                <p className="text-xs text-text-secondary truncate">Answers are grounded in Saif's actual project data.</p>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setMinimized((v) => !v)}
                aria-label={minimized ? 'Restore chat' : 'Minimize chat'}
                title={minimized ? 'Restore' : 'Minimize'}
                className={`p-1.5 rounded-sm text-text-secondary hover:text-teal-400 transition duration-fast ease ${focusRing}`}
              >
                <Minus size={15} strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMaximized((v) => !v)
                  setMinimized(false)
                }}
                aria-label={maximized ? 'Restore chat size' : 'Maximize chat'}
                title={maximized ? 'Restore size' : 'Maximize'}
                className={`p-1.5 rounded-sm text-text-secondary hover:text-teal-400 transition duration-fast ease ${focusRing}`}
              >
                {maximized ? (
                  <Minimize2 size={15} strokeWidth={2} aria-hidden="true" />
                ) : (
                  <Maximize2 size={15} strokeWidth={2} aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setMaximized(false)
                  setMinimized(false)
                }}
                aria-label="Close chat"
                title="Close"
                className={`p-1.5 rounded-sm text-text-secondary hover:text-coral-400 transition duration-fast ease ${focusRing}`}
              >
                <X size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
          </div>

          {minimized ? null : (
            <>
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-text-secondary">{greeting}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    'inline-block max-w-[85%] rounded-md px-3 py-2 text-sm text-left ' +
                    (m.role === 'user'
                      ? 'bg-teal-500 text-bg-base'
                      : m.error
                        ? 'bg-red-950/40 text-red-300 border border-red-900'
                        : 'bg-bg-surface text-text-primary border border-border-subtle')
                  }
                >
                  {m.usedFallback && (
                    <span className="inline-block mb-1 text-[10px] font-medium uppercase tracking-wide bg-amber-500/15 text-amber-400 rounded-full px-2 py-0.5">
                      Offline mode
                    </span>
                  )}
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {m.sources.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] border border-teal-500/40 text-teal-400 rounded-full px-2 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <p className="text-sm text-text-secondary">Thinking…</p>}
          </div>

          {!loading && suggestions.length > 0 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {suggestions.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => sendMessage(null, chip)}
                  className={
                    'text-xs rounded-full border border-teal-500/40 text-teal-400 px-3 py-1.5 ' +
                    `hover:bg-teal-500/10 transition duration-fast ease ${focusRing}`
                  }
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={sendMessage} className="border-t border-border-subtle p-3 flex gap-2">
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className={`flex-1 min-w-0 border border-border-default bg-bg-surface text-text-primary rounded-full px-3 py-2 text-sm outline-none transition duration-fast ease focus:border-teal-500`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`rounded-full bg-teal-500 text-bg-base text-sm px-4 py-2 disabled:opacity-40 transition duration-base ease hover:bg-teal-400 hover:scale-[1.02] ${focusRing}`}
            >
              Send
            </button>
          </form>
            </>
          )}
        </div>
      )}
    </>
  )
}
