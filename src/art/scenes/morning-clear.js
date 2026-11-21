// "Everyone woke up. Nobody died."
// Relief: a big yellow sun, a pajama arm stretching up with every finger wide,
// coffee steaming, two birds. Lettered: ALL ALIVE.

const r1 = (v) => Math.round(v * 10) / 10;

function place(d, { s = 1, flip = false, rot = 0, x = 0, y = 0 }) {
  const a = (rot * Math.PI) / 180;
  const c = Math.cos(a);
  const n = Math.sin(a);
  return d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, px, py) => {
    const X = (flip ? -px : +px) * s;
    const Y = +py * s;
    return `${r1(x + X * c - Y * n)} ${r1(y + X * n + Y * c)}`;
  });
}

// an open hand stretching, palm toward us, fingers spread; origin = heel of the palm
const HAND_PAPER =
  'M-34 120 L-36 -10 C -50 -28, -62 -48, -70 -62 C -74 -72, -64 -78, -58 -70 C -48 -58, -38 -52, -30 -54 C -30 -80, -32 -104, -34 -118 C -34 -130, -24 -132, -22 -124 C -18 -110, -12 -90, -8 -70 C -8 -100, -8 -124, -6 -136 C -4 -144, 6 -144, 7 -136 C 9 -122, 10 -96, 10 -70 C 13 -90, 16 -110, 18 -124 C 19 -132, 29 -130, 29 -122 C 28 -104, 26 -84, 26 -62 C 32 -76, 38 -90, 42 -102 C 46 -110, 54 -106, 51 -98 C 46 -84, 40 -68, 36 -50 L36 120 Z';
const HAND_INK = [
  'M-36 42 L-36 -10',
  'M-36 -10 C -50 -26, -62 -46, -70 -60 C -76 -70, -66 -76, -60 -68 C -50 -56, -40 -50, -28 -48',
  'M-28 -50 C -29 -76, -32 -100, -34 -114 C -35 -124, -25 -127, -23 -119 C -19 -104, -14 -86, -10 -66',
  'M-9 -66 C -9 -96, -8 -120, -6 -132 C -4 -140, 5 -140, 6 -132 C 8 -120, 9 -96, 9 -66',
  'M9 -66 C 12 -88, 16 -106, 19 -118 C 21 -126, 30 -124, 28 -116 C 27 -100, 25 -82, 24 -62',
  'M24 -62 C 30 -76, 36 -90, 41 -100 C 45 -107, 53 -103, 50 -95 C 45 -80, 39 -66, 36 -50 L36 42',
].join(' ');
const ARM = { s: 1.18, rot: 10, x: 124, y: 318 };

const bird = (x, y, s) =>
  `M${x - 14 * s} ${y - 4 * s} C ${x - 9 * s} ${y - 9 * s}, ${x - 4 * s} ${y - 7 * s}, ${x} ${y} C ${x + 4 * s} ${y - 8 * s}, ${x + 10 * s} ${y - 11 * s}, ${x + 16 * s} ${y - 7 * s}`;

export default {
  id: 'morning-clear',
  title: 'A clear morning: a big yellow sun, a pajama arm stretching up with every finger wide, coffee steaming, two birds. All alive.',
  viewBox: '0 0 400 500',
  tile: 'stone',
  layers: [
    // the sun, up and out
    { group: [
      { paper: 'M262 132 C 318 130, 362 174, 360 230 C 358 286, 314 328, 258 326 C 202 324, 160 280, 162 226 C 164 172, 206 134, 262 132 Z', fill: 'candle' },
    ], anim: 'rise', at: 0.1, loop: 'breathe', origin: '260 230', loopAt: 3 },
    { ink: 'M160 196 C 172 150, 214 118, 264 120 C 316 122, 358 158, 368 206', w: 4, at: 0.3, taper: 0.8 },

    // the stretch
    { group: [
      { paper: place(HAND_PAPER, { ...ARM, x: ARM.x - 5, y: ARM.y + 4 }), fill: 'bone' },
      { paper: place('M-44 40 L46 40 L52 140 L-52 140 Z', ARM), fill: 'sky', rough: 1.2 },
      { paper: place('M-44 58 L46 58 L47 70 L-45 70 Z M-46 88 L48 88 L49 100 L-47 100 Z', ARM), fill: 'periwinkle', rough: 0.8 },
      { ink: place(HAND_INK, ARM), w: 4.5 },
      { ink: place('M-44 40 C -14 46, 18 46, 46 40', ARM), w: 4.5 },
    ], anim: 'rise', at: 0.5, loop: 'sway', origin: '134 470', loopAt: 2.6 },

    // coffee
    { group: [
      { paper: 'M264 338 L334 336 C 334 368, 330 392, 316 404 L280 404 C 266 392, 262 368, 262 336 Z', fill: 'terracotta' },
      { ink: 'M258 332 L330 332 C 330 364, 326 390, 312 402 L276 402 C 262 390, 258 364, 258 332', w: 4.5 },
      { ink: 'M330 346 C 352 342, 356 372, 326 378', w: 4.5 },
      { ink: 'M252 408 C 280 414, 314 414, 340 406', w: 4 },
    ], anim: 'pop', at: 1.3 },
    { group: [
      { ink: 'M280 320 C 270 306, 290 296, 280 280 M304 322 C 294 304, 316 294, 306 274', w: 3.2, taper: 0.9 },
    ], anim: 'fade', at: 1.7, loop: 'drift', origin: '292 320' },

    // birds
    { group: [
      { ink: bird(70, 150, 1.5) + ' ' + bird(118, 120, 1.1), w: 4 },
    ], anim: 'fade', at: 2.0, loop: 'float', origin: '94 136' },

    { text: 'ALL ALIVE', x: 200, y: 30, size: 50, maxWidth: 330, w: 6, color: 'ink', at: 2.2 },
  ],
};
