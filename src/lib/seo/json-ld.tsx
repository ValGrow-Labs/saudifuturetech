import React from 'react';
import { getBaseUrl, getCanonicalUrl, DEFAULT_SEO } from './config';
import { ArticleDetail, AuthorItem } from '@/types';

/**
 * Safely serialize JSON-LD script content, escaping dangerous HTML characters to prevent XSS.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
}

/**
 * Top-level Organization Structured Data (Saudi Future Tech Publisher)
 */
export const OrganizationJsonLd: React.FC = () => {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: DEFAULT_SEO.siteName,
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/icon.png`,
    },
    description: DEFAULT_SEO.description,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Riyadh',
      addressCountry: 'SA',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: DEFAULT_SEO.publisher.editorialDesk,
      contactType: 'editorial desk',
    },
    sameAs: [DEFAULT_SEO.social.linkedin],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
};

/**
 * WebSite Structured Data with SiteLinks SearchBox
 */
export const WebSiteJsonLd: React.FC = () => {
  const baseUrl = getBaseUrl();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: DEFAULT_SEO.siteName,
    url: baseUrl,
    description: DEFAULT_SEO.description,
    publisher: {
      '@type': 'Organization',
      name: DEFAULT_SEO.siteName,
      url: baseUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
};

interface NewsArticleJsonLdProps {
  article: ArticleDetail;
}

/**
 * In-depth NewsArticle / Technical Article Schema for Editorial Detail Pages
 */
export const NewsArticleJsonLd: React.FC<NewsArticleJsonLdProps> = ({ article }) => {
  const baseUrl = getBaseUrl();
  const articleUrl = getCanonicalUrl(`/article/${article.slug}`);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    image: [article.coverImageUrl],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    articleSection: article.category.name,
    inLanguage: 'en-US',
    keywords: article.tags?.join(', '),
    author: {
      '@type': 'Person',
      name: article.author.displayName,
      jobTitle: article.author.title,
      url: getCanonicalUrl(`/author/${article.author.slug}`),
      ...(article.author.avatarUrl && { image: article.author.avatarUrl }),
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: DEFAULT_SEO.siteName,
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon.png`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
};

interface AuthorProfileJsonLdProps {
  author: AuthorItem;
}

/**
 * Person / ProfilePage Schema for Author Byline Profiles
 */
export const AuthorProfileJsonLd: React.FC<AuthorProfileJsonLdProps> = ({ author }) => {
  const authorUrl = getCanonicalUrl(`/author/${author.slug}`);

  const sameAsLinks: string[] = [];
  if (author.twitterHandle) {
    const handle = author.twitterHandle.replace(/^@/, '');
    sameAsLinks.push(`https://x.com/${handle}`);
  }
  if (author.linkedinUrl) {
    sameAsLinks.push(author.linkedinUrl);
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: author.displayName,
      jobTitle: author.title,
      description: author.bio,
      url: authorUrl,
      ...(author.avatarUrl && { image: author.avatarUrl }),
      worksFor: {
        '@type': 'Organization',
        name: DEFAULT_SEO.siteName,
        url: getBaseUrl(),
      },
      ...(sameAsLinks.length > 0 && { sameAs: sameAsLinks }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
};

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList Schema for navigation hierarchies
 */
export const BreadcrumbJsonLd: React.FC<BreadcrumbJsonLdProps> = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: getCanonicalUrl(item.href) }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  );
};

