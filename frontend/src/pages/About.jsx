import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Briefcase, MapPin, Clock } from 'lucide-react'
import { useMode } from '../context/ModeContext'
import about from '../data/about.json'
import Reveal from '../components/Reveal'
import { linkTeal, tagTeal, mutedText } from '../styles/classNames'

// Scannable at-a-glance facts - a recruiter skimming for 30 seconds should get
// education/current-role/location/availability without reading a paragraph.
const QUICK_FACTS = [
  {
    icon: GraduationCap,
    label: 'Education',
    value: 'B.E. AI & ML, Cambridge Institute of Technology - CGPA 8.87/10, graduating May 2027',
  },
  {
    icon: Briefcase,
    label: 'Currently',
    value: 'Project Intern, Samsung R&D Institute India (Samsung PRISM) - leading a 4-member team',
    scrollTo: 'experience',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Open to relocation & remote worldwide - would need visa sponsorship',
  },
  {
    icon: Clock,
    label: 'Availability',
    value: 'Available now for internships; full-time after May 2027',
  },
]

const LOOKING_FOR_TAGS = ['AI Engineering', 'Full Stack Development', 'Python Development']

function QuickFacts() {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {QUICK_FACTS.map(({ icon: Icon, label, value, scrollTo }) => {
        const Wrapper = scrollTo ? 'button' : 'div'
        return (
          <Wrapper
            key={label}
            type={scrollTo ? 'button' : undefined}
            onClick={scrollTo ? () => navigate('/', { state: { scrollTo } }) : undefined}
            className={`flex items-start gap-3 p-4 card-noise border border-border-subtle rounded-md transition duration-base ease hover:border-teal-500/40 hover:shadow-glow-teal ${scrollTo ? 'text-left w-full cursor-pointer' : ''}`}
          >
            <Icon className="shrink-0 mt-0.5 text-teal-400" size={18} strokeWidth={2} aria-hidden="true" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{label}</p>
              <p className="mt-0.5 text-sm text-text-primary">{value}</p>
            </div>
          </Wrapper>
        )
      })}
    </div>
  )
}

function Achievements({ achievements, compact }) {
  const items = compact ? achievements.slice(0, 3) : achievements
  return (
    <ul className="space-y-2 text-sm text-text-primary">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-teal-400">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

function Domains({ domains }) {
  return (
    <div className="flex flex-wrap gap-2">
      {domains.map((domain) => (
        <span key={domain} className={tagTeal}>
          {domain}
        </span>
      ))}
    </div>
  )
}

function LookingForAndLocation() {
  return (
    <ul className="space-y-1.5 text-sm text-text-primary">
      {[
        'AI Engineering, Full Stack Development, or Python Development roles',
        about.location.relocation,
        about.location.remote,
        about.location.visa,
        about.location.availability,
      ].map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-teal-400">
            •
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// Everything a recruiter needs, scannable in ~30 seconds - a bento grid of
// small cards instead of paragraphs, and nothing hidden behind an "expand"
// toggle (a modern portfolio shows it all up front, at a glance).
const PERSONAL_BULLETS = [
  'Got into AI/coding for the impact - building things that actually solve problems',
  'Off-screen: gym, badminton, cooking, and a new hobby every few weeks',
  "Endlessly curious - always chasing the next thing to learn",
]

function BentoCard({ title, className = '', children }) {
  return (
    <div
      className={`p-4 card-noise border border-border-subtle rounded-md transition duration-base ease hover:border-teal-500/40 hover:shadow-glow-teal ${className}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

function RecruiterAbout() {
  return (
    <div className="space-y-4">
      <Reveal as="section">
        <h1 className="text-2xl font-semibold font-display text-text-primary">About</h1>
        <p className={`mt-2 max-w-xl ${mutedText}`}>
          Final-year AI &amp; ML student who builds full-stack, production-grade AI systems - not notebooks.
        </p>
      </Reveal>

      <Reveal as="section" delayMs={60}>
        <QuickFacts />
      </Reveal>

      <Reveal as="section" delayMs={100} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BentoCard title="What I'm looking for">
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_TAGS.map((tag) => (
              <span key={tag} className={tagTeal}>
                {tag}
              </span>
            ))}
          </div>
        </BentoCard>
        <BentoCard title="Domains">
          <Domains domains={about.domains} />
        </BentoCard>
      </Reveal>

      <Reveal as="section" delayMs={140}>
        <BentoCard title="Achievements">
          <Achievements achievements={about.achievements} />
        </BentoCard>
      </Reveal>

      <Reveal as="section" delayMs={180}>
        <BentoCard title="Beyond the resume">
          <ul className="space-y-1.5 text-sm text-text-primary">
            {PERSONAL_BULLETS.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden="true" className="text-teal-400">
                  •
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </BentoCard>
      </Reveal>
    </div>
  )
}

const FRIEND_PERSONAL_BULLETS = [
  'Got hooked on AI & coding because I love solving problems that actually matter',
  "Outside the screen: gym, badminton, cooking, or whatever random hobby I'm currently obsessed with",
  'Endlessly curious - always chasing the next new thing',
]

const FRIEND_WHAT_I_DO_BULLETS = [
  'AI internship at Samsung - building real production systems, not toy demos',
  'A pile of side projects on top of that, mostly AI-powered full-stack builds',
  'Rule/classical-ML systems do the actual work; an LLM explains the result in plain English',
]

function FriendAbout() {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="space-y-10">
      <Reveal as="section">
        <h1 className="text-2xl font-semibold font-display text-text-primary">A bit more about me</h1>
        <ul className="mt-4 max-w-2xl space-y-1.5 text-sm text-text-primary">
          {FRIEND_PERSONAL_BULLETS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-teal-400">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" delayMs={60}>
        <ul className="max-w-2xl space-y-1.5 text-sm text-text-primary">
          {FRIEND_WHAT_I_DO_BULLETS.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-teal-400">
                •
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal as="section" delayMs={120}>
        <h2 className="text-lg font-semibold font-display text-text-primary border-l-2 border-teal-500 pl-3">
          A few highlights
        </h2>
        <div className="mt-3">
          <Achievements achievements={about.achievements} compact />
        </div>
      </Reveal>

      <Reveal as="section" delayMs={180}>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={`text-sm ${linkTeal}`}
        >
          {expanded ? '← Hide' : 'the boring recruiter stuff →'}
        </button>
        {expanded && (
          <div className="mt-4 space-y-4">
            <Domains domains={about.domains} />
            <LookingForAndLocation />
            <Achievements achievements={about.achievements} />
          </div>
        )}
      </Reveal>
    </div>
  )
}

export default function About() {
  const { mode } = useMode()

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <Link to="/" className={`text-sm ${linkTeal}`}>
        ← Back home
      </Link>
      <div className="mt-4">{mode === 'friend' ? <FriendAbout /> : <RecruiterAbout />}</div>
    </div>
  )
}
