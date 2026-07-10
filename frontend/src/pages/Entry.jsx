import { useState } from 'react'
import { useMode } from '../context/ModeContext'
import { unlockCardAudio } from '../components/HoverImpact'
import VisitorGlobe from '../components/VisitorGlobe'
import Reveal from '../components/Reveal'
import { mutedText, focusRing } from '../styles/classNames'

const OPTIONS = [
  {
    mode: 'recruiter',
    title: 'Recruiter',
    description: "I'm hiring or scoping for a role.",
  },
  {
    mode: 'friend',
    title: 'Friend',
    description: 'Show me around casually.',
  },
]

export default function Entry() {
  const { setMode } = useMode()
  const [globeStats, setGlobeStats] = useState(null)

  return (
    <div className="h-screen overflow-hidden bg-bg-base flex items-center justify-center px-6">
      <div className="relative w-full max-w-lg aspect-square">
        {/* Globe fills this whole box - large and fully visible, day or night
            texture picked automatically from the visitor's own local clock (see
            isDaytimeNow() in VisitorGlobe). The Welcome text + cards overlay only
            a compact band across the middle (roughly 30% of the globe's area),
            so most of the sphere stays clearly visible on either side/above/below. */}
        <div className="absolute inset-0 opacity-90 select-none">
          <VisitorGlobe showCaption={false} onStatsChange={setGlobeStats} />
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-4 pointer-events-none px-4">
          <Reveal delayMs={0} className="text-center pointer-events-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold font-display text-text-primary drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              Welcome
            </h1>
            <p className={`mt-1 text-sm ${mutedText} drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]`}>
              Pick the lens you want to view this site through.
            </p>
          </Reveal>

          <Reveal delayMs={150} className="grid grid-cols-2 gap-3 w-full max-w-xs pointer-events-auto">
            {OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => {
                  // Prime audio synchronously inside this click, since it's the first
                  // guaranteed user gesture on the page - later scroll-triggered card
                  // sounds on the friend-mode board aren't gestures themselves and some
                  // browsers (Safari in particular) only allow unmuted playback for
                  // elements primed during an actual gesture handler like this one.
                  unlockCardAudio()
                  setMode(option.mode)
                }}
                className={
                  'flex flex-col text-left bg-bg-surface/80 backdrop-blur-sm border border-border-default/70 ' +
                  'rounded-md p-3 transition duration-base ease shadow-lg ' +
                  'hover:bg-bg-surface/95 hover:border-teal-500/70 hover:shadow-glow-teal hover:scale-[1.02] ' +
                  `${focusRing}`
                }
              >
                <h2 className="text-sm font-medium font-display text-text-primary">{option.title}</h2>
                <p className={`mt-0.5 text-xs ${mutedText}`}>{option.description}</p>
              </button>
            ))}
          </Reveal>
        </div>

        {globeStats && (
          <p className={`absolute inset-x-0 bottom-2 text-center text-xs ${mutedText} drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)]`}>
            {globeStats.isFallback
              ? "No real visitors tracked yet - dots show places I've worked with or applied to."
              : `Visitors from ${globeStats.pinCount} ${globeStats.pinCount === 1 ? 'place' : 'places'} across ${globeStats.countryCount} ${globeStats.countryCount === 1 ? 'country' : 'countries'}`}
          </p>
        )}
      </div>
    </div>
  )
}
