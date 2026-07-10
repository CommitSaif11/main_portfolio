import { FaLinkedin, FaGithub } from 'react-icons/fa'
import { SiGmail } from 'react-icons/si'
import { EMAIL, LINKEDIN_URL, GITHUB_URL } from '../data/socials'
import { btnSecondary } from '../styles/classNames'

function IconLink({ href, label, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={`gap-2 ${btnSecondary}`}>
      {children}
      {label}
    </a>
  )
}

// Labeled buttons (icon + text), same style as the Contact page - not a bare
// icon-only row. Same 3 profiles everywhere: email, LinkedIn, GitHub.
export default function SocialIcons({ className = '' }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <IconLink href={`mailto:${EMAIL}`} label="Email">
        <SiGmail className="w-4 h-4" style={{ color: '#EA4335' }} aria-hidden="true" />
      </IconLink>
      <IconLink href={LINKEDIN_URL} label="LinkedIn">
        <FaLinkedin className="w-4 h-4" style={{ color: '#0A66C2' }} aria-hidden="true" />
      </IconLink>
      <IconLink href={GITHUB_URL} label="GitHub">
        <FaGithub className="w-4 h-4 text-teal-400" aria-hidden="true" />
      </IconLink>
    </div>
  )
}
