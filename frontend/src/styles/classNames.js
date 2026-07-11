export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 focus-visible:outline-offset-2'

export const cardBase =
  `h-full flex flex-col card-noise border border-border-subtle rounded-md p-6 transition duration-base ease ` +
  `hover:border-teal-500/40 hover:shadow-glow-teal hover:scale-[1.02]`

export const btnPrimary =
  `inline-flex items-center justify-center bg-coral-500 text-bg-base font-medium rounded-full px-5 py-2 text-sm ` +
  `transition duration-base ease hover:bg-coral-400 hover:shadow-glow-coral hover:scale-[1.02] ${focusRing}`

// Sky-blue CTA - scoped to the Check My Fit tool only, so it never dilutes
// coral's exclusivity as the primary hero CTA color. Same shape/hover language
// as btnPrimary: solid vivid sky-400 (same blue as the badge/accent bar/glow)
// with dark text for contrast - matches btnPrimary's dark-text-on-bright-accent
// convention. (Previously amber, moved off yellow per feedback that it read
// too close to the Stack section's AI/GenAI tag color for a distinct tool.)
export const btnSky =
  `inline-flex items-center justify-center bg-[#38BDF8] text-bg-base font-semibold rounded-full px-5 py-2 text-sm ` +
  `transition duration-base ease hover:bg-[#7DD3FC] hover:shadow-[0_0_32px_rgba(56,189,248,0.65)] hover:scale-[1.02] ${focusRing}`

export const btnSecondary =
  `inline-flex items-center justify-center border border-border-default text-text-primary font-medium rounded-full px-5 py-2 text-sm ` +
  `transition duration-base ease hover:border-teal-500 hover:text-teal-400 hover:shadow-glow-teal hover:scale-[1.02] ${focusRing}`

export const linkTeal =
  `text-teal-400 hover:text-teal-300 underline underline-offset-2 transition duration-fast ease ${focusRing} rounded-sm`

export const tagTeal =
  'text-xs border border-teal-500/40 text-teal-400 rounded-sm px-2 py-1 transition duration-base ease ' +
  'hover:scale-105 hover:border-teal-400 hover:bg-teal-500/10 hover:shadow-glow-teal'

export const mutedText = 'text-text-secondary'
export const fadedText = 'text-text-tertiary'

// Applied on top of cardBase (or similar) while a card is "in focus" - roughly
// centered in the viewport, per useInFocus. `!` forces these to win over the
// resting border/shadow classes already baked into cardBase, since both are
// present as plain (non-hover) utilities at the same specificity.
export const cardInFocusGlow = 'border-teal-500/50! shadow-glow-teal!'
export const cardFocusTransition = 'transition-[border-color,box-shadow] duration-[380ms] ease'

// Recruiter-mode-only card color-by-meaning system: teal = default project
// cards, violet = achievement/credibility (Experience), aurora green = "How I
// work" (kept distinct from Projects' teal so the two don't read as the same
// category), sky blue = the Check My Fit AI tool (moved off amber/yellow - see
// btnSky). Coral stays exclusive to the primary hero CTA (btnPrimary) and is
// never used on a card. Deliberately kept separate from cardBase/card-noise
// (unchanged, still used by Friend mode's project cards and the About page) so
// this richer treatment never leaks outside Recruiter mode.
//
// cardShellBase is the shape only (border/radius/padding/hover-scale) with no
// color baked in - `relative overflow-hidden` so the accent bar (CardAccent.jsx)
// can sit flush against the left edge and get clipped to the card's rounded
// corners. Pair with CARD_ACCENT[color] for the background wash, badge, and a
// noticeably larger/stronger glow (40px blur vs. the site-wide default 24px)
// so the category reads clearly against the dark page background.
export const cardShellBase =
  'relative overflow-hidden h-full flex flex-col border border-border-subtle rounded-md p-6 transition duration-base ease hover:scale-[1.02]'

export const CARD_ACCENT = {
  teal: {
    tint: 'card-tint-teal',
    hover: 'hover:border-teal-500/60 hover:shadow-[0_0_44px_rgba(45,212,191,0.5)]',
    focus: 'border-teal-500/70! shadow-[0_0_44px_rgba(45,212,191,0.5)]!',
  },
  violet: {
    tint: 'card-tint-violet',
    hover: 'hover:border-[#A78BFA]/60 hover:shadow-[0_0_44px_rgba(167,139,250,0.5)]',
    focus: 'border-[#A78BFA]/70! shadow-[0_0_44px_rgba(167,139,250,0.5)]!',
  },
  aurora: {
    tint: 'card-tint-aurora',
    // Bumped to a resting glow + stronger hover (matching sky's treatment)
    // after feedback that at teal/violet's normal intensity, aurora read as
    // barely different from the teal Projects cards - emerald and teal sit
    // close in hue, so this needed more punch, not just a different color.
    resting: 'border-[#34D399]/30 shadow-[0_0_36px_rgba(52,211,153,0.3)]',
    hover: 'hover:border-[#34D399]/70 hover:shadow-[0_0_56px_rgba(52,211,153,0.6)]',
    focus: 'border-[#34D399]/70! shadow-[0_0_44px_rgba(52,211,153,0.5)]!',
  },
  sky: {
    tint: 'card-tint-sky',
    // Sky gets a resting glow (not just on hover, unlike teal/violet/aurora) -
    // energy here comes from a persistent edge glow + vivid badge/bar rather
    // than a flat background wash, so the border visibly emanates light even
    // before the card is touched (this is the AI tool card - it should feel
    // "live").
    resting: 'border-[#38BDF8]/30 shadow-[0_0_36px_rgba(56,189,248,0.3)]',
    hover: 'hover:border-[#38BDF8]/70 hover:shadow-[0_0_56px_rgba(56,189,248,0.6)]',
    focus: 'border-[#38BDF8]/70! shadow-[0_0_44px_rgba(56,189,248,0.5)]!',
  },
}
