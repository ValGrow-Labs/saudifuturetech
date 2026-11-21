import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';
import { MainContainer } from '@/components/public/MainContainer';
import { UnsubscribeClient } from '@/components/public/UnsubscribeClient';

export const metadata: Metadata = {
  title: 'Unsubscribe from Newsletter | Saudi Future Tech',
  description: 'Manage your subscription preferences for the Saudi Future Tech Executive Briefing.',
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
    <div className="min-h-screen flex flex-col bg-editorial-paper text-ink-body font-sans selection:bg-brand-yellow/30">
      <SiteHeader />

      <main className="flex-1 py-16 sm:py-24 flex items-center justify-center">
        <MainContainer>
          <Suspense fallback={<div className="text-center text-xs text-ink-muted font-serif italic">Loading preferences...</div>}>
            <UnsubscribeClient token={token} />
          </Suspense>
        </MainContainer>
      </main>

      <SiteFooter />
    </div>
  );
}

