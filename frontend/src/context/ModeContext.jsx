import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'

export const MODES = ['recruiter', 'friend']
const STORAGE_KEY = 'mode'

const ModeContext = createContext(undefined)

export function ModeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const initial = MODES.includes(stored) ? stored : null
    // Set synchronously (before first paint) so returning visitors never see a
    // flash of the wrong accent theme while React commits.
    if (initial) document.documentElement.setAttribute('data-mode', initial)
    return initial
  })

  useEffect(() => {
    if (mode) {
      localStorage.setItem(STORAGE_KEY, mode)
    }
  }, [mode])

  // Drives the mode-wide accent theme (see index.css [data-mode] overrides).
  // useLayoutEffect so switching modes later re-themes before the browser paints.
  useLayoutEffect(() => {
    if (mode) {
      document.documentElement.setAttribute('data-mode', mode)
    } else {
      document.documentElement.removeAttribute('data-mode')
    }
  }, [mode])

  const setMode = (newMode) => {
    if (MODES.includes(newMode)) {
      setModeState(newMode)
    }
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider')
  }
  return context
}
