// Generates the Open Graph image at src/assets/img/og/pipe-band-predictor.png
// Run with: npm run generate:og
//
// Composites the app icon onto a brand-gradient background with title +
// tagline. Uses system fonts via sharp's SVG renderer — adequate for
// OG cards which are usually displayed at 1200×630 alongside the page title.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const W = 1200;
const H = 630;
const ICON_SIZE = 200;
const CARD_SIZE = 260;
const CARD_RADIUS = 48;
const cardX = (W - CARD_SIZE) / 2;
const cardY = 110;

const svgBackground = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3C8CCA"/>
      <stop offset="55%" stop-color="#144571"/>
      <stop offset="100%" stop-color="#0A2C4A"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="18%" r="55%">
      <stop offset="0%" stop-color="#E8B923" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#E8B923" stop-opacity="0"/>
    </radialGradient>
    <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- White card to host the icon -->
  <rect x="${cardX}" y="${cardY}" width="${CARD_SIZE}" height="${CARD_SIZE}"
        rx="${CARD_RADIUS}" fill="#FFFFFF" filter="url(#cardShadow)"/>

  <g font-family="-apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif" text-anchor="middle">
    <text x="${W / 2}" y="460" font-size="68" font-weight="800"
          fill="#FFFFFF" letter-spacing="-1.4">Pipe Band Predictor</text>
    <text x="${W / 2}" y="520" font-size="32" font-weight="600"
          fill="#FACC15" letter-spacing="0.5">Pipe band prediction game</text>
  </g>
</svg>`;

const iconBuffer = await sharp(join(root, 'src/assets/img/icons/icon.png'))
  .resize(ICON_SIZE, ICON_SIZE)
  .toBuffer();

const iconLeft = (W - ICON_SIZE) / 2;
const iconTop = cardY + (CARD_SIZE - ICON_SIZE) / 2;

const outPath = join(root, 'src/assets/img/og/pipe-band-predictor.png');

await sharp(Buffer.from(svgBackground))
  .composite([{ input: iconBuffer, top: iconTop, left: iconLeft }])
  .png()
  .toFile(outPath);

console.log(`Wrote ${outPath} (${W}×${H})`);
