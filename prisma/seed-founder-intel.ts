import { PrismaClient, OpportunityCategory, OpportunityStatus, StartupStage, BusinessModel, InvestorType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏛️ Seeding Founder-First Intelligence Data (Opportunities, Startups, Investors)...');

  // Verify Categories
  const categories = await prisma.category.findMany();
  const catMap = new Map(categories.map(c => [c.slug, c.id]));

  // ---------------------------------------------------------------------------
  // 1. OPPORTUNITIES (Grants, Accelerators, Subsidies, Hackathons, Sandboxes)
  // ---------------------------------------------------------------------------
  console.log('💼 Seeding Verified Saudi Opportunities...');

  const opportunitiesData = [
    {
      title: 'NTDP MVPLab Grant & Acceleration',
      slug: 'ntdp-mvplab-grant',
      organization: 'National Technology Development Program (NTDP)',
      category: OpportunityCategory.GRANT,
      fundingAmount: 'Up to SAR 150,000 (Non-Dilutive)',
      equityTaken: '0% Equity',
      location: 'Riyadh, KSA (Hybrid)',
      description: 'The MVPLab initiative by NTDP bridges early-stage Saudi tech founders with accredited global and local venture builders to design, build, and test market-ready MVPs with non-dilutive government co-funding.',
      eligibilitySummary: 'Saudi nationals or majority Saudi-owned tech venture with a proprietary digital product roadmap and validated problem statement.',
      eligibilityCriteria: [
        'Saudi Commercial Registration (CR) or Saudi national founder',
        'Proprietary technology IP or software platform design',
        'Commitment to 12-week venture builder collaboration',
        'Clear target addressable market in KSA or GCC'
      ],
      status: OpportunityStatus.OPEN,
      deadline: new Date('2026-12-15T23:59:59Z'),
      applicationUrl: 'https://ntdp.gov.sa/en/initiatives/mvplab',
      sourceName: 'NTDP Official Portal',
      isFeatured: true,
      categoryId: catMap.get('ai-deep-tech') || null,
    },
    {
      title: 'The Garage Incubator & Seed Cohort',
      slug: 'the-garage-seed-cohort',
      organization: 'The Garage (KACST & MCIT)',
      category: OpportunityCategory.ACCELERATOR,
      fundingAmount: 'SAR 100,000 Direct Grant + SAR 250K Cloud Credits',
      equityTaken: '0% Equity (Zero Dilution)',
      location: 'The Garage Campus, KACST, Riyadh',
      description: 'Saudi Arabia’s flagship startup district spanning 28,000 sqm inside KACST. Cohort members receive dedicated office suites, prototyping laboratories, regulatory concierge, and direct access to regional VC demo days.',
      eligibilitySummary: 'Early-stage tech startups with a live prototype, functional beta, or working hardware demonstrator.',
      eligibilityCriteria: [
        'Full-time technical or product co-founder based in Riyadh',
        'Functional prototype or working software codebase',
        'Commitment to work on-campus at The Garage Riyadh',
        'Scalable B2B or consumer technology focus'
      ],
      status: OpportunityStatus.OPEN,
      deadline: new Date('2026-11-30T23:59:59Z'),
      applicationUrl: 'https://thegarage.sa',
      sourceName: 'The Garage KACST',
      isFeatured: true,
      categoryId: catMap.get('ai-deep-tech') || null,
    },
    {
      title: 'KAUST Taqadam Accelerator Cohort',
      slug: 'kaust-taqadam-accelerator',
      organization: 'KAUST Innovation',
      category: OpportunityCategory.ACCELERATOR,
      fundingAmount: 'SAR 150,000 Zero-Equity Grant + Up to SAR 375K Follow-on',
      equityTaken: '0% Equity',
      location: 'Thuwal & Riyadh, KSA',
      description: 'A 6-month founder accelerator powering game-changing tech startups across AI, deep tech, clean energy, and biotech. Offers world-class labs, global founder coaches, and non-dilutive grant capital.',
      eligibilitySummary: 'Cutting-edge technology innovators, university spinouts, and regional founders seeking deep technical infrastructure.',
      eligibilityCriteria: [
        'At least two committed co-founders',
        'Deep-tech, hardware, or IP-differentiated software stack',
        'Readiness to participate in 6 bootcamp modules across KSA',
        'Demonstrable commercialization roadmap'
      ],
      status: OpportunityStatus.OPEN,
      deadline: new Date('2026-12-31T23:59:59Z'),
      applicationUrl: 'https://innovation.kaust.edu.sa/entrepreneurs/taqadam/',
      sourceName: 'KAUST Innovation Ventures',
      isFeatured: true,
      categoryId: catMap.get('clean-energy') || null,
    },
    {
      title: 'SAMA Regulatory Sandbox — FinTech Window',
      slug: 'sama-regulatory-sandbox-fintech',
      organization: 'Saudi Central Bank (SAMA)',
      category: OpportunityCategory.GOVERNMENT_PROGRAM,
      fundingAmount: 'Regulatory Relief & Direct Bank Gateway Access',
      equityTaken: 'None',
      location: 'Riyadh, KSA',
      description: 'Official controlled testing environment by SAMA enabling FinTech startups to trial innovative open banking, micro-lending, automated underwriting, and digital payments products under live market conditions with real consumers.',
      eligibilitySummary: 'FinTech entities registered in KSA proposing novel payment, wealthtech, open finance, or credit solutions.',
      eligibilityCriteria: [
        'Saudi Commercial Registration (FinTech activity code)',
        'Clear risk mitigation and consumer protection framework',
        'Functional platform ready for live sandbox API integration',
        'Demonstrated value proposition to Saudi financial inclusion'
      ],
      status: OpportunityStatus.OPEN,
      deadline: null, // Rolling admission
      applicationUrl: 'https://www.sama.gov.sa/en-US/Regulatory%20Sandbox/Pages/default.aspx',
      sourceName: 'Saudi Central Bank (SAMA)',
      isFeatured: true,
      categoryId: catMap.get('fintech') || null,
    },
    {
      title: 'Monsha’at Innovation Vouchers',
      slug: 'monshaat-innovation-vouchers',
      organization: 'Monsha’at (Small & Medium Enterprises General Authority)',
      category: OpportunityCategory.SUBSIDY,
      fundingAmount: 'Co-funding up to SAR 100,000 (80% Subsidy)',
      equityTaken: '0% Non-Dilutive',
      location: 'Kingdom-wide',
      description: 'Government subsidy providing direct financial vouchers to tech SMEs to contract certified research centers, patent attorneys, testing laboratories, and cloud engineering specialists.',
      eligibilitySummary: 'Saudi-licensed micro, small, and medium technology enterprises seeking industrial or software validation.',
      eligibilityCriteria: [
        'Active Monsha’at SME classification certificate',
        'Saudi CR older than 3 months',
        'Eligible validation project (patent, ISO audit, cloud pen-test)',
        'Match funding capability for remaining 20% cost'
      ],
      status: OpportunityStatus.OPEN,
      deadline: null, // Rolling
      applicationUrl: 'https://www.monshaat.gov.sa/en/service/innovation-vouchers',
      sourceName: 'Monsha’at SME Authority',
      isFeatured: false,
      categoryId: catMap.get('govtech') || null,
    },
    {
      title: 'SDAIA ALLaM GenAI Sovereign Compute Grant',
      slug: 'sdaia-allam-compute-grant',
      organization: 'Saudi Data and AI Authority (SDAIA)',
      category: OpportunityCategory.GRANT,
      fundingAmount: 'Up to SAR 300,000 Value in NVIDIA H100 GPU Clusters',
      equityTaken: '0% Non-Dilutive',
      location: 'Riyadh, KSA (Remote Compute)',
      description: 'Grants sovereign high-performance computing clusters and direct fine-tuning access to the ALLaM Arabic Large Language Model for startups building native Arabic generative applications and conversational systems.',
      eligibilitySummary: 'AI founders and research labs developing Arabic natural language, computer vision, or multimodal models.',
      eligibilityCriteria: [
        'Native Arabic language processing or regional data modality',
        'High-memory GPU training workload requirements',
        'Demonstrated engineering team with PyTorch/TensorFlow expertise',
        'Compliance with SDAIA National Data Governance regulations'
      ],
      status: OpportunityStatus.CLOSING_SOON,
      deadline: new Date('2026-11-28T18:00:00Z'),
      applicationUrl: 'https://sdaia.gov.sa',
      sourceName: 'SDAIA Innovation Directorate',
      isFeatured: true,
      categoryId: catMap.get('ai-deep-tech') || null,
    },
    {
      title: 'Sanabil 500 Global MENA Seed Accelerator',
      slug: 'sanabil-500-global-accelerator',
      organization: 'Sanabil Investments & 500 Global',
      category: OpportunityCategory.ACCELERATOR,
      fundingAmount: 'SAR 375,000 ($100,000 USD) Seed Investment',
      equityTaken: 'Fixed 7% Equity',
      location: 'Riyadh, KSA',
      description: 'Premier venture-backed 16-week growth program for early-stage regional founders, offering direct capital injection, intensive growth hacking mentorship, and global investor demo day exposure.',
      eligibilitySummary: 'Post-launch tech startups showing initial revenue or rapid weekly user retention metrics.',
      eligibilityCriteria: [
        'Live product with paying customers or strong organic traction',
        'Scalable software or platform business model',
        'At least two full-time founders available in Riyadh for key weeks',
        'Incorporated entity or readiness to incorporate in ADGM, Delaware, or KSA'
      ],
      status: OpportunityStatus.OPEN,
      deadline: new Date('2026-12-20T23:59:59Z'),
      applicationUrl: 'https://500.co/accelerators/sanabil-500-mena-seed',
      sourceName: 'Sanabil 500 Global',
      isFeatured: false,
      categoryId: catMap.get('smart-cities-infra') || null,
    },
    {
      title: 'NCA CyberIC Startup Incubator Cohort 3',
      slug: 'nca-cyberic-incubator-cohort-3',
      organization: 'National Cybersecurity Authority (NCA)',
      category: OpportunityCategory.INCUBATOR,
      fundingAmount: 'SAR 120,000 Grant + Sovereign Security Certification Support',
      equityTaken: '0% Equity',
      location: 'Riyadh, KSA',
      description: 'Targeted incubator powering home-grown cybersecurity innovation, from zero-trust architecture and cryptographic engines to IoT security and threat intelligence tools.',
      eligibilitySummary: 'Saudi cybersecurity software and hardware ventures.',
      eligibilityCriteria: [
        'Core cyber defense, identity, or infrastructure IP',
        'Saudi engineering founders',
        'Commitment to comply with NCA Essential Cybersecurity Controls (ECC)'
      ],
      status: OpportunityStatus.OPEN,
      deadline: new Date('2027-01-15T23:59:59Z'),
      applicationUrl: 'https://nca.gov.sa/en/initiatives/cyberic',
      sourceName: 'National Cybersecurity Authority',
      isFeatured: false,
      categoryId: catMap.get('cybersecurity') || null,
    }
  ];

  for (const opp of opportunitiesData) {
    await prisma.opportunity.upsert({
      where: { slug: opp.slug },
      update: opp,
      create: opp,
    });
  }
  console.log(`   ✓ Seeded ${opportunitiesData.length} opportunities`);

  // ---------------------------------------------------------------------------
  // 2. STARTUPS (Verified Saudi Tech Registry across 6 Pillars)
  // ---------------------------------------------------------------------------
  console.log('🚀 Seeding Verified Saudi Startups Directory...');

  const startupsData = [
    {
      name: 'Mozn',
      slug: 'mozn-ai',
      tagline: 'Enterprise AI & Financial Crime Intelligence',
      description: 'Mozn builds sovereign Arabic natural language processing and automated financial risk intelligence. Its FOCAL platform powers AML compliance, transaction monitoring, and fraud prevention for leading Gulf banks.',
      websiteUrl: 'https://mozn.sa',
      hqCity: 'Riyadh',
      foundingYear: 2017,
      stage: StartupStage.SERIES_B,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: true,
      techStack: ['Python', 'PyTorch', 'Kafka', 'PostgreSQL', 'Kubernetes', 'KSA Sovereign Cloud'],
      keyMetrics: 'Processed 500M+ transactions, Tier-1 Saudi banks as enterprise clients',
      categoryId: catMap.get('ai-deep-tech') || null,
    },
    {
      name: 'Tamara',
      slug: 'tamara-fintech',
      tagline: 'The First Saudi FinTech Unicorn & Shopping Platform',
      description: 'Tamara is the Kingdom’s premier Buy-Now-Pay-Later and financial services platform, partnered with tens of thousands of regional merchants, backed by Sanabil, Checkout.com, and Goldman Sachs.',
      websiteUrl: 'https://tamara.co',
      hqCity: 'Riyadh',
      foundingYear: 2020,
      stage: StartupStage.SERIES_C,
      businessModel: BusinessModel.B2B2C,
      verified: true,
      isFeatured: true,
      techStack: ['TypeScript', 'Node.js', 'Go', 'React Native', 'AWS Bahrain/KSA', 'Redis'],
      keyMetrics: 'Over 10M registered users, $1B+ valuation unicorn',
      categoryId: catMap.get('fintech') || null,
    },
    {
      name: 'Lean Technologies',
      slug: 'lean-technologies',
      tagline: 'Financial Infrastructure & Open Banking Gateway',
      description: 'Lean enables developers to build cutting-edge financial applications by providing universal API access to bank accounts across Saudi Arabia and the UAE for payments and real-time account data retrieval.',
      websiteUrl: 'https://leantech.me',
      hqCity: 'Riyadh',
      foundingYear: 2019,
      stage: StartupStage.SERIES_B,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: true,
      techStack: ['Go', 'TypeScript', 'GraphQL', 'Docker', 'PostgreSQL', 'mTLS Security'],
      keyMetrics: 'Regulated under SAMA Open Banking Framework, $100M+ raised',
      categoryId: catMap.get('fintech') || null,
    },
    {
      name: 'Unifonic',
      slug: 'unifonic',
      tagline: 'Sovereign Cloud Communications & Customer Engagement Platform',
      description: 'Unifonic is a Saudi Arabia-founded enterprise cloud communications platform enabling financial institutions, government portals, and regional scaleups to automate SMS gateways, voice routing, and digital messaging over unified APIs.',
      websiteUrl: 'https://unifonic.com',
      hqCity: 'Riyadh',
      foundingYear: 2006,
      stage: StartupStage.GROWTH,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: false,
      techStack: ['Go', 'Kubernetes', 'Redis', 'PostgreSQL', 'mTLS', 'AWS KSA'],
      keyMetrics: 'Processed 10B+ customer interactions; official communications infrastructure for major Saudi ministries and banks',
      categoryId: catMap.get('smart-cities-infra') || null,
    },
    {
      name: 'Sirar by stc',
      slug: 'sirar-cybersecurity',
      tagline: 'Sovereign Cybersecurity & Managed Detection Service',
      description: 'Sirar provides advanced cyber defense, secure cloud gateways, threat hunting, and digital signatures designed to protect Saudi critical national infrastructure and digital government entities.',
      websiteUrl: 'https://sirar.com.sa',
      hqCity: 'Riyadh',
      foundingYear: 2021,
      stage: StartupStage.GROWTH,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: false,
      techStack: ['Zero-Trust', 'Splunk', 'CrowdStrike Falcon', 'Private Cloud', 'HSM'],
      keyMetrics: '100% compliant with NCA ECC & CSCC regulatory baselines',
      categoryId: catMap.get('cybersecurity') || null,
    },
    {
      name: 'NOMADD Desert Solar',
      slug: 'nomadd-solar',
      tagline: 'Waterless Autonomous Solar Panel Cleaning Robotics',
      description: 'NOMADD (NO-water Mechanical Automated Dusting Device) is a patented clean-tech robotics company spun out of KAUST, developing autonomous waterless robots that clean utility-scale solar arrays in harsh desert environments without consuming water.',
      websiteUrl: 'https://kaust.edu.sa',
      hqCity: 'Thuwal / Jeddah',
      foundingYear: 2012,
      stage: StartupStage.SERIES_A,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: true,
      techStack: ['Embedded C++', 'Autonomous Robotics', 'Solar Telemetry', 'Harsh-Climate Sensors'],
      keyMetrics: 'Patented waterless cleaning technology licensed with Saudi Aramco; 0 liters of water consumed',
      categoryId: catMap.get('clean-energy') || null,
    },
    {
      name: 'Lucidya',
      slug: 'lucidya-ai',
      tagline: 'AI-Powered Customer Intelligence & Arabic NLP Engine',
      description: 'Lucidya is a leading Saudi enterprise AI company providing citizen sentiment analysis, omnichannel customer listening, and proprietary Arabic dialect NLP intelligence for government agencies, ministries, and top GCC enterprises.',
      websiteUrl: 'https://lucidya.com',
      hqCity: 'Riyadh',
      foundingYear: 2016,
      stage: StartupStage.SERIES_B,
      businessModel: BusinessModel.B2B,
      verified: true,
      isFeatured: false,
      techStack: ['Python', 'Transformers NLP', 'React', 'Node.js', 'Kafka', 'PostgreSQL'],
      keyMetrics: 'Largest AI funding round in MENA region ($30M Series B); 90%+ Arabic dialect accuracy',
      categoryId: catMap.get('govtech') || null,
    },
    {
      name: 'Jahez Tech',
      slug: 'jahez-group',
      tagline: 'On-Demand Logistics & Autonomous Delivery Systems',
      description: 'Publicly listed food delivery and hyper-local logistics giant innovating in automated dispatch, micro-fulfillment warehouse robotics, and last-mile electric vehicle fleets.',
      websiteUrl: 'https://jahez.net',
      hqCity: 'Riyadh',
      foundingYear: 2016,
      stage: StartupStage.GROWTH,
      businessModel: BusinessModel.B2C,
      verified: true,
      isFeatured: false,
      techStack: ['Kotlin', 'Swift', 'Go', 'Kubernetes', 'Google Cloud KSA'],
      keyMetrics: 'Publicly traded on Saudi Tadawul Nomu (Ticker: 9526)',
      categoryId: catMap.get('smart-cities-infra') || null,
    }
  ];

  for (const startup of startupsData) {
    await prisma.startup.upsert({
      where: { slug: startup.slug },
      update: startup,
      create: startup,
    });
  }
  console.log(`   ✓ Seeded ${startupsData.length} startups`);

  // ---------------------------------------------------------------------------
  // 3. INVESTORS (Active VCs, Accelerators & Funds in KSA)
  // ---------------------------------------------------------------------------
  console.log('💰 Seeding Active Saudi Venture Capital & Institutional Funds...');

  const investorsData = [
    {
      name: 'STV (Saudi Technology Ventures)',
      slug: 'stv-vc',
      type: InvestorType.VENTURE_CAPITAL,
      hqLocation: 'Riyadh, KSA',
      websiteUrl: 'https://stv.vc',
      pitchUrl: 'https://stv.vc/founders',
      saudiRegulated: true,
      licenseDetails: 'CMA Licensed Asset Manager & Anchor KSA VC',
      targetStages: ['Seed', 'Series A', 'Series B', 'Growth'],
      targetSectors: ['FinTech', 'AI & Deep Tech', 'E-Commerce Infrastructure', 'Enterprise SaaS'],
      checkSizeRange: 'SAR 7.5M – SAR 75M ($2M – $20M)',
      portfolioHighlights: ['Jahez', 'Tabby', 'Trukkr', 'Rewaa', 'Mrsool'],
      description: 'The largest independent venture capital fund in the Middle East with over $500M in capital under management, anchored by Saudi Telecom Company (stc) and regional institutional investors.',
      isFeatured: true,
    },
    {
      name: 'Raed Ventures',
      slug: 'raed-ventures',
      type: InvestorType.VENTURE_CAPITAL,
      hqLocation: 'Riyadh, KSA',
      websiteUrl: 'https://raed.vc',
      pitchUrl: 'https://raed.vc/apply',
      saudiRegulated: true,
      licenseDetails: 'CMA Authorized & SVC Co-Investment Partner',
      targetStages: ['Pre-Seed', 'Seed', 'Series A'],
      targetSectors: ['Logistics Tech', 'FinTech', 'B2B Marketplaces', 'EdTech'],
      checkSizeRange: 'SAR 1.5M – SAR 12M ($400K – $3.2M)',
      portfolioHighlights: ['Sary', 'Tamara', 'Trella', 'Lean Technologies', 'Squadio'],
      description: 'Early-stage venture capital firm established by Almajdouie Holding, focused on backing founders transforming traditional value chains across Saudi Arabia and the GCC.',
      isFeatured: true,
    },
    {
      name: 'Outliers VC',
      slug: 'outliers-vc',
      type: InvestorType.VENTURE_CAPITAL,
      hqLocation: 'Riyadh & New York',
      websiteUrl: 'https://outliers.vc',
      pitchUrl: 'https://outliers.vc/contact',
      saudiRegulated: true,
      licenseDetails: 'SVC Approved Partner Fund',
      targetStages: ['Pre-Seed', 'Seed'],
      targetSectors: ['Deep Tech', 'Software Infrastructure', 'Developer Tools', 'FinTech'],
      checkSizeRange: 'SAR 1.8M – SAR 7.5M ($500K – $2M)',
      portfolioHighlights: ['Dapi', 'Penny Software', 'Spekit', 'Qlub'],
      description: 'Seed fund led by technical operators, writing first institutional checks to exceptional founders building venture-scale software from Riyadh to the globe.',
      isFeatured: true,
    },
    {
      name: 'Impact46',
      slug: 'impact46',
      type: InvestorType.VENTURE_CAPITAL,
      hqLocation: 'Riyadh, KSA',
      websiteUrl: 'https://impact46.com',
      pitchUrl: 'https://impact46.com/apply',
      saudiRegulated: true,
      licenseDetails: 'CMA Authorized Capital Management Company',
      targetStages: ['Seed', 'Series A', 'Pre-IPO Growth'],
      targetSectors: ['FinTech', 'GovTech', 'AI', 'PropTech'],
      checkSizeRange: 'SAR 3M – SAR 30M ($800K – $8M)',
      portfolioHighlights: ['Jahez', 'Tamara', 'Nearpay', 'Drahim', 'Penny'],
      description: 'Pioneering Saudi asset management firm investing across all venture phases, known for leading early rounds into Saudi Arabia’s first tech unicorns.',
      isFeatured: true,
    },
    {
      name: 'Khwarizmi Ventures',
      slug: 'khwarizmi-ventures',
      type: InvestorType.VENTURE_CAPITAL,
      hqLocation: 'Riyadh, KSA',
      websiteUrl: 'https://khwarizmivc.com',
      pitchUrl: 'https://khwarizmivc.com/pitch',
      saudiRegulated: true,
      licenseDetails: 'CMA Licensed Fund',
      targetStages: ['Seed', 'Series A'],
      targetSectors: ['FinTech', 'SaaS', 'HealthTech', 'Logistics'],
      checkSizeRange: 'SAR 1M – SAR 8M ($250K – $2M)',
      portfolioHighlights: ['Eyewa', 'Sihaty', 'Baraka', 'Nana'],
      description: 'Named after the father of modern algorithms, Khwarizmi Ventures backs passionate founders architecting the future of Middle Eastern digital economies.',
      isFeatured: false,
    },
    {
      name: 'Saudi Venture Capital Company (SVC)',
      slug: 'svc-sovereign-fund',
      type: InvestorType.GOVERNMENT_FUND,
      hqLocation: 'Riyadh, KSA',
      websiteUrl: 'https://svc.com.sa',
      pitchUrl: 'https://svc.com.sa/programs',
      saudiRegulated: true,
      licenseDetails: 'Government Sovereign Fund-of-Funds (Monshaat & FDF)',
      targetStages: ['Seed', 'Series A', 'Series B', 'Pre-IPO'],
      targetSectors: ['All High-Growth Tech Sectors'],
      checkSizeRange: 'SAR 5M – SAR 50M (Via Co-Investment & Fund Allocation)',
      portfolioHighlights: ['Direct Co-investment in 30+ Saudi startups alongside licensed VCs'],
      description: 'Sovereign investment company stimulating and financing venture capital and private equity ecosystem in the Kingdom, providing matching co-investments to verified institutional deals.',
      isFeatured: true,
    }
  ];

  for (const inv of investorsData) {
    await prisma.investor.upsert({
      where: { slug: inv.slug },
      update: inv,
      create: inv,
    });
  }
  console.log(`   ✓ Seeded ${investorsData.length} investors`);

  console.log('🎉 Founder Intelligence Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Founder intelligence seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
