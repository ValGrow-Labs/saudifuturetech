import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Newsreader, IBM_Plex_Sans_Arabic } from 'next/font/google';
import './globals.css';
import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/constants';
import { SmoothScrollProvider } from '@/components/providers/SmoothScrollProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

// Codec Pro (Headings & Display Typography from saudimakesfuture.com)
const codecPro = localFont({
  src: [
    {
      path: '../../public/fonts/CodecPro-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/CodecPro-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-codec',
  display: 'swap',
});

// Lato (Primary Body & UI Typography from saudimakesfuture.com)
const lato = localFont({
  src: [
    {
      path: '../../public/fonts/lato-light.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/lato-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/lato-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/lato-black.woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-lato',
  display: 'swap',
});

// Newsreader Serif preserved for literary longreads / quotes
const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
  style: ['normal', 'italic'],
});

// Refined IBM Plex Sans Arabic for subtle bilingual accents
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Saudi Future Tech | Technology, AI & Innovation',
    template: '%s | Saudi Future Tech',
  },
  description:
    'An independent technology publication covering artificial intelligence, cognitive cities, GovTech, cybersecurity, and frontier innovation in Saudi Arabia and the GCC.',
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
      'An independent technology publication covering artificial intelligence, cognitive cities, GovTech, cybersecurity, and frontier innovation in Saudi Arabia and the GCC.',
    siteName: 'Saudi Future Tech',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Saudi Future Tech | Technology, AI & Innovation',
    description:
      'An independent technology publication covering artificial intelligence, cognitive cities, GovTech, cybersecurity, and frontier innovation in Saudi Arabia and the GCC.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${codecPro.variable} ${lato.variable} ${newsreader.variable} ${ibmPlexArabic.variable}`}
    >
      <head>
        {/* Anti-FOUC Theme Script: execute before paint to eliminate any flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('sft-theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="bg-editorial-paper dark:bg-[#0A1F2C] text-ink-body dark:text-[#E2E8F0] font-sans antialiased min-h-screen flex flex-col selection:bg-brand-yellow selection:text-ink-high transition-colors duration-200">
        <ThemeProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

