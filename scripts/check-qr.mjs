#!/usr/bin/env node
/* Render our styled QR codes to PNG and decode them with jsQR. Fails loudly if any won't scan. */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { qrSvg } from '../src/ui/qr.js';

const base = 'https://throughnateseyes.github.io/mafia-night/';
const samples = [
  `${base}#/j/k3m9x2pq7d.AbCdEfGhIjKlMnOpQrStUv.0`,
  `${base}#/n/k3m9x2pq7d.AbCdEfGhIjKlMnOpQrStUv.ZyXwVuTsRqPoNmLkJiHgFe.0`,
  `${base}#/tv/k3m9x2pq7d.AbCdEfGhIjKlMnOpQrStUv.1`,
];
mkdirSync('.art-preview', { recursive: true });
let ok = true;
for (const [i, text] of samples.entries()) {
  for (const px of [180, 400]) {
    const svgPath = `.art-preview/qr-${i}.svg`;
    const pngPath = `.art-preview/qr-${i}-${px}.png`;
    writeFileSync(svgPath, qrSvg(text));
    execFileSync('rsvg-convert', ['-w', String(px), '-o', pngPath, svgPath]);
    const png = PNG.sync.read(readFileSync(pngPath));
    const got = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    const pass = got?.data === text;
    ok &&= pass;
    console.log(`${pass ? 'PASS' : 'FAIL'} ${px}px  ${text.split('#')[1]}`);
  }
}
process.exit(ok ? 0 : 1);
