// "Detective, who do you suspect?"
// A magnifying glass the size of the moon finds a trail of footprints, and below it
// the narrator's silent answer waits: a thumb up, a thumb down.

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

// a bare left footprint pointing up: sole, then five toes
const dot = (x, y, r) => `M${x} ${y - r} C ${r1(x + r * 1.3)} ${y - r}, ${r1(x + r * 1.3)} ${y + r}, ${x} ${y + r} C ${r1(x - r * 1.3)} ${y + r}, ${r1(x - r * 1.3)} ${y - r}, ${x} ${y - r} Z`;
const PRINT =
  'M2 -30 C 17 -30, 21 -16, 16 -4 C 13 6, 14 16, 10 27 C 6 36, -8 36, -10 25 C -12 13, -7 3, -10 -6 C -13 -20, -11 -30, 2 -30 Z ' +
  [dot(-4, -39, 6), dot(7.5, -40.5, 4.4), dot(14.5, -36.5, 3.8), dot(19.5, -30.5, 3.2), dot(22, -23.5, 2.7)].join(' ');
// [x, y, rot, scale, right foot?]
const prints = (list) => list.map(([x, y, rot, s, right]) => place(PRINT, { x, y, rot, s, flip: !!right })).join(' ');

// a fist with the thumb up, forearm off to the left
const FIST_PAPER =
  'M-96 -26 L-24 -30 C -26 -54, -22 -72, -12 -80 C -2 -86, 10 -80, 10 -66 C 10 -54, 8 -42, 10 -32 C 34 -34, 48 -24, 46 -8 C 50 6, 46 18, 40 22 C 44 30, 42 40, 36 44 C 38 52, 30 58, 20 58 C 0 58, -30 50, -96 44 Z';
const FIST_INK = [
  'M-96 -24 C -70 -26, -44 -26, -22 -24 C -26 -50, -22 -70, -12 -78 C -4 -84, 6 -78, 6 -66 C 6 -52, 4 -40, 8 -30',
  'M8 -30 C 30 -32, 44 -22, 40 -8 C 38 0, 30 2, 10 1',
  'M30 2 C 44 4, 44 18, 30 19 L10 18',
  'M28 19 C 40 21, 40 33, 28 34 L10 33',
  'M26 34 C 36 36, 34 48, 22 48 C 6 50, -20 46, -42 42 C -60 40, -80 40, -96 40',
  'M-10 -20 C -8 -8, -2 0, 6 2',
].join(' ');
const UP = { x: 92, y: 372, s: 0.95, rot: -6 };
const DOWN = { x: 300, y: 372, s: 0.95, rot: 184 };

export default {
  id: 'detective-wake',
  title: 'The detective wakes: a magnifying glass the size of the moon finds a trail of footprints; below, a thumbs up and a thumbs down wait for the answer',
  viewBox: '0 0 400 500',
  tile: 'dusk',
  layers: [
    // the trail, small out here
    { paper: prints([[20, 300, 26, 0.62], [52, 286, 34, 0.64, 1], [62, 242, 30, 0.66], [96, 230, 40, 0.68, 1]]), fill: 'bone', rough: 0.4, anim: 'fade', at: 0.1 },

    // the glass: lens like a moon, rim, handle
    { group: [
      { paper: 'M284 232 L300 222 L364 290 C 370 300, 360 312, 350 306 L282 244 Z', fill: 'clay' },
      { ink: 'M296 236 L360 300', w: 4, color: 'bone' },
      { paper: 'M206 70 C 268 68, 314 116, 312 176 C 310 236, 264 280, 202 278 C 140 276, 96 230, 98 170 C 100 112, 146 72, 206 70 Z', fill: 'sky' },
      // seen through the glass: two prints, big
      { paper: prints([[132, 240, 30, 1.1], [190, 184, 32, 1.1, 1], [200, 112, 28, 1.05]]), fill: 'dusk', rough: 0.6 },
      { ink: 'M202 66 C 266 64, 318 114, 316 176 C 314 240, 264 284, 200 282 C 136 280, 92 230, 94 168 C 96 108, 142 66, 202 66', w: 7, color: 'bone' },
      { ink: 'M128 128 C 140 108, 160 96, 182 92', w: 4, color: 'bone', taper: 0.9 },
    ], anim: 'drop', at: 0.3, loop: 'float', origin: '206 176', loopAt: 3 },

    // the answer: one thumb up, one thumb down
    { group: [
      { paper: place(FIST_PAPER, { ...UP, x: UP.x - 4, y: UP.y + 4 }), fill: 'bone' },
      { ink: place(FIST_INK, UP), w: 4.5 },
    ], anim: 'slide-r', at: 1.4, loop: 'bob', origin: '92 372', loopAt: 3.2 },
    { group: [
      { paper: place(FIST_PAPER, { ...DOWN, x: DOWN.x + 5, y: DOWN.y + 3 }), fill: 'bone' },
      { ink: place(FIST_INK, DOWN), w: 4.5 },
    ], anim: 'slide-l', at: 1.8 },
  ],
};
