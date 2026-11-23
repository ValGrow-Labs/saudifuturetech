import prisma from '@/lib/prisma';
import { OpportunityCategory, OpportunityStatus, StartupStage, BusinessModel, InvestorType } from '@prisma/client';

export interface OpportunityFilters {
  category?: OpportunityCategory | 'ALL';
  status?: OpportunityStatus | 'ALL' | 'ACTIVE_ONLY';
  categorySlug?: string;
  search?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  eligibility?: 'ALL' | 'SAUDI_CR' | 'NON_DILUTIVE' | 'PRE_REVENUE_MVP';
  sort?: 'deadline-asc' | 'verified-desc' | 'amount-desc' | 'title-asc';
}

export async function getOpportunities(filters: OpportunityFilters = {}) {
  const where: any = {};

  // Public views only see published records
  if (!filters.includeUnpublished) {
    where.isPublished = true;
  }

  if (filters.category && filters.category !== 'ALL') {
    where.category = filters.category;
  }

  if (filters.categorySlug && filters.categorySlug !== 'ALL') {
    where.categoryRel = { slug: filters.categorySlug };
  }

  if (filters.featuredOnly) {
    where.isFeatured = true;
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.trim();
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { organization: { contains: term, mode: 'insensitive' } },
      { description: { contains: term, mode: 'insensitive' } },
      { eligibilitySummary: { contains: term, mode: 'insensitive' } },
    ];
  }

  // Determine Prisma orderBy clause
  let orderBy: any = [
    { isFeatured: 'desc' },
    { deadline: 'asc' },
    { createdAt: 'desc' },
  ];

  if (filters.sort === 'verified-desc') {
    orderBy = [{ verifiedAt: 'desc' }];
  } else if (filters.sort === 'title-asc') {
    orderBy = [{ title: 'asc' }];
  } else if (filters.sort === 'deadline-asc') {
    orderBy = [{ deadline: 'asc' }, { isFeatured: 'desc' }];
  }

  const rawList = await prisma.opportunity.findMany({
    where,
    include: {
      categoryRel: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy,
  });

  const now = new Date();

  // Dynamic expired detection & verification post-processing
  const processed = rawList.map((opp) => {
    // If deadline is in the past, compute effective status as CLOSED
    const isExpired = Boolean(opp.deadline && new Date(opp.deadline) < now);
    const effectiveStatus: OpportunityStatus = isExpired
      ? OpportunityStatus.CLOSED
      : opp.status;

    return {
      ...opp,
      effectiveStatus,
      isExpired,
      categoryRel: opp.categoryRel
        ? {
            id: opp.categoryRel.id,
            name: opp.categoryRel.name,
            slug: opp.categoryRel.slug,
            color: opp.categoryRel.accentColor || '#39765B',
          }
        : null,
    };
  });

  // Filter by status (including dynamic expired handling)
  let filtered = processed;
  if (filters.status === 'ACTIVE_ONLY') {
    filtered = filtered.filter((opp) => opp.effectiveStatus !== OpportunityStatus.CLOSED);
  } else if (filters.status && filters.status !== 'ALL') {
    filtered = filtered.filter((opp) => opp.effectiveStatus === filters.status);
  }

  // Eligibility stage filter
  if (filters.eligibility && filters.eligibility !== 'ALL') {
    if (filters.eligibility === 'NON_DILUTIVE') {
      filtered = filtered.filter(
        (opp) =>
          opp.equityTaken?.includes('0%') ||
          opp.equityTaken?.toLowerCase().includes('non-dilutive') ||
          opp.category === OpportunityCategory.GRANT ||
          opp.category === OpportunityCategory.SUBSIDY
      );
    } else if (filters.eligibility === 'SAUDI_CR') {
      filtered = filtered.filter((opp) => {
        const criteria = Array.isArray(opp.eligibilityCriteria)
          ? (opp.eligibilityCriteria as string[]).join(' ')
          : '';
        return (
          criteria.toLowerCase().includes('cr') ||
          criteria.toLowerCase().includes('commercial registration') ||
          opp.eligibilitySummary?.toLowerCase().includes('cr') ||
          opp.eligibilitySummary?.toLowerCase().includes('saudi entity')
        );
      });
    } else if (filters.eligibility === 'PRE_REVENUE_MVP') {
      filtered = filtered.filter((opp) => {
        const text = `${opp.title} ${opp.description} ${opp.eligibilitySummary}`.toLowerCase();
        return text.includes('mvp') || text.includes('prototype') || text.includes('seed') || text.includes('pre-seed') || text.includes('early');
      });
    }
  }

  return filtered;
}

export interface StartupFilters {
  stage?: StartupStage | 'ALL';
  businessModel?: BusinessModel | 'ALL';
  categorySlug?: string;
  hqCity?: string;
  crVerifiedOnly?: boolean;
  search?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  sort?: 'RECENT' | 'NAME' | 'STAGE' | 'FOUNDING_YEAR';
}

export async function getStartups(filters: StartupFilters = {}) {
  const where: any = {};

  if (!filters.includeUnpublished) {
    where.isPublished = true;
  }

  if (filters.stage && filters.stage !== 'ALL') {
    where.stage = filters.stage;
  }

  if (filters.businessModel && filters.businessModel !== 'ALL') {
    where.businessModel = filters.businessModel;
  }

  if (filters.categorySlug && filters.categorySlug !== 'ALL') {
    where.category = { slug: filters.categorySlug };
  }

  if (filters.hqCity && filters.hqCity !== 'ALL') {
    where.hqCity = { contains: filters.hqCity, mode: 'insensitive' };
  }

  if (filters.crVerifiedOnly) {
    where.crVerified = true;
  }

  if (filters.featuredOnly) {
    where.isFeatured = true;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { tagline: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { hqCity: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  let orderBy: any[] = [
    { isFeatured: 'desc' },
    { verifiedAt: 'desc' },
    { name: 'asc' },
  ];

  if (filters.sort === 'NAME') {
    orderBy = [{ name: 'asc' }];
  } else if (filters.sort === 'FOUNDING_YEAR') {
    orderBy = [{ foundingYear: 'desc' }, { name: 'asc' }];
  } else if (filters.sort === 'STAGE') {
    orderBy = [{ stage: 'desc' }, { name: 'asc' }];
  }

  const startups = await prisma.startup.findMany({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy,
  });

  return startups.map((s) => ({
    ...s,
    category: s.category
      ? {
          id: s.category.id,
          name: s.category.name,
          slug: s.category.slug,
          color: s.category.accentColor || '#C69B59',
        }
      : null,
  }));
}

export interface InvestorFilters {
  type?: InvestorType | 'ALL';
  stage?: string | 'ALL';
  sector?: string | 'ALL';
  cmaAuthorizedOnly?: boolean;
  svcPartnerOnly?: boolean;
  activeInvestingOnly?: boolean;
  saudiRegulatedOnly?: boolean;
  search?: string;
  featuredOnly?: boolean;
  includeUnpublished?: boolean;
  sort?: 'NAME' | 'RECENT' | 'TYPE';
}

export async function getInvestors(filters: InvestorFilters = {}) {
  const where: any = {};

  if (!filters.includeUnpublished) {
    where.isPublished = true;
  }

  if (filters.type && filters.type !== 'ALL') {
    where.type = filters.type;
  }

  if (filters.cmaAuthorizedOnly) {
    where.isCmaAuthorized = true;
  }

  if (filters.svcPartnerOnly) {
    where.isSvcPartner = true;
  }

  if (filters.activeInvestingOnly) {
    where.isActiveInvesting = true;
  }

  if (filters.saudiRegulatedOnly) {
    where.saudiRegulated = true;
  }

  if (filters.featuredOnly) {
    where.isFeatured = true;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { licenseDetails: { contains: filters.search, mode: 'insensitive' } },
      { cmaLicenseNumber: { contains: filters.search, mode: 'insensitive' } },
      { regulatoryCategory: { contains: filters.search, mode: 'insensitive' } },
      { hqLocation: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  let orderBy: any[] = [
    { isFeatured: 'desc' },
    { name: 'asc' },
  ];

  if (filters.sort === 'RECENT') {
    orderBy = [{ verifiedAt: 'desc' }, { name: 'asc' }];
  } else if (filters.sort === 'TYPE') {
    orderBy = [{ type: 'asc' }, { name: 'asc' }];
  }

  const investors = await prisma.investor.findMany({
    where,
    orderBy,
  });

  // In-memory filter for Json arrays (targetStages & targetSectors)
  let result = investors;
  if (filters.stage && filters.stage !== 'ALL') {
    const targetStage = filters.stage.toLowerCase();
    result = result.filter((inv) => {
      const stages = Array.isArray(inv.targetStages) ? (inv.targetStages as string[]) : [];
      return stages.some((s) => s.toLowerCase().includes(targetStage));
    });
  }

  if (filters.sector && filters.sector !== 'ALL') {
    const targetSector = filters.sector.toLowerCase();
    result = result.filter((inv) => {
      const sectors = Array.isArray(inv.targetSectors) ? (inv.targetSectors as string[]) : [];
      return sectors.some((s) => s.toLowerCase().includes(targetSector));
    });
  }

  return result;
}

export async function getInvestorBySlug(slug: string, allowUnpublished = false) {
  const where: any = { slug };
  if (!allowUnpublished) {
    where.isPublished = true;
  }

  return await prisma.investor.findFirst({
    where,
  });
}

export async function getAllInvestorSlugs() {
  // Used by generateStaticParams. If the database is unreachable at build time
  // (e.g. a first deploy), pre-render nothing — pages render on first request.
  try {
    const investors = await prisma.investor.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return investors.map((inv) => inv.slug);
  } catch (error) {
    console.warn('[DataAccess] getAllInvestorSlugs failed, skipping pre-render:', String(error).slice(0, 200));
    return [];
  }
}

export async function getRelatedInvestors(excludeId?: string, type?: InvestorType, limit = 3) {
  const where: any = { isPublished: true };
  if (excludeId) {
    where.id = { not: excludeId };
  }
  if (type) {
    where.type = type;
  }

  return await prisma.investor.findMany({
    where,
    take: limit,
    orderBy: [
      { isFeatured: 'desc' },
      { verifiedAt: 'desc' },
    ],
  });
}

export async function getOpportunityBySlug(slug: string, allowUnpublished = false) {
  const where: any = { slug };
  if (!allowUnpublished) {
    where.isPublished = true;
  }

  const opp = await prisma.opportunity.findFirst({
    where,
    include: {
      categoryRel: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
  });

  if (!opp) return null;

  const now = new Date();
  const isExpired = Boolean(opp.deadline && new Date(opp.deadline) < now);
  const effectiveStatus = isExpired ? OpportunityStatus.CLOSED : opp.status;

  return {
    ...opp,
    effectiveStatus,
    isExpired,
    categoryRel: opp.categoryRel
      ? {
          id: opp.categoryRel.id,
          name: opp.categoryRel.name,
          slug: opp.categoryRel.slug,
          color: opp.categoryRel.accentColor || '#39765B',
        }
      : null,
  };
}

export async function getRelatedOpportunities(categoryId?: string | null, excludeId?: string, limit = 3) {
  const where: any = { isPublished: true };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const list = await prisma.opportunity.findMany({
    where,
    take: limit,
    include: {
      categoryRel: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { deadline: 'asc' },
    ],
  });

  const now = new Date();

  return list.map((opp) => {
    const isExpired = Boolean(opp.deadline && new Date(opp.deadline) < now);
    return {
      ...opp,
      effectiveStatus: isExpired ? OpportunityStatus.CLOSED : opp.status,
      isExpired,
      categoryRel: opp.categoryRel
        ? {
            id: opp.categoryRel.id,
            name: opp.categoryRel.name,
            slug: opp.categoryRel.slug,
            color: opp.categoryRel.accentColor || '#39765B',
          }
        : null,
    };
  });
}

export async function getStartupBySlug(slug: string, allowUnpublished = false) {
  const where: any = { slug };
  if (!allowUnpublished) {
    where.isPublished = true;
  }

  const s = await prisma.startup.findFirst({
    where,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
  });

  if (!s) return null;

  return {
    ...s,
    category: s.category
      ? {
          id: s.category.id,
          name: s.category.name,
          slug: s.category.slug,
          color: s.category.accentColor || '#C69B59',
        }
      : null,
  };
}

export async function getRelatedStartups(categoryId?: string | null, excludeId?: string, limit = 3) {
  const where: any = { isPublished: true };
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (excludeId) {
    where.id = { not: excludeId };
  }

  const list = await prisma.startup.findMany({
    where,
    take: limit,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          accentColor: true,
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { foundingYear: 'desc' },
    ],
  });

  return list.map((s) => ({
    ...s,
    category: s.category
      ? {
          id: s.category.id,
          name: s.category.name,
          slug: s.category.slug,
          color: s.category.accentColor || '#C69B59',
        }
      : null,
  }));
}

export async function getAllOpportunitySlugs() {
  // Used by generateStaticParams. If the database is unreachable at build time
  // (e.g. a first deploy), pre-render nothing — pages render on first request.
  try {
    const opps = await prisma.opportunity.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return opps.map((o) => o.slug);
  } catch (error) {
    console.warn('[DataAccess] getAllOpportunitySlugs failed, skipping pre-render:', String(error).slice(0, 200));
    return [];
  }
}

export async function getAllStartupSlugs() {
  // Used by generateStaticParams. If the database is unreachable at build time
  // (e.g. a first deploy), pre-render nothing — pages render on first request.
  try {
    const startups = await prisma.startup.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return startups.map((s) => s.slug);
  } catch (error) {
    console.warn('[DataAccess] getAllStartupSlugs failed, skipping pre-render:', String(error).slice(0, 200));
    return [];
  }
}

// ------------------------------------------------------------------------------
// UNIFIED SEARCH INTELLIGENCE ENGINE (Phase E)
// ------------------------------------------------------------------------------

export interface UnifiedSearchOptions {
  query?: string;
  category?: 'all' | 'startups' | 'investors' | 'opportunities' | 'articles';
  page?: number;
  limit?: number;
}

export interface UnifiedSearchCounts {
  all: number;
  startups: number;
  investors: number;
  opportunities: number;
  articles: number;
}

export interface UnifiedSearchResponse {
  query: string;
  category: 'all' | 'startups' | 'investors' | 'opportunities' | 'articles';
  page: number;
  limit: number;
  totalPages: number;
  totalCount: number;
  counts: UnifiedSearchCounts;
  startups: any[];
  investors: any[];
  opportunities: any[];
  articles: any[];
}

export async function searchUnifiedEcosystem(options: UnifiedSearchOptions = {}): Promise<UnifiedSearchResponse> {
  const query = (options.query || '').trim();
  const category = options.category || 'all';
  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 12);
  const term = query.toLowerCase();

  // Helper scoring function
  const scoreText = (
    name: string,
    highWeightFields: (string | null | undefined)[],
    standardFields: (string | null | undefined)[]
  ): number => {
    if (!term) return 1;
    const lowerName = (name || '').toLowerCase();
    let score = 0;

    if (lowerName === term) score += 100;
    else if (lowerName.startsWith(term)) score += 60;
    else if (lowerName.includes(term)) score += 40;

    for (const f of highWeightFields) {
      if (f && f.toLowerCase().includes(term)) {
        score += 25;
      }
    }

    for (const f of standardFields) {
      if (f && f.toLowerCase().includes(term)) {
        score += 10;
      }
    }

    return score;
  };

  // 1. Fetch all published records in parallel
  const [rawStartups, rawInvestors, rawOpps, rawArticles] = await Promise.all([
    prisma.startup.findMany({
      where: { isPublished: true },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            accentColor: true,
          },
        },
      },
    }),
    prisma.investor.findMany({
      where: { isPublished: true },
    }),
    prisma.opportunity.findMany({
      where: { isPublished: true },
      include: {
        categoryRel: {
          select: {
            id: true,
            name: true,
            slug: true,
            accentColor: true,
          },
        },
      },
    }),
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            accentColor: true,
          },
        },
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        articleTags: {
          include: {
            tag: true,
          },
        },
      },
    }),
  ]);

  const now = new Date();

  // 2. Score and Filter Startups
  const scoredStartups = rawStartups
    .map((s) => {
      const highWeight = [
        s.tagline,
        s.fundingDisclosed,
        s.category?.name,
        Array.isArray(s.investorsDisclosed) ? (s.investorsDisclosed as string[]).join(' ') : '',
        Array.isArray(s.products) ? (s.products as string[]).join(' ') : '',
      ];
      const standard = [
        s.description,
        s.hqCity,
        s.stage,
        s.businessModel,
        Array.isArray(s.techStack) ? (s.techStack as string[]).join(' ') : '',
      ];
      const score = scoreText(s.name, highWeight, standard);
      return {
        ...s,
        category: s.category
          ? {
              id: s.category.id,
              name: s.category.name,
              slug: s.category.slug,
              color: s.category.accentColor || '#C69B59',
            }
          : null,
        _score: score,
      };
    })
    .filter((s) => s._score > 0)
    .sort((a, b) => b._score - a._score || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name));

  // 3. Score and Filter Investors
  const scoredInvestors = rawInvestors
    .map((inv) => {
      const highWeight = [
        inv.checkSizeRange,
        inv.cmaLicenseNumber,
        inv.regulatoryCategory,
        inv.licenseDetails,
        inv.svcProgramDetails,
        inv.type,
        Array.isArray(inv.portfolioHighlights) ? (inv.portfolioHighlights as string[]).join(' ') : '',
      ];
      const standard = [
        inv.description,
        inv.thesisSummary,
        inv.hqLocation,
        Array.isArray(inv.targetStages) ? (inv.targetStages as string[]).join(' ') : '',
        Array.isArray(inv.targetSectors) ? (inv.targetSectors as string[]).join(' ') : '',
      ];
      const score = scoreText(inv.name, highWeight, standard);
      return {
        ...inv,
        _score: score,
      };
    })
    .filter((inv) => inv._score > 0)
    .sort((a, b) => b._score - a._score || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.name.localeCompare(b.name));

  // 4. Score and Filter Opportunities
  const scoredOpps = rawOpps
    .map((opp) => {
      const isExpired = Boolean(opp.deadline && new Date(opp.deadline) < now);
      const effectiveStatus: OpportunityStatus = isExpired ? OpportunityStatus.CLOSED : opp.status;

      const highWeight = [
        opp.organization,
        opp.fundingAmount,
        opp.equityTaken,
        opp.category,
        opp.categoryRel?.name,
      ];
      const standard = [
        opp.description,
        opp.location,
        opp.eligibilitySummary,
        Array.isArray(opp.eligibilityCriteria) ? (opp.eligibilityCriteria as string[]).join(' ') : '',
        Array.isArray(opp.benefits) ? (opp.benefits as string[]).join(' ') : '',
        Array.isArray(opp.requirements) ? (opp.requirements as string[]).join(' ') : '',
      ];
      let score = scoreText(opp.title, highWeight, standard);
      if (score > 0 && !isExpired) {
        score += 15; // Active boost
      }

      return {
        ...opp,
        effectiveStatus,
        isExpired,
        categoryRel: opp.categoryRel
          ? {
              id: opp.categoryRel.id,
              name: opp.categoryRel.name,
              slug: opp.categoryRel.slug,
              color: opp.categoryRel.accentColor || '#39765B',
            }
          : null,
        _score: score,
      };
    })
    .filter((opp) => opp._score > 0)
    .sort((a, b) => b._score - a._score || (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || a.title.localeCompare(b.title));

  // 5. Score and Filter Articles
  const scoredArticles = rawArticles
    .map((art) => {
      const tags = art.articleTags.map((at) => at.tag.name).join(' ');
      const highWeight = [art.category?.name, tags];
      const standard = [art.excerpt, art.content, art.author.name];
      const score = scoreText(art.title, highWeight, standard);
      return {
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        readingTime: art.readingTime,
        publishedAt: art.publishedAt || art.createdAt,
        author: {
          displayName: art.author.name,
          avatarUrl: art.author.avatar,
        },
        category: art.category
          ? {
              id: art.category.id,
              name: art.category.name,
              slug: art.category.slug,
              color: art.category.accentColor || '#39765B',
            }
          : null,
        _score: score,
      };
    })
    .filter((art) => art._score > 0)
    .sort((a, b) => b._score - a._score || new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const counts: UnifiedSearchCounts = {
    all: scoredStartups.length + scoredInvestors.length + scoredOpps.length + scoredArticles.length,
    startups: scoredStartups.length,
    investors: scoredInvestors.length,
    opportunities: scoredOpps.length,
    articles: scoredArticles.length,
  };

  let totalCount = counts.all;
  let totalPages = 1;
  let startupsResult: any[] = [];
  let investorsResult: any[] = [];
  let opportunitiesResult: any[] = [];
  let articlesResult: any[] = [];

  if (category === 'startups') {
    totalCount = counts.startups;
    totalPages = Math.max(1, Math.ceil(totalCount / limit));
    startupsResult = scoredStartups.slice((page - 1) * limit, page * limit);
  } else if (category === 'investors') {
    totalCount = counts.investors;
    totalPages = Math.max(1, Math.ceil(totalCount / limit));
    investorsResult = scoredInvestors.slice((page - 1) * limit, page * limit);
  } else if (category === 'opportunities') {
    totalCount = counts.opportunities;
    totalPages = Math.max(1, Math.ceil(totalCount / limit));
    opportunitiesResult = scoredOpps.slice((page - 1) * limit, page * limit);
  } else if (category === 'articles') {
    totalCount = counts.articles;
    totalPages = Math.max(1, Math.ceil(totalCount / limit));
    articlesResult = scoredArticles.slice((page - 1) * limit, page * limit);
  } else {
    // 'all': Show top results for each entity
    totalCount = counts.all;
    totalPages = 1;
    startupsResult = scoredStartups.slice(0, 4);
    investorsResult = scoredInvestors.slice(0, 4);
    opportunitiesResult = scoredOpps.slice(0, 4);
    articlesResult = scoredArticles.slice(0, 3);
  }

  return {
    query,
    category,
    page,
    limit,
    totalPages,
    totalCount,
    counts,
    startups: startupsResult,
    investors: investorsResult,
    opportunities: opportunitiesResult,
    articles: articlesResult,
  };
}
