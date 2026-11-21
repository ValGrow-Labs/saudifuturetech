import { NextRequest, NextResponse } from 'next/server';
import { searchUnifiedEcosystem } from '@/lib/founder-intelligence';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const rawCategory = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Normalize category
    let category: 'all' | 'startups' | 'investors' | 'opportunities' | 'articles' = 'all';
    if (
      rawCategory === 'startups' ||
      rawCategory === 'investors' ||
      rawCategory === 'opportunities' ||
      rawCategory === 'articles'
    ) {
      category = rawCategory;
    }

    const searchResult = await searchUnifiedEcosystem({
      query,
      category,
      page,
      limit,
    });

    return NextResponse.json({
      ...searchResult,
      // Backwards compatibility for existing legacy consumers
      count: searchResult.totalCount,
      results: searchResult.articles,
      articlesCount: searchResult.counts.articles,
      opportunitiesCount: searchResult.counts.opportunities,
      startupsCount: searchResult.counts.startups,
      investorsCount: searchResult.counts.investors,
    });
  } catch (error) {
    console.error('[API/search] Search handler error:', error);
    return NextResponse.json(
      { error: 'Failed to execute unified founder intelligence search query' },
      { status: 500 }
    );
  }
}
