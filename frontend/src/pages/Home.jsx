import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import { registerProximityZone } from '../utils/proximityZones'
import ProjectTeaser from '../components/ProjectTeaser'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import HoverImpact from '../components/HoverImpact'
import SocialIcons from '../components/SocialIcons'
import GameWidget from '../components/GameWidget'
import TerminalTour from '../components/TerminalTour'
import FitCheck from './FitCheck'
import { openTerminal } from '../components/Terminal'
import { openChatWidget } from '../components/ChatWidget'
import projects from '../data/projects.json'
import skills from '../data/skills.json'
import { btnPrimary, btnSecondary, linkTeal, tagTeal, cardBase, mutedText } from '../styles/classNames'

const CONTENT = {
  recruiter: {
    headline: 'Md Saif Alam - AI Engineer & Full Stack Developer',
    subline: 'Ask Zoe, my RAG-powered AI assistant, about me and my projects - or dive straight into the projects yourself.',
    highlight: 'RAG-powered AI assistant',
    ctas: [
      { label: 'Ask Zoe', action: 'openChat' },
      { label: 'Download Resume', href: '/resume.pdf' },
      { label: 'View Projects', to: '/projects' },
    ],
  },
  friend: {
    headline: "Hey, I'm Saif 👋",
    subline:
      "There's a terminal game hiding here, a chatbot that'll roast my code if you ask it right, and a globe with pins from wherever you're reading this. Go find them.",
    highlight: 'chatbot',
    ctas: [
      { label: 'Play a game', to: '/play' },
      { label: 'Say hi', to: '/contact' },
      { label: "See what I've built", to: '/projects' },
    ],
  },
}

// Splits the subline around its one accent phrase so it can be styled/animated
// distinctly from the rest of the sentence, without hardcoding markup per mode.
function Subline({ text, highlight }) {
  const idx = text.indexOf(highlight)
  if (idx === -1) return <>{text}</>
  const before = text.slice(0, idx)
  const after = text.slice(idx + highlight.length)
  return (
    <>
      {before}
      <span className="zoe-highlight-sweep font-semibold text-teal-400">{highlight}</span>
      {after}
    </>
  )
}

function Cta({ cta, primary, ctaRef }) {
  const className = primary ? btnPrimary : btnSecondary
  if (cta.action === 'openChat') {
    return (
      <button ref={ctaRef} type="button" onClick={openChatWidget} className={className}>
        {cta.label}
      </button>
    )
  }
  if (cta.to) {
    return (
      <Link to={cta.to} className={className}>
        {cta.label}
      </Link>
    )
  }
  return (
    <a href={cta.href} target="_blank" rel="noreferrer" className={className}>
      {cta.label}
    </a>
  )
}

// Staggered entrance on load (not scroll-triggered like the rest of the page's
// Reveal usage, since Hero is already in view at mount) - headline, then
// subline, then buttons, then social row, each a beat behind the last, so the
// page feels alive instead of just appearing fully-formed.
function Hero({ mode, id }) {
  const content = CONTENT[mode] ?? CONTENT.friend
  const sublineRef = useRef(null)
  const chatCtaRef = useRef(null)

  // Hovering near the tagline or the "Ask Zoe" CTA is one of the proximity
  // zones that auto-opens the chat widget (see ChatWidget.jsx) - registered
  // here since those elements only exist within this Home page.
  useEffect(() => {
    const unregisterSubline = registerProximityZone(sublineRef.current)
    const unregisterCta = chatCtaRef.current ? registerProximityZone(chatCtaRef.current) : () => {}
    return () => {
      unregisterSubline()
      unregisterCta()
    }
  }, [mode])

  return (
    <section id={id} className="text-center scroll-mt-24">
      <Reveal as="h1" delayMs={0} className="text-3xl sm:text-4xl font-semibold font-display text-text-primary">
        {content.headline}
      </Reveal>
      <Reveal as="p" delayMs={120} className={`mt-4 max-w-2xl mx-auto text-lg sm:text-xl ${mutedText}`}>
        <span ref={sublineRef}>
          <Subline text={content.subline} highlight={content.highlight} />
        </span>
      </Reveal>
      <Reveal delayMs={240} className="mt-8 flex flex-wrap justify-center gap-3">
        {content.ctas.map((cta, i) => (
          <Cta key={cta.label} cta={cta} primary={i === 0} ctaRef={cta.action === 'openChat' ? chatCtaRef : undefined} />
        ))}
      </Reveal>
      <Reveal delayMs={360}>
        <SocialIcons className="mt-6" />
      </Reveal>
    </section>
  )
}

function ImpactSection({ mode, id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 scroll-mt-24">
      <div className="flex justify-center">
        <HoverImpact mode={mode} />
      </div>
    </Reveal>
  )
}

// Story section - a scannable teaser (short tagline + quick bullets), not a
// paragraph dump - the full breakdown lives on /about for anyone who wants more.
const STORY_BULLETS = [
  'Final-year AI & ML student (CGPA 8.87/10) at Cambridge Institute of Technology',
  'Currently: Project Intern @ Samsung R&D Institute India (Samsung PRISM)',
  'Builds full-stack, production-grade AI systems - not notebooks',
]

function StorySection({ id }) {
  return (
    <Reveal as="section" id={id} className={`mt-20 scroll-mt-24 ${cardBase}`}>
      <h2 className="text-xl font-semibold font-display text-text-primary">How I work</h2>
      <ul className="mt-3 max-w-2xl space-y-1.5 text-sm text-text-primary">
        {STORY_BULLETS.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true" className="text-teal-400">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link to="/about" className={`mt-5 inline-block text-sm ${linkTeal}`}>
        Read the full story →
      </Link>
    </Reveal>
  )
}

// Compact teasers, not the full project detail - name, tagline, 1-2 top
// metrics/tags, and a link out to the dedicated /projects/:id detail page.
function ProjectTeasersSection({ mode, list, id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 scroll-mt-24">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold font-display text-text-primary">Projects</h2>
        <Link to="/projects" className={`text-sm ${linkTeal}`}>
          View all →
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        {list.map((project, i) => (
          <Reveal key={project.id} delayMs={i * 70} className="h-full">
            <ProjectTeaser project={project} mode={mode} />
          </Reveal>
        ))}
      </div>
    </Reveal>
  )
}

function SkillsSection({ id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 scroll-mt-24">
      <h2 className="text-xl font-semibold font-display text-text-primary">Stack</h2>
      <div className="mt-6 space-y-4">
        {Object.entries(skills).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{category}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((item) => (
                <span key={item} className={tagTeal}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Link to="/fit-check" className={`mt-5 inline-block text-sm ${linkTeal}`}>
        See if I fit your stack →
      </Link>
    </Reveal>
  )
}

// Recruiter also gets the fit-check tool inline on the scroll, so people who
// never click through to the standalone /fit-check page still see it - the
// dedicated route stays too, for direct/bookmarkable links from the nav.
function FitCheckSection({ id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 scroll-mt-24">
      <FitCheck embedded />
    </Reveal>
  )
}

// Friend: a "have you tried..." teaser for stuff that's easy to miss on a
// first scroll - replaces the old generic "Fun stuff" card, and points at the
// terminal specifically since that's the one feature worth calling out by name.
// The chatbot line is always shown and highlighted (it's the single most
// worth-finding feature); the rest is a large pool, randomized per page load
// so repeat visitors don't see the exact same five tips every time.
const CHATBOT_TOUR_LINE = 'Ask the chatbot in the corner to roast my code - it actually will'
const TOUR_ITEM_POOL = [
  "Scroll your mouse wheel over the achievements up top - it's a carousel",
  'Hover a project card below and watch it expand',
  'Click a gold pin on the globe on the landing page',
  "Type \"help\" in the terminal for the full command list",
  "Type \"git log --oneline\" in the terminal for my career timeline",
  'Drag a sticky note on the achievements board - it fights back',
  'Switch between Recruiter and Friend mode up top - it re-themes the whole site',
  'Type "cd projects/<name>" then "cat readme" in the terminal',
  'Type "ask \\"<question>\\"" in the terminal to talk to the chatbot without leaving it',
  'The globe shows real visitors in real time - come back later and watch the count change',
  "Drag the globe around - it's fully interactive, not just decoration",
  'Race the clock in the fix-the-bug game and see your WPM',
]

function pickRandomTourItems(count) {
  const shuffled = [...TOUR_ITEM_POOL].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map((text) => ({ text }))
}

function TourSection({ id }) {
  const lines = useMemo(
    () => [{ text: CHATBOT_TOUR_LINE, highlight: true }, ...pickRandomTourItems(4)],
    [],
  )
  return (
    <Reveal as="section" id={id} className="mt-16 scroll-mt-24 text-center">
      <h2 className="text-xl font-semibold font-display text-text-primary">Have you tried...</h2>
      <div className="mt-4">
        <TerminalTour lines={lines} />
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={openTerminal} className={btnPrimary}>
          Open terminal
        </button>
        <Link to="/play" className={btnSecondary}>
          Play a game
        </Link>
      </div>
    </Reveal>
  )
}

function ContactSection({ heading = "Let's talk", id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 text-center scroll-mt-24">
      <h2 className="text-xl font-semibold font-display text-text-primary">{heading}</h2>
      <div className="mt-4">
        <Link to="/contact" className={btnSecondary}>
          Contact
        </Link>
      </div>
    </Reveal>
  )
}

// Friend's contact section skips the extra click through to /contact - every
// way to reach out (email, LinkedIn, GitHub, LeetCode, Codeforces) plus the
// resume are all right here, since a friend wouldn't want to go hunting for it.
function FriendContactSection({ id }) {
  return (
    <Reveal as="section" id={id} className="mt-20 text-center scroll-mt-24">
      <h2 className="text-xl font-semibold font-display text-text-primary">Say hi</h2>
      <p className={`mt-2 ${mutedText}`}>Pick your favorite way to bug me.</p>
      <SocialIcons className="mt-5" />
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href="/resume.pdf" download className={btnSecondary}>
          The Serious Grown-Up PDF
        </a>
      </div>
    </Reveal>
  )
}

// Recruiter: a single-scroll page - hero -> impact -> story -> project teasers ->
// stack summary -> contact. Full project detail lives on /projects/:id, and /about
// still works as a direct-link backup for the full bio.
function RecruiterHome() {
  const flagship = projects.filter((p) => p.tier === 'flagship')
  return (
    <>
      <Hero mode="recruiter" id="hero" />
      <ImpactSection mode="recruiter" id="impact" />
      <StorySection id="story" />
      <ProjectTeasersSection mode="recruiter" list={flagship} />
      <SkillsSection id="skills" />
      <FitCheckSection id="fit-check" />
      <ContactSection id="contact" />
    </>
  )
}

// Friend: a single scrolling page - hero -> personal intro -> sticky-note achievements
// -> casual projects -> fun stuff (game) -> globe -> contact. The friend-mode nav
// scroll-links to these anchors instead of routing to separate pages. Unchanged by
// the recruiter/developer restructure.
const PERSONAL_BULLETS_FRIEND = [
  'Got hooked on AI & coding because I love solving problems that actually matter',
  "Outside the screen: gym, badminton, cooking, or whatever random hobby I'm currently obsessed with",
  'Endlessly curious - always chasing the next new thing',
]

function FriendHome() {
  return (
    <>
      <Hero mode="friend" id="hero" />

      <ImpactSection mode="friend" />

      {/* Personal blurb now comes after the achievements, not before - lead with
          the "wow" stuff, then the casual intro. */}
      <Reveal as="section" id="personal" className="mt-16 scroll-mt-24">
        <h2 className="text-xl font-semibold font-display text-text-primary">A bit more personal</h2>
        <ul className="mt-3 max-w-2xl space-y-1.5 text-sm text-text-primary">
          {PERSONAL_BULLETS_FRIEND.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-teal-400">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" className="mt-10">
        <GameWidget />
      </Reveal>

      {/* Terminal teaser sits above Projects on purpose - a friend browsing this
          site is here for the personality/features, not to read a project list,
          so that comes first and Projects trails behind it. */}
      <TourSection id="tour" />

      <Reveal as="section" id="projects" className="mt-16 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold font-display text-text-primary">Stuff I've built</h2>
          <Link to="/projects" className={`text-sm ${linkTeal}`}>
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.id} delayMs={i * 70} className="h-full">
              <ProjectCard project={project} mode="friend" />
            </Reveal>
          ))}
        </div>
      </Reveal>

      <FriendContactSection id="contact" />
    </>
  )
}

export default function Home() {
  const { mode } = useMode()
  const location = useLocation()

  useEffect(() => {
    const scrollTo = location.state?.scrollTo
    if (!scrollTo) return
    const el = document.getElementById(scrollTo)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState({}, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      {mode === 'friend' ? <FriendHome /> : <RecruiterHome />}
    </div>
  )
}
