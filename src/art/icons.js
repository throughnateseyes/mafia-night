// Brush-drawn UI icons, so the interface speaks the same hand as the art.
// 48-unit box, ≤ 6 ink subpaths, readable at 24 px, draw-on ≤ 0.5 s.
// Ink is `currentColor` so an icon takes the text color of the button it sits in
// (ink on paper screens, bone on night screens). Swap INK for 'ink' to pin it.

const INK = 'currentColor';
const W = 3.25;

/* ---------- helpers (return plain path strings) ---------- */

const r1 = (n) => Math.round(n * 10) / 10;

/** Rotate every coordinate pair of a path (M L C Q Z only) about (cx, cy). */
function rot(d, deg, cx = 24, cy = 24) {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  let x = null;
  return d
    .match(/[MLCQZ]|-?\d*\.?\d+/g)
    .map((t) => {
      if (/[A-Z]/.test(t)) { x = null; return t; }
      if (x === null) { x = Number(t); return ''; }
      const y = Number(t);
      const out = `${r1(cx + (x - cx) * c - (y - cy) * s)} ${r1(cy + (x - cx) * s + (y - cy) * c)}`;
      x = null;
      return out;
    })
    .filter(Boolean)
    .join(' ');
}

/** A hand-drawn ring: 4 cubic arcs with slightly uneven radii. */
function ring(cx, cy, r, wob = [0, 0, 0, 0]) {
  const k = 0.5523;
  const p = [0, 1, 2, 3].map((i) => {
    const a = (i * Math.PI) / 2 - Math.PI / 2;
    const rr = r + wob[i];
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a), tx: -Math.sin(a), ty: Math.cos(a), r: rr };
  });
  let d = `M${r1(p[0].x)} ${r1(p[0].y)}`;
  for (let i = 0; i < 4; i++) {
    const a = p[i];
    const b = p[(i + 1) % 4];
    d += ` C ${r1(a.x + a.tx * k * a.r)} ${r1(a.y + a.ty * k * a.r)}, ${r1(b.x - b.tx * k * b.r)} ${r1(b.y - b.ty * k * b.r)}, ${r1(b.x)} ${r1(b.y)}`;
  }
  return d;
}

/** Stadium (chain link) centred on cx,cy, horizontal before rotation. */
function link(cx, cy, len, h, deg) {
  const r = h / 2;
  const x0 = cx - len / 2 + r;
  const x1 = cx + len / 2 - r;
  const k = 0.5523 * r;
  const d = `M${x0} ${cy - r} L${x1} ${cy - r} C ${x1 + k} ${cy - r}, ${x1 + r} ${cy - k}, ${x1 + r} ${cy} C ${x1 + r} ${cy + k}, ${x1 + k} ${cy + r}, ${x1} ${cy + r} L${x0} ${cy + r} C ${x0 - k} ${cy + r}, ${x0 - r} ${cy + k}, ${x0 - r} ${cy} C ${x0 - r} ${cy - k}, ${x0 - k} ${cy - r}, ${x0} ${cy - r} Z`;
  return rot(d, deg, cx, cy);
}

/** Build an icon: one or more ink passes, drawn on back to back within ~0.4 s. */
function icon(id, title, passes, extra = []) {
  let t = 0.02;
  const layers = [];
  for (const p of passes) {
    const n = p.d.trim().split(/(?=M)/).length;
    const dur = p.dur ?? Math.min(0.3, 0.1 + n * 0.05);
    layers.push({ ink: p.d, w: p.w ?? W, color: INK, at: r1(t * 100) / 100, dur, taper: p.taper ?? 0.5 });
    t += dur * 0.85;
  }
  layers.push(...extra.map((e) => ({ at: Math.min(0.3, r1(t * 100) / 100), anim: 'pop', ...e })));
  return { id: `icon-${id}`, title, viewBox: '0 0 48 48', tile: null, layers };
}

const dot = (cx, cy, r, more = {}) => ({ paper: ring(cx, cy, r), fill: INK, rough: 0.3, ...more });

/* ---------- the set ---------- */

export default {
  close: icon('close', 'Close', [{ d: 'M13 12 C 20 19, 28 28, 36 36 M36 12 C 28 19, 20 28, 12 36', taper: 0.35 }]),

  rules: icon('rules', 'Rules', [
    { d: 'M24 14 C 19 10, 12 10, 7 12 L7 37 C 12 35, 19 35, 24 38 M24 14 C 29 10, 36 10, 41 12 L41 37 C 36 35, 29 35, 24 38' },
    { d: 'M24 14 L24 38', w: 3 },
  ]),

  eye: icon(
    'eye',
    'Peek',
    [
      { d: 'M5 24 C 13 13, 35 13, 43 24 C 35 35, 13 35, 5 24' },
      { d: ring(24, 24, 6.5, [0.4, -0.3, 0.2, 0]), w: 3 },
    ],
    [dot(24, 24, 2.6)],
  ),

  'eye-closed': icon('eye-closed', 'Eyes closed', [
    { d: 'M5 21 C 13 32, 35 32, 43 21' },
    { d: 'M13 28 L10 34 M24 31 L24 38 M35 28 L38 34', w: 3 },
  ]),

  check: icon('check', 'Done', [{ d: 'M8 25 C 12 28, 16 32, 19 37 C 24 27, 31 17, 41 9', w: 3.5 }]),

  skull: icon(
    'skull',
    'Dead',
    [
      { d: 'M24 7 C 33 7, 39 13, 39 21 C 39 26, 37 29, 34 31 L34 38 C 34 40, 32 41, 30 41 L18 41 C 16 41, 14 40, 14 38 L14 31 C 11 29, 9 26, 9 21 C 9 13, 15 7, 24 7' },
      { d: 'M22 29 L24 26 L26 29 M20.5 41 L20.5 36 M27.5 41 L27.5 36', w: 3 },
    ],
    [
      { paper: 'M14 21 C 14 17, 22 17, 21.5 21.5 C 21 25, 14 25, 14 21 Z', fill: INK, rough: 0.3 },
      { paper: 'M26.5 21.5 C 26 17, 34 17, 34 21 C 34 25, 27 25, 26.5 21.5 Z', fill: INK, rough: 0.3 },
    ],
  ),

  moon: icon('moon', 'Night', [{ d: 'M30 7 C 17 7, 8 16, 8 27 C 8 36, 16 42, 27 42 C 33 42, 37 39.5, 40 35.5 C 26 38, 18 22, 30 7' }]),

  sun: icon('sun', 'Day', [
    { d: 'M5 36 C 18 35, 30 36.5, 43 35.5 M14 35.5 C 14 29, 18.5 24, 24 24 C 29.5 24, 34 29, 34 35.5' },
    { d: 'M24 9 L24 17 M10.5 16 L15 21 M37.5 16 L33 21', w: 3, taper: 0.3 },
  ]),

  hand: icon('hand', 'Raise your hand to vote', [
    { d: 'M17 28 L17 12.5 C 17 9.5, 21.5 9.5, 21.5 12.5 L21.5 24 M21.5 13 L21.5 9 C 21.5 5.5, 26 5.5, 26 9 L26 24 M26 12 L26 11 C 26 7.5, 30.5 7.5, 30.5 11 L30.5 25 M30.5 17 C 30.5 13, 35 13, 35 17 L35 31 C 35 38, 31 43, 25 43 C 19 43, 16 40, 13 35 C 11 32, 9 29, 7.5 27 C 6.5 24.5, 9.5 22.5, 12 24.5 L17 29' },
  ]),

  'arrow-right': icon('arrow-right', 'Next', [{ d: 'M7 24.5 C 17 23.5, 28 24, 39 24 M28 13 C 32 17, 36 21, 40.5 24 C 36 27, 32 31, 28 35.5' }]),

  'arrow-left': icon('arrow-left', 'Back', [{ d: 'M41 24.5 C 31 23.5, 20 24, 9 24 M20 13 C 16 17, 12 21, 7.5 24 C 12 27, 16 31, 20 35.5' }]),

  qr: icon(
    'qr',
    'QR code',
    [
      { d: 'M7 7 L20 7 L20 20 L7 20 Z M28 7 L41 7 L41 20 L28 20 Z M7 28 L20 28 L20 41 L7 41 Z', w: 3 },
      { d: 'M28 28 L28 41 M34 28 L41 28 L41 34 M34 34.5 L34 41 L41 41', w: 3 },
    ],
    [dot(13.5, 13.5, 2.4), dot(34.5, 13.5, 2.4), dot(13.5, 34.5, 2.4)],
  ),

  plus: icon('plus', 'Add', [{ d: 'M24 9 C 24.5 19, 23.5 29, 24 39 M9 24.5 C 19 23.5, 29 24, 39 23.5', taper: 0.25 }]),

  minus: icon('minus', 'Remove', [{ d: 'M9 24.5 C 19 23.5, 29 24, 39 23.5', taper: 0.25 }]),

  crown: icon('crown', 'Winner', [
    { d: 'M9 36 L6.5 15 L16.5 24.5 L24 10 L31.5 24.5 L41.5 15 L39 36 C 30 38, 18 38, 9 36' },
    { d: 'M10 30.5 C 19 32.5, 29 32.5, 38 30.5', w: 3 },
  ]),

  refresh: icon('refresh', 'Play again', [
    { d: 'M38.5 21 C 37 12.5, 30 8, 23.5 8 C 14.5 8.5, 8 15.5, 8 24.5 C 8.5 33.5, 15.5 40, 24.5 40 C 31 40, 36 36, 38.5 30.5' },
    { d: 'M30.5 19.5 L38.5 21.5 L41 13' },
  ]),

  users: icon('users', 'Players', [
    { d: `${ring(18, 17, 6.5, [0.3, 0, 0.2, -0.2])} M6 41 C 6 31, 30 31, 30 41`, dur: 0.25 },
    { d: 'M28 11.5 C 30 9, 33 8.5, 35 9.5 C 39 11.5, 39.5 18, 36 21 C 34.5 22.5, 32.5 23, 30.5 22.5 M33.5 28 C 39 28, 43 32, 43 38.5', w: 3 },
  ]),

  sparkle: icon('sparkle', 'Sparkle', [
    { d: 'M21 8 C 22 19, 25 22, 36 24 C 25 26, 22 29, 21 41 C 20 29, 17 26, 6 24 C 17 22, 20 19, 21 8' },
    { d: 'M38 5 L38 14 M33.5 9.5 L42.5 9.5', w: 3 },
  ]),

  knife: icon('knife', 'Mafia', [
    { d: 'M21 27 L42 6 C 43 16, 36 26, 27 33 Z' },
    { d: 'M17 23.5 L30.5 37', w: 3.5 },
  ], [{ paper: 'M21 30.5 L10 41.5 C 8 43.5, 4.5 40, 6.5 38 L17.5 27 Z', fill: INK, rough: 0.3 }]),

  heart: icon('heart', 'Heart', [
    { d: 'M24 40 C 11 31, 6 23, 7.5 16.5 C 9 10.5, 18 8, 24 15.5 C 30 8, 39 10.5, 40.5 16.5 C 42 23, 37 31, 24 40' },
  ]),

  lock: icon('lock', 'Locked', [
    { d: 'M16 22 L16 16 C 16 7, 32 7, 32 16 L32 22', w: 3 },
    { d: 'M10.5 22 L37.5 22 L37 41 L11 41 Z' },
    { d: 'M24 30 L24 35.5', w: 3, taper: 0 },
  ], [dot(24, 29.5, 2.4)]),

  link: icon('link', 'Link', [{ d: `${link(18, 30, 22, 11, -45)} ${link(30, 18, 22, 11, -45)}` }]),
};
