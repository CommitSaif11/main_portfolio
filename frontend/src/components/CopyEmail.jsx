import { useState } from 'react'
import { FiCopy, FiCheck } from 'react-icons/fi'
import { EMAIL } from '../data/socials'
import { mutedText, focusRing } from '../styles/classNames'

// Plain-text email + copy-to-clipboard fallback, for use alongside a mailto
// button (mailto doesn't do anything if the user has no mail client set up).
export default function CopyEmail({ className = '' }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard API unavailable; nothing more we can do
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 text-sm ${mutedText} ${className}`}>
      <span className="select-all">{EMAIL}</span>
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy email address"
        className={`relative inline-flex items-center justify-center p-1 rounded-sm hover:text-teal-400 transition duration-fast ease ${focusRing}`}
      >
        {copied ? <FiCheck className="w-4 h-4 text-teal-400" /> : <FiCopy className="w-4 h-4" />}
        {copied && (
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs bg-bg-surface border border-border-subtle rounded-sm px-2 py-1 shadow-glow-teal">
            Copied!
          </span>
        )}
      </button>
    </div>
  )
}
