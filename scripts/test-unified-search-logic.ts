import prisma from '../src/lib/prisma';
import { OpportunityStatus } from '@prisma/client';

async function testSearchLogic() {
  console.log('🧪 Testing Unified Search Logic...\n');

  const testQueries = [
    'Tamara',
    'Impact46',
    'NTDP',
    'Mozn',
    'Series A',
    'Debt',
    'CMA',
    'ADGM',
    'FinTech',
    'Clean Energy',
    'xyznonexistent999'
  ];

  for (const q of testQueries) {
    const term = q.trim().toLowerCase();

    // 1. Startups
    const allStartups = await prisma.startup.findMany({
      where: { isPublished: true },
      include: { category: true }
    });

    const matchingStartups = allStartups.filter(s => {
      const text = [
        s.name,
        s.tagline,
        s.description,
        s.hqCity,
        s.fundingDisclosed || '',
        s.stage,
        s.businessModel,
        s.category?.name || '',
        ...(Array.isArray(s.products) ? s.products as string[] : []),
        ...(Array.isArray(s.investorsDisclosed) ? s.investorsDisclosed as string[] : []),
        ...(Array.isArray(s.techStack) ? s.techStack as string[] : []),
      ].join(' ').toLowerCase();
      return text.includes(term);
    });

    // 2. Investors
    const allInvestors = await prisma.investor.findMany({
      where: { isPublished: true }
    });

    const matchingInvestors = allInvestors.filter(inv => {
      const text = [
        inv.name,
        inv.description,
        inv.thesisSummary || '',
        inv.regulatoryCategory || '',
        inv.licenseDetails || '',
        inv.cmaLicenseNumber || '',
        inv.svcProgramDetails || '',
        inv.checkSizeRange || '',
        inv.type,
        inv.hqLocation,
        ...(Array.isArray(inv.targetStages) ? inv.targetStages as string[] : []),
        ...(Array.isArray(inv.targetSectors) ? inv.targetSectors as string[] : []),
        ...(Array.isArray(inv.portfolioHighlights) ? inv.portfolioHighlights as string[] : []),
      ].join(' ').toLowerCase();
      return text.includes(term);
    });

    // 3. Opportunities
    const allOpps = await prisma.opportunity.findMany({
      where: { isPublished: true },
      include: { categoryRel: true }
    });

    const now = new Date();
    const matchingOpps = allOpps.filter(opp => {
      const text = [
        opp.title,
        opp.organization,
        opp.description,
        opp.fundingAmount || '',
        opp.equityTaken || '',
        opp.location || '',
        opp.eligibilitySummary || '',
        opp.category,
        opp.categoryRel?.name || '',
        ...(Array.isArray(opp.eligibilityCriteria) ? opp.eligibilityCriteria as string[] : []),
        ...(Array.isArray(opp.benefits) ? opp.benefits as string[] : []),
        ...(Array.isArray(opp.requirements) ? opp.requirements as string[] : []),
      ].join(' ').toLowerCase();
      return text.includes(term);
    });

    console.log(`🔍 Query: "${q}" -> Startups: ${matchingStartups.length}, Investors: ${matchingInvestors.length}, Opps: ${matchingOpps.length}`);
    if (matchingStartups.length > 0) {
      console.log(`   Startups: ${matchingStartups.map(s => s.name).join(', ')}`);
    }
    if (matchingInvestors.length > 0) {
      console.log(`   Investors: ${matchingInvestors.map(i => i.name).join(', ')}`);
    }
    if (matchingOpps.length > 0) {
      console.log(`   Opps: ${matchingOpps.map(o => o.title).join(', ')}`);
    }
    console.log('');
  }
}

testSearchLogic()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
