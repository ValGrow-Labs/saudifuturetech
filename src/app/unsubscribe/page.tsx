import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { UnsubscribeClient } from '@/components/public/UnsubscribeClient';
import { getCanonicalUrl } from '@/lib/seo/config';

export const metadata: Metadata = {
  title: 'Unsubscribe',
  description: 'Stop receiving the Saudi Future Tech Sunday Brief.',
  alternates: {
    canonical: getCanonicalUrl('/unsubscribe'),
  },
  robots: {
    index: false,
    follow: false,
  },
};

interface UnsubscribePageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token } = await searchParams;

  return (
    <>
      <SiteHeader />

      <main id="main" className="flex-1">
        <MainContainer className="pt-14 md:pt-20 pb-28">
          <Suspense fallback={<p className="meta">Loading…</p>}>
            <UnsubscribeClient token={token} />
          </Suspense>
        </MainContainer>
      </main>

      <SiteFooter />
    </>
  );
}
