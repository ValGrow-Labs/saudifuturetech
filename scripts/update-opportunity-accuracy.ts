import prisma from '../src/lib/prisma';
import { OpportunityStatus } from '@prisma/client';

async function updateOpportunityAccuracy() {
  console.log('🔄 Updating Opportunity status, benefits, and evidence URLs for final sign-off...\n');

  // 1. KAUST TAQADAM
  await prisma.opportunity.update({
    where: { slug: 'kaust-taqadam-accelerator' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://taqadam.kaust.edu.sa/',
      sourceUrl: 'https://innovation.kaust.edu.sa/entrepreneurs/taqadam/',
      sourceName: 'KAUST Entrepreneurship Center (Official Portal)',
      fundingAmount: 'SAR 150,000 Zero-Equity Grant + Up to SAR 375K Follow-on',
      equityTaken: '0% Equity (Zero Dilution)',
      description: 'TAQADAM is an annual startup accelerator powered by King Abdullah University of Science and Technology (KAUST) and Saudi Awwal Bank (SAB). Accepted startups receive SAR 150,000 in zero-equity grant funding, with top-performing showcase finalists eligible for up to SAR 375,000 in follow-on funding. The annual cohort runs for 6 months. Application intake is currently closed between cohorts.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ KAUST TAQADAM: status set to CLOSED (Annual cycle between cohorts)');

  // 2. The Garage
  await prisma.opportunity.update({
    where: { slug: 'the-garage-seed-cohort' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://thegarage.sa',
      sourceUrl: 'https://thegarage.sa',
      sourceName: 'The Garage (MCIT & KACST Official Portal)',
      fundingAmount: 'SAR 100,000 Direct Grant + SAR 250K Cloud Credits',
      equityTaken: '0% Equity (Zero Dilution)',
      description: 'The Garage Incubator and Accelerator (backed by MCIT, KACST, and SAFCSP) provides tech startups with up to SAR 100,000 in direct grants, SAR 250,000 in cloud credits, access to KACST research laboratories, and dedicated workspace at its Riyadh campus. Programs are conducted in periodic cohort batches; the application window is currently closed pending announcement of the next intake.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ The Garage: status set to CLOSED (Between cohort batches)');

  // 3. SAMA Regulatory Sandbox
  await prisma.opportunity.update({
    where: { slug: 'sama-regulatory-sandbox-fintech' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/PermittedEntities.aspx',
      sourceName: 'Saudi Central Bank (SAMA) Regulatory Sandbox Official Framework',
      fundingAmount: 'Controlled Regulatory Testing Framework (Non-Cash Relief)',
      equityTaken: 'None (Non-Cash Regulatory Framework)',
      description: 'The SAMA Regulatory Sandbox is a controlled supervisory test environment established by the Saudi Central Bank. It permits local and international FinTech companies to test innovative financial products, services, and business models with live consumers under relaxed regulatory requirements, subject to sandbox cohort testing parameters, operational controls, and defined transaction limits. Evaluated in structured cohort testing windows; application intake is currently closed between cohort reviews.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ SAMA Sandbox: direct bank API claim removed; status set to CLOSED (Between cohort reviews)');

  // 4. Sanabil 500 Global
  await prisma.opportunity.update({
    where: { slug: 'sanabil-500-global-accelerator' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceName: 'Sanabil 500 MENA Seed Accelerator Portal (500 Global & Sanabil)',
      fundingAmount: '$100,000 USD (~SAR 375,000) Seed Investment',
      equityTaken: 'Standard Seed Equity Stake',
      description: 'The Sanabil 500 MENA Seed Accelerator (joint venture between Sanabil Investments and 500 Global) provides early-stage tech founders across the MENA region with $100,000 USD in seed capital investment, growth mentorship, and regional investor network access. The program operates in structured batch intakes; the application window is currently closed between batches.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Sanabil 500 Global: status set to CLOSED (Between batches)');

  // 5. NCA CyberIC
  await prisma.opportunity.update({
    where: { slug: 'nca-cyberic-incubator-cohort-3' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://nca.gov.sa/initiatives/cyberic',
      sourceUrl: 'https://nca.gov.sa/initiatives/cyberic',
      sourceName: 'National Cybersecurity Authority (NCA) Official CyberIC Portal',
      fundingAmount: 'Up to SAR 120,000 Grant + Sovereign Security Certification',
      equityTaken: '0% Equity',
      description: 'The CyberIC program is a national initiative launched by the National Cybersecurity Authority (NCA) to foster cybersecurity entrepreneurship in the Kingdom. It provides early-stage cybersecurity startups with development grants up to SAR 120,000, testing lab access, and sovereign security certification guidance. Cohort 3 applications are closed.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ NCA CyberIC: status set to CLOSED (Cohort 3 closed)');

  // 6. NTDP MVPLab
  await prisma.opportunity.update({
    where: { slug: 'ntdp-mvplab-grant' },
    data: {
      status: OpportunityStatus.CLOSED,
      deadline: null,
      applicationUrl: 'https://ntdp.gov.sa/initiatives/mvplab',
      sourceUrl: 'https://ntdp.gov.sa/initiatives/mvplab',
      sourceName: 'National Technology Development Program (NTDP) Official Portal',
      fundingAmount: 'Up to SAR 150,000 (Non-Dilutive Grant)',
      equityTaken: '0% Equity',
      description: 'The MVPLab initiative by the National Technology Development Program (NTDP) provides non-dilutive financial development grants of up to SAR 150,000 alongside workspace access and specialized mentorship for Saudi tech founders with completed MVPs or feasibility studies. Applications are evaluated in cohort batches; the intake window is currently closed between cycles.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ NTDP MVPLab: status set to CLOSED (Between batch cycles)');

  // 7. Monsha’at Innovation Vouchers
  await prisma.opportunity.update({
    where: { slug: 'monshaat-innovation-vouchers' },
    data: {
      status: OpportunityStatus.ROLLING,
      deadline: null,
      applicationUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceName: 'Monsha’at Small and Medium Enterprises General Authority Portal',
      fundingAmount: 'Co-funding Voucher up to SAR 100,000 (80% Subsidy)',
      equityTaken: '0% Non-Dilutive',
      description: 'The Monsha’at Innovation Vouchers program is an ongoing government service that subsidizes up to 80% (up to SAR 100,000) of R&D, digital prototyping, and technical business development costs for registered Saudi SMEs through accredited service providers. Open on a continuous rolling basis for eligible Commercial Registration (CR) holders, subject to annual voucher budget allocations.',
      verifiedAt: new Date(),
    },
  });
  console.log('   ✅ Monsha’at Innovation Vouchers: status set to ROLLING (Ongoing portal service)');

  console.log('\n🎉 Opportunity data successfully updated!');
}

updateOpportunityAccuracy().catch(console.error).finally(() => prisma.$disconnect());
