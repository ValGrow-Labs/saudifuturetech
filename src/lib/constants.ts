import { CategoryWithTags, EDITORIAL_CATEGORIES } from './categories';
import { ARTICLES } from './articles';

export type { CategoryWithTags };
export { EDITORIAL_CATEGORIES };

export const SITE_NAME = 'Saudi Future Tech';
export const SITE_TAGLINE = 'Reporting on the technology being built in Saudi Arabia.';
export const SITE_DESCRIPTION =
  'Independent reporting on technology in Saudi Arabia, and a checked directory of the grants, startups and investors behind it.';

export interface NavLink {
  label: string;
  href: string;
  badge?: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Latest', href: '/latest' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Startups', href: '/startups' },
  { label: 'Investors', href: '/funding' },
  { label: 'Analysis', href: '/insights' },
];

export const PILLAR_LINKS = EDITORIAL_CATEGORIES.map((c) => ({
  label: c.name,
  href: `/category/${c.slug}`,
  color: c.color,
}));

export const POPULAR_SEARCH_TAGS = [
  'ALLaM LLM',
  'NEOM Cognitive Cities',
  'SAMA Open Banking',
  'NCA Zero Trust',
  'Green Hydrogen',
  'GovTech APIs',
];

// Reusable article references mapped directly from centralized articles store
export const SAMPLE_FEATURED_ARTICLE = ARTICLES[1];
export const SAMPLE_SECONDARY_ARTICLES = [ARTICLES[2], ARTICLES[3], ARTICLES[4], ARTICLES[5]];
export const SAMPLE_EDITORS_PICK_ARTICLES = ARTICLES.filter((a) => a.isEditorsPick && a.id !== 'art-01');

// 5 Numbered Trending Stories (Editorial 48-Hour Velocity Index)
export const SAMPLE_TRENDING_ITEMS = [
  {
    rank: '01',
    title: 'OXAGON Clears Phase-1 Grid Connection for Green Hydrogen Manufacturing Complex',
    category: 'Clean Energy',
    categorySlug: 'clean-energy',
    readingTime: '3 min read',
    publishedAt: '2026-11-14T06:00:00Z',
  },
  {
    rank: '02',
    title: 'Tawakkalna Unrolls Biometric Federated Identity API for GCC Enterprise Integrations',
    category: 'GovTech',
    categorySlug: 'govtech',
    readingTime: '4 min read',
    publishedAt: '2026-11-13T19:00:00Z',
  },
  {
    rank: '03',
    title: 'King Abdullah University of Science and Technology Launches 100-Petaflop Supercomputing Cluster',
    category: 'AI & Deep Tech',
    categorySlug: 'ai-deep-tech',
    readingTime: '5 min read',
    publishedAt: '2026-11-13T11:20:00Z',
  },
  {
    rank: '04',
    title: 'Venture Capital Inflows: Saudi Startups Secure Record $850M Across Q3 Seed and Series A Cohorts',
    category: 'FinTech',
    categorySlug: 'fintech',
    readingTime: '4 min read',
    publishedAt: '2026-11-12T15:45:00Z',
  },
  {
    rank: '05',
    title: 'National Grid Automates Carbon Offset Tracking via Sovereign Permissioned Blockchain',
    category: 'Clean Energy',
    categorySlug: 'clean-energy',
    readingTime: '6 min read',
    publishedAt: '2026-11-11T09:10:00Z',
  },
];
