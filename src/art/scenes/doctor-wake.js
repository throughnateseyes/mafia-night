// "Doctor, who will you save?"
// Two open hands rise into a pool of candlelight, offering up a heart that's been sewn back together.

const r1 = (v) => Math.round(v * 10) / 10;

// place a path drawn in hand space: scale, mirror, rotate (degrees), move
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

// an open hand, palm toward us, fingers up; thumb on the left, pinky on the right.
// origin = heel of the palm. Each finger is its own stroke: up, round the tip, down.
const HAND_PAPER =
  'M40 40 L40 -64 C 44 -92, 40 -110, 30 -114 C 22 -118, 16 -112, 16 -104 C 16 -124, 12 -138, 2 -138 C -6 -146, -18 -144, -18 -134 C -22 -130, -34 -132, -36 -120 L-38 -66 C -52 -78, -66 -90, -76 -86 C -84 -82, -82 -72, -76 -64 C -62 -44, -48 -24, -40 -8 L-40 40 Z';
const HAND_INK = [
  'M36 44 L36 2 C 38 -28, 39 -52, 35 -70 C 37 -88, 37 -100, 31 -108 C 26 -114, 18 -112, 18 -102 L17 -78',
  'M18 -100 C 18 -116, 16 -126, 10 -131 C 4 -135, -2 -130, -2 -122 L-2 -84',
  'M-2 -120 C -3 -132, -6 -140, -12 -142 C -18 -143, -22 -138, -22 -128 L-21 -86',
  'M-22 -126 C -24 -126, -32 -126, -34 -116 C -36 -100, -36 -86, -35 -66',
  'M-35 -52 C -48 -64, -60 -80, -70 -84 C -78 -86, -82 -78, -76 -70 C -64 -50, -52 -30, -42 -10 C -38 0, -38 20, -38 44',
].join(' ');

const LEFT = { s: 1.08, rot: -9, x: 158, y: 462 };
const RIGHT = { s: 1.08, rot: 8, x: 244, y: 466, flip: true };

export default {
  id: 'doctor-wake',
  title: 'The doctor wakes: two open hands rise into a pool of candlelight, offering up a heart sewn back together',
  viewBox: '0 0 400 500',
  tile: 'dusk',
  layers: [
    // lantern glow
    { group: [
      { paper: 'M200 96 C 280 94, 336 154, 334 232 C 332 310, 274 366, 196 364 C 118 362, 64 304, 66 228 C 68 152, 122 98, 200 96 Z', fill: 'candle' },
    ], anim: 'grow', at: 0.1, origin: '200 230', loop: 'breathe', loopAt: 2.6 },
    { ink: 'M78 156 C 104 104, 156 78, 214 82 C 274 88, 322 128, 340 186', w: 3.5, color: 'bone', at: 0.35, taper: 0.8 },

    // the heart, sewn back together, beating
    { group: [
      { paper: 'M204 260 C 190 232, 144 230, 142 268 C 140 302, 180 324, 206 348 C 232 324, 270 302, 268 266 C 266 230, 220 230, 204 260 Z', fill: 'terracotta' },
      { ink: 'M198 254 C 184 224, 136 224, 134 262 C 132 298, 172 320, 198 344 C 224 320, 262 298, 260 260 C 258 224, 212 222, 198 254', w: 5.5, at: 1.5 },
      { ink: 'M200 256 L190 278 L208 296 L198 322', w: 3.5, at: 2.1 },
      { ink: 'M182 270 L200 276 M198 286 L216 286 M186 304 L206 310', w: 4, at: 2.35 },
      // the needle is still hanging off the last stitch
      { ink: 'M201 256 C 206 226, 236 214, 262 216 C 280 218, 290 206, 294 192', w: 2.5, at: 2.6, taper: 0.3 },
      { ink: 'M288 206 L310 166', w: 4, at: 2.85, taper: 0.9 },
    ], anim: 'drop', at: 1.3, loop: 'pulse', origin: '200 290', loopAt: 3 },

    // hands rise into the light
    { group: [
      { paper: place(HAND_PAPER, { ...LEFT, x: LEFT.x - 4, y: LEFT.y + 4 }), fill: 'bone' },
      { ink: place(HAND_INK, LEFT), w: 4.5 },
    ], anim: 'rise', at: 0.55 },
    { group: [
      { paper: place(HAND_PAPER, { ...RIGHT, x: RIGHT.x + 5, y: RIGHT.y + 3 }), fill: 'bone' },
      { ink: place(HAND_INK, RIGHT), w: 4.5 },
    ], anim: 'rise', at: 0.75 },

    // sparks lifting off the light
    { group: [
      { paper: 'M104 92 L108 83 L112 92 L108 101 Z M318 70 L321 63 L324 70 L321 77 Z M352 208 L355 201 L358 208 L355 215 Z', fill: 'candle', rough: 0.2 },
    ], anim: 'fade', at: 2.7, loop: 'drift', origin: '220 130' },
  ],
};
