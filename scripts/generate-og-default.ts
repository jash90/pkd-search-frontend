import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ImageResponse } from '@vercel/og';
import {
  OG_HEIGHT,
  OG_WIDTH,
  loadInterFonts,
  renderOgCard,
} from '../api/og-card';

// Generates the single static OG card served to all pages (public/og-default.png).
// Production runs on Caddy (static files only), so the /api/og function never
// executes there — this build-time render replaces it. Re-run with `npm run build:og`
// whenever the card design in api/og-card.tsx changes; commit the resulting PNG.

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '..', 'public', 'og-default.png');

const main = async () => {
  const fonts = await loadInterFonts();
  if (fonts.length === 0) {
    console.warn('[og] Inter fonts unavailable — falling back to built-in sans-serif.');
  }

  const image = new ImageResponse(renderOgCard({}, fonts.length > 0), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    ...(fonts.length > 0 ? { fonts } : {}),
  });

  const buffer = Buffer.from(await image.arrayBuffer());
  writeFileSync(OUT, buffer);
  console.log(`[og] wrote ${OUT} (${OG_WIDTH}x${OG_HEIGHT}, ${buffer.length} bytes)`);
};

main().catch((err) => {
  console.error('[og] generation failed:', err);
  process.exit(1);
});
