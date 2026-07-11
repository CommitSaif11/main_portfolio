export const focusRing =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400 focus-visible:outline-offset-2'

export const cardBase =
  `h-full flex flex-col card-noise border border-border-subtle rounded-md p-6 transition duration-base ease ` +
  `hover:border-teal-500/40 hover:shadow-glow-teal hover:scale-[1.02]`

export const btnPrimary =
  `inline-flex items-center justify-center bg-coral-500 text-bg-base font-medium rounded-full px-5 py-2 text-sm ` +
  `transition duration-base ease hover:bg-coral-400 hover:shadow-glow-coral hover:scale-[1.02] ${focusRing}`

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
