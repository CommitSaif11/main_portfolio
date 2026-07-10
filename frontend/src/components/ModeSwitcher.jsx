import { MODES, useMode } from '../context/ModeContext'
import { focusRing } from '../styles/classNames'

const LABELS = {
  recruiter: 'Recruiter',
  friend: 'Friend',
}

export default function ModeSwitcher() {
  const { mode, setMode } = useMode()

  return (
    <div className="flex items-center gap-1 border border-border-subtle rounded-full p-1 text-sm bg-bg-surface">
      {MODES.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
          className={
            `px-3 py-1 rounded-full transition duration-base ease hover:scale-105 ${focusRing} ` +
            (mode === m
              ? 'bg-teal-500 text-bg-base shadow-glow-teal'
              : 'text-text-secondary hover:text-teal-400 hover:shadow-[0_0_16px_var(--teal-glow)]')
          }
        >
          {LABELS[m]}
        </button>
      ))}
    </div>
  )
}
