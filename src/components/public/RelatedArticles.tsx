import React from 'react';
import { ArticlePreview } from '@/types';
import { ArticleCard } from './ArticleCard';
import { SectionHeading } from './SectionHeading';

interface RelatedArticlesProps {
  articles: ArticlePreview[];
  categoryName?: string;
  categorySlug?: string;
}

export const RelatedArticles: React.FC<RelatedArticlesProps> = ({
  articles,
  categoryName,
  categorySlug,
}) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section aria-label="Related Coverage" className="space-y-6 pt-12 border-t border-editorial-hairline">
      <SectionHeading
        title="Related Coverage & Intelligence"
        subtitle={categoryName ? `More technical investigations in ${categoryName}` : 'Recommended companion reading'}
        viewAllHref={categorySlug ? `/category/${categorySlug}` : '/latest'}
        viewAllLabel="Explore Pillar"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
};

