import { ImageResponse } from '@vercel/og';
import {
  INTER_REGULAR,
  INTER_BOLD,
  OG_HEIGHT,
  OG_WIDTH,
  renderOgCard,
  tryLoadFont,
} from './og-card';

// NOTE: production is served by Caddy (Railway) as static files, so this
// handler is currently dead in production — og:image points at the static
// public/og-default.png (see src/lib/seo.ts). Kept for any host that does run
// serverless functions, and as a runtime sibling to the build-time generator.
// Runs on Vercel Node.js (Fluid Compute) — @vercel/og no longer reliably
// bundles for the legacy Edge runtime, so we leave the runtime at default.

let regularCache: ArrayBuffer | null = null;
let boldCache: ArrayBuffer | null = null;
let fontsUnavailable = false;

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

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
    const useCustomFonts = !fontsUnavailable && !!regularCache && !!boldCache;

    return new ImageResponse(
      renderOgCard(
        {
          title: searchParams.get('title'),
          subtitle: searchParams.get('subtitle'),
          badge: searchParams.get('badge'),
        },
        useCustomFonts,
      ),
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
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
