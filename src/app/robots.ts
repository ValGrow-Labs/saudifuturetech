import type { MetadataRoute } from 'next';
import { getBaseUrl, getCanonicalUrl } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin',
          '/api/admin/',
          '/api/cron/',
          '/api/auth/',
          '/unsubscribe',
          '/search',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

