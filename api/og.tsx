import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

const INTER_REGULAR = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf';
const INTER_BOLD = 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf';

let regularCache: ArrayBuffer | null = null;
let boldCache: ArrayBuffer | null = null;
let fontsUnavailable = false;

const tryLoadFont = async (url: string): Promise<ArrayBuffer | null> => {
  try {
    const res = await fetch(url, {
      // 3s is plenty for a CDN TTF; avoid hanging the Edge function if jsdelivr lags.
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
};

const clamp = (value: string | null, max: number, fallback: string): string => {
  if (!value) return fallback;
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
};

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const title = clamp(
      searchParams.get('title'),
      120,
      'Wyszukiwarka Kodów PKD 2025',
    );
    const subtitle = clamp(
      searchParams.get('subtitle'),
      200,
      'Znajdź idealny kod PKD dzięki AI — darmowo, bez rejestracji',
    );
    const badge = searchParams.get('badge')?.slice(0, 40) ?? null;

    if (!fontsUnavailable && (!regularCache || !boldCache)) {
      const [reg, bold] = await Promise.all([
        regularCache ? Promise.resolve(regularCache) : tryLoadFont(INTER_REGULAR),
        boldCache ? Promise.resolve(boldCache) : tryLoadFont(INTER_BOLD),
      ]);
      if (reg && bold) {
        regularCache = reg;
        boldCache = bold;
      } else {
        // Mark as unavailable for this isolate so we don't retry on every request.
        fontsUnavailable = true;
      }
    }
    const useCustomFonts = !fontsUnavailable && regularCache && boldCache;

    return new ImageResponse(
      (
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
      ),
      {
        width: 1200,
        height: 630,
        ...(useCustomFonts
          ? {
              fonts: [
                { name: 'Inter', data: regularCache!, style: 'normal', weight: 400 },
                { name: 'Inter', data: boldCache!, style: 'normal', weight: 700 },
              ],
            }
          : {}),
      },
    );
  } catch (err) {
    return new Response(`OG image error: ${(err as Error).message}`, {
      status: 500,
    });
  }
}
