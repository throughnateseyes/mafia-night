#!/usr/bin/env node
/*
 * Render art modules to SVG + PNG so you can look at them.
 *
 *   node scripts/render-art.mjs src/art/scenes/night-falls.js [more files...]
 *   node scripts/render-art.mjs --text "MAFIA NIGHT" [--text "SAM"]
 *   node scripts/render-art.mjs src/art/scenes/morning-dead.js --slot name=STEPH
 *   node scripts/render-art.mjs --sheet src/art/roles/*.js        (contact sheet)
 *   options: --out <dir> (default .art-preview), --width <px> (default 900), --frames
 *            (--frames also renders the 3 line-boil variants side by side)
 *
 * A module's default export is one art object, or an array of them.
 * Prints the PNG paths. Open them with your image viewer / Read tool.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { renderArt } from '../src/art/render.js';

const args = process.argv.slice(2);
let out = '.art-preview';
let width = 900;
let sheet = false;
const slots = {};
const files = [];
const texts = [];
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--out') out = args[++i];
  else if (a === '--width') width = Number(args[++i]);
  else if (a === '--slot') { const [k, ...v] = args[++i].split('='); slots[k] = v.join('='); }
  else if (a === '--text') texts.push(args[++i]);
  else if (a === '--sheet') sheet = true;
  else files.push(a);
}
mkdirSync(out, { recursive: true });

const arts = [];
for (const f of files) {
  const mod = await import(pathToFileURL(resolve(f)).href + `?t=${Date.now()}`);
  const list = [mod.default].flat().filter(Boolean);
  for (const art of list) arts.push({ art, name: art.id ?? basename(f, '.js') });
}
for (const t of texts) {
  arts.push({
    name: `text-${t.replace(/\W+/g, '_').slice(0, 30)}`,
    art: { id: `text-${t}`, viewBox: '0 0 1000 260', tile: 'sand', layers: [{ text: t, x: 500, y: 70, size: 110, maxWidth: 940 }] },
  });
}

function toPng(svg, file, w) {
  const svgPath = `${out}/${file}.svg`;
  const pngPath = `${out}/${file}.png`;
  writeFileSync(svgPath, svg);
  execFileSync('rsvg-convert', ['-w', String(w), '-o', pngPath, svgPath]);
  return pngPath;
}

if (sheet) {
  // grid of static renders on one page
  const cols = Math.min(4, arts.length);
  const cell = 400;
  const rows = Math.ceil(arts.length / cols);
  const inner = arts.map(({ art }, i) => {
    const svg = renderArt(art, { animate: false, slots });
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cell;
    return svg.replace('<svg ', `<svg x="${x + 10}" y="${y + 10}" width="${cell - 20}" height="${cell - 20}" `);
  });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${cols * cell} ${rows * cell}"><rect width="100%" height="100%" fill="#fff"/>${inner.join('')}</svg>`;
  console.log(toPng(svg, 'sheet', Math.min(1600, cols * cell)));
} else {
  for (const { art, name } of arts) {
    console.log(toPng(renderArt(art, { animate: false, slots }), name, width));
  }
}
