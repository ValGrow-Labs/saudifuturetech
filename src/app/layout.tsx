import type { Metadata } from 'next';
import { Newsreader, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';

// Newsreader — display & reading serif (optical sizes for headlines vs. body)
const serif = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
});

// Geist — interface sans
const sans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

// Geist Mono — figures, dates, data labels
const mono = Geist_Mono({
  subsets: ['latin'],
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
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="grain bg-paper text-ink-2 font-sans antialiased min-h-[100dvh] flex flex-col">
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

