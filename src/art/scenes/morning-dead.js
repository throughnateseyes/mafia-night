// "In the morning, STEPH was found..."
// The sun comes up like any other morning. On the floor in front of it: a chalk outline,
// a party hat knocked off its head, a birthday candle still smoking. The name, big.

// a smooth closed curve through points (Catmull-Rom → cubic Béziers)
function smooth(pts) {
  const r = (v) => Math.round(v * 10) / 10;
  const n = pts.length;
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d += ` C ${r(p1[0] + (p2[0] - p0[0]) / 6)} ${r(p1[1] + (p2[1] - p0[1]) / 6)}, ${r(p2[0] - (p3[0] - p1[0]) / 6)} ${r(p2[1] - (p3[1] - p1[1]) / 6)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

// lying on their back, head to the left: one arm flung over the head, one knee bent
const fit = ([x, y]) => [Math.round(214 + (x - 214) * 0.9), Math.round(318 + (y - 318) * 0.84 + 16)];
const BODY = smooth([
  [130, 306], [150, 296], [164, 268], [150, 250], [136, 244], [128, 236], [120, 244], [124, 254],
  [146, 266], [154, 282], [176, 298], [214, 294], [252, 294], [300, 286], [344, 282], [358, 276],
  [366, 286], [356, 296], [300, 310], [292, 318], [324, 344], [306, 368], [292, 384], [282, 380],
  [286, 368], [302, 346], [276, 330], [252, 332], [212, 334], [182, 334], [188, 360], [208, 380],
  [214, 392], [204, 396], [192, 386], [170, 362], [162, 338], [132, 330],
].map(fit));
const HEAD_C = fit([104, 318]);

export default {
  id: 'morning-dead',
  title: 'Morning: the sun comes up behind a chalk outline on the floor, a party hat knocked off beside it and a birthday candle still smoking',
  viewBox: '0 0 400 500',
  tile: 'sand',
  layers: [
    // sunrise
    { group: [
      { paper: 'M204 166 C 262 166, 304 210, 304 266 C 304 320, 260 362, 202 362 C 146 362, 102 320, 102 264 C 102 208, 146 166, 204 166 Z', fill: 'terracotta' },
    ], anim: 'rise', at: 0.1, loop: 'breathe', origin: '204 264', loopAt: 3 },
    { ink: 'M94 236 C 104 190, 146 156, 198 154 C 252 152, 296 186, 310 232', w: 4, at: 0.35, taper: 0.8 },

    // the floor and the horizon
    { paper: 'M-10 268 C 90 260, 230 266, 410 258 L410 510 L-10 510 Z', fill: 'clay', rough: 1.2, anim: 'rise', at: 0.3 },
    { ink: 'M8 264 C 120 256, 270 262, 392 254', w: 5, at: 0.5 },

    // the chalk outline, drawn in one go like someone walked round the body
    { ink: smooth([[0, -24], [19, -15], [24, 2], [16, 18], [0, 23], [-18, 16], [-24, 0], [-17, -17]].map(([x, y]) => [HEAD_C[0] + x, HEAD_C[1] + y])), w: 5, color: 'bone', at: 0.8, dur: 0.4 },
    { ink: BODY, w: 5, color: 'bone', at: 1.0, dur: 1.0 },

    // the name lands
    { slot: 'name', x: 200, y: 48, size: 84, maxWidth: 350, w: 8, color: 'ink', at: 1.6 },

    // knocked off: the party hat, on its side
    { group: [
      { paper: 'M60 346 C 78 350, 90 364, 92 384 L24 404 Z', fill: 'bone' },
      { paper: 'M44 370 C 54 372, 62 382, 64 392 L52 396 C 50 388, 44 382, 36 380 Z', fill: 'terracotta', rough: 0.5 },
      { ink: 'M62 342 L22 402 L94 382', w: 4.5 },
      { ink: 'M62 342 C 80 348, 92 364, 94 382', w: 4.5 },
      { paper: 'M20 396 C 27 396, 30 402, 28 408 C 26 413, 17 414, 14 408 C 11 402, 14 396, 20 396 Z', fill: 'sky', rough: 0.5 },
    ], anim: 'drop', at: 2.3, loop: 'sway', origin: '58 380', loopAt: 3.4 },

    // a birthday candle, toppled, still smoking
    { group: [
      { paper: 'M282 390 L352 370 L357 385 L287 405 Z', fill: 'bone' },
      { ink: 'M282 392 L350 373 M287 405 L356 386 M300 383 L308 399 M322 377 L330 393', w: 3.5 },
      { ink: 'M356 379 L366 376', w: 2.5 },
    ], anim: 'drop', at: 2.6 },
    { group: [
      { ink: 'M370 372 C 382 358, 364 346, 376 332 C 388 318, 370 304, 382 290', w: 3, taper: 0.9 },
    ], anim: 'fade', at: 2.9, loop: 'drift', origin: '370 372' },
  ],
};
