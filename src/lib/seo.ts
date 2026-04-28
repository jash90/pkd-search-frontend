export const SITE_URL = 'https://kodypkd.app';
export const SITE_NAME = 'kodypkd.app';

// Truncate text to fit Google's ~155-160 char description budget.
// Cuts on a word boundary, adds … ellipsis when shortened.
export const truncate = (text: string, max = 158): string => {
  const cleaned = text.trim().replace(/\s+/g, ' ');
  if (cleaned.length <= max) return cleaned;
  const slice = cleaned.slice(0, max - 1);
  const lastSpace = slice.lastIndexOf(' ');
  return `${slice.slice(0, lastSpace > 80 ? lastSpace : slice.length).trim()}…`;
};

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

// Schema for an individual PKD code page. Combines DefinedTerm (the code itself),
// description and OG image into a single Article-shaped object so Google
// can show rich results.
export type CodePageSchemaInput = {
  code: string;
  name: string;
  description: string;
  url: string;
  image: string;
  sectionLetter?: string;
  sectionName?: string;
  modifiedDate?: string;
};

export const makeCodePageSchema = (input: CodePageSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `Kod PKD ${input.code} — ${input.name}`,
  description: input.description,
  url: input.url,
  image: input.image,
  inLanguage: 'pl-PL',
  isAccessibleForFree: true,
  ...(input.modifiedDate ? { dateModified: input.modifiedDate } : {}),
  about: {
    '@type': 'DefinedTerm',
    name: input.code,
    description: input.name,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'Polska Klasyfikacja Działalności 2025 (PKD 2025)',
      url: 'https://klasyfikacje.stat.gov.pl/Pkd2025',
    },
    ...(input.sectionLetter
      ? { termCode: input.code, identifier: input.code }
      : {}),
  },
  ...(input.sectionName
    ? {
        articleSection: input.sectionName,
      }
    : {}),
  author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
});

// Schema for the /pkd-2025 hub: a CollectionPage that aggregates all
// 728 subclasses, exposed as DefinedTermSet via DefinedTerm members.
export type CollectionPageSchemaInput = {
  url: string;
  title: string;
  description: string;
  count: number;
};

export const makeCollectionPageSchema = (input: CollectionPageSchemaInput) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  url: input.url,
  name: input.title,
  description: input.description,
  inLanguage: 'pl-PL',
  isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
  about: {
    '@type': 'DefinedTermSet',
    name: 'Polska Klasyfikacja Działalności 2025 (PKD 2025)',
    url: 'https://klasyfikacje.stat.gov.pl/Pkd2025',
    hasDefinedTerm: { '@type': 'QuantitativeValue', value: input.count, unitText: 'kody' },
  },
});
