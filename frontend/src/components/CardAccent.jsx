// Recruiter-only card color-by-meaning system: a left accent bar (strong,
// immediately visible signal) plus a small named category badge, so the
// category reads at a glance instead of relying on a 1px border color that's
// too subtle to register on its own. Colors are chosen per-card at runtime
// (not a fixed literal per call site), so these use inline styles rather than
// Tailwind arbitrary-value classes - Tailwind's scanner can't see a color
// that only exists as a JS variable at build time.
const ACCENT_HEX = {
  teal: '#2DD4BF',
  violet: '#A78BFA',
  amber: '#FBBF24',
  aurora: '#34D399',
  sky: '#38BDF8',
}

export function CardAccentBar({ color }) {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-1.5"
      style={{ backgroundColor: ACCENT_HEX[color] }}
    />
  )
}

export function CardBadge({ color, children }) {
  const hex = ACCENT_HEX[color]
  return (
    <span
      className="inline-flex self-start items-center rounded-full px-2 py-0.5 mb-3 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: hex, backgroundColor: `${hex}26`, border: `1px solid ${hex}66` }}
    >
      {children}
    </span>
  )
}
