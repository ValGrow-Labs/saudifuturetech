import type { Config } from 'tailwindcss';

/**
 * Saudi Future Tech — design tokens
 *
 * One paper, one ink, one accent.
 *   paper  — Riyadh limestone. The reading surface.
 *   ink    — warm near-black, four steps from headline to faint metadata.
 *   rule   — hairlines. Structure comes from rules, not boxes.
 *   clay   — Najdi mud-brick red. The only accent. Use sparingly:
 *            kickers, live states, the primary action, link hovers.
 *   moss   — reserved for a single semantic meaning: "open / accepting".
 *
 * Legacy token families (editorial, brand, saudi, sft) are remapped onto
 * this palette so admin screens inherit the system without rewrites.
 */

const paper = {
  DEFAULT: '#F2EEE5',
  sheet: '#FAF8F3',
  band: '#EAE4D8',
  deep: '#E2DBCC',
};

const ink = {
  DEFAULT: '#1A1714',
  2: '#3A352F',
  3: '#6F675D',
  4: '#9A9186',
  // legacy aliases
  high: '#1A1714',
  body: '#3A352F',
  muted: '#6F675D',
  faint: '#9A9186',
};

const rule = {
  DEFAULT: '#D8D0C1',
  strong: '#1A1714',
  soft: '#E4DDD0',
};

const clay = {
  DEFAULT: '#A63D24',
  dark: '#86301B',
  tint: '#F0DFD5',
  wash: '#F6ECE5',
};

const moss = {
  DEFAULT: '#3F6B52',
  tint: '#DFE8DF',
};

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        paper,
        ink,
        rule,
        clay,
        moss,

        // ---- legacy families, remapped ----
        editorial: {
          paper: paper.DEFAULT,
          pure: paper.sheet,
          sand: paper.band,
          stone: paper.deep,
          hairline: rule.DEFAULT,
          rule: rule.strong,
        },
        saudi: {
          green: clay.DEFAULT,
          greenHover: clay.dark,
          greenSubtle: clay.wash,
          navy: ink.DEFAULT,
          navyElevated: ink[2],
          warmWhite: paper.DEFAULT,
          surface: paper.band,
          surfaceHover: paper.deep,
          gold: clay.DEFAULT,
          goldSubtle: clay.wash,
          teal: clay.DEFAULT,
          tealSubtle: clay.wash,
          text: ink.DEFAULT,
          muted: ink[3],
          border: rule.DEFAULT,
        },
        brand: {
          navy: ink.DEFAULT,
          sand: paper.band,
          oasis: moss.DEFAULT,
          teal: clay.DEFAULT,
          desertGold: clay.DEFAULT,
          white: paper.sheet,
          graphite: paper.DEFAULT,
          surface: paper.sheet,
          elevated: paper.band,
          dark: ink.DEFAULT,
          cloud: ink.DEFAULT,
          yellow: clay.DEFAULT,
          'yellow-hover': clay.dark,
          'yellow-subtle': clay.wash,
          gold: clay.DEFAULT,
        },
        sft: {
          text: { high: ink.DEFAULT, body: ink[2], muted: ink[3], dark: ink.DEFAULT },
          border: {
            subtle: rule.DEFAULT,
            medium: '#C9BFAE',
            hover: clay.DEFAULT,
            yellow: clay.DEFAULT,
          },
          category: {
            ai: ink[3],
            govtech: ink[3],
            cybersecurity: ink[3],
            smartcities: ink[3],
            fintech: ink[3],
            cleanenergy: ink[3],
          },
        },
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // legacy aliases
        heading: ['var(--font-serif)', 'Georgia', 'serif'],
        codec: ['var(--font-serif)', 'Georgia', 'serif'],
        editorial: ['var(--font-serif)', 'Georgia', 'serif'],
        lato: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale for the serif — tight leading, negative tracking.
        'display-xl': ['clamp(2.75rem, 5.2vw, 4.75rem)', { lineHeight: '1.02', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.022em' }],
        'display-md': ['clamp(1.75rem, 2.8vw, 2.5rem)', { lineHeight: '1.1', letterSpacing: '-0.018em' }],
        'display-sm': ['clamp(1.375rem, 2vw, 1.75rem)', { lineHeight: '1.18', letterSpacing: '-0.012em' }],
        micro: ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.02em' }],
      },
      borderRadius: {
        none: '0',
        xs: '2px',
        sm: '2px',
        DEFAULT: '3px',
        md: '4px',
        lg: '6px',
        xl: '8px',
      },
      maxWidth: {
        measure: '66ch',
        '8xl': '88rem',
        '9xl': '96rem',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      zIndex: {
        header: '40',
        overlay: '50',
        grain: '60',
      },
      boxShadow: {
        // tinted to the paper, never pure black
        lift: '0 1px 0 rgba(26,23,20,0.04), 0 8px 24px -12px rgba(74,52,30,0.18)',
        'card-hover': '0 1px 0 rgba(26,23,20,0.04), 0 12px 32px -16px rgba(74,52,30,0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
