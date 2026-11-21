import prisma from '../src/lib/prisma';
import { OpportunityStatus } from '@prisma/client';

async function applyFinalEvidenceAccuracy() {
  console.log('🔄 Applying final evidence accuracy corrections to SAMA Sandbox and Monsha’at Vouchers...\n');

  // 1. SAMA Regulatory Sandbox
  // Status: OPEN — YEAR-ROUND APPLICATIONS per SAMA Rulebook Chapter 2
  // Applications subject to eligibility assessment & acceptance (not automatic admission)
  // Non-cash relief; unsupported bank API gateway claims omitted.
  await prisma.opportunity.update({
    where: { slug: 'sama-regulatory-sandbox-fintech' },
    data: {
      status: OpportunityStatus.OPEN,
      deadline: null,
      applicationUrl: 'https://sama.gov.sa/en-US/pages/servicedetails.aspx?serviceid=96',
      sourceUrl: 'https://rulebook.sama.gov.sa/en/introduction-20',
      sourceName: 'Saudi Central Bank (SAMA) Regulatory Sandbox Official Rulebook & Service Portal',
      fundingAmount: 'Controlled Regulatory Testing Framework (Non-Cash Relief)',
      equityTaken: 'None (Non-Cash Supervisory Testing Environment)',
      description: 'The SAMA Regulatory Sandbox is a controlled supervisory test environment established by the Saudi Central Bank. In accordance with SAMA\'s official Rulebook, the sandbox is open throughout the year to receive applications from local and international FinTechs and licensed financial institutions. Admission is subject to formal eligibility assessment, testing criteria, and supervisory acceptance (not automatic admission). Direct bank API gateway claims are omitted as unsupported.',
      benefits: [
        'Supervised testing of innovative FinTech solutions with live customers under relaxed regulatory requirements',
        'Testing parameters, transaction limits, and safeguards defined directly with SAMA supervisors',
        'Evaluation for formal sandbox graduation and licensing transition upon successful testing',
        'Applications accepted year-round subject to statutory eligibility assessment and supervisory admission',
      ],
      eligibilityCriteria: [
        'Licensed financial institutions or tech startups with innovative financial solutions',
        'Genuine FinTech innovation ready for live testing with real consumers in Saudi Arabia',
        'Identified regulatory relief requirements to test business model',
        'Compliance with consumer protection, AML/CTF safeguards, and risk controls',
        'Formal acceptance by SAMA following supervisory assessment (admission not automatic)',
      ],
      eligibilitySummary: 'Open year-round to licensed financial institutions and FinTech startups testing innovative financial solutions in KSA, subject to formal SAMA eligibility assessment and acceptance.',
      verifiedAt: new Date(),
      verifiedBy: 'SFT Regulatory Intelligence Audit Desk',
    },
  });
  console.log('   ✅ SAMA Sandbox: Status set to OPEN (Year-round applications per Rulebook), official URLs updated, bank API gateway claim omitted.');

  // 2. Monsha’at Innovation Vouchers
  // Remove unsupported numerical claims: "Up to SAR 100,000", "Up to 80% co-funding"
  // Mark financial benefits as unverified against official Monsha'at portal documentation
  await prisma.opportunity.update({
    where: { slug: 'monshaat-innovation-vouchers' },
    data: {
      status: OpportunityStatus.ROLLING,
      deadline: null,
      applicationUrl: 'https://www.monshaat.gov.sa/en/services',
      sourceUrl: 'https://www.monshaat.gov.sa/en/services',
      sourceName: 'Monsha’at Small and Medium Enterprises General Authority (Official Portal) — Specific Financial Caps Unverified',
      fundingAmount: 'Service Subsidy & Prototyping Support (Exact Financial Cap Unverified)',
      equityTaken: '0% Non-Dilutive (Government Enablement Service)',
      description: 'Monsha’at (Small and Medium Enterprises General Authority) provides innovation and prototyping enablement services for registered Saudi SMEs. Specific claims of up to SAR 100,000 or 80% co-funding are unverified in official public Monsha’at documentation and have been removed. Services are available subject to Monsha’at eligibility and quota allocation.',
      benefits: [
        'Access to prototyping facilities and innovation center resources',
        'Subsidized technical and commercial advisory through registered service partners',
        'Assistance with feasibility testing and prototype validation',
        'Specific financial caps and co-funding percentages: Unverified against official Monsha\'at guidelines',
      ],
      eligibilityCriteria: [
        'Active Saudi Commercial Registration (CR)',
        'Small or Medium Enterprise classified according to Monsha\'at SME definitions',
        'Innovative technical concept or product requiring prototyping or advisory',
        'Compliance with Monsha\'at service terms and resource allocation limits',
      ],
      eligibilitySummary: 'Active Saudi Commercial Registration (CR) holder classified as SME by Monsha\'at with innovative tech or prototyping project. Specific financial limits unverified.',
      verifiedAt: new Date(),
      verifiedBy: 'SFT Editorial Quality Board',
    },
  });
  console.log('   ✅ Monsha’at Vouchers: Unsupported numerical caps removed, financial terms marked unverified, verified features preserved.');

  console.log('\n🎉 Opportunity accuracy database corrections applied successfully!');
}

applyFinalEvidenceAccuracy().catch(console.error).finally(() => prisma.$disconnect());
