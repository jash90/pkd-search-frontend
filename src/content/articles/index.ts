import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import manifest from './manifest.json';

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  keywords: string[];
}

export interface ArticleEntry extends ArticleMeta {
  Component: LazyExoticComponent<ComponentType>;
}

const mdxModules = import.meta.glob<{ default: ComponentType }>('./*.mdx');

const loadModule = (slug: string) => {
  const path = `./${slug}.mdx`;
  const loader = mdxModules[path];
  if (!loader) {
    throw new Error(`Missing MDX file for article "${slug}" at ${path}`);
  }
  return loader as () => Promise<{ default: ComponentType }>;
};

export const articles: ArticleEntry[] = (manifest as ArticleMeta[]).map((meta) => ({
  ...meta,
  Component: lazy(loadModule(meta.slug)),
}));

export const articlesBySlug = Object.fromEntries(
  articles.map((article) => [article.slug, article]),
);

export const getArticle = (slug: string | undefined): ArticleEntry | undefined => {
  if (!slug) return undefined;
  return articlesBySlug[slug];
};
