import type { Config } from 'tailwindcss';

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
        // User-Specified Modern Saudi Palette
        saudi: {
          green: '#0B6E4F',          // Primary brand: Deep Saudi green (Buttons, links, active states)
          greenHover: '#08533C',     // Primary brand hover / pressed state
          greenSubtle: '#E8F5EF',    // Soft green tint for badges / pills
          navy: '#0A1F2C',           // Deep base: Midnight navy (Dark sections, footer, premium areas)
          navyElevated: '#122B3D',   // Elevated midnight surface
          warmWhite: '#FAF9F6',      // Background: Warm white (Main page background)
          surface: '#F1F5F2',        // Surface: Soft mint/gray (Cards, section backgrounds)
          surfaceHover: '#E7EFE9',   // Hover state for soft surface
          gold: '#C9A227',           // Accent: Desert gold (Thin lines, badges, highlights only)
          goldSubtle: '#FDF8EC',     // Subtle gold tint
          teal: '#19B5A3',           // Alert/energy: Electric teal (AI, innovation, interactive highlights)
          tealSubtle: '#E6FAF7',     // Subtle electric teal tint
          text: '#111827',           // Text: Near-black (Body text)
          muted: '#4B5563',          // Secondary muted text (Readable charcoal)
          border: '#E2E8E4',         // Soft border tone
        },
        // Editorial Paper & Ink Palette (Longreads Aesthetic)
        editorial: {
          paper: '#FBFBF9',          // Warm, literary off-white paper canvas
          pure: '#FFFFFF',           // Crisp clean white for reading sheets & cards
          sand: '#F5F5EE',           // Warm cream/linen for callout cards & pull quotes
          stone: '#EBEBE6',          // Soft neutral surface
          hairline: '#E7E7E0',       // Delicate 1px print-style newspaper divider
          rule: '#141517',           // Bold masthead & section rules
        },
        ink: {
          high: '#141517',           // Deepest black for commanding serif headlines
          body: '#2B2E33',           // Rich, readable charcoal for longform paragraphs
          muted: '#6B7280',          // Bylines, reading times, publication dates, captions
          faint: '#9CA3AF',          // Subtle metadata & arrows
        },
        // Official Brand Palette (Founder Intelligence & Saudi Modern Identity)
        brand: {
          navy: '#14283D',           // Midnight Navy (Executive authority & contrast)
          sand: '#F2EDE2',           // Desert Sand (Al-Turaif limestone reading canvas)
          oasis: '#39765B',          // Oasis Green (Verified signals, active grants)
          teal: '#25A6A0',           // Digital Teal (Tech accents, interactive pills)
          desertGold: '#C69B59',     // Desert Gold (Deadlines, high-priority callouts)
          white: '#FFFFFF',          // Clean White (Surface cards & containers)
          graphite: '#FBFBF9',       // Canvas paper background
          surface: '#FFFFFF',        // Clean white card surface
          elevated: '#F5F5EE',       // Warm sand elevated surface
          dark: '#14283D',           // Dark foundation
          cloud: '#141517',          // High-contrast deep ink text
          yellow: '#F4C542',         // Sunshine Yellow
          'yellow-hover': '#E0B332', // Active / hover state
          'yellow-subtle': 'rgba(244, 197, 66, 0.15)', // Subtle yellow tint
          gold: '#C69B59',           // Refined Desert Gold
        },
        // Semantic Typography & Border Tokens
        sft: {
          text: {
            high: '#141517',         // Primary headlines
            body: '#2B2E33',         // Editorial reading body text
            muted: '#6B7280',        // Bylines, timestamps, captions
            dark: '#141517',         // Deep text
          },
          border: {
            subtle: '#E7E7E0',       // Fine 1px hairline border
            medium: '#D1D1C7',       // Distinct section dividers
            hover: 'rgba(244, 197, 66, 0.60)', // Interactive hover borders
            yellow: '#F4C542',       // Solid accent border
          },
          // Editorial Category Pillar Accents
          category: {
            ai: '#D49A3D',           // Desert Gold
            govtech: '#2563EB',      // Royal Blue
            cybersecurity: '#DC2626',// Crimson
            smartcities: '#D97706',  // Amber
            fintech: '#0D9488',      // Teal
            cleanenergy: '#16A34A',  // Emerald
          },
        },
      },
      fontFamily: {
        // Primary Headings: Codec Pro (Mirroring Saudi Makes Future geometric typography)
        heading: ['var(--font-codec)', 'Codec Pro', 'sans-serif'],
        codec: ['var(--font-codec)', 'Codec Pro', 'sans-serif'],
        // Primary Body & UI: Lato (Mirroring Saudi Makes Future body typography)
        sans: ['var(--font-lato)', 'Lato', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        lato: ['var(--font-lato)', 'Lato', '-apple-system', 'sans-serif'],
        // Legacy serif mapping defaults to Codec Pro display font for unified Saudi Makes Future aesthetic
        serif: ['var(--font-codec)', 'Codec Pro', 'var(--font-serif)', 'Georgia', 'serif'],
        editorial: ['var(--font-serif)', 'Georgia', 'Palatino Linotype', 'serif'],
        // Refined Arabic Typography for subtle brand accents
        arabic: ['var(--font-arabic)', 'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Geeza Pro', 'Traditional Arabic', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        sm: '2px',
        DEFAULT: '4px',
        md: '6px',
        lg: '8px',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  plugins: [],
};

export default config;
