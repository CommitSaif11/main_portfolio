import { Link } from 'react-router-dom'
import { useMode } from '../context/ModeContext'
import Reveal from '../components/Reveal'
import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { LINKEDIN_URL, GITHUB_URL } from '../data/socials'
import { btnSecondary, linkTeal, mutedText } from '../styles/classNames'
import EmailContact from '../components/EmailContact'

const RESUME_URL = '/resume.pdf'

function IconLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={`gap-2 ${btnSecondary}`}>
      {children}
      {label}
    </a>
  )
}

export default function Contact() {
  const { mode } = useMode()

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <Link to="/" className={`text-sm ${linkTeal}`}>
        ← Back home
      </Link>

      <Reveal className="mt-4">
        <h1 className="text-2xl font-semibold font-display text-text-primary">Get in touch</h1>
        <p className={`mt-2 ${mutedText}`}>
          Fastest way to reach me is email - happy to talk roles, projects, or anything in between.
        </p>
      </Reveal>

      <Reveal delayMs={80} className="mt-8">
        <EmailContact mode={mode} />
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <IconLink href={LINKEDIN_URL} label="LinkedIn">
            <FaLinkedin className="w-4 h-4" style={{ color: '#0A66C2' }} aria-hidden="true" />
          </IconLink>
          <IconLink href={GITHUB_URL} label="GitHub">
            <FaGithub className="w-4 h-4 text-teal-400" aria-hidden="true" />
          </IconLink>
        </div>
      </Reveal>

      <Reveal delayMs={140} className="mt-6">
        <a href={RESUME_URL} download className={`text-sm ${linkTeal}`}>
          Download resume (PDF)
        </a>
      </Reveal>
    </div>
  )
}
