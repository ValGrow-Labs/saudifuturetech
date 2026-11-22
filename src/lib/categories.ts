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
    description: 'Arabic language models, national compute, robotics, and the companies and labs building them.',
    color: '#F4C542', // Sunshine Yellow
    displayOrder: 1,
    tags: ['ALLaM LLM', 'Supercomputing', 'Computer Vision', 'Robotics', 'SDAIA'],
    articleCountPreview: 18,
  },
  {
    id: 'cat-govtech',
    name: 'GovTech',
    slug: 'govtech',
    description: 'How government services move online: Absher, Tawakkalna, digital ID and open data.',
    color: '#4A90E2', // Diplomatic Blue
    displayOrder: 2,
    tags: ['Absher Platform', 'Digital ID', 'DGA Standards', 'Cloud First', 'Open Data'],
    articleCountPreview: 14,
  },
  {
    id: 'cat-cyber',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'NCA rules, data residency, and how Saudi organisations defend their networks.',
    color: '#E05D44', // Terracotta Crimson
    displayOrder: 3,
    tags: ['NCA ECC', 'Zero Trust', 'Threat Intel', 'Data Residency', 'Cloud Security'],
    articleCountPreview: 12,
  },
  {
    id: 'cat-smartcities',
    name: 'Smart Cities & Infra',
    slug: 'smart-cities-infra',
    description: 'NEOM, Red Sea Global, ROSHN and the networks, sensors and software inside new cities.',
    color: '#D49A3D', // Desert Ochre
    displayOrder: 4,
    tags: ['THE LINE', 'OXAGON', 'Red Sea Global', 'Digital Twins', 'IoT Sensors'],
    articleCountPreview: 22,
  },
  {
    id: 'cat-fintech',
    name: 'FinTech',
    slug: 'fintech',
    description: 'Payments, open banking, the SAMA sandbox, and who is funding Saudi fintech.',
    color: '#2EBFA5', // Jade Cyan
    displayOrder: 5,
    tags: ['SAMA Sandbox', 'Open Banking', 'BNPL Rails', 'SARIE Real-Time', 'Venture Capital'],
    articleCountPreview: 15,
  },
  {
    id: 'cat-cleanenergy',
    name: 'Clean Energy',
    slug: 'clean-energy',
    description: 'Solar, green hydrogen, carbon capture and the grid that has to carry it all.',
    color: '#52B788', // Sage Green
    displayOrder: 6,
    tags: ['Green Hydrogen', 'Solar Arrays', 'CCUS', 'Grid Balancing', 'HVDC'],
    articleCountPreview: 11,
  },
];

