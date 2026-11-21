import { CategoryItem } from '@/types';

export interface CategoryWithTags extends CategoryItem {
  tags: string[];
  articleCountPreview: number;
}

export const EDITORIAL_CATEGORIES: CategoryWithTags[] = [
  {
    id: 'cat-ai',
    name: 'AI & Deep Tech',
    slug: 'ai-deep-tech',
    description: 'Sovereign foundation models, Arabic LLMs, robotics, compute clusters, and autonomous systems.',
    color: '#F4C542', // Sunshine Yellow
    displayOrder: 1,
    tags: ['ALLaM LLM', 'Supercomputing', 'Computer Vision', 'Robotics', 'SDAIA'],
    articleCountPreview: 18,
  },
  {
    id: 'cat-govtech',
    name: 'GovTech',
    slug: 'govtech',
    description: 'Digital public infrastructure, platform governance, Absher, Tawakkalna, and administrative digitization.',
    color: '#4A90E2', // Diplomatic Blue
    displayOrder: 2,
    tags: ['Absher Platform', 'Digital ID', 'DGA Standards', 'Cloud First', 'Open Data'],
    articleCountPreview: 14,
  },
  {
    id: 'cat-cyber',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'National cybersecurity frameworks, sovereign encryption, enterprise defense, and threat intelligence.',
    color: '#E05D44', // Terracotta Crimson
    displayOrder: 3,
    tags: ['NCA ECC', 'Zero Trust', 'Threat Intel', 'Data Residency', 'Cloud Security'],
    articleCountPreview: 12,
  },
  {
    id: 'cat-smartcities',
    name: 'Smart Cities & Infra',
    slug: 'smart-cities-infra',
    description: 'Cognitive infrastructure, NEOM, Red Sea Global, ROSHN, 5G/6G connectivity, and digital twins.',
    color: '#D49A3D', // Desert Ochre
    displayOrder: 4,
    tags: ['THE LINE', 'OXAGON', 'Red Sea Global', 'Digital Twins', 'IoT Sensors'],
    articleCountPreview: 22,
  },
  {
    id: 'cat-fintech',
    name: 'FinTech',
    slug: 'fintech',
    description: 'Open banking, SAMA regulatory sandbox, digital payments, and venture capital innovation.',
    color: '#2EBFA5', // Jade Cyan
    displayOrder: 5,
    tags: ['SAMA Sandbox', 'Open Banking', 'BNPL Rails', 'SARIE Real-Time', 'Venture Capital'],
    articleCountPreview: 15,
  },
  {
    id: 'cat-cleanenergy',
    name: 'Clean Energy',
    slug: 'clean-energy',
    description: 'Green hydrogen gigaprojects, solar generation, carbon capture, and smart electrical grids.',
    color: '#52B788', // Sage Green
    displayOrder: 6,
    tags: ['Green Hydrogen', 'Solar Arrays', 'CCUS', 'Grid Balancing', 'HVDC'],
    articleCountPreview: 11,
  },
];

