import skills from './skills.json'

// Category → color mapping shared by the Stack section and any other tag/pill
// grouping on the site (currently: project tech-stack tags), so the same
// category always reads as the same color everywhere. Follows the site's
// card color-by-meaning system: teal = default, violet = achievement/
// credibility, amber = AI/GenAI - and coral is reserved exclusively for the
// primary hero CTA, never used on a card or tag. With coral off the table,
// Databases reuses violet instead (there's no blue in the palette) - safe
// because Databases isn't adjacent to Frameworks (violet's other user) in the
// skills.json category order, so no two adjacent categories still share a
// color. Tools & Cloud reuses teal for the same reason (not adjacent to
// Languages, teal's other user).
export const CATEGORY_STYLES = {
  Languages: {
    tag:
      'text-[#2DD4BF] border-[#2DD4BF]/40 hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/10 ' +
      'hover:shadow-[0_0_16px_rgba(45,212,191,0.45)]',
    label: 'text-[#2DD4BF]/80',
  },
  Frameworks: {
    tag:
      'text-[#A78BFA] border-[#A78BFA]/40 hover:border-[#A78BFA] hover:bg-[#A78BFA]/10 ' +
      'hover:shadow-[0_0_16px_rgba(167,139,250,0.45)]',
    label: 'text-[#A78BFA]/80',
  },
  'AI / GenAI': {
    tag:
      'text-[#FBBF24] border-[#FBBF24]/40 hover:border-[#FBBF24] hover:bg-[#FBBF24]/10 ' +
      'hover:shadow-[0_0_16px_rgba(251,191,36,0.45)]',
    label: 'text-[#FBBF24]/80',
  },
  Databases: {
    tag:
      'text-[#A78BFA] border-[#A78BFA]/40 hover:border-[#A78BFA] hover:bg-[#A78BFA]/10 ' +
      'hover:shadow-[0_0_16px_rgba(167,139,250,0.45)]',
    label: 'text-[#A78BFA]/80',
  },
  'Tools & Cloud': {
    tag:
      'text-[#2DD4BF] border-[#2DD4BF]/40 hover:border-[#2DD4BF] hover:bg-[#2DD4BF]/10 ' +
      'hover:shadow-[0_0_16px_rgba(45,212,191,0.45)]',
    label: 'text-[#2DD4BF]/80',
  },
}

export const DEFAULT_CATEGORY = 'Frameworks'

// Base shape shared by every category's tag - color comes from CATEGORY_STYLES.
export const categoryTagBase =
  'text-xs border rounded-sm px-2 py-1 transition duration-base ease hover:scale-105'

export function categoryTagClass(category) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES[DEFAULT_CATEGORY]
  return `${categoryTagBase} ${style.tag}`
}

export function categoryLabelClass(category) {
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES[DEFAULT_CATEGORY]
  return `text-xs font-medium uppercase tracking-wide ${style.label}`
}

// Best-effort classifier for tech-stack strings that don't carry an explicit
// category (project tech_stack arrays, unlike skills.json, are flat lists).
// Matches first against skills.json's own entries (so anything already
// categorized there - React, FastAPI, PostgreSQL, etc. - inherits that exact
// category), then a small curated list for tokens that only show up in
// project tech stacks (Groq LLM, Androguard, SHAP, and similar).
const SKILLS_KEYWORDS = Object.entries(skills).map(([category, items]) => [
  category,
  items.map((item) => item.toLowerCase()),
])

const EXTRA_KEYWORDS = [
  ['AI / GenAI', ['groq', 'llm', 'lightgbm', 'xgboost', 'shap', 'paddleocr', 'opencv']],
  ['Databases', ['sqlalchemy', 'alembic']],
  ['Tools & Cloud', ['androguard', 'apktool', 'jadx', 'reportlab']],
  ['Frameworks', ['recharts']],
]

// Flattened to (keyword, category) pairs and sorted longest-keyword-first, so a
// short generic keyword (e.g. Languages' "sql") can never win a substring match
// against a longer, more specific one (e.g. Databases' "postgresql") just
// because its category happened to be checked first.
const ALL_KEYWORDS = [...SKILLS_KEYWORDS, ...EXTRA_KEYWORDS]
  .flatMap(([category, keywords]) => keywords.map((keyword) => [keyword, category]))
  .sort((a, b) => b[0].length - a[0].length)

export function classifyTech(tech) {
  const t = tech.toLowerCase()
  const exact = ALL_KEYWORDS.find(([keyword]) => keyword === t)
  if (exact) return exact[1]
  const partial = ALL_KEYWORDS.find(([keyword]) => t.includes(keyword))
  return partial ? partial[1] : DEFAULT_CATEGORY
}
