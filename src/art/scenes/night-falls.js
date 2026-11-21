// "Everyone, close your eyes."
// A head in profile against a huge flat moon; its hair grows up into bare branches.
// Its eye is shut. Around it the stars are tiny shut eyes too... except one, peeking.

const r1 = (v) => Math.round(v * 10) / 10;
// move every "x y" pair in a path
const shift = (d, dx, dy) => d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x, y) => `${r1(+x + dx)} ${r1(+y + dy)}`);
const DX = -12;
const DY = 22;

// seeded rand so the branches are the same every render
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// bare branches as one cut-paper silhouette: tapered quads, forking
function tree(x, y, ang, len, w, depth, rand, out = []) {
  const x2 = x + Math.cos(ang) * len;
  const y2 = y + Math.sin(ang) * len;
  const w2 = Math.max(1.4, w * 0.62);
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  out.push(
    `M${r1(x + nx * w / 2)} ${r1(y + ny * w / 2)} L${r1(x2 + nx * w2 / 2)} ${r1(y2 + ny * w2 / 2)} L${r1(x2 - nx * w2 / 2)} ${r1(y2 - ny * w2 / 2)} L${r1(x - nx * w / 2)} ${r1(y - ny * w / 2)} Z`,
  );
  if (depth > 0) {
    const kids = rand() < 0.3 ? 3 : 2;
    for (let k = 0; k < kids; k++) {
      const spread = kids === 3 ? (k - 1) * 0.55 : (k ? 1 : -1) * (0.3 + rand() * 0.3);
      tree(x2, y2, ang + spread + (rand() - 0.5) * 0.25, len * (0.66 + rand() * 0.16), w2, depth - 1, rand, out);
    }
  }
  return out;
}

function branches() {
  const rand = rng(7);
  const out = [];
  // swept back, like hair in a wind, so the head leans into the night
  // trunks start inside the skull so they flare out of it like hair
  tree(196 + DX, 236 + DY, -1.45, 72, 24, 5, rand, out);
  tree(168 + DX, 240 + DY, -1.85, 80, 26, 5, rand, out);
  tree(140 + DX, 256 + DY, -2.3, 70, 22, 5, rand, out);
  tree(122 + DX, 286 + DY, -2.75, 52, 16, 4, rand, out);
  return out.join(' ');
}

// a shut eye: lid arc + three lashes hanging down
const lid = (x, y, s = 1) => `M${x - 12 * s} ${y - 2 * s} C ${x - 6 * s} ${y + 7 * s}, ${x + 6 * s} ${y + 7 * s}, ${x + 12 * s} ${y - 3 * s}`;
const lashes = (x, y, s = 1) =>
  `M${x - 7 * s} ${y + 6 * s} Q ${x - 10 * s} ${y + 11 * s}, ${x - 14 * s} ${y + 14 * s} M${x + 1 * s} ${y + 8 * s} Q ${x + 1 * s} ${y + 13 * s}, ${x} ${y + 18 * s} M${x + 8 * s} ${y + 5 * s} Q ${x + 11 * s} ${y + 10 * s}, ${x + 16 * s} ${y + 12 * s}`;
const stars = [[38, 34, 0.85], [376, 70, 0.8], [30, 420, 0.8]];

const sparkle = (x, y, s) =>
  `M${x} ${y - s} L${x + s * 0.28} ${y - s * 0.28} L${x + s} ${y} L${x + s * 0.28} ${y + s * 0.28} L${x} ${y + s} L${x - s * 0.28} ${y + s * 0.28} L${x - s} ${y} L${x - s * 0.28} ${y - s * 0.28} Z`;

export default {
  id: 'night-falls',
  title: 'Night falls: a head in profile against a huge moon, its hair growing into bare branches, eyes shut, the stars are shut eyes too, except one peeking',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    // the moon: periwinkle under sky, misregistered
    { paper: 'M194 56 C 292 54, 366 130, 364 222 C 362 316, 288 386, 192 384 C 100 382, 30 308, 32 218 C 34 126, 102 58, 194 56 Z', fill: 'periwinkle', anim: 'grow', at: 0.1, origin: '198 220' },
    { paper: 'M204 48 C 300 48, 372 124, 370 216 C 368 310, 294 378, 202 376 C 110 374, 38 302, 40 210 C 42 118, 110 48, 204 48 Z', fill: 'sky', anim: 'grow', at: 0.2, origin: '204 212' },
    { ink: 'M58 118 C 96 62, 166 30, 240 36 C 316 44, 374 106, 382 186', w: 4, color: 'bone', at: 0.4, taper: 0.8 },

    // the sleeper
    { paper: shift('M64 500 C 70 452, 100 430, 134 418 C 140 398, 138 380, 132 366 C 108 344, 98 304, 108 270 C 120 232, 156 210, 194 210 C 228 211, 248 232, 252 258 C 253 266, 254 272, 258 278 C 263 287, 270 295, 276 304 C 277 309, 271 312, 263 311 C 265 317, 266 320, 261 324 C 265 329, 263 334, 257 337 C 258 347, 254 356, 242 359 C 230 362, 222 364, 216 370 C 214 384, 216 396, 224 406 C 270 418, 320 440, 336 500 Z', DX, DY), fill: 'ink', rough: 0.8, anim: 'rise', at: 0.6 },
    { group: [{ paper: branches(), fill: 'ink', rough: 0.35 }], anim: 'grow', at: 1.0, origin: '172 236', loop: 'sway', loopAt: 3.2 },

    // the shut eye, big enough to read from the couch
    { ink: lid(224, 292, 1.3), w: 5, color: 'bone', at: 1.6 },
    { ink: lashes(224, 292, 1.3), w: 2.4, color: 'bone', at: 1.85, taper: 0.8 },
    // rim of moonlight on the brow and nose, offset like a print
    { ink: shift('M246 236 C 255 250, 257 264, 261 276 C 266 287, 273 295, 280 303', DX + 1, DY), w: 3, color: 'bone', at: 1.9, taper: 0.9 },

    // star-eyes, all shut
    { ink: stars.map(([x, y, s]) => lid(x, y, s)).join(' '), w: 3.5, color: 'bone', at: 2.1 },
    { ink: stars.map(([x, y, s]) => lashes(x, y, s)).join(' '), w: 2, color: 'bone', at: 2.4, taper: 0.5 },
    { paper: sparkle(112, 22, 6) + ' ' + sparkle(388, 260, 4.5) + ' ' + sparkle(16, 250, 4) + ' ' + sparkle(330, 18, 4), fill: 'bone', rough: 0.3, anim: 'pop', at: 2.6 },

    // ...one of them is peeking
    { group: [
      { paper: 'M342 404 C 352 390, 376 390, 386 404 C 376 418, 352 418, 342 404 Z', fill: 'bone', rough: 0.5 },
      { paper: 'M364 398 C 369 398, 371 402, 371 405 C 371 409, 368 411, 364 411 C 360 411, 358 408, 358 405 C 358 401, 360 398, 364 398 Z', fill: 'ink', rough: 0.3 },
      { ink: 'M338 405 C 350 386, 376 386, 389 403', w: 3, color: 'bone' },
    ], anim: 'pop', at: 3.0, loop: 'blink', origin: '364 404', loopAt: 3.4 },
  ],
};
