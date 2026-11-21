// Player avatars: a cut-paper disc with one witty object on it.
// Shown in the lobby list, the narrator's roster and on the TV, so each one
// has to read at ~44 px. ≤ 10 ink subpaths each, entrance ≤ 1 s, one small loop.

/* ---------- helpers (return plain path strings) ---------- */

const r1 = (n) => Math.round(n * 10) / 10;

/** Wobbly 4-point blob (a hand-cut disc). radii = [r0..r3], rot in degrees. */
function blob(cx, cy, radii, rot = 0) {
  const k = 0.5523;
  const pts = radii.map((r, i) => {
    const a = ((rot + i * 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), tx: -Math.sin(a), ty: Math.cos(a), r };
  });
  let d = `M${r1(pts[0].x)} ${r1(pts[0].y)}`;
  for (let i = 0; i < 4; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % 4];
    d += ` C ${r1(p.x + p.tx * k * p.r)} ${r1(p.y + p.ty * k * p.r)}, ${r1(q.x - q.tx * k * q.r)} ${r1(q.y - q.ty * k * q.r)}, ${r1(q.x)} ${r1(q.y)}`;
  }
  return `${d} Z`;
}
const circle = (cx, cy, r) => blob(cx, cy, [r, r, r, r]);

/** Move / rotate every coordinate pair of a path (M L C Q S T Z only). */
function tf(d, { dx = 0, dy = 0, rot = 0, cx = 60, cy = 60 } = {}) {
  const a = (rot * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const tokens = d.match(/[MLCQSTZ]|-?\d*\.?\d+/g);
  let out = '';
  let x = null;
  for (const t of tokens) {
    if (/[A-Z]/.test(t)) { out += ` ${t}`; x = null; continue; }
    if (x === null) { x = Number(t); continue; }
    const y = Number(t);
    const px = cx + (x - cx) * cos - (y - cy) * sin + dx;
    const py = cy + (x - cx) * sin + (y - cy) * cos + dy;
    out += ` ${r1(px)} ${r1(py)}`;
    x = null;
  }
  return out.trim();
}
/** Misregistered print: paper sits a little off its ink line. */
const off = (d, dx = 2.5, dy = 2) => tf(d, { dx, dy });

const disc = (fill, radii, rot) => ({ paper: blob(60, 60, radii, rot), fill, rough: 0.8, anim: 'grow', at: 0 });

/* ---------- the doodles ---------- */

// Fedora, tipped low; two eyes watch from under the brim.
const fedora = (() => {
  const R = { rot: -9, cx: 60, cy: 58 };
  const crown = 'M38 64 C 37 50, 40 38, 46 33 C 52 30, 55 37, 60 37 C 65 37, 69 30, 75 33 C 81 38, 83 50, 82 64';
  const brim = 'M18 67 C 30 59, 46 62, 60 62 C 74 62, 90 59, 102 67 C 94 76, 76 75, 60 75 C 44 75, 26 76, 18 67';
  return {
    id: 'av-fedora',
    title: 'Fedora',
    viewBox: '0 0 120 120',
    tile: null,
    layers: [
      disc('terracotta', [51, 48, 52, 49], 10),
      { paper: off(tf(`${crown} Z`, R)), fill: 'bone', anim: 'pop', at: 0.15 },
      { paper: off(tf(`${brim} Z`, R)), fill: 'bone', anim: 'pop', at: 0.2 },
      { paper: tf('M38 55 C 50 58, 70 58, 82 55 L82 63 C 70 66, 50 66, 38 63 Z', R), fill: 'ink', anim: 'fade', at: 0.55 },
      { ink: `${tf(crown, R)} ${tf(brim, R)} ${tf('M55 37 C 57 42, 62 42, 65 37', R)}`, w: 4, at: 0.25, dur: 0.5 },
      {
        group: [
          { paper: 'M38 89 C 42 82, 52 82, 56 89 C 52 95, 42 95, 38 89 Z', fill: 'bone' },
          { paper: 'M63 89 C 67 82, 77 82, 81 89 C 77 95, 67 95, 63 89 Z', fill: 'bone' },
          { paper: circle(50.5, 89, 3.4), fill: 'ink' },
          { paper: circle(75.5, 89, 3.4), fill: 'ink' },
        ],
        loop: 'blink', origin: '59 89', anim: 'fade', at: 0.75, loopAt: 1.2,
      },
    ],
  };
})();

// Party hat, jaunty, with confetti.
const partyHat = (() => {
  const R = { rot: 12, cx: 60, cy: 70 };
  const cone = 'M38 88 C 46 68, 54 48, 62 28 C 68 48, 76 68, 84 88';
  return {
    id: 'av-party-hat',
    title: 'Party hat',
    viewBox: '0 0 120 120',
    tile: null,
    layers: [
      disc('periwinkle', [49, 52, 48, 51], 30),
      { paper: 'M22 42 L31 36 L34 45 Z', fill: 'candle', anim: 'pop', at: 0.7 },
      { paper: 'M86 28 L96 31 L91 40 Z', fill: 'bone', anim: 'pop', at: 0.75 },
      { paper: 'M96 64 L102 60 L104 67 L98 69 Z', fill: 'terracotta', anim: 'pop', at: 0.8 },
      { paper: 'M18 70 L26 65 L29 74 Z', fill: 'bone', anim: 'pop', at: 0.85 },
      {
        group: [
          { paper: off(tf(`${cone} C 70 94, 50 94, 38 88 Z`, R)), fill: 'candle' },
          { paper: off(tf('M47 66 C 56 71, 68 71, 76 66 L79 74 C 68 80, 54 80, 44 74 Z', R)), fill: 'terracotta' },
          { paper: off(tf(circle(62, 24, 7), R)), fill: 'bone' },
          { ink: `${tf(cone, R)} ${tf('M36 88 C 50 95, 72 95, 86 88', R)} ${tf('M52 50 C 57 54, 66 54, 71 49', R)} ${tf(circle(62, 23, 6.5), R)}`, w: 4, at: 0.25, dur: 0.55 },
        ],
        loop: 'sway', origin: '60 92', anim: 'pop', at: 0.15, loopAt: 1,
      },
    ],
  };
})();

// A slice of birthday cake, one candle.
const cake = {
  id: 'av-cake',
  title: 'Slice of cake',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('sage', [50, 49, 52, 48], 60),
    { paper: off('M22 66 L74 47 L98 59 Z'), fill: 'bone', anim: 'pop', at: 0.15 },
    { paper: off('M22 66 L98 59 L98 89 L22 91 Z'), fill: 'bone', anim: 'pop', at: 0.18 },
    { paper: off('M22 75 L98 70 L98 77 L22 82 Z'), fill: 'terracotta', anim: 'fade', at: 0.4 },
    { ink: 'M22 66 L74 47 L98 59 M22 66 L98 59 L98 89 M22 65 L22 91 L98 89', w: 4, at: 0.25, dur: 0.5 },
    { ink: 'M26 68 C 30 74, 35 74, 38 67 C 42 74, 48 74, 52 66 C 56 72, 62 72, 66 65', w: 3, at: 0.6, dur: 0.2 },
    { ink: 'M67 55 L67 34', w: 4.5, at: 0.7, dur: 0.12 },
    { group: [{ paper: 'M67 18 C 61 25, 61 31, 67 31 C 73 31, 73 25, 67 18 Z', fill: 'candle' }], loop: 'flicker', origin: '67 31', anim: 'pop', at: 0.85 },
  ],
};

// Pine tree in a party hat: even the woods came to the birthday.
const pine = (() => {
  const left = 'M60 32 C 56 40, 50 47, 41 52 C 46 54, 51 54, 53 53 C 49 61, 42 68, 33 73 C 39 75, 45 75, 47 74 C 43 82, 36 89, 27 94 L60 94';
  const right = 'M60 32 C 64 40, 70 47, 79 52 C 74 54, 70 54, 67 53 C 71 61, 78 68, 87 73 C 81 75, 76 75, 73 74 C 77 82, 84 89, 93 94 L60 94';
  const hat = 'M50 35 L63 10 L69 31';
  return {
    id: 'av-pine',
    title: 'Pine tree in a party hat',
    viewBox: '0 0 120 120',
    tile: null,
    layers: [
      disc('stone', [52, 49, 50, 48], 20),
      { paper: 'M22 46 L30 41 L32 49 Z', fill: 'terracotta', anim: 'pop', at: 0.8 },
      { paper: 'M90 38 L99 41 L94 48 Z', fill: 'periwinkle', anim: 'pop', at: 0.85 },
      { paper: 'M94 62 L101 60 L101 67 Z', fill: 'candle', anim: 'pop', at: 0.9 },
      {
        group: [
          { paper: off(`${left} L93 94 C 84 89, 77 82, 73 74 C 76 75, 81 75, 87 73 C 78 68, 71 61, 67 53 C 70 54, 74 54, 79 52 C 70 47, 64 40, 60 32 Z`), fill: 'sage' },
          { ink: `${left} ${right} M60 94 L60 105`, w: 4, at: 0.25, dur: 0.5 },
          {
            group: [
              { paper: off('M50 35 L63 10 L69 31 C 63 35, 56 36, 50 35 Z', 2, 1.5), fill: 'periwinkle' },
              { paper: off('M54.5 26 L66 22 L67.5 26.5 C 63 28.5, 57 29.5, 52.5 30 Z', 2, 1.5), fill: 'candle' },
              { paper: circle(63.5, 9, 4.5), fill: 'candle' },
              { ink: hat, w: 3.5, at: 0.75, dur: 0.15 },
            ],
            anim: 'drop', at: 0.7,
          },
        ],
        loop: 'sway', origin: '60 105', anim: 'rise', at: 0.15, loopAt: 1,
      },
    ],
  };
})();

// Crescent moon with one eye open: who's awake?
const moon = {
  id: 'av-moon',
  title: 'Moon with one eye open',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('sky', [50, 52, 48, 51], 45),
    { paper: off('M74 26 C 46 20, 24 40, 24 62 C 24 85, 46 101, 74 94 C 56 88, 48 76, 48 60 C 48 46, 56 33, 74 26 Z'), fill: 'bone', anim: 'pop', at: 0.15 },
    { ink: 'M74 26 C 46 20, 24 40, 24 62 C 24 85, 46 101, 74 94 M74 94 C 56 88, 48 76, 48 60 C 48 46, 56 33, 74 26', w: 4, at: 0.25, dur: 0.5 },
    { paper: 'M86 36 L88 42 L94 44 L88 46 L86 52 L84 46 L78 44 L84 42 Z', fill: 'candle', anim: 'pop', at: 0.8 },
    { paper: 'M92 70 L93.5 74 L97 75.5 L93.5 77 L92 81 L90.5 77 L87 75.5 L90.5 74 Z', fill: 'candle', anim: 'pop', at: 0.88 },
    {
      group: [
        { paper: 'M27 60 C 31 53, 41 53, 45 60 C 41 66, 31 66, 27 60 Z', fill: 'bone' },
        { ink: 'M27 60 C 31 53, 41 53, 45 60 C 41 66, 31 66, 27 60', w: 3, at: 0.7, dur: 0.2 },
        { paper: circle(39.5, 60, 3.3), fill: 'ink' },
      ],
      loop: 'blink', origin: '36 59', anim: 'fade', at: 0.7, loopAt: 1.4,
    },
    { ink: 'M28 50 C 33 48, 39 47.5, 44 49', w: 3, at: 0.9, dur: 0.1 },
  ],
};

// Teacup whose steam asks a question.
const teacup = {
  id: 'av-teacup',
  title: 'Teacup with question-mark steam',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('sand', [51, 48, 50, 52], 70),
    { paper: off('M32 64 C 32 80, 42 90, 55 90 C 68 90, 78 80, 78 64 C 78 58, 32 58, 32 64 Z'), fill: 'periwinkle', anim: 'pop', at: 0.15 },
    { paper: 'M37 64 C 37 61, 73 61, 73 64 C 73 67, 37 67, 37 64 Z', fill: 'bone', anim: 'fade', at: 0.45 },
    { paper: off('M24 91 C 40 98, 72 98, 88 91 C 80 87, 32 87, 24 91 Z'), fill: 'sage', anim: 'pop', at: 0.2 },
    { ink: 'M32 64 C 32 58, 78 58, 78 64 C 78 70, 32 70, 32 64 M32 65 C 32 80, 42 90, 55 90 C 68 90, 78 80, 78 65 M78 68 C 91 65, 91 82, 73 82 M22 91 C 40 99, 72 99, 90 91', w: 4, at: 0.25, dur: 0.55 },
    {
      group: [{ ink: 'M47 31 C 46 20, 66 18, 66 28 C 66 35, 56 36, 57 44 M57 50.5 L57.5 52', w: 3.5, at: 0.75, dur: 0.25 }],
      loop: 'drift', origin: '57 50', anim: 'fade', at: 0.75,
    },
  ],
};

// Old cabin key; the hole in the bow is a heart.
const key = (() => {
  const R = { rot: 30, cx: 60, cy: 60 };
  const bow = circle(30, 60, 17);
  const heart = 'M30 69 C 20 62, 20.5 52, 25.5 52 C 28 52, 30 54.5, 30 56.5 C 30 54.5, 32 52, 34.5 52 C 39.5 52, 40 62, 30 69 Z';
  const blade = 'M46 56 L102 56 L102 64 L99 64 L99 73 L93 73 L93 79 L86 79 L86 64 L46 64 Z';
  return {
    id: 'av-key',
    title: 'Old key with a heart',
    viewBox: '0 0 120 120',
    tile: null,
    layers: [
      disc('candle', [49, 51, 50, 48], 15),
      {
        group: [
          { paper: off(tf(bow, R)), fill: 'bone' },
          { paper: off(tf(blade, R)), fill: 'bone' },
          { paper: tf(heart, R), fill: 'terracotta' },
          { ink: `${tf(bow, R)} ${tf('M46 56 L102 56 L102 64', R)} ${tf('M46 64 L86 64 L86 79 L93 79 L93 73 L99 73 L99 64.5', R)} ${tf('M53 51 L53 69', R)}`, w: 4, at: 0.25, dur: 0.55 },
          { ink: tf(heart, R), w: 3, at: 0.8, dur: 0.15 },
        ],
        loop: 'sway', origin: '60 60', anim: 'pop', at: 0.15, loopAt: 1,
      },
    ],
  };
})();

// Quill signing in red.
const quill = {
  id: 'av-quill',
  title: 'Quill signing in red',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('sand', [48, 51, 50, 49], 50),
    { ink: 'M18 96 C 26 88, 30 100, 38 94 C 44 89, 46 98, 52 95 C 58 92, 62 98, 72 94', w: 3, color: 'blood', at: 0.75, dur: 0.25 },
    {
      group: [
        { paper: off('M42 82 C 38 60, 58 30, 92 18 C 88 44, 70 70, 46 86 Z'), fill: 'terracotta' },
        { ink: 'M42 82 C 38 60, 58 30, 92 18 C 88 44, 70 70, 46 86 M30 98 C 48 74, 66 48, 90 20 M49 54 L56 60 M70 50 L74 57', w: 3.5, at: 0.2, dur: 0.55 },
      ],
      loop: 'sway', origin: '30 98', anim: 'pop', at: 0.15, loopAt: 1,
    },
  ],
};

// Spotted mushroom with a cabin door. (Edible? Who's to say.)
const mushroom = {
  id: 'av-mushroom',
  title: 'Mushroom house',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('candle', [50, 48, 51, 49], 80),
    { paper: off('M46 66 C 44 80, 42 90, 40 97 L80 97 C 78 90, 76 80, 74 66 Z'), fill: 'bone', anim: 'rise', at: 0.15 },
    {
      group: [
        { paper: off('M22 64 C 22 36, 42 22, 60 22 C 78 22, 98 36, 98 64 C 80 71, 40 71, 22 64 Z'), fill: 'terracotta' },
        { paper: blob(44, 42, [6.5, 5.5, 6, 6], 20), fill: 'bone' },
        { paper: blob(68, 34, [5, 4.5, 5, 4], 0), fill: 'bone' },
        { paper: blob(82, 52, [4, 4.5, 3.5, 4], 40), fill: 'bone' },
        { paper: blob(34, 58, [3, 3, 3.5, 3], 0), fill: 'bone' },
        { ink: 'M22 64 C 22 36, 42 22, 60 22 C 78 22, 98 36, 98 64 M22 64 C 40 71, 80 71, 98 64', w: 4, at: 0.25, dur: 0.4 },
      ],
      loop: 'breathe', origin: '60 68', anim: 'drop', at: 0.2, loopAt: 1,
    },
    { ink: 'M46 69 C 44 80, 42 90, 40 97 M74 69 C 76 80, 78 90, 80 97 M28 98 C 50 101, 70 101, 92 98', w: 4, at: 0.55, dur: 0.3 },
    { ink: 'M54 98 L54 87 C 54 80, 66 80, 66 87 L66 98', w: 3, at: 0.85, dur: 0.15 },
  ],
};

// Lantern, candle inside.
const lantern = {
  id: 'av-lantern',
  title: 'Lantern',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('periwinkle', [51, 49, 52, 48], 5),
    { paper: circle(60, 62, 33), fill: 'bone', opacity: 0.3, anim: 'grow', at: 0.5 },
    { paper: off('M48 38 C 44 52, 44 70, 48 84 L72 84 C 76 70, 76 52, 72 38 Z'), fill: 'candle', anim: 'pop', at: 0.15 },
    { paper: off('M40 37 C 46 27, 74 27, 80 37 Z'), fill: 'ink', anim: 'pop', at: 0.2 },
    { ink: 'M51 28 C 50 12, 70 12, 69 28 M48 38 C 44 52, 44 70, 48 84 M72 38 C 76 52, 76 70, 72 84 M40 87 L80 87 M40 37 L80 37 M60 74 L60 68', w: 4, at: 0.25, dur: 0.55 },
    {
      group: [
        { paper: 'M60 46 C 52 56, 52 68, 60 68 C 68 68, 68 56, 60 46 Z', fill: 'terracotta' },
        { paper: 'M60 56 C 56 61, 56 67, 60 67 C 64 67, 64 61, 60 56 Z', fill: 'bone' },
      ],
      loop: 'flicker', origin: '60 68', anim: 'pop', at: 0.8,
    },
  ],
};

// Owl giving a sideways look.
const owl = {
  id: 'av-owl',
  title: 'Suspicious owl',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('clay', [50, 52, 49, 50], 35),
    { paper: off('M36 28 L45 39 C 53 35, 67 35, 75 39 L84 28 C 89 44, 91 56, 89 70 C 87 88, 75 98, 60 98 C 45 98, 33 88, 31 70 C 29 56, 31 44, 36 28 Z'), fill: 'bone', anim: 'pop', at: 0.15 },
    { ink: 'M36 28 L45 39 C 53 35, 67 35, 75 39 L84 28 C 89 44, 91 56, 89 70 C 87 88, 75 98, 60 98 C 45 98, 33 88, 31 70 C 29 56, 31 44, 36 28', w: 4, at: 0.25, dur: 0.45 },
    {
      group: [
        { paper: circle(47, 57, 10.5), fill: 'candle' },
        { paper: circle(73, 57, 10.5), fill: 'candle' },
        { ink: `${circle(47, 56, 10)} ${circle(73, 56, 10)}`, w: 3.5, at: 0.55, dur: 0.25 },
        { paper: 'M38 47 L56 50 L56 54 L38 52 Z', fill: 'ink' },
        { paper: circle(52, 58, 3.6), fill: 'ink' },
        { paper: circle(78, 58, 3.6), fill: 'ink' },
      ],
      loop: 'blink', origin: '60 57', anim: 'fade', at: 0.55, loopAt: 1.3,
    },
    { paper: 'M56 68 L64 68 L60 76 Z', fill: 'terracotta', anim: 'pop', at: 0.8 },
    { ink: 'M50 83 L54 87 L58 83 M62 83 L66 87 L70 83', w: 3, at: 0.85, dur: 0.15 },
  ],
};

// Magnifying glass over a fingerprint.
const magnifier = {
  id: 'av-magnifier',
  title: 'Magnifying glass over a fingerprint',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('stone', [49, 50, 52, 48], 65),
    {
      group: [
        { paper: 'M65 71 L71 65 L96 90 C 98 94, 94 98, 90 96 Z', fill: 'ink' },
        { paper: off(circle(50, 50, 24)), fill: 'bone' },
        { ink: `${circle(50, 50, 24)} M67 67 L72 72`, w: 4.5, at: 0.2, dur: 0.4 },
        { ink: 'M37 62 C 34 44, 46 36, 54 38 C 62 40, 66 48, 64 60 M43 64 C 41 52, 46 45, 52 45 C 58 45, 60 52, 59 62 M49 64 C 48 56, 50 52, 52 52 C 54 52, 55 56, 54 62', w: 3, at: 0.6, dur: 0.3 },
      ],
      loop: 'float', origin: '60 60', anim: 'pop', at: 0.15, loopAt: 1,
    },
  ],
};

// Rubber duck, bobbing.
const duck = {
  id: 'av-duck',
  title: 'Rubber duck',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('sky', [52, 49, 50, 50], 85),
    {
      group: [
        { paper: off('M33 45 C 26 42, 20 44, 16 49 C 22 54, 30 53, 35 51 Z', 1.5, 1.5), fill: 'terracotta' },
        { paper: off('M57 58 C 66 52, 63 31, 47 31 C 35 31, 30 44, 34 52 C 35 55, 36 57, 36 58 C 26 62, 26 84, 46 86 L76 86 C 88 86, 96 76, 94 60 C 88 66, 80 66, 72 62 C 66 60, 61 60, 57 58 Z'), fill: 'candle' },
        { ink: 'M57 58 C 66 52, 63 31, 47 31 C 35 31, 30 44, 34 52 C 35 55, 36 57, 36 58 C 26 62, 26 84, 46 86 L76 86 C 88 86, 96 76, 94 60 C 88 66, 80 66, 72 62 C 66 60, 61 60, 57 58 M33 45 C 26 42, 20 44, 16 49 C 22 54, 30 53, 35 51 M57 70 C 63 78, 75 78, 82 68 M44 42 L45 43.5', w: 4, at: 0.2, dur: 0.6 },
      ],
      loop: 'bob', origin: '60 86', anim: 'rise', at: 0.15, loopAt: 1,
    },
    { ink: 'M14 91 C 24 86, 34 95, 44 91 C 54 87, 64 95, 74 91 C 84 87, 94 95, 106 91', w: 3, color: 'bone', at: 0.75, dur: 0.2 },
  ],
};

// Pocket watch stopped just before midnight.
const watch = {
  id: 'av-watch',
  title: 'Pocket watch at midnight',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('terracotta', [50, 51, 48, 52], 25),
    { ink: 'M55 25 C 40 16, 24 22, 18 38', w: 3, at: 0.8, dur: 0.15 },
    {
      group: [
        { paper: off(circle(60, 66, 26)), fill: 'bone' },
        { ink: `${circle(60, 66, 26)} M60 40 L60 34 M54 29 C 54 21, 66 21, 66 29 C 66 33, 54 33, 54 29`, w: 4, at: 0.2, dur: 0.45 },
        { paper: circle(60, 46, 2), fill: 'ink' },
        { paper: circle(80, 66, 2), fill: 'ink' },
        { paper: circle(60, 86, 2), fill: 'ink' },
        { paper: circle(40, 66, 2), fill: 'ink' },
        { ink: 'M60 66 L54 54 M60 66 L58.5 49', w: 3.5, at: 0.6, dur: 0.15 },
      ],
      loop: 'sway', origin: '60 25', anim: 'drop', at: 0.15, loopAt: 1,
    },
  ],
};

// Ace of spades.
const card = (() => {
  const R = { rot: 9, cx: 60, cy: 62 };
  const back = 'M42 30 L82 30 C 85 30, 86 31, 86 34 L86 88 C 86 91, 85 92, 82 92 L42 92 C 39 92, 38 91, 38 88 L38 34 C 38 31, 39 30, 42 30 Z';
  return {
    id: 'av-card',
    title: 'Ace of spades',
    viewBox: '0 0 120 120',
    tile: null,
    layers: [
      disc('sage', [50, 48, 51, 50], 40),
      { paper: off(tf(back, { rot: -14, cx: 60, cy: 62, dx: -6 })), fill: 'terracotta', anim: 'pop', at: 0.1 },
      { ink: tf(back, { rot: -14, cx: 60, cy: 62, dx: -6 }), w: 3, at: 0.2, dur: 0.25 },
      {
        group: [
          { paper: off(tf(back, R)), fill: 'bone' },
          { ink: tf(back, R), w: 3.5, at: 0.4, dur: 0.35 },
          { paper: tf('M62 44 C 54 54, 46 60, 50 68 C 53 73, 58 72, 60 68 L57 78 L67 78 L64 68 C 66 72, 71 73, 74 68 C 78 60, 70 54, 62 44 Z', R), fill: 'ink' },
          { ink: `${tf('M44 46 L47.5 37 L51 46', R)} ${tf('M45.5 42.5 L49.5 42.5', R)}`, w: 3, at: 0.75, dur: 0.15 },
        ],
        loop: 'float', origin: '60 62', anim: 'slide-r', at: 0.35, loopAt: 1,
      },
    ],
  };
})();

// Wine glass with one drip down the side.
const wine = {
  id: 'av-wine',
  title: 'Glass of red wine',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [
    disc('clay', [48, 50, 51, 50], 55),
    {
      group: [
        { paper: off('M42 30 C 40 50, 46 66, 60 68 C 74 66, 80 50, 78 30 Z'), fill: 'bone' },
        { paper: off('M43 45 C 52 49, 68 41, 77 45 C 76 58, 70 66, 60 67 C 50 66, 44 58, 43 45 Z', 1.5, 1.5), fill: 'blood' },
        { paper: 'M79 30 C 83 33, 85 39, 85 46 C 88 49, 87.5 55, 84 55.5 C 80.5 56, 79.5 50, 82.5 46.5 C 82.5 40, 81.5 35, 79 30 Z', fill: 'blood' },
        { ink: 'M42 30 C 40 50, 46 66, 60 68 C 74 66, 80 50, 78 30 M42 30 C 42 26, 78 26, 78 30 C 78 34, 42 34, 42 30 M60 68 L60 93 M45 95 C 54 90, 66 90, 75 95 M44 45 C 52 49, 68 41, 76 45', w: 4, at: 0.2, dur: 0.55 },
      ],
      loop: 'sway', origin: '60 95', anim: 'pop', at: 0.15, loopAt: 1,
    },
  ],
};

export default [fedora, cake, partyHat, owl, moon, key, teacup, pine, lantern, quill, mushroom, magnifier, watch, card, duck, wine];
