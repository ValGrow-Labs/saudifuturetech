import { SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/constants';

/**
 * Returns the sanitized base URL of the publication.
 * Strips any trailing slashes to guarantee clean canonical concatenation.
 */
export function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://saudifuturetech.com';
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

