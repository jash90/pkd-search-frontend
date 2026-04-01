export const SITE_URL = 'https://kodypkd.app';

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
