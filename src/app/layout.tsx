import type { Metadata } from 'next';
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Sans_Arabic, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

// IBM Plex — one family across serif, sans, Arabic and mono, so Latin and
// Arabic text sit together properly. Engineered rather than decorative, which
// suits a technology publication.

// Headlines and long-form reading: a classic broadsheet serif
const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

// Interface text
const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-sans',
  display: 'swap',
});

// Arabic, designed to match Plex Sans; used automatically for Arabic glyphs
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-arabic',
  display: 'swap',
});

// Code blocks only
const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Saudi Future Tech | Technology, AI & Innovation',
    template: '%s | Saudi Future Tech',
  },
  description:
    'Independent reporting on technology in Saudi Arabia: AI, government platforms, security, cities, finance and energy — plus a checked directory of grants, startups and investors.',
  keywords: [
    'Saudi Arabia Tech',
    'Vision 2030',
    'ALLaM AI',
    'NEOM Cognitive Cities',
    'GovTech Saudi',
    'Cybersecurity NCA',
    'FinTech SAMA',
    'Clean Energy Hydrogen',
    'Middle East Innovation',
  ],
  authors: [{ name: 'Saudi Future Tech Editorial Desk' }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Saudi Future Tech | Technology, AI & Innovation',
    description:
      'Independent reporting on technology in Saudi Arabia: AI, government platforms, security, cities, finance and energy — plus a checked directory of grants, startups and investors.',
    siteName: 'Saudi Future Tech',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saudi Future Tech | Technology, AI & Innovation',
    description:
      'Independent reporting on technology in Saudi Arabia: AI, government platforms, security, cities, finance and energy — plus a checked directory of grants, startups and investors.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${arabic.variable} ${mono.variable}`}>
      <body className="grain text-ink-2 font-sans antialiased min-h-[100dvh] flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-overlay focus:bg-ink focus:text-paper-sheet focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}

