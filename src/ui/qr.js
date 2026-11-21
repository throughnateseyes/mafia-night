/*
 * QR codes drawn to match the art (soft ink modules, rounded finder eyes) while
 * keeping everything a phone camera needs: exact module grid, 4-module quiet zone,
 * dark-on-light contrast, error correction level M (15% damage tolerated).
 * scripts/check-qr.mjs renders these and decodes them to prove they scan.
 */
import QRCode from 'qrcode';

export function qrMatrix(text) {
  const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
  const { size, data } = qr.modules;
  return { size, dark: (x, y) => data[y * size + x] === 1 };
}

export function qrSvg(text, { ink = '#191714', paper = '#FAF6EE', label = 'QR code' } = {}) {
  const { size, dark } = qrMatrix(text);
  const q = 4; // quiet zone
  const total = size + q * 2;
  const isFinder = (x, y) => (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
  let mods = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!dark(x, y) || isFinder(x, y)) continue;
      // tiny seeded variation in corner roundness keeps it feeling inked, never changes coverage
      const r = 0.28 + (((x * 7 + y * 13) % 5) * 0.02);
      mods += `<rect x="${x + q + 0.04}" y="${y + q + 0.04}" width="0.92" height="0.92" rx="${r}"/>`;
    }
  }
  const eye = (fx, fy) => {
    const X = fx + q;
    const Y = fy + q;
    return `<path fill-rule="evenodd" d="M${X + 1.6} ${Y}h3.8a1.6 1.6 0 0 1 1.6 1.6v3.8a1.6 1.6 0 0 1-1.6 1.6h-3.8a1.6 1.6 0 0 1-1.6-1.6v-3.8a1.6 1.6 0 0 1 1.6-1.6zM${X + 1.9} ${Y + 1}h3.2a0.9 0.9 0 0 1 0.9 0.9v3.2a0.9 0.9 0 0 1-0.9 0.9h-3.2a0.9 0.9 0 0 1-0.9-0.9v-3.2a0.9 0.9 0 0 1 0.9-0.9z"/><rect x="${X + 2}" y="${Y + 2}" width="3" height="3" rx="0.9"/>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" class="qr" viewBox="0 0 ${total} ${total}" role="img" aria-label="${label}" shape-rendering="geometricPrecision"><rect width="${total}" height="${total}" fill="${paper}"/><g fill="${ink}">${mods}${eye(0, 0)}${eye(size - 7, 0)}${eye(0, size - 7)}</g></svg>`;
}
