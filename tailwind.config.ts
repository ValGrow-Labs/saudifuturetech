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

// Broadsheet theme: cream newsprint, near-black ink, Saudi green section labels.
const paper = {
  DEFAULT: '#F8F1DE',
  sheet: '#FCF8EC',
  band: '#F1E8CF',
  deep: '#E8DDBF',
};

const ink = {
  DEFAULT: '#141414',
  2: '#3B3832',
  3: '#6A6458',
  4: '#9B9381',
  // legacy aliases
  high: '#141414',
  body: '#3B3832',
  muted: '#6A6458',
  faint: '#9B9381',
};

const rule = {
  DEFAULT: '#CBBF9F',
  strong: '#141414',
  soft: '#DDD3B8',
};

// The accent: Saudi green.
const clay = {
  DEFAULT: '#11603F',
  dark: '#0C4A30',
  tint: '#DCE8D9',
  wash: '#EAF0E2',
};

// Urgency only: closing deadlines, items waiting for review.
// Urgency only: closing deadlines, items waiting for review.
const alert = {
  DEFAULT: '#B3361F',
  dark: '#8F2B18',
  tint: '#F2D9CF',
};

// Open / live / confirmed.
const moss = {
  DEFAULT: '#1D7A4E',
  tint: '#DDEBDD',
};

// Gold highlights: rules, numerals, the masthead line.
const gold = {
  DEFAULT: '#9A7430',
  dark: '#7C5D26',
};

// Fixed colours that do not follow the theme: for type over photographs
// and the always-dark footer.
const night = { DEFAULT: '#1B1813', 2: '#24201A' };
const snow = { DEFAULT: '#F4F1EA' };

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
        alert,
        moss,
        gold,
        night,
        snow,

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
            medium: '#BFB290',
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
        serif: ['var(--font-serif)', 'var(--font-arabic)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        // legacy aliases
        heading: ['var(--font-serif)', 'var(--font-arabic)', 'Georgia', 'serif'],
        codec: ['var(--font-serif)', 'var(--font-arabic)', 'Georgia', 'serif'],
        editorial: ['var(--font-serif)', 'var(--font-arabic)', 'Georgia', 'serif'],
        lato: ['var(--font-sans)', 'var(--font-arabic)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Display scale for the serif — tight leading, negative tracking.
        'display-xl': ['clamp(2.75rem, 5.2vw, 4.75rem)', { lineHeight: '1.02', letterSpacing: '-0.018em' }],
        'display-lg': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.016em' }],
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
        lift: 'none',
        'card-hover': '0 1px 2px rgba(60,45,20,0.07), 0 26px 52px -22px rgba(60,45,20,0.32)',
      },
    },
  },
  plugins: [],
};

export default config;
