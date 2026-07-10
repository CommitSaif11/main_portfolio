import { useEffect } from 'react'
import { TerminalSquare, Home, Trophy, User, FolderGit2, Target, Mail, PartyPopper } from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import ModeSwitcher from './ModeSwitcher'
import ChatWidget from './ChatWidget'
import Mascot from './Mascot'
import Terminal, { openTerminal } from './Terminal'
import { unlockCardAudio } from './HoverImpact'
import { useMode } from '../context/ModeContext'
import { focusRing } from '../styles/classNames'

// All 3 modes are single-scroll home pages now - nav scroll-links to Home's own
// sections instead of routing to separate pages for them. /projects (and each
// project's own /projects/:id detail page) and /fit-check still get real route
// changes, since they need to be independently reachable/bookmarkable and don't
// fit as an inline anchor-truncated teaser.
const NAV_BY_MODE = {
  recruiter: [
    { type: 'scroll', id: 'hero', label: 'Home', icon: Home },
    { type: 'scroll', id: 'impact', label: 'Impact', icon: Trophy },
    { type: 'scroll', id: 'story', label: 'About', icon: User },
    { type: 'route', to: '/projects', label: 'Projects', icon: FolderGit2 },
    { type: 'route', to: '/fit-check', label: 'Check my fit', icon: Target },
    { type: 'scroll', id: 'contact', label: 'Contact', icon: Mail },
  ],
  friend: [
    { type: 'scroll', id: 'hero', label: 'Home', icon: Home },
    { type: 'scroll', id: 'personal', label: 'About me', icon: User },
    // Placed right before Projects (not tucked away as a separate button off to the
    // side) so it's impossible to miss while scanning the nav.
    { type: 'action', id: 'terminal', label: 'Terminal', icon: TerminalSquare, onClick: openTerminal },
    { type: 'scroll', id: 'tour', label: 'Try this', icon: PartyPopper },
    { type: 'scroll', id: 'projects', label: 'Projects', icon: FolderGit2 },
    { type: 'scroll', id: 'contact', label: 'Contact', icon: Mail },
  ],
}

// Shared look for every nav item: icon lifts + glows and the label gets a soft
// text-glow on hover, plus an underline that slides in from the center.
const NAV_ITEM_CLASS =
  `group relative flex items-center gap-1.5 rounded-sm px-1 py-1 transition duration-fast ease ${focusRing}`
const NAV_ICON_CLASS =
  'transition duration-base ease group-hover:scale-125 group-hover:-translate-y-0.5 ' +
  'group-hover:drop-shadow-[0_0_6px_var(--teal-glow)]'
const NAV_LABEL_CLASS = 'group-hover:[text-shadow:0_0_10px_var(--teal-glow)]'
const NAV_UNDERLINE_CLASS =
  'pointer-events-none absolute left-1/2 -bottom-1 h-px w-full -translate-x-1/2 scale-x-0 bg-teal-400 ' +
  'transition-transform duration-base ease group-hover:scale-x-100'

function NavItemContent({ Icon, label, active }) {
  return (
    <>
      <Icon
        size={15}
        strokeWidth={2}
        aria-hidden="true"
        className={NAV_ICON_CLASS + (active ? ' text-teal-400' : '')}
      />
      <span className={NAV_LABEL_CLASS}>{label}</span>
      <span aria-hidden="true" className={NAV_UNDERLINE_CLASS} />
    </>
  )
}

function ModeNavLinks({ items }) {
  const navigate = useNavigate()
  const location = useLocation()

  function scrollToSection(id) {
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } })
      return
    }
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {items.map((item) =>
        item.type === 'route' ? (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              NAV_ITEM_CLASS + ' ' + (isActive ? 'font-medium text-text-primary' : 'text-text-secondary hover:text-teal-400')
            }
          >
            {({ isActive }) => <NavItemContent Icon={item.icon} label={item.label} active={isActive} />}
          </NavLink>
        ) : item.type === 'action' ? (
          <button
            key={item.id}
            type="button"
            onClick={item.onClick}
            title={item.label === 'Terminal' ? 'Open terminal (Cmd+K or ~)' : undefined}
            className={`${NAV_ITEM_CLASS} text-coral-400 hover:text-coral-300`}
          >
            <NavItemContent Icon={item.icon} label={item.label} />
          </button>
        ) : (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={`${NAV_ITEM_CLASS} text-text-secondary hover:text-teal-400`}
          >
            <NavItemContent Icon={item.icon} label={item.label} />
          </button>
        ),
      )}
    </>
  )
}

export default function Layout() {
  const { mode } = useMode()
  const showTerminal = mode === 'friend'

  // Fallback for returning visitors whose mode is already stored, so they never
  // hit Entry's onClick unlock - the first click/keydown anywhere primes audio.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockCardAudio, { once: true })
    window.addEventListener('keydown', unlockCardAudio, { once: true })
    return () => {
      window.removeEventListener('pointerdown', unlockCardAudio)
      window.removeEventListener('keydown', unlockCardAudio)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-bg-base text-text-primary">
      <nav
        className={
          'sticky top-0 z-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 ' +
          'border-b border-border-subtle bg-bg-base/85 backdrop-blur-md transition-shadow duration-base ease'
        }
      >
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          <ModeNavLinks items={NAV_BY_MODE[mode] ?? NAV_BY_MODE.recruiter} />
        </div>
        <ModeSwitcher />
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <ChatWidget />
      <Mascot />
      {showTerminal && <Terminal />}
    </div>
  )
}
