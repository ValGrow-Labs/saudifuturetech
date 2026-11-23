import { ArticleDetail, AuthorItem, CategoryItem } from '@/types';
import { EDITORIAL_CATEGORIES } from './categories';

export const AUTHORS: AuthorItem[] = [
  {
    id: 'auth-01',
    displayName: 'Tariq Al-Mansoor',
    slug: 'tariq-al-mansoor',
    title: 'Senior Deep Tech Analyst',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Tariq Al-Mansoor specializes in sovereign computing clusters, foundation models, and high-performance computing architecture. With over a decade of systems engineering research across the GCC, he analyzes the intersections of Arabic NLP, semiconductor supply chains, and sovereign data centers.',
    location: 'Riyadh, Saudi Arabia',
    twitterHandle: '@tariq_tech',
    linkedinUrl: 'https://linkedin.com',
  },
  {
    id: 'auth-02',
    displayName: 'Zainab Al-Husseini',
    slug: 'zainab-al-husseini',
    title: 'Infrastructure & Smart Cities Editor',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Zainab Al-Husseini covers urban telemetry, edge computing nodes, and autonomous transit frameworks across NEOM, Red Sea Global, and ROSHN. She holds a master’s in Systems Architecture and reports on cognitive infrastructure deployment throughout the Arabian peninsula.',
    location: 'Tabuk / Riyadh, Saudi Arabia',
    twitterHandle: '@zainab_infra',
    linkedinUrl: 'https://linkedin.com',
  },
  {
    id: 'auth-03',
    displayName: 'Fahad Al-Khatib',
    slug: 'fahad-al-khatib',
    title: 'Cyber Defense & Systems Specialist',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Fahad Al-Khatib reports on national cybersecurity frameworks, Essential Cybersecurity Controls (ECC), sovereign data residency, and zero-trust cloud architectures. Prior to technology journalism, he worked in enterprise security assessment and threat intelligence.',
    location: 'Dammam, Saudi Arabia',
    twitterHandle: '@fahad_cyber',
    linkedinUrl: 'https://linkedin.com',
  },
  {
    id: 'auth-04',
    displayName: 'Reem Al-Dossari',
    slug: 'reem-al-dossari',
    title: 'FinTech & Venture Markets Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Reem Al-Dossari investigates financial infrastructure, SAMA regulatory sandboxes, open banking API standards, and venture capital liquidity in the MENA region. She tracks early-stage startup deal flow and digital payment integration across central banks.',
    location: 'Riyadh, Saudi Arabia',
    twitterHandle: '@reem_fintech',
    linkedinUrl: 'https://linkedin.com',
  },
];

export const ARTICLES: ArticleDetail[] = [
  // 1. Lead Story - AI & Deep Tech
  {
    id: 'art-01',
    title: 'Inside Saudi Arabia’s Sovereign Compute Blueprint: Accelerating ALLaM and National Foundation Models',
    slug: 'saudi-arabia-sovereign-compute-blueprint-allam',
    excerpt:
      'An in-depth architectural examination of the high-performance computing clusters, liquid-cooled data facilities, and bilingual dataset pipelines powering the Kingdom’s next-generation artificial intelligence initiatives under SDAIA.',
    coverImageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1800&q=80',
    coverImageAlt: 'Network cables plugged into a patch panel in a data centre',
    coverImageCaption: 'Inside a data centre: the cabling that national compute runs on.',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 7,
    publishedAt: '2026-11-14T08:00:00Z',
    updatedAt: '2026-11-14T11:30:00Z',
    status: 'PUBLISHED',
    isFeatured: true,
    category: EDITORIAL_CATEGORIES[0],
    author: AUTHORS[0],
    tags: ['ALLaM LLM', 'SDAIA', 'Supercomputing', 'Deep Tech', 'Compute Clusters', 'Arabic NLP'],
    sampleContent: true,
    seoTitle: 'Inside Saudi Arabia’s Sovereign Compute Blueprint: Accelerating ALLaM',
    seoDescription:
      'An architectural review of Saudi Arabia’s high-performance AI clusters and sovereign dataset pipelines developing bilingual foundation models.',
    sections: [
      {
        heading: 'The Sovereign Imperative for Frontier Compute',
        paragraphs: [
          'The global compute landscape has entered an era where computational self-sufficiency is no longer merely a strategic advantage—it is a core pillar of national digital sovereignty. In Saudi Arabia, the Saudi Data and AI Authority (SDAIA) has spearheaded a synchronized infrastructure expansion designed to establish high-density compute clusters capable of training foundation models natively on domestic soil.',
          'At the center of this architectural effort is the ALLaM foundation model family. Unlike commercial models trained predominantly on scraped English-language web corpora with Arabic appended as a secondary translation layer, ALLaM was architected from inception as an intrinsically bilingual Arabic-English system. Achieving parity with premier global models required overcoming historical tokenization inefficiencies and training compute bottlenecks that have long constrained non-Latin LLM development.',
        ],
        pullQuote: {
          quote: 'Computational self-sufficiency in the age of generative models is the foundation of digital sovereignty. The ability to curate, train, and deploy models within domestic legal and operational borders guarantees long-term strategic resilience.',
          attribution: 'Tariq Al-Mansoor, Senior Deep Tech Analyst',
        },
      },
      {
        heading: 'Architectural Topology of the High-Performance Clusters',
        subheading: 'Liquid Cooling, Optical Fabrics, and Distributed Training Pipelines',
        paragraphs: [
          'Deploying massive GPU clusters in the climatic conditions of the Arabian Peninsula necessitates revolutionary physical infrastructure engineering. Standard air-cooled data centers incur unsustainable power usage effectiveness (PUE) overheads when outdoor ambient temperatures exceed 45°C during summer months.',
          'The newly commissioned Tier-IV compute facilities integrate direct-to-chip liquid cooling loops alongside non-blocking InfiniBand optical interconnects operating at 800 Gbps per node. By dissipating thermal loads directly through dielectric fluids and closed-circuit evaporative cooling towers, facilities maintain an annualized PUE below 1.15—a benchmark that rivals sub-arctic European data centers while operating in the heart of Riyadh.',
        ],
        takeaway:
          'Direct-to-chip liquid cooling enables Saudi compute clusters to sustain 800 Gbps non-blocking InfiniBand topologies with an annualized PUE below 1.15, neutralizing regional ambient heat barriers.',
        table: {
          headers: ['Cluster Metric', 'Generation 1 Benchmark', 'Current Sovereign Topology'],
          rows: [
            ['Interconnect Throughput', '200 Gbps HDR', '800 Gbps NDR Quantum-2'],
            ['Cooling Architecture', 'Chilled-Air Recirculation', 'Direct-to-Chip Liquid Cooling'],
            ['Annualized PUE Ratio', '1.48', '1.14'],
            ['Bilingual Token Throughput', '1.2M tokens/sec', '8.4M tokens/sec'],
          ],
        },
      },
      {
        heading: 'Dialectal Alignment and Mathematical Benchmarking',
        paragraphs: [
          'A persistent technical limitation of generalized foundation models has been their failure to interpret colloquial regional dialects. Arabic is characterized by diglossia: while Modern Standard Arabic (MSA) governs formal prose, jurisprudence, and official administrative records, daily interpersonal and commercial discourse relies on regional dialects such as Najdi, Hijazi, and Gulf Arabic.',
          'The ALLaM development team curated an unprecedented corpus of over 400 billion specialized tokens, subjecting the pipeline to Reinforcement Learning from Human Feedback (RLHF) executed by regional domain experts in law, engineering, and administrative governance. The result is a model that demonstrates exceptional mathematical reasoning and syntactic coherence across dialectal and formal contexts simultaneously.',
        ],
      },
    ],
  },

  // 2. Smart Cities & Infra - THE LINE
  {
    id: 'art-02',
    title: 'Cognitive Infrastructure at Scale: How THE LINE Integrates Real-Time IoT Sensory Networks',
    slug: 'cognitive-infrastructure-the-line-iot-sensory-networks',
    excerpt:
      'Examining the edge computing topology, zero-latency micro-data hubs, and autonomous transit telemetry built into NEOM’s linear architectural spine.',
    coverImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Architectural modern high-rise glass facade reflecting clean blue skies',
    coverImageCaption: 'Cognitive urban architecture visual study • Demonstration Editorial Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 5,
    publishedAt: '2026-11-13T14:30:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[3],
    author: AUTHORS[1],
    tags: ['THE LINE', 'NEOM', 'Smart Cities', 'Edge Computing', 'IoT Sensors', 'Digital Twins'],
    sampleContent: true,
    seoTitle: 'Cognitive Infrastructure: How THE LINE Integrates Real-Time IoT',
    seoDescription:
      'Technical investigation of the sensor networks, zero-latency micro-data hubs, and digital twin architecture in NEOM’s THE LINE.',
    sections: [
      {
        heading: 'Beyond Smart Cities: The Cognitive Paradigm',
        paragraphs: [
          'Traditional smart city implementations suffer from a fundamental architectural flaw: they are legacy urban matrices retrofitted with isolated sensor silos. Traffic cameras operate on distinct networks from water telemetry, which in turn are decoupled from energy distribution grids. Data is gathered, analyzed post-facto, and rarely synthesized into predictive operations in real time.',
          'THE LINE at NEOM inverts this model. Built as a continuous 170-kilometer linear structure with a 200-meter width and 500-meter height, the entire urban spine is engineered from the bedrock up as a singular, machine-readable cognitive system. Every structural module, environmental damper, and autonomous transit capsule feeds telemetry into a distributed digital twin operating across multi-tiered edge computing nodes.',
        ],
        pullQuote: {
          quote: 'A cognitive city does not merely respond to citizen movement; it anticipates systemic load, pre-allocates localized energy buffers, and optimizes transit routing milliseconds before congestion can materialize.',
          attribution: 'Zainab Al-Husseini, Infrastructure & Smart Cities Editor',
        },
      },
      {
        heading: 'Edge Computing Hierarchy in Linear Architecture',
        paragraphs: [
          'Because transit latency must not exceed single-digit milliseconds for autonomous maglev transport traveling at speeds exceeding 400 km/h, centralized cloud architectures are physically incapable of meeting safety margins. Instead, THE LINE utilizes a tripartite computing topology:',
          '1. Layer-1 Micro-Nodes: Embedded directly into structural piers every 50 meters, performing sensor aggregation and anomaly detection locally at the edge.',
          '2. Layer-2 Sector Hubs: Intermediate edge compute modules every 2 kilometers managing local microgrids, thermal ventilation, and dynamic vertical elevators.',
          '3. Layer-3 Core Datacenters: Deep subterranean computing vaults aggregating long-term machine learning models and municipal simulation datasets.',
        ],
        takeaway:
          'Sub-5ms latency requirements for autonomous transit necessitate micro-nodes placed every 50 meters along the structural spine, decoupling safety-critical controls from centralized internet backbones.',
      },
    ],
  },

  // 3. Cybersecurity - NCA Frameworks
  {
    id: 'art-03',
    title: 'National Cybersecurity Authority Frameworks: Zero Trust Mandates for Cloud-Native Public Infrastructure',
    slug: 'nca-frameworks-zero-trust-mandates-cloud-infrastructure',
    excerpt:
      'A technical breakdown of Essential Cybersecurity Controls (ECC) and how regional enterprise IT systems enforce sovereign data residency and cryptographic isolation.',
    coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Matrix code and binary network security visualization',
    coverImageCaption: 'Cybersecurity defense and cryptography visualization • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 6,
    publishedAt: '2026-11-12T10:15:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[2],
    author: AUTHORS[2],
    tags: ['Cybersecurity', 'NCA ECC', 'Zero Trust', 'Data Sovereignty', 'Cryptography', 'Cloud Security'],
    sampleContent: true,
    seoTitle: 'NCA Frameworks: Zero Trust Mandates for Saudi Cloud Infrastructure',
    seoDescription:
      'Detailed breakdown of Essential Cybersecurity Controls (ECC) and how sovereign cryptography protects Saudi public cloud platforms.',
    sections: [
      {
        heading: 'Sovereign Cryptographic Enclaves and Essential Controls',
        paragraphs: [
          'As Saudi government ministries and enterprise infrastructure migrate mission-critical applications to hybrid and hyperscale cloud providers, regulatory compliance is governed with mathematical rigor by the National Cybersecurity Authority (NCA).',
          'Under the Essential Cybersecurity Controls (ECC-1:2018) and the Cloud Cybersecurity Controls (CSCC-1:2020), legacy perimeter defenses have been systematically replaced by continuous verification Zero Trust Architecture (ZTA). Every transaction, RPC call, and database query must prove identity, authorization, and device health dynamically before access is granted.',
        ],
        pullQuote: {
          quote: 'Trust is an unacceptable operational vulnerability in critical national infrastructure. Under NCA directives, every packet and identity must be cryptographically re-authenticated regardless of network location.',
          attribution: 'Fahad Al-Khatib, Cyber Defense Specialist',
        },
      },
      {
        heading: 'Hardware Security Modules and Sovereign Key Custody',
        paragraphs: [
          'A pivotal component of the Class-4 cloud compliance tier is the mandate that encryption keys remain under exclusive sovereign custody. International cloud service providers operating within the Kingdom must interface with dedicated Hardware Security Modules (HSMs) physically located within national borders.',
          'Even in multi-tenant cloud environments, data-at-rest and data-in-transit are encrypted using keys that cannot be retrieved, inspected, or compelled by foreign jurisdictions, guaranteeing that sovereign records remain cryptographically immune to extraterritorial discovery requests.',
        ],
        takeaway:
          'NCA Class-4 compliance mandates sovereign Hardware Security Modules (HSMs) inside national territory, preventing foreign legal discovery orders from accessing encrypted data-at-rest.',
      },
    ],
  },

  // 4. FinTech - Open Banking
  {
    id: 'art-04',
    title: 'The Open Banking Evolution: SAMA’s Regulatory Sandbox Accelerates Embedded Finance and BNPL Rails',
    slug: 'open-banking-evolution-sama-regulatory-sandbox-embedded-finance',
    excerpt:
      'How Saudi Arabia’s synchronized API specifications and unified payment gateways are reshaping transaction volume across GCC financial institutions.',
    coverImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Digital financial analytics interface showing charts and metrics',
    coverImageCaption: 'Digital banking and algorithmic finance interface • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 4,
    publishedAt: '2026-11-11T16:00:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[4],
    author: AUTHORS[3],
    tags: ['FinTech', 'SAMA Sandbox', 'Open Banking', 'APIs', 'Digital Payments', 'Venture Capital'],
    sampleContent: true,
    seoTitle: 'Open Banking Evolution: SAMA’s Regulatory Sandbox and Embedded Finance',
    seoDescription:
      'How synchronized API specifications and SAMA sandbox frameworks are driving digital banking scale across Saudi Arabia.',
    sections: [
      {
        heading: 'Standardized Financial APIs and Institutional Interoperability',
        paragraphs: [
          'The transition toward Open Banking in the Kingdom is not leaving integration to market fragmentation. Under the guidance of the Saudi Central Bank (SAMA), the Open Banking Framework established unified, mandatory API specifications that all licensed commercial banks must expose to accredited FinTech participants.',
          'By providing standardized RESTful endpoints for Account Information Services (AIS) and Payment Initiation Services (PIS), third-party innovators can deploy embedded finance solutions across multiple banking rails with zero proprietary integration friction.',
        ],
        pullQuote: {
          quote: 'SAMA’s regulatory sandbox has proven that progressive deregulation paired with strict architectural standards accelerates capital velocity without compromising balance-sheet stability.',
          attribution: 'Reem Al-Dossari, FinTech & Venture Markets Lead',
        },
      },
      {
        heading: 'Real-Time Settlement and the Expansion of Instant Rails',
        paragraphs: [
          'Coupled with the SARIE real-time settlement rails and Mada debit infrastructure, instant payment initiation has reached unprecedented penetration across retail commerce. Consumers and corporate accounts now execute instant micro-transactions with zero interchange settlement delay.',
        ],
        takeaway:
          'Unified SAMA API specifications allow fintechs to connect to all domestic commercial banks through a single integration harness, compressing product launch timelines from months to days.',
      },
    ],
  },

  // 5. Clean Energy - Red Sea Global Microgrid (Editor's Pick 1)
  {
    id: 'art-05',
    title: 'Red Sea Global’s 100% Off-Grid Microgrid: Architecture, Battery Storage, and Solar Orchestration',
    slug: 'red-sea-global-off-grid-microgrid-solar-battery-architecture',
    excerpt:
      'A deep technical review of the world’s largest tourism microgrid: 400MW solar generation paired with a 1,200MWh battery energy storage system operating entirely independent of the national grid.',
    coverImageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Large scale utility solar array under bright sun with mountain horizon',
    coverImageCaption: 'Utility solar energy installation • Red Sea Global architectural study reference',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 8,
    publishedAt: '2026-11-14T05:00:00Z',
    status: 'PUBLISHED',
    isEditorsPick: true,
    category: EDITORIAL_CATEGORIES[5],
    author: AUTHORS[0],
    tags: ['Clean Energy', 'Red Sea Global', 'Microgrids', 'Solar Arrays', 'BESS', 'Grid Automation'],
    sampleContent: true,
    seoTitle: 'Red Sea Global’s 100% Off-Grid Microgrid: Architecture & Battery Storage',
    seoDescription:
      'An in-depth technical examination of the 400MW solar and 1,200MWh battery energy storage system powering Red Sea Global completely off-grid.',
    sections: [
      {
        heading: 'The Engineering Challenge of Total Grid Independence',
        paragraphs: [
          'Operating high-end luxury resorts, international aviation infrastructure, and municipal utilities across 90 offshore islands without connecting to the national electricity grid is one of the most audacious electrical engineering endeavors ever realized.',
          'Conventional off-grid installations rely on diesel generators as spinning reserves to handle cloud cover transients and nighttime peak demand. Red Sea Global (RSG) committed from day one to operate exclusively on 100% renewable energy around the clock, eliminating fossil generation completely.',
        ],
        pullQuote: {
          quote: 'Operating entirely off-grid requires balancing sub-second solar variability with automated battery dispatch algorithms across hundreds of remote island nodes.',
          attribution: 'Red Sea Project Energy Systems Review',
        },
      },
      {
        heading: 'The 1,200 MWh Battery Energy Storage System (BESS)',
        paragraphs: [
          'To bridge daytime photovoltaic generation with nighttime hospitality loads, RSG deployed a 1,200 MWh lithium-iron-phosphate (LFP) Battery Energy Storage System distributed across multiple coastal hubs.',
          'Advanced grid-forming inverters emulate mechanical turbine inertia electronically. When a cloud bank temporarily covers a 100MW solar array, solid-state inverters inject real and reactive power within 15 milliseconds, stabilizing grid frequency at precisely 60.00 Hz without voltage collapse.',
        ],
        takeaway:
          'Grid-forming inverters simulate synchronous generator inertia in solid-state firmware, injecting reactive power within 15ms to prevent voltage dropouts across 90 islands.',
      },
    ],
  },

  // 6. GovTech - Sovereign Cloud Topology (Editor's Pick 2)
  {
    id: 'art-06',
    title: 'National Sovereign Cloud Topology: Data Residency, Hyper-Scale Hubs, and Enterprise Regions',
    slug: 'national-sovereign-cloud-topology-data-residency-hyperscale',
    excerpt:
      'How Oracle, Google Cloud, and Microsoft enterprise cloud regions in Dammam and Riyadh meet NCA Class-4 sovereign data isolation standards for critical government workloads.',
    coverImageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'High-density modern data center server racks with blue and amber LED indicators',
    coverImageCaption: 'Enterprise cloud infrastructure facility • Sovereign cloud architecture study',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 7,
    publishedAt: '2026-11-13T09:30:00Z',
    status: 'PUBLISHED',
    isEditorsPick: true,
    category: EDITORIAL_CATEGORIES[1],
    author: AUTHORS[1],
    tags: ['GovTech', 'Sovereign Cloud', 'Data Residency', 'Cloud Regions', 'DGA', 'Infrastructure'],
    sampleContent: true,
    seoTitle: 'National Sovereign Cloud Topology: Data Residency and Hyperscale Hubs',
    seoDescription:
      'How hyperscale cloud regions in Saudi Arabia achieve NCA Class-4 sovereign data isolation for critical government infrastructure.',
    sections: [
      {
        heading: 'Sovereign Regions vs. Public Cloud Hyperscalers',
        paragraphs: [
          'Under the Digital Government Authority (DGA) directives, government entities are required to follow a "Cloud-First" policy while strictly adhering to data classification guidelines. Data classified as Confidential or Top Secret cannot leave sovereign borders under any circumstances.',
          'To accommodate this requirement, global hyperscalers designed dedicated Sovereign Cloud Regions in Riyadh and Dammam. These facilities feature air-gapped management planes, sovereign background-checked local operational personnel, and independent fiber-optic backbones decoupled from public internet transit.',
        ],
        pullQuote: {
          quote: 'Sovereign cloud is not simply about physical server location; it requires full legal, operational, and cryptographic autonomy over the control plane itself.',
          attribution: 'Zainab Al-Husseini, Infrastructure & Smart Cities Editor',
        },
      },
    ],
  },

  // 7. AI & Deep Tech - ALLaM Dialect Alignment (Editor's Pick 3)
  {
    id: 'art-07',
    title: 'The Arabic AI Frontier: SDAIA’s ALLaM Architecture, Tokenization Benchmarks, and Dialect Alignment',
    slug: 'arabic-ai-frontier-sdaia-allam-architecture-tokenization-benchmarks',
    excerpt:
      'Behind the mathematical and grammatical breakthroughs in ALLaM: evaluating cross-lingual token density, Najdi/Hijazi dialect evaluation datasets, and sovereign RLHF alignment.',
    coverImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Futuristic architectural cityscape representing cognitive intelligence and smart city scale',
    coverImageCaption: 'Cognitive systems and artificial intelligence research • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 9,
    publishedAt: '2026-11-12T13:45:00Z',
    status: 'PUBLISHED',
    isEditorsPick: true,
    category: EDITORIAL_CATEGORIES[0],
    author: AUTHORS[3],
    tags: ['AI & Deep Tech', 'ALLaM', 'SDAIA', 'Tokenization', 'Arabic LLMs', 'RLHF'],
    sampleContent: true,
    seoTitle: 'The Arabic AI Frontier: ALLaM Architecture and Benchmarks',
    seoDescription:
      'Evaluating token density, dialectal alignment datasets, and RLHF methodologies in SDAIA’s ALLaM foundation model.',
    sections: [
      {
        heading: 'The Geometry of Semitic Tokenization',
        paragraphs: [
          'Standard subword tokenizers (such as Byte-Pair Encoding trained on Latin text) suffer a severe "tokenization tax" when processing Arabic scripts. Because vowels, diacritics, and morpho-syntactic clitics attach directly to roots, an Arabic word that conveys an entire sentence can consume 5 to 8 tokens in a conventional tokenizer, compared to 1 or 2 tokens for the English equivalent.',
          'ALLaM implemented a custom root-and-pattern morphological tokenizer that preserves morphological roots while compressing token length by over 40%, directly reducing training and inference costs by an equivalent margin.',
        ],
      },
    ],
  },

  // 8. Smart Cities - OXAGON Robotics
  {
    id: 'art-08',
    title: 'Industrial Automation at OXAGON: The Modular Manufacturing Framework for Advanced Logistics',
    slug: 'industrial-automation-oxagon-modular-manufacturing-logistics',
    excerpt:
      'Inside the automated material handling, autonomous crane systems, and digital twin port networks taking shape on the Red Sea coast.',
    coverImageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Modern robotic manipulator arm in precision industrial environment',
    coverImageCaption: 'Robotics and industrial automation study • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 5,
    publishedAt: '2026-11-10T12:00:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[3],
    author: AUTHORS[2],
    tags: ['Smart Cities', 'OXAGON', 'Robotics', 'Automation', 'Logistics', 'Digital Twins'],
    sampleContent: true,
    seoTitle: 'Industrial Automation at OXAGON: Modular Manufacturing and Logistics',
    seoDescription:
      'Examining automated container terminals, modular manufacturing hubs, and digital twin supply chains at OXAGON.',
    sections: [
      {
        heading: 'Next-Generation Autonomous Port Operations',
        paragraphs: [
          'OXAGON is designed as an integrated industrial floating ecosystem that reimagines maritime logistics. By linking automated quayside container cranes with autonomous straddle carriers and automated guided vehicles (AGVs), container dwell times are targeted for compression under 45 minutes.',
        ],
      },
    ],
  },

  // 9. Cybersecurity - Enterprise Threat Hunting
  {
    id: 'art-09',
    title: 'Enterprise Threat Hunting Across Critical Infrastructure: Tuwaiq and NCA Defense Automation Protocols',
    slug: 'enterprise-threat-hunting-critical-infrastructure-tuwaiq-nca',
    excerpt:
      'How AI-driven Security Operations Centers (SOCs) and sovereign threat intelligence exchanges protect energy pipelines and financial networks from state-sponsored APTs.',
    coverImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Cyber defense monitoring displays in security operations center',
    coverImageCaption: 'SOC operations and proactive threat detection study • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 6,
    publishedAt: '2026-11-09T15:20:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[2],
    author: AUTHORS[2],
    tags: ['Cybersecurity', 'Threat Hunting', 'NCA ECC', 'SOC Automation', 'Critical Infrastructure'],
    sampleContent: true,
    seoTitle: 'Enterprise Threat Hunting Across Critical Infrastructure: Tuwaiq & NCA',
    seoDescription:
      'How automated telemetry correlation and sovereign cyber defense hubs protect critical national infrastructure in Saudi Arabia.',
    sections: [
      {
        heading: 'Proactive Telemetry vs. Reactive Defense',
        paragraphs: [
          'In modern cyber conflict, reactive signature-based antivirus has been obsolete for years. Critical infrastructure defense across the Kingdom has transitioned toward continuous behavioral telemetry and automated adversary containment.',
          'Through collaborative frameworks established by the National Cybersecurity Authority (NCA) and Tuwaiq Academy cyber defense laboratories, incident response teams share indicators of compromise (IOCs) across public and private sectors in under 90 seconds.',
        ],
        pullQuote: {
          quote: 'Defense automation is no longer a luxury; when an APT leverages machine-speed payload delivery, human response alone cannot stop lateral traversal in a critical industrial network.',
          attribution: 'Fahad Al-Khatib, Cyber Defense Specialist',
        },
      },
      {
        heading: 'Air-Gapped Industrial Control Systems (ICS/SCADA)',
        paragraphs: [
          'Operational Technology (OT) networks governing oil processing, water desalination, and power transmission are isolated through unidirectional data diodes. By enforcing physical one-way data conduits, monitoring telemetry flows freely to central security consoles without exposing industrial actuators to inbound external commands.',
        ],
        takeaway:
          'Unidirectional hardware data diodes guarantee that operational telemetry leaves industrial control facilities while physically prohibiting external command packets from reaching turbine and pump actuators.',
      },
    ],
  },

  // 10. FinTech - Cross-Border Settlement
  {
    id: 'art-10',
    title: 'Cross-Border Instant Settlement: How SARIE and GCC Central Bank Interconnects are Reshaping B2B Trade',
    slug: 'cross-border-instant-settlement-sarie-gcc-central-bank-interconnects',
    excerpt:
      'Examining multilateral RTGS settlement rails, currency basket tokenization trials, and how corporate treasury operations achieve liquidity parity in seconds.',
    coverImageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Financial trading and currency exchange digital charts',
    coverImageCaption: 'Cross-border liquidity and settlement analysis • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 5,
    publishedAt: '2026-11-08T11:45:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[4],
    author: AUTHORS[3],
    tags: ['FinTech', 'SARIE', 'Central Banks', 'Cross-Border', 'B2B Payments', 'SAMA'],
    sampleContent: true,
    seoTitle: 'Cross-Border Instant Settlement: SARIE and GCC Central Bank Rails',
    seoDescription:
      'How multilateral real-time gross settlement systems and digital payment corridors are transforming regional trade finance.',
    sections: [
      {
        heading: 'Compressing the T+2 Correspondent Banking Delay',
        paragraphs: [
          'For decades, cross-border payments between GCC economies traversed intermediary correspondent banks in London or New York, adding 24 to 48 hours of transit latency and significant foreign exchange fees to simple regional transfers.',
          'The linkage of Saudi Arabia’s SARIE system with regional multilateral payment networks enables direct central bank bilateral netting, settling transactions in domestic currencies in under 10 seconds.',
        ],
        pullQuote: {
          quote: 'Direct central bank settlement rails eliminate correspondent intermediaries, reducing transfer friction to single-digit seconds for cross-border enterprise liquidity.',
          attribution: 'Reem Al-Dossari, FinTech & Venture Markets Lead',
        },
      },
      {
        heading: 'Corporate Treasury APIs and Programmatic Liquidity',
        paragraphs: [
          'With real-time settlement APIs, enterprise resource planning (ERP) platforms can programmatically sweep excess balances across Saudi and regional subsidiaries at end-of-day, maximizing yield and eliminating overnight currency exposure.',
        ],
        takeaway:
          'Automated treasury sweeping enabled by SAMA instant settlement APIs unlocks millions in previously trapped intra-day liquidity for regional conglomerates.',
      },
    ],
  },

  // 11. Clean Energy - NEOM Green Hydrogen
  {
    id: 'art-11',
    title: 'NEOM Green Hydrogen Complex: Industrial Electrolyzer Scale, Desalination Loops, and Export Cryo-Terminals',
    slug: 'neom-green-hydrogen-complex-electrolyzer-scale-desalination',
    excerpt:
      'A deep dive into the world’s largest utility-scale green ammonia production facility: combining 4GW of dedicated solar and wind with 2.2GW alkaline electrolyzer stacks.',
    coverImageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Modern industrial clean tech piping and renewable energy installation',
    coverImageCaption: 'Green hydrogen production architecture • Demonstration Editorial Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 7,
    publishedAt: '2026-11-07T09:00:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[5],
    author: AUTHORS[0],
    tags: ['Clean Energy', 'Green Hydrogen', 'NEOM', 'Electrolyzers', 'Renewables', 'Industrial Tech'],
    sampleContent: true,
    seoTitle: 'NEOM Green Hydrogen Complex: Electrolyzers, Desalination, and Export',
    seoDescription:
      'Inside the 4GW renewable and 2.2GW electrolyzer complex producing 600 tons of green hydrogen per day in NEOM.',
    sections: [
      {
        heading: 'Coupling 4 Gigawatts of Variable Wind and Solar',
        paragraphs: [
          'Located in the northwest province of Tabuk, the NEOM Green Hydrogen Company (NGHC) takes advantage of a rare geographical convergence: high daytime solar irradiance paired with strong nighttime thermal desert winds.',
          'By co-locating 2.2 gigawatts of Thyssenkrupp Nucera alkaline electrolyzers directly alongside dedicated renewable generation, the facility achieves high capacity utilization without burdening the domestic electrical transmission grid.',
        ],
        pullQuote: {
          quote: 'The co-location of desert solar and nocturnal wind yields an exceptional combined capacity factor, making gigawatt-scale hydrogen synthesis commercially viable.',
          attribution: 'Tariq Al-Mansoor, Senior Deep Tech Analyst',
        },
      },
      {
        heading: 'Cryogenic Ammonia Conversion for Global Shipping',
        paragraphs: [
          'Because transporting elemental liquid hydrogen requires cryogenic containment at -253°C, the facility synthesizes hydrogen into green ammonia (NH3) at -33°C. Up to 1.2 million tons of green ammonia will be exported annually from the Port of OXAGON to international industrial decarbonization partners.',
        ],
        takeaway:
          'Converting green hydrogen to ammonia at -33°C reduces cryogenic cooling requirements by over 200°C compared to liquid hydrogen, enabling efficient transport on standard global chemical tankers.',
      },
    ],
  },

  // 12. GovTech - Microservice Architecture for Absher/Tawakkalna
  {
    id: 'art-12',
    title: 'Digital Public Infrastructure at Scale: Absher and Tawakkalna’s Real-Time Microservice Modernization',
    slug: 'digital-public-infrastructure-absher-tawakkalna-microservice-architecture',
    excerpt:
      'Architecting resilient public sector platforms handling 30 million active users, hundreds of government integrations, and automated biometric verification services.',
    coverImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    coverImageAlt: 'Modern conference room and collaborative technology development workspace',
    coverImageCaption: 'Digital government infrastructure architecture • Demonstration Archive',
    imageCredit: 'Photo via Unsplash Editorial License',
    readingTimeMinutes: 6,
    publishedAt: '2026-11-06T14:15:00Z',
    status: 'PUBLISHED',
    category: EDITORIAL_CATEGORIES[1],
    author: AUTHORS[1],
    tags: ['GovTech', 'Absher', 'Tawakkalna', 'Microservices', 'DGA', 'Public Infrastructure'],
    sampleContent: true,
    seoTitle: 'Digital Public Infrastructure: Absher and Tawakkalna Architecture',
    seoDescription:
      'How Saudi Arabia modernized its citizen public service platforms into cloud-native microservices serving 30M citizens.',
    sections: [
      {
        heading: 'Transitioning from Monolith to Event-Driven Microservices',
        paragraphs: [
          'Serving 30 million residents with hundreds of transactional government services—from passport renewals and civil registry records to driver licensing and municipal permits—places extreme load spikes on public infrastructure.',
          'Under the direction of SDAIA and the Digital Government Authority, the core platforms transitioned to event-driven microservices orchestrated on sovereign Kubernetes clusters. Asynchronous message queuing ensures that spikes during tax filing or national identity renewal periods do not cascade into downstream service outages.',
        ],
        pullQuote: {
          quote: 'Public infrastructure resilience is demonstrated when millions of citizens execute simultaneous life-event transactions with zero service degradation.',
          attribution: 'Zainab Al-Husseini, Infrastructure & Smart Cities Editor',
        },
      },
      {
        heading: 'Sovereign Biometric Authentication and Zero-Knowledge Proofs',
        paragraphs: [
          'Through integration with the National Information Center (NIC), identity verification leverages decentralized zero-knowledge verification mechanisms. Third-party applications and public agencies can confirm citizen eligibility or identity without receiving raw biometric templates, preserving citizen privacy at the cryptographic layer.',
        ],
        takeaway:
          'Zero-knowledge verification protocols enable public sector agencies to validate identity credentials without transferring or exposing raw biometric facial or fingerprint vectors.',
      },
    ],
  },
];

// Helper Query Functions
export function getAllArticles(): ArticleDetail[] {
  return [...ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getArticleBySlug(slug: string): ArticleDetail | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getArticlesByCategory(categorySlug: string): ArticleDetail[] {
  return getAllArticles().filter((a) => a.category.slug === categorySlug);
}

export function getArticlesByAuthor(authorSlug: string): ArticleDetail[] {
  return getAllArticles().filter((a) => a.author.slug === authorSlug);
}

export function getRelatedArticles(currentSlug: string, categorySlug: string, limit = 3): ArticleDetail[] {
  return getAllArticles()
    .filter((a) => a.slug !== currentSlug && a.category.slug === categorySlug)
    .slice(0, limit);
}

export function getAllAuthors(): AuthorItem[] {
  return AUTHORS;
}

export function getAuthorBySlug(slug: string): AuthorItem | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}

export function getCategoryBySlug(slug: string): CategoryItem | undefined {
  return EDITORIAL_CATEGORIES.find((c) => c.slug === slug);
}

export function searchArticles(query: string, categorySlug?: string): ArticleDetail[] {
  const normalizedQuery = query.toLowerCase().trim();
  const articles = getAllArticles();

  return articles.filter((article) => {
    // If category filter is applied
    if (categorySlug && categorySlug !== 'all' && article.category.slug !== categorySlug) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    // Match title, excerpt, category, author, tags, or section headings
    const matchesTitle = article.title.toLowerCase().includes(normalizedQuery);
    const matchesExcerpt = article.excerpt.toLowerCase().includes(normalizedQuery);
    const matchesCategory = article.category.name.toLowerCase().includes(normalizedQuery);
    const matchesAuthor = article.author.displayName.toLowerCase().includes(normalizedQuery);
    const matchesTags = article.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));
    const matchesSections = article.sections.some(
      (s) =>
        s.heading?.toLowerCase().includes(normalizedQuery) ||
        s.paragraphs.some((p) => p.toLowerCase().includes(normalizedQuery))
    );

    return matchesTitle || matchesExcerpt || matchesCategory || matchesAuthor || matchesTags || matchesSections;
  });
}
