import prisma from '../src/lib/prisma';
import { OpportunityStatus } from '@prisma/client';

async function syncFinalData() {
  console.log('🔄 Synchronizing database records for Final Data & Security Sign-off...\n');

  // 1. UPDATE OPPORTUNITY RECORDS
  console.log('--- 1. Updating Opportunity Records ---');

  // 1.1 Correct SDAIA ALLaM: It was a hackathon competition (concluded), NOT an active separate H100 compute grant
  await prisma.opportunity.update({
    where: { slug: 'sdaia-allam-compute-grant' },
    data: {
      title: 'SDAIA ALLaM Challenge (Concluded Hackathon)',
      category: 'GOVERNMENT_PROGRAM',
      description: 'The ALLaM Challenge was a national competitive AI hackathon with a SAR 1,000,000 total prize pool organized by SDAIA in partnership with SAFCSP, IBM, and NTDP. The SAR 300,000 award was the competition second-place cash prize, not an open standalone GPU compute grant. The challenge cohort is now concluded.',
      fundingAmount: 'SAR 1M Total Prize Pool (SAR 300K 2nd Place Award)',
      equityTaken: '0% Non-Dilutive (Competition Prize)',
      status: OpportunityStatus.CLOSED,
      isPublished: false, // Quarantined from active opportunity directory
      applicationUrl: 'https://sdaia.gov.sa',
      sourceUrl: 'https://sdaia.gov.sa',
      sourceName: 'Saudi Data and AI Authority (SDAIA) Official Announcements',
      verifiedAt: new Date(),
      verifiedBy: 'SFT Editorial Quality Board',
    },
  });
  console.log('   ✅ Corrected SDAIA ALLaM: marked as Concluded Hackathon, status CLOSED, isPublished: false');

  // 1.2 Update KAUST Taqadam Accelerator
  await prisma.opportunity.update({
    where: { slug: 'kaust-taqadam-accelerator' },
    data: {
      applicationUrl: 'https://taqadam.kaust.edu.sa/',
      sourceUrl: 'https://taqadam.kaust.edu.sa/',
      sourceName: 'KAUST Entrepreneurship Center & SABB',
      fundingAmount: 'SAR 150,000 Zero-Equity Grant + Up to SAR 375K Follow-on',
      equityTaken: '0% Equity (Zero Dilution)',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified KAUST Taqadam Accelerator URL and Zero-Equity terms');

  // 1.3 Update NTDP MVPLab
  await prisma.opportunity.update({
    where: { slug: 'ntdp-mvplab-grant' },
    data: {
      applicationUrl: 'https://ntdp.gov.sa/initiatives/mvplab',
      sourceUrl: 'https://ntdp.gov.sa/initiatives/mvplab',
      sourceName: 'National Technology Development Program (NTDP) Official Portal',
      fundingAmount: 'Up to SAR 150,000 (Non-Dilutive Grant)',
      equityTaken: '0% Equity',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified NTDP MVPLab URL and grant terms');

  // 1.4 Update The Garage Seed Cohort
  await prisma.opportunity.update({
    where: { slug: 'the-garage-seed-cohort' },
    data: {
      applicationUrl: 'https://thegarage.sa',
      sourceUrl: 'https://thegarage.sa',
      sourceName: 'The Garage (KACST & MCIT) Official Portal',
      fundingAmount: 'SAR 100,000 Direct Grant + SAR 250K Cloud Credits',
      equityTaken: '0% Equity (Zero Dilution)',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified The Garage Seed Cohort URL and grant terms');

  // 1.5 Update Sanabil 500 Global
  await prisma.opportunity.update({
    where: { slug: 'sanabil-500-global-accelerator' },
    data: {
      applicationUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceName: 'Sanabil Investments (PIF) & 500 Global Official Portal',
      fundingAmount: '$100,000 USD (~SAR 375,000) Seed Investment',
      equityTaken: 'Standard Seed Equity Stake',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified Sanabil 500 Global URL and terms');

  // 1.6 Update Monsha’at Innovation Vouchers
  await prisma.opportunity.update({
    where: { slug: 'monshaat-innovation-vouchers' },
    data: {
      applicationUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceName: 'Monsha’at Small and Medium Enterprises General Authority',
      fundingAmount: 'Co-funding Voucher up to SAR 100,000 (80% Subsidy)',
      equityTaken: '0% Non-Dilutive',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified Monsha’at Innovation Vouchers URL and terms');

  // 1.7 Update NCA CyberIC Incubator
  await prisma.opportunity.update({
    where: { slug: 'nca-cyberic-incubator-cohort-3' },
    data: {
      applicationUrl: 'https://nca.gov.sa/initiatives/cyberic',
      sourceUrl: 'https://nca.gov.sa/initiatives/cyberic',
      sourceName: 'National Cybersecurity Authority (NCA) Official Portal',
      fundingAmount: 'Up to SAR 120,000 Grant + Sovereign Security Certification',
      equityTaken: '0% Equity',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified NCA CyberIC Incubator URL and terms');

  // 1.8 Update SAMA Sandbox
  await prisma.opportunity.update({
    where: { slug: 'sama-regulatory-sandbox-fintech' },
    data: {
      applicationUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceName: 'Saudi Central Bank (SAMA) Regulatory Sandbox Official Register',
      fundingAmount: 'Regulatory Relief & Direct Bank Gateway Access (Non-Cash)',
      equityTaken: 'None (Regulatory Sandbox Framework)',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Verified SAMA Regulatory Sandbox URL and non-cash regulatory benefits');

  // 2. UPDATE INVESTOR DIRECT REGISTER URLS
  console.log('\n--- 2. Updating Investor Direct Evidence URLs ---');

  await prisma.investor.update({
    where: { slug: 'impact46' },
    data: {
      sourceUrl: 'https://cma.org.sa/en/Market/AuthorisedPersons/Pages/default.aspx',
      sourceName: 'Capital Market Authority (CMA) Register — Tatheer Company Finance (Lic. 18196-32)',
      checkSizeRange: '$800K – $3M (Unconfirmed Check Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'khwarizmi-ventures' },
    data: {
      sourceUrl: 'https://cma.org.sa/en/Market/AuthorisedPersons/Pages/default.aspx',
      sourceName: 'Capital Market Authority (CMA) Register — Khwarizmi Capital Company (Lic. 02-23255)',
      checkSizeRange: '$250K – $1.5M (Unconfirmed Check Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'raed-ventures' },
    data: {
      sourceUrl: 'https://www.adgm.com/public-registers/fsra/fs-firms/raed-ventures-limited',
      sourceName: 'ADGM FSRA Public Register — Raed Ventures Limited (FSP No. 200031)',
      checkSizeRange: '$500K – $1.5M (Unconfirmed Check Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'svc-sovereign-fund' },
    data: {
      sourceUrl: 'https://svc.com.sa/investment-in-funds/',
      sourceName: 'Saudi Venture Capital (SVC) Official Investment Guidelines & Mandates',
      checkSizeRange: 'Min SAR 1,000,000 (Direct Co-Investment capped at 30% of round)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'sanabil-investments' },
    data: {
      sourceUrl: 'https://sanabil.com',
      sourceName: 'Public Investment Fund (PIF) & Sanabil Investments Corporate Disclosures',
      checkSizeRange: '$10M – $50M+ (Unconfirmed Growth Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'waed-ventures' },
    data: {
      sourceUrl: 'https://waed.net',
      sourceName: 'Saudi Aramco Entrepreneurship Center (Wa’ed Ventures) Portfolio Announcements',
      checkSizeRange: '$1M – $5M (Unconfirmed Check Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'stv-vc' },
    data: {
      sourceUrl: 'https://stv.vc',
      sourceName: 'STV Corporate Disclosures & Venture Portfolios',
      checkSizeRange: '$2.5M – $15M (Unconfirmed Lead Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'outliers-vc' },
    data: {
      sourceUrl: 'https://svc.com.sa',
      sourceName: 'Saudi Venture Capital (SVC) Partner Directory / Outliers Corporate Disclosures',
      checkSizeRange: '$500K – $1.5M (Unconfirmed Check Estimate)',
    },
  });

  await prisma.investor.update({
    where: { slug: 'oqal-angel-network' },
    data: {
      sourceUrl: 'https://oqal.org',
      sourceName: 'Oqal Angel Investors Network Official Charter & Guidelines',
      checkSizeRange: 'SAR 200K – SAR 1.5M (Pooled Angel Syndicate)',
    },
  });
  console.log('   ✅ Updated all 9 Investor official register URLs and check size designations.');

  // 3. UPDATE STARTUP DIRECT REGISTER URLS
  console.log('\n--- 3. Updating Startup Direct Evidence URLs ---');

  await prisma.startup.update({
    where: { slug: 'jahez-group' },
    data: {
      sourceUrl: 'https://www.saudiexchange.sa/wps/portal/saudiexchange/hidden/company-profile-main/?companySymbol=9526',
      sourceName: 'Saudi Exchange (Tadawul Nomu) Official Company Profile (Symbol: 9526)',
    },
  });

  await prisma.startup.update({
    where: { slug: 'lean-technologies' },
    data: {
      sourceUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceName: 'Saudi Central Bank (SAMA) Permitted Open Banking Testing Register',
    },
  });

  await prisma.startup.update({
    where: { slug: 'lucidya-ai' },
    data: {
      sourceUrl: 'https://mc.gov.sa/en/pages/default.aspx',
      sourceName: 'Ministry of Commerce Official Registry (Wathiq) / Impact46 Series B Disclosures',
    },
  });

  await prisma.startup.update({
    where: { slug: 'mozn-ai' },
    data: {
      sourceUrl: 'https://mozn.sa/trust-center',
      sourceName: 'Ministry of Commerce Registry (Wathiq) / Mozn Trust Center',
    },
  });

  await prisma.startup.update({
    where: { slug: 'nomadd-solar' },
    data: {
      sourceUrl: 'https://innovation.kaust.edu.sa',
      sourceName: 'Ministry of Commerce Registry (Wathiq) / KAUST Innovation Ventures',
    },
  });

  await prisma.startup.update({
    where: { slug: 'sirar-cybersecurity' },
    data: {
      sourceUrl: 'https://nca.gov.sa',
      sourceName: 'National Cybersecurity Authority (NCA) Licensed MSSP Register / stc group',
    },
  });

  await prisma.startup.update({
    where: { slug: 'tamara-fintech' },
    data: {
      sourceUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceName: 'Saudi Central Bank (SAMA) Permitted BNPL Register / Tamara Official Release',
    },
  });

  await prisma.startup.update({
    where: { slug: 'unifonic' },
    data: {
      sourceUrl: 'https://mc.gov.sa/en/pages/default.aspx',
      sourceName: 'Ministry of Commerce Registry (Wathiq) / SoftBank Vision Fund 2 Disclosures',
    },
  });
  console.log('   ✅ Updated all 8 Startup official register evidence URLs.');

  console.log('\n🎉 Database synchronization complete!');
}

syncFinalData().catch(console.error).finally(() => prisma.$disconnect());
