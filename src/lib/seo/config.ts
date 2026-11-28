import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/constants';

export const PRODUCTION_CANONICAL_DOMAIN = 'https://saudifuturetech.com';

/**
 * Returns the sanitized base URL of the publication.
 * Enforces https://saudifuturetech.com in production and removes localhost fallback
 * from production SEO metadata, sitemaps, canonicals, and JSON-LD.
 */
export function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  // In production or build phases, always prioritize the verified canonical domain
  // and prevent localhost or preview URLs from contaminating canonical SEO tags.
  if (process.env.NODE_ENV === 'production') {
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
      return envUrl.replace(/\/+$/, '');
    }
    return PRODUCTION_CANONICAL_DOMAIN;
  }

  // In local development, use envUrl if defined, otherwise production canonical
  const url = envUrl || PRODUCTION_CANONICAL_DOMAIN;
  return url.replace(/\/+$/, '');
}

/**
 * Generate a strict, canonical URL for a given relative or absolute path.
 * Normalizes leading, trailing, and consecutive slashes to avoid duplicate indexing penalties.
 */
export function getCanonicalUrl(path = ''): string {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  if (!normalizedPath) {
    return baseUrl;
  }
  return `${baseUrl}/${normalizedPath}`;
}

export const DEFAULT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'Saudi Future Tech — Intelligence on Technology, Startups and Venture Capital in Saudi Arabia',
};

export const DEFAULT_SEO = {
  siteName: SITE_NAME,
  titleDefault: `${SITE_NAME} | Technology, AI & Vision 2030`,
  titleTemplate: `%s | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
  tagline: SITE_TAGLINE,
  locale: 'en_US',
  publisher: {
    name: SITE_NAME,
    headquarters: 'Riyadh, Kingdom of Saudi Arabia',
    editorialDesk: 'editorial@saudifuturetech.com',
  },
  social: {
    twitter: '@SaudiFutureTech',
    linkedin: 'https://www.linkedin.com/company/saudi-future-tech',
  },
} as const;

