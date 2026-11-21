// "Mafia, open your eyes and choose."
// Three fedoras huddle under the moon. Only their eyes show, all sliding the same way,
// following a pale hand that points out of the dark over a blood-red print.

const r1 = (v) => Math.round(v * 10) / 10;

// a figure in a fedora, front on: crown with a pinch, wide brim, face in shadow, shoulders
function fedora(cx, top, s, tilt = 0) {
  const P = (x, y) => `${r1(cx + (x + Math.min(0, y - 88) * tilt) * s)} ${r1(top + y * s - (y < 88 ? x * tilt * 0.5 * s : 0))}`;
  return [
    `M${P(-150, 400)}`,
    `C ${P(-142, 250)}, ${P(-120, 196)}, ${P(-62, 178)}`, // left shoulder
    `C ${P(-34, 170)}, ${P(-24, 160)}, ${P(-22, 140)}`, // neck
    `C ${P(-34, 128)}, ${P(-40, 108)}, ${P(-40, 88)}`, // jaw / cheek
    `L${P(-62, 88)}`,
    `C ${P(-92, 86)}, ${P(-100, 74)}, ${P(-86, 68)}`, // brim left tip
    `C ${P(-70, 64)}, ${P(-56, 64)}, ${P(-46, 64)}`,
    `C ${P(-46, 40)}, ${P(-42, 14)}, ${P(-30, 4)}`, // crown left
    `C ${P(-20, -2)}, ${P(-8, 6)}, ${P(0, 18)}`, // the pinch
    `C ${P(8, 4)}, ${P(22, -4)}, ${P(34, 4)}`,
    `C ${P(44, 14)}, ${P(46, 40)}, ${P(46, 64)}`, // crown right
    `C ${P(58, 64)}, ${P(74, 62)}, ${P(88, 66)}`,
    `C ${P(102, 72)}, ${P(94, 86)}, ${P(64, 88)}`, // brim right tip
    `L${P(40, 88)}`,
    `C ${P(40, 108)}, ${P(34, 128)}, ${P(22, 140)}`,
    `C ${P(24, 160)}, ${P(34, 170)}, ${P(62, 178)}`,
    `C ${P(120, 196)}, ${P(142, 250)}, ${P(150, 400)}`,
    'Z',
  ].join(' ');
}

// the hat band, same frame as fedora()
function band(cx, top, s, tilt = 0) {
  const P = (x, y) => `${r1(cx + (x + Math.min(0, y - 88) * tilt) * s)} ${r1(top + y * s - (y < 88 ? x * tilt * 0.5 * s : 0))}`;
  return `M${P(-47, 50)} C ${P(-20, 54)}, ${P(20, 54)}, ${P(47, 50)} L${P(47, 64)} C ${P(20, 68)}, ${P(-20, 68)}, ${P(-47, 64)} Z`;
}

// moonlight on the top of the brim, left side, and a nick on the crown
function shine(cx, top, s, tilt = 0) {
  const P = (x, y) => `${r1(cx + (x + Math.min(0, y - 88) * tilt) * s)} ${r1(top + y * s - (y < 88 ? x * tilt * 0.5 * s : 0))}`;
  return `M${P(-90, 70)} C ${P(-76, 64)}, ${P(-60, 63)}, ${P(-48, 64)} M${P(-40, 30)} C ${P(-38, 20)}, ${P(-34, 12)}, ${P(-28, 7)}`;
}

// an almond eye at (x, y), pupil slid to the right
const almond = (x, y, s) =>
  `M${r1(x - 13 * s)} ${y} C ${r1(x - 6 * s)} ${r1(y - 8 * s)}, ${r1(x + 6 * s)} ${r1(y - 8 * s)}, ${r1(x + 13 * s)} ${r1(y - 1 * s)} C ${r1(x + 6 * s)} ${r1(y + 7 * s)}, ${r1(x - 6 * s)} ${r1(y + 7 * s)}, ${r1(x - 13 * s)} ${y} Z`;
const pupil = (x, y, s) => {
  const px = x + 6 * s;
  const r = 4.6 * s;
  return `M${r1(px)} ${r1(y - r)} C ${r1(px + r * 1.3)} ${r1(y - r)}, ${r1(px + r * 1.3)} ${r1(y + r)}, ${r1(px)} ${r1(y + r)} C ${r1(px - r * 1.3)} ${r1(y + r)}, ${r1(px - r * 1.3)} ${r1(y - r)}, ${r1(px)} ${r1(y - r)} Z`;
};
const eyes = (cx, y, s, gap, at) => ({
  group: [
    { paper: almond(cx - gap, y, s) + ' ' + almond(cx + gap, y, s), fill: 'bone', rough: 0.4 },
    { paper: pupil(cx - gap, y, s) + ' ' + pupil(cx + gap, y, s), fill: 'ink', rough: 0.2 },
  ],
  anim: 'unfold',
  at,
  origin: `${cx} ${y}`,
});

export default {
  id: 'mafia-wake',
  title: 'Mafia wakes: three figures in fedoras huddle under the moon, eyes open in the dark, all glancing toward a pale hand pointing over a blood-red print',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    { paper: 'M150 40 C 206 38, 248 82, 246 136 C 244 190, 202 230, 148 228 C 94 226, 54 184, 56 130 C 58 78, 98 42, 150 40 Z', fill: 'sky', anim: 'grow', at: 0.1, origin: '150 134' },
    { ink: 'M50 104 C 66 62, 106 34, 156 32 C 206 32, 244 62, 256 104', w: 3.5, color: 'bone', at: 0.3, taper: 0.8 },

    // the huddle: back two in dusk, the one in front in ink
    { paper: fedora(78, 212, 0.78, -0.14), fill: 'dusk', rough: 0.8, anim: 'rise', at: 0.5 },
    { group: [{ paper: fedora(328, 200, 0.8, 0.12), fill: 'dusk', rough: 0.8 }], anim: 'rise', at: 0.65, loop: 'breathe', origin: '328 500', loopAt: 3 },
    { paper: fedora(206, 150, 1.02, 0.07), fill: 'ink', rough: 0.8, anim: 'rise', at: 0.8 },
    { paper: band(78, 212, 0.78, -0.14) + ' ' + band(328, 200, 0.8, 0.12), fill: 'night', rough: 0.4, anim: 'fade', at: 0.9 },
    { paper: band(206, 150, 1.02, 0.07), fill: 'dusk', rough: 0.4, anim: 'fade', at: 1.0 },

    // moonlight catching the brims and crowns
    { ink: shine(206, 150, 1.02, 0.07), w: 3, color: 'bone', at: 1.1, taper: 0.9 },
    { ink: shine(78, 212, 0.78, -0.14) + ' ' + shine(328, 200, 0.8, 0.12), w: 2.5, color: 'bone', at: 1.25, taper: 0.9 },

    // eyes open, one pair after another
    { ...eyes(206, 252, 1.15, 22, 1.4), loop: 'blink', loopAt: 3.6 },
    eyes(78, 290, 0.85, 17, 1.6),
    eyes(328, 278, 0.88, 17, 1.75),
    { ink: 'M178 241 C 186 236, 196 238, 202 243 M210 243 C 218 236, 228 236, 236 241', w: 3, color: 'bone', at: 1.9 },

    // the choice
    { blob: 'M222 288 C 266 286, 296 316, 294 352 C 292 390, 262 412, 222 410 C 180 408, 152 380, 154 346 C 156 312, 184 290, 222 288 Z', fill: 'blood', anim: 'grow', at: 2.0, origin: '224 350' },
    { group: [
      { paper: 'M18 326 L76 320 L84 374 L22 384 Z', fill: 'ink', rough: 0.6 },
      { paper: 'M72 318 L98 316 L104 374 L80 378 Z', fill: 'bone', rough: 0.7 },
      { paper: 'M104 322 C 130 316, 160 312, 176 313 L256 316 C 274 317, 276 338, 258 338 L188 340 C 200 352, 198 366, 186 368 C 196 376, 192 390, 178 390 C 184 398, 176 408, 162 406 C 140 404, 120 396, 104 384 Z', fill: 'bone', rough: 0.8 },
      { ink: 'M102 318 C 128 312, 154 308, 178 309 L250 311 C 268 312, 270 333, 250 333 L186 334', w: 4.5 },
      { ink: 'M186 334 C 202 338, 202 356, 184 358 C 176 358, 170 355, 167 352', w: 4 },
      { ink: 'M182 358 C 198 364, 196 380, 178 381 C 170 381, 165 378, 162 375', w: 4 },
      { ink: 'M174 381 C 186 388, 180 400, 166 399 C 158 398, 154 396, 151 393', w: 4 },
      { ink: 'M140 330 C 158 334, 176 340, 190 344', w: 3.5 },
      { ink: 'M166 396 C 140 396, 118 388, 100 376', w: 4.5 },
      { ink: 'M220 313 C 223 319, 223 325, 220 331', w: 2.5 },
    ], anim: 'slide-l', at: 2.3, loop: 'bob', origin: '100 350', loopAt: 3.3 },
  ],
};
