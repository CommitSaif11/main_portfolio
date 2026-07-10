/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // bg resolves through CSS custom properties too, so each mode can carry a
        // distinct background tone (not just a distinct accent) - see index.css.
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          'surface-hover': 'var(--bg-surface-hover)',
          elevated: 'var(--bg-elevated)',
        },
        // teal/coral resolve through CSS custom properties (defined in index.css)
        // so the whole site's accent usage re-themes per mode via a single
        // [data-mode] override, instead of needing per-component edits.
        teal: {
          400: 'var(--teal-400)',
          500: 'var(--teal-500)',
          600: 'var(--teal-600)',
        },
        coral: {
          400: 'var(--coral-400)',
          500: 'var(--coral-500)',
        },
        text: {
          primary: '#F1F5F4',
          secondary: '#9CA8A6',
          tertiary: '#667070',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.08)',
          DEFAULT: 'rgba(255, 255, 255, 0.14)',
          teal: 'var(--border-teal)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '6px',
        md: '12px',
        lg: '20px',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'glow-teal': '0 0 24px var(--teal-glow)',
        'glow-coral': '0 0 24px var(--coral-glow)',
      },
    },
  },
}
