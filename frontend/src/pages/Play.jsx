import { Link } from 'react-router-dom'
import GameWidget from '../components/GameWidget'
import { linkTeal, mutedText } from '../styles/classNames'

export default function Play() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <Link to="/" className={`text-sm ${linkTeal}`}>
        ← Back home
      </Link>

      <h1 className="mt-6 text-2xl sm:text-3xl font-semibold font-display text-text-primary">Play a game</h1>
      <p className={`mt-2 ${mutedText}`}>
        Same game as the terminal's <code>play</code> command, plus a typing speed test - switch between them below.
      </p>
      <div className="mt-8">
        <GameWidget />
      </div>
    </div>
  )
}
