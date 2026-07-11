import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal'
import { btnSky, cardShellBase, CARD_ACCENT, linkTeal, mutedText, fadedText } from '../styles/classNames'
import { CardAccentBar, CardBadge } from '../components/CardAccent'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const NETWORK_ERROR_MESSAGE = "Couldn't reach the server just now - try again in a moment."
const COOLDOWN_SECONDS = 10

export default function FitCheck({ embedded = false }) {
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const [cooldown, setCooldown] = useState(0)
  const cooldownRef = useRef(null)

  useEffect(() => () => clearInterval(cooldownRef.current), [])

  function startCooldown() {
    setCooldown(COOLDOWN_SECONDS)
    clearInterval(cooldownRef.current)
    cooldownRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(cooldownRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const text = jobDescription.trim()
    if (!text || loading || cooldown > 0) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`${API_URL}/fit-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_description: text }),
      })
      if (!res.ok) throw new Error('bad response')
      const data = await res.json()
      setResult(data)
    } catch {
      setError(NETWORK_ERROR_MESSAGE)
    } finally {
      setLoading(false)
      startCooldown()
    }
  }

  const disabled = loading || cooldown > 0 || !jobDescription.trim()

  // Embedded (Home page): full card treatment - sky blue is this tool's own
  // identity in the recruiter card color-by-meaning system (teal=default
  // project cards, violet=Experience, aurora green=How I Work), kept off
  // amber/yellow so it doesn't collide with the Stack section's AI/GenAI tag
  // color. Standalone /fit-check page keeps its own plain page layout (it
  // already has a back link + its own heading chrome, so a full card wrap
  // there would be redundant), but still picks up the sky textarea/button for
  // tool identity.
  return (
    <div
      className={
        embedded
          ? `${cardShellBase} ${CARD_ACCENT.sky.tint} ${CARD_ACCENT.sky.resting} ${CARD_ACCENT.sky.hover}`
          : 'max-w-3xl mx-auto px-6 py-16'
      }
    >
      {embedded && (
        <>
          <CardAccentBar color="sky" />
          <CardBadge color="sky">AI Tool</CardBadge>
        </>
      )}
      {!embedded && (
        <Link to="/" className={`text-sm ${linkTeal}`}>
          ← Back home
        </Link>
      )}
      <Reveal className={embedded ? undefined : 'mt-4'}>
        {embedded ? (
          <h2 className="text-xl font-semibold font-display text-text-primary">Check my fit</h2>
        ) : (
          <h1 className="text-2xl font-semibold font-display text-text-primary">Check my fit</h1>
        )}
        <p className={`mt-2 ${mutedText}`}>
          Paste a job description and get a quick read on how Saif's background lines up.
        </p>
      </Reveal>

      <Reveal delayMs={60} className="mt-8">
        <form onSubmit={handleSubmit}>
          <label htmlFor="job-description" className="sr-only">
            Job description
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            rows={10}
            className="w-full border border-border-default bg-bg-surface text-text-primary rounded-md p-4 text-sm outline-none transition duration-base ease focus:border-[#38BDF8] focus:shadow-[0_0_24px_rgba(56,189,248,0.45)] resize-y"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={disabled}
              className={`${btnSky} ${
                disabled ? '' : 'btn-sky-pulse'
              } disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none`}
            >
              {loading ? 'Analyzing...' : cooldown > 0 ? `Wait ${cooldown}s` : 'Check fit'}
            </button>
            {cooldown > 0 && !loading && (
              <span className={`text-xs ${fadedText}`}>Rate-limited to keep this feature sustainable.</span>
            )}
          </div>
        </form>
      </Reveal>

      {error && (
        <div className="mt-8 border border-red-900 bg-red-950/40 text-red-300 rounded-md p-4 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-10 space-y-8 animate-pulse" aria-hidden="true">
          <section>
            <div className="h-3 w-32 bg-bg-surface rounded" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 bg-bg-surface rounded-full" />
              <div className="h-6 w-24 bg-bg-surface rounded-full" />
              <div className="h-6 w-16 bg-bg-surface rounded-full" />
            </div>
          </section>
          <section>
            <div className="h-3 w-24 bg-bg-surface rounded" />
            <div className="mt-3 flex gap-2">
              <div className="h-6 w-20 bg-bg-surface rounded-full" />
              <div className="h-6 w-16 bg-bg-surface rounded-full" />
            </div>
          </section>
          <section>
            <div className="h-3 w-20 bg-bg-surface rounded" />
            <div className="mt-3 space-y-2">
              <div className="h-3 w-full bg-bg-surface rounded" />
              <div className="h-3 w-5/6 bg-bg-surface rounded" />
              <div className="h-3 w-2/3 bg-bg-surface rounded" />
            </div>
          </section>
        </div>
      )}

      {!loading && result && (
        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-sm font-medium text-teal-400 uppercase tracking-wide">Matching skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.matching_skills.length === 0 && (
                <p className={`text-sm ${mutedText}`}>No strong overlaps found.</p>
              )}
              {result.matching_skills.map((skill) => (
                <span
                  key={skill}
                  className="text-xs rounded-full px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/30 transition duration-base ease hover:scale-105 hover:border-green-400 hover:bg-green-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-teal-400 uppercase tracking-wide">Room to grow</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {result.gaps.length === 0 && (
                <p className={`text-sm ${mutedText}`}>Nothing notable - strong overlap across the board.</p>
              )}
              {result.gaps.map((gap) => (
                <span
                  key={gap}
                  className="text-xs rounded-full px-3 py-1 bg-bg-surface text-text-secondary border border-border-default transition duration-base ease hover:scale-105 hover:border-teal-500/40 hover:text-teal-400"
                >
                  {gap}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium text-teal-400 uppercase tracking-wide">Summary</h2>
            <p className="mt-3 text-sm text-text-primary whitespace-pre-wrap">{result.overall_fit_summary}</p>
          </section>
        </div>
      )}

      <div className="mt-12 border-t border-border-subtle pt-6 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <p className={`text-xs max-w-md ${fadedText}`}>
          AI-generated analysis based on Saif's public profile - for a fuller picture, reach out directly.
        </p>
        <Link to="/contact" className={`shrink-0 text-sm ${linkTeal}`}>
          Contact Saif
        </Link>
      </div>
    </div>
  )
}
