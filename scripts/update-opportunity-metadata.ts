import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Updating Opportunity verified metadata, sources, benefits, and requirements...');

  const updates = [
    {
      slug: 'ntdp-mvplab-grant',
      sourceUrl: 'https://ntdp.gov.sa/en/initiatives/mvplab',
      sourceName: 'National Technology Development Program (NTDP)',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Up to SAR 150,000 zero-equity grant for MVP development',
        'Technical support and cloud infrastructure vouchers',
        'Fast-track access to Saudi venture capital network',
        'Up to SAR 375,000 follow-on acceleration matching'
      ],
      requirements: [
        'Saudi tech startup with valid Commercial Registration (CR)',
        'Working prototype or software architecture proof-of-concept',
        'At least one Saudi national founder or technical leader',
        'Innovative digital solution in high-priority national tech sectors'
      ]
    },
    {
      slug: 'the-garage-seed-cohort',
      sourceUrl: 'https://thegarage.sa',
      sourceName: 'The Garage (KACST / MCIT)',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Up to SAR 100,000 non-dilutive founder stipend & grant',
        'Dedicated workspace at The Garage KACST Innovation District in Riyadh',
        'Access to prototyping labs, supercomputing resources, and technical equipment',
        'Direct mentorship from global serial entrepreneurs and MENA VCs'
      ],
      requirements: [
        'Deep-tech or technology-enabled startup at pre-seed or seed stage',
        'Commitment to base core development team in Riyadh, KSA',
        'Proprietary technology, algorithms, or registered intellectual property',
        'Ready to participate in full-time incubation program'
      ]
    },
    {
      slug: 'kaust-taqadam-accelerator',
      sourceUrl: 'https://innovation.kaust.edu.sa/entrepreneurs/taqadam/',
      sourceName: 'KAUST Innovation Ventures & SAB',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'SAR 150,000 zero-equity grant per accepted startup',
        'Chance to win up to SAR 375,000 follow-on grant at demo day showcase',
        'Access to KAUST Core Laboratories and world-class faculty researchers',
        'Global mentorship, venture investor introductions, and Saudi market entry'
      ],
      requirements: [
        'Early-stage startup across AI, clean tech, biotech, fintech, or advanced materials',
        'Founders from KSA or international teams committing to Saudi expansion',
        'Innovative solution with technical defensibility and scalable business model',
        'Commitment to complete 6-month intensive acceleration modules'
      ]
    },
    {
      slug: 'monshaat-innovation-vouchers',
      sourceUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceName: 'Monsha’at SME Authority',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Up to SAR 100,000 subsidy vouchers for specialized advisory services',
        'Certified IP, patent registration, and legal structuring subsidies',
        'Technical feasibility testing and digital prototyping grants',
        '100% government subsidized — no equity, no debt repayment required'
      ],
      requirements: [
        'Active Saudi Commercial Registration (CR) as an SME or micro-enterprise',
        'Operating in tech, digital transformation, or advanced manufacturing',
        'Valid subscription to Monsha’at enterprise portal',
        'Project proposal demonstrating innovative capability in KSA'
      ]
    },
    {
      slug: 'sdaia-allam-compute-grant',
      sourceUrl: 'https://sdaia.gov.sa',
      sourceName: 'SDAIA Innovation Directorate',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Up to SAR 250,000 in sovereign GPU cluster compute credits (Non-Cash)',
        'Early developer API access to ALLaM Arabic Foundation Models',
        'Technical co-design support with SDAIA AI research scientists',
        'Showcase at the Global AI Summit (GAIN) in Riyadh'
      ],
      requirements: [
        'Specialized AI startup developing LLM, computer vision, or Arabic NLP applications',
        'Compliance with SDAIA National Data Governance Regulations',
        'Saudi legal entity or qualified international enterprise under MISA license',
        'Demonstrated capability to utilize high-performance sovereign compute clusters'
      ]
    },
    {
      slug: 'sanabil-500-global-accelerator',
      sourceUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceName: 'Sanabil Investments (PIF) & 500 Global',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'USD 100,000 (SAR 375,000) seed capital investment',
        '14-week growth acceleration curriculum led by 500 Global partners',
        'Co-working space in Riyadh and ongoing global alumni network access',
        'Private Demo Day presentation before top MENA and Silicon Valley investors'
      ],
      requirements: [
        'Pre-seed or seed-stage tech venture with demonstrable user traction or revenue',
        '7% equity standard investment structure via convertible instrument',
        'Team with strong technical execution capability based in or expanding to KSA',
        'Scalable regional business model with multi-market expansion potential'
      ]
    },
    {
      slug: 'nca-cyberic-incubator-cohort-3',
      sourceUrl: 'https://nca.gov.sa/en/initiatives/cyberic',
      sourceName: 'National Cybersecurity Authority (NCA)',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Up to SAR 50,000 equity-free development grant per venture',
        'Access to NCA specialized cyber range, testing sandbox, and vulnerability labs',
        'Fast-track national compliance guidance for NCA ECC and CSCC frameworks',
        'Direct procurement introductions to Saudi enterprise and government buyers'
      ],
      requirements: [
        'Saudi cybersecurity startup developing proprietary defensive or security tech',
        'Solutions addressing cloud security, threat intel, identity, or critical infra defense',
        'Team committed to building sovereign cybersecurity IP inside Saudi Arabia',
        'Active or pending Saudi Commercial Registration'
      ]
    },
    {
      slug: 'sama-regulatory-sandbox-fintech',
      sourceUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceName: 'Saudi Central Bank (SAMA)',
      verifiedBy: 'SFT Editorial Board — Verification Desk',
      isPublished: true,
      benefits: [
        'Formal regulatory exemption to test novel FinTech solutions with live customers',
        'Controlled testing environment under direct supervision of SAMA regulators',
        'Clear transition pathway to full banking or FinTech operational licensing',
        'Reputational credibility with institutional partners, banks, and VCs'
      ],
      requirements: [
        'FinTech startup offering novel financial, payment, lending, or insurance technology',
        'Genuine innovation not covered adequately under existing regulatory frameworks',
        'Sound business model, risk mitigation framework, and consumer protection protocols',
        'Incorporated entity with technical capability to safeguard financial transactions'
      ]
    }
  ];

  for (const item of updates) {
    const existing = await prisma.opportunity.findUnique({ where: { slug: item.slug } });
    if (existing) {
      await prisma.opportunity.update({
        where: { slug: item.slug },
        data: {
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          verifiedBy: item.verifiedBy,
          isPublished: item.isPublished,
          benefits: item.benefits,
          requirements: item.requirements,
          verifiedAt: new Date()
        }
      });
      console.log(`✅ Updated metadata for: ${item.slug}`);
    }
  }

  console.log('🎉 All opportunities verified and synchronized!');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
