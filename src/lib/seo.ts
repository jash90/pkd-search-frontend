export const SITE_URL = 'https://kodypkd.app';
export const SITE_NAME = 'kodypkd.app';

export type OgImageParams = {
  title?: string;
  subtitle?: string;
  badge?: string;
};

export const buildOgImageUrl = (params: OgImageParams = {}): string => {
  const qs = new URLSearchParams();
  if (params.title) qs.set('title', params.title);
  if (params.subtitle) qs.set('subtitle', params.subtitle);
  if (params.badge) qs.set('badge', params.badge);
  const suffix = qs.toString();
  return `${SITE_URL}/api/og${suffix ? `?${suffix}` : ''}`;
};

const POLISH_DIACRITICS: Record<string, string> = {
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
  'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
};

export const createSlug = (text: string): string => {
  return text
    .trim()
    .toLowerCase()
    .replace(/[ąćęłńóśźż]/g, (ch) => POLISH_DIACRITICS[ch] || ch)
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const decodeSlug = (slug: string): string => {
  return decodeURIComponent(slug).replace(/-/g, ' ');
};

// PKD code <-> URL slug. "56.11.Z" <-> "56-11-z"
export const codeToSlug = (code: string): string =>
  code.toLowerCase().replace(/\./g, '-');

export const slugToCode = (slug: string): string =>
  slug.toUpperCase().replace(/-/g, '.');

export type BreadcrumbItem = { name: string; url: string };

export const makeBreadcrumbSchema = (items: BreadcrumbItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
  })),
});

export type ItemListEntry = { code: string; name: string };

export const makeItemListSchema = (label: string, items: ItemListEntry[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Kody PKD dla: ${label}`,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'DefinedTerm',
      name: item.code,
      description: item.name,
    },
  })),
});

export type FaqItem = { question: string; answer: string };

export const makeFaqSchema = (items: FaqItem[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export type ArticleSchemaInput = {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  keywords?: string[];
};

export const makeArticleSchema = (article: ArticleSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  datePublished: article.publishedAt,
  dateModified: article.updatedAt,
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/artykuly/${article.slug}` },
  ...(article.keywords && article.keywords.length > 0 ? { keywords: article.keywords.join(', ') } : {}),
});
