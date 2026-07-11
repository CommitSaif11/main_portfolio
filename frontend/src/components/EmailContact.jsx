import { SiGmail } from 'react-icons/si'
import { FiMail } from 'react-icons/fi'
import { EMAIL } from '../data/socials'
import { btnPrimary, linkTeal, focusRing } from '../styles/classNames'
import CopyEmail from './CopyEmail'

const BODY_BY_MODE = {
  recruiter: "Hi Saif, I'm reaching out about an opportunity at ",
  friend: 'Hey Saif! ',
}

function gmailComposeUrl(mode) {
  const body = BODY_BY_MODE[mode] ?? BODY_BY_MODE.recruiter
  return (
    'https://mail.google.com/mail/?view=cm&fs=1' +
    `&to=${encodeURIComponent(EMAIL)}` +
    '&su=' + encodeURIComponent('Portfolio Contact') +
    '&body=' + encodeURIComponent(body)
  )
}

function mailtoUrl(mode) {
  const body = BODY_BY_MODE[mode] ?? BODY_BY_MODE.recruiter
  return (
    `mailto:${EMAIL}` +
    '?subject=' + encodeURIComponent('Portfolio Contact') +
    '&body=' + encodeURIComponent(body)
  )
}

// Two ways to email + a copyable plain-text fallback:
// - Gmail compose deep link (works for any visitor with a Google account,
//   regardless of whether their device has a mail client configured)
// - plain mailto: (native mail app - best on mobile / configured desktop clients)
// - plain text address with copy-to-clipboard, for everyone else
export default function EmailContact({ mode, className = '' }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <a href={gmailComposeUrl(mode)} target="_blank" rel="noreferrer" className={`gap-2 ${btnPrimary}`}>
          <SiGmail className="w-4 h-4" style={{ color: '#EA4335' }} aria-hidden="true" />
          Email Me
        </a>
        <a
          href={mailtoUrl(mode)}
          aria-label="Email me using your default mail app"
          className={`inline-flex items-center gap-1 text-xs ${linkTeal} ${focusRing}`}
        >
          <FiMail className="w-3.5 h-3.5" aria-hidden="true" />
          or use your default mail app
        </a>
      </div>
      <CopyEmail />
    </div>
  )
}
