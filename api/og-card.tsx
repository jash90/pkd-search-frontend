/** @jsxImportSource react */
import type { ReactElement } from 'react';

// Shared OG card design + font loading, used by both the (now legacy) /api/og
// serverless handler and the build-time `scripts/generate-og-default.ts`
// generator that produces the static public/og-default.png.

export const INTER_REGULAR =
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
export const INTER_BOLD =
  'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf';

export const tryLoadFont = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const res = await fetch(url, {
      // 3s is plenty for a CDN TTF; avoid hanging if jsdelivr lags.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
};

export type OgFont = {
  name: 'Inter';
  data: ArrayBuffer;
  style: 'normal';
  weight: 400 | 700;
};

// Loads both Inter weights; returns an empty array if either fails so callers
// can fall back to the built-in sans-serif.
export const loadInterFonts = async (): Promise<OgFont[]> => {
  const [reg, bold] = await Promise.all([
    tryLoadFont(INTER_REGULAR),
    tryLoadFont(INTER_BOLD),
  ]);
  if (!reg || !bold) return [];
  return [
    { name: 'Inter', data: reg, style: 'normal', weight: 400 },
    { name: 'Inter', data: bold, style: 'normal', weight: 700 },
  ];
};

const clamp = (value: string | null | undefined, max: number, fallback: string): string => {
  if (!value) return fallback;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export type OgCardParams = {
  title?: string | null;
  subtitle?: string | null;
  badge?: string | null;
};

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export const renderOgCard = (
  params: OgCardParams = {},
  useCustomFonts = false,
): ReactElement => {
  const title = clamp(params.title, 120, 'Wyszukiwarka Kodów PKD 2025');
  const subtitle = clamp(
    params.subtitle,
    200,
    'Znajdź idealny kod PKD dzięki AI — darmowo, bez rejestracji',
  );
  const badge = params.badge ? params.badge.slice(0, 40) : null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '80px',
        background:
          'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #3b82f6 100%)',
        color: 'white',
        fontFamily: useCustomFonts ? 'Inter' : 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
            fontSize: '32px',
            fontWeight: 700,
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'white',
              color: '#1e3a8a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            PKD
          </div>
          <span>kodypkd.app</span>
        </div>
        {badge ? (
          <div
            style={{
              display: 'flex',
              padding: '12px 28px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.15)',
              fontSize: '24px',
              fontWeight: 500,
            }}
          >
            {badge}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          maxWidth: '1040px',
        }}
      >
        <div
          style={{
            fontSize: title.length > 60 ? '58px' : '72px',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '30px',
            fontWeight: 400,
            opacity: 0.88,
            lineHeight: 1.35,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '22px',
          opacity: 0.75,
        }}
      >
        <span>PKD 2025 • CEIDG • KRS</span>
        <span>kodypkd.app</span>
      </div>
    </div>
  );
};
