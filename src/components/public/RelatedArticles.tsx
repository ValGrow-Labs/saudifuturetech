import React from 'react';
import { ArticlePreview } from '@/types';
import { ArticleCard } from './ArticleCard';
import { SectionHeading } from './SectionHeading';

interface RelatedArticlesProps {
  articles: ArticlePreview[];
  categoryName?: string;
  categorySlug?: string;
}

/** "More from the desk": up to three teasers divided by vertical hairlines. */
export const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles, categoryName, categorySlug }) => {
  if (!articles || articles.length === 0) return null;

  return (
    <section aria-label="Read next">
      <SectionHeading
        kicker={categoryName ? `More from ${categoryName}` : undefined}
        title="Read next"
        viewAllHref={categorySlug ? `/category/${categorySlug}` : '/latest'}
        viewAllLabel={categoryName ? `All ${categoryName} stories` : 'All stories'}
      />

      <div className="grid gap-y-8 md:grid-cols-3 md:gap-x-10">
        {articles.slice(0, 3).map((article, i) => (
          <ArticleCard
            key={article.id}
            article={article}
            size="sm"
            className={
              i > 0
                ? 'pt-8 border-t border-rule md:pt-0 md:border-t-0 md:border-l md:border-rule md:pl-10'
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
};
