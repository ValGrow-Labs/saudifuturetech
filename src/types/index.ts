export type ArticleStatus = 'DRAFT' | 'IN_REVIEW' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';

export type UserRole = 'SUPER_ADMIN' | 'EDITOR' | 'AUTHOR';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  displayOrder: number;
}

export interface AuthorItem {
  id: string;
  displayName: string;
  slug: string;
  title: string;
  avatarUrl: string;
  bio?: string;
  location?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
}

export interface ArticleSection {
  heading?: string;
  subheading?: string;
  paragraphs: string[];
  pullQuote?: {
    quote: string;
    attribution?: string;
  };
  takeaway?: string;
  inlineImage?: {
    url: string;
    alt: string;
    caption?: string;
  };
  codeBlock?: {
    code: string;
    language: string;
    caption?: string;
  };
  table?: {
    headers: string[];
    rows: string[][];
  };
}

export interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string;
  coverImageAlt: string;
  coverImageCaption?: string;
  imageCredit?: string;
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt?: string;
  category: CategoryItem;
  author: AuthorItem;
  status: ArticleStatus;
  isFeatured?: boolean;
  isTrending?: boolean;
  isEditorsPick?: boolean;
  tags: string[];
  sampleContent: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ArticleDetail extends ArticlePreview {
  sections: ArticleSection[];
}

export interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
}
