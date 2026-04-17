// Script de génération des icônes PNG pour la PWA
// Usage: node scripts/generate-icons.cjs
// Aucune dépendance — utilise uniquement les modules natifs Node.js

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

// ── CRC32 ─────────────────────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// ── PNG builder ───────────────────────────────────────────────────────────────
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const d = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(d.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, d])));
  return Buffer.concat([len, t, d, crcBuf]);
}

/**
 * @param {number} width
 * @param {number} height
 * @param {(x: number, y: number) => [number, number, number, number]} pixelFn  RGBA
 */
function makePNG(width, height, pixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA

  const raw = [];
  for (let y = 0; y < height; y++) {
    raw.push(0); // filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      raw.push(r, g, b, a);
    }
  }
  const idat = zlib.deflateSync(Buffer.from(raw));
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// ── Primitives ────────────────────────────────────────────────────────────────
function inRect(x, y, x1, y1, x2, y2) {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}
function inCircle(x, y, cx, cy, r) {
  return Math.hypot(x - cx, y - cy) <= r;
}
function inRoundedRect(x, y, x1, y1, x2, y2, r) {
  if (x < x1 || x > x2 || y < y1 || y > y2) return false;
  if (x < x1 + r && y < y1 + r) return inCircle(x, y, x1 + r, y1 + r, r);
  if (x > x2 - r && y < y1 + r) return inCircle(x, y, x2 - r, y1 + r, r);
  if (x < x1 + r && y > y2 - r) return inCircle(x, y, x1 + r, y2 - r, r);
  if (x > x2 - r && y > y2 - r) return inCircle(x, y, x2 - r, y2 - r, r);
  return true;
}

// ── Couleurs ──────────────────────────────────────────────────────────────────
const ORANGE = [249, 115, 22, 255]; // #F97316
const WHITE  = [255, 255, 255, 255];
const TRANSP = [0, 0, 0, 0];

// ── Icon 192×192 : marmite blanche sur fond orange arrondi ────────────────────
function icon192(x, y) {
  const W = 192, H = 192;

  // Fond orange, coins arrondis 36px
  if (!inRoundedRect(x, y, 0, 0, W - 1, H - 1, 36)) return TRANSP;

  // Corps de la marmite
  if (inRoundedRect(x, y, 58, 82, 134, 152, 10)) return WHITE;

  // Couvercle
  if (inRoundedRect(x, y, 50, 68, 142, 84, 4)) return WHITE;

  // Bouton du couvercle
  if (inRoundedRect(x, y, 87, 56, 105, 70, 4)) return WHITE;

  // Anse gauche
  if (inRoundedRect(x, y, 36, 92, 60, 112, 6)) return WHITE;

  // Anse droite
  if (inRoundedRect(x, y, 132, 92, 156, 112, 6)) return WHITE;

  // Vapeur — 3 colonnes de petits tirets
  const steamCols = [82, 96, 110];
  for (const sx of steamCols) {
    for (let sy = 28; sy <= 52; sy += 10) {
      if (inCircle(x, y, sx, sy, 3)) return WHITE;
    }
  }

  return ORANGE;
}

// ── Badge 72×72 : marmite blanche sur fond orange (cercle) ────────────────────
function badge72(x, y) {
  const W = 72, H = 72;

  // Fond blanc (transparent hors cercle)
  if (!inCircle(x, y, W / 2, H / 2, W / 2 - 1)) return TRANSP;

  // Fond orange
  // Corps
  if (inRoundedRect(x, y, 21, 30, 51, 56, 4)) return WHITE;
  // Couvercle
  if (inRoundedRect(x, y, 18, 24, 54, 32, 2)) return WHITE;
  // Bouton
  if (inRoundedRect(x, y, 32, 20, 40, 26, 2)) return WHITE;
  // Anse gauche
  if (inRoundedRect(x, y, 13, 34, 22, 42, 3)) return WHITE;
  // Anse droite
  if (inRoundedRect(x, y, 50, 34, 59, 42, 3)) return WHITE;

  return ORANGE;
}

// ── Génération ────────────────────────────────────────────────────────────────
const OUT = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, 'icon-192x192.png'), makePNG(192, 192, icon192));
console.log('✓ icon-192x192.png');

fs.writeFileSync(path.join(OUT, 'badge-72x72.png'), makePNG(72, 72, badge72));
console.log('✓ badge-72x72.png');

// Apple touch icon — même que 192, format PNG standard
fs.writeFileSync(path.join(OUT, 'apple-touch-icon.png'), makePNG(180, 180, (x, y) => icon192(x * (192 / 180), y * (192 / 180))));
console.log('✓ apple-touch-icon.png (180×180)');

console.log('\nIcônes générées dans public/icons/');
