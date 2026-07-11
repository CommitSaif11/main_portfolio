import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { LINKEDIN_URL, GITHUB_URL } from '../data/socials'
import { btnSecondary } from '../styles/classNames'
import EmailContact from './EmailContact'

function IconLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={`gap-2 ${btnSecondary}`}>
      {children}
      {label}
    </a>
  )
}

// Same 3 profiles everywhere: email, LinkedIn, GitHub.
export default function SocialIcons({ className = '', mode, compact = false }) {
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <EmailContact mode={mode} compact={compact} />
      <div className="flex flex-wrap items-center justify-center gap-3">
        <IconLink href={LINKEDIN_URL} label="LinkedIn">
          <FaLinkedin className="w-4 h-4" style={{ color: '#0A66C2' }} aria-hidden="true" />
        </IconLink>
        <IconLink href={GITHUB_URL} label="GitHub">
          <FaGithub className="w-4 h-4 text-teal-400" aria-hidden="true" />
        </IconLink>
      </div>
    </div>
  )
}
