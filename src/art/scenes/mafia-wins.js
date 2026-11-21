// Mafia wins: "The Mafia wins." Three fedora silhouettes against a huge flat moon; the boss tips his hat with a sly grin.
// ---- shared hand kit (copied into each scene file) ----
const D = Math.PI / 180;
const r1 = (v) => Math.round(v * 10) / 10;
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const dirOf = (deg) => [Math.sin(deg * D), -Math.cos(deg * D)];
const nrmOf = (deg) => [Math.cos(deg * D), Math.sin(deg * D)];

function place(pts, { x = 0, y = 0, s = 1, r = 0, flip = false }) {
  const c = Math.cos(r * D), n = Math.sin(r * D);
  return pts.map(([px, py]) => {
    const fx = flip ? -px : px;
    return [x + s * (fx * c - py * n), y + s * (fx * n + py * c)];
  });
}
// move/turn/scale an absolute path written with M L C Q S T Z only
function tp(d, o) {
  return d.replace(/(-?\d*\.?\d+)[ ,]+(-?\d*\.?\d+)/g, (_, a, b) => {
    const [[x, y]] = place([[+a, +b]], o);
    return `${r1(x)} ${r1(y)}`;
  });
}
function curve(pts, closed = false) {
  const P = closed ? [pts.at(-1), ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts.at(-1)];
  let d = `M${r1(P[1][0])} ${r1(P[1][1])}`;
  for (let i = 1; i < P.length - 2; i++) {
    const [a, b, c, e] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    d += ` C ${r1(b[0] + (c[0] - a[0]) / 6)} ${r1(b[1] + (c[1] - a[1]) / 6)}, ${r1(c[0] - (e[0] - b[0]) / 6)} ${r1(c[1] - (e[1] - b[1]) / 6)}, ${r1(c[0])} ${r1(c[1])}`;
  }
  return closed ? `${d} Z` : d;
}
// one digit: base centre, angle (deg from up, + = clockwise), length, width, bend at knuckle
function digit(b, ang, L, w, bend) {
  const a2 = ang + bend;
  const k = add(b, dirOf(ang), L * 0.55);
  const t = add(k, dirOf(a2), L * 0.45);
  const n1 = nrmOf(ang), n2 = nrmOf(a2), nk = nrmOf((ang + a2) / 2), up = dirOf(a2);
  const hw = w / 2;
  const left = [add(b, n1, -hw), add(k, nk, -hw * 0.92), add(t, n2, -hw * 0.82)];
  const cap = [150, 105, 60].map((th) => add(add(t, n2, Math.cos(th * D) * hw * 0.82), up, Math.sin(th * D) * hw * 1.0));
  const right = [add(t, n2, hw * 0.82), add(k, nk, hw * 0.92), add(b, n1, hw)];
  return [...left, ...cap, ...right];
}
/*
 * An open hand, palm out, fingers up. Local units: wrist centre at 0,0, fingertips ~ -92.
 * o: x y s r flip | spread (deg) | curl [thumb,index,middle,ring,pinky] 0..1 | arm (wrist length)
 *    split: 'one' | 'two' | 'fingers' | cuff: true
 */
function openHand(o = {}) {
  const { spread = 12, curl = [0, 0, 0, 0, 0], arm = 30, split = 'two', cuff = true, thumbAng = -52, cuffY, sleeve = 3 } = o;
  const bases = [[-16, -50], [-4, -54.5], [8, -53], [18.5, -46.5]];
  const lens = [33, 37, 34, 26];
  const wids = [11.5, 12, 11.5, 10];
  const angs = [-spread - 2, -spread * 0.25, spread * 0.55, spread * 1.25 + 4];
  const bends = [3, 1, -2, -5];
  const fingers = bases.map((b, i) => {
    const c = curl[i + 1] ?? 0;
    const L = lens[i] * (1 - 0.55 * c);
    const bend = bends[i] + (i < 2 ? 1 : -1) * c * 30;
    return digit(b, angs[i], L, wids[i], bend);
  });
  const tc = curl[0] ?? 0;
  const thumb = digit([-18, -22], thumbAng + tc * 30, 33 * (1 - 0.4 * tc), 12, 16 + tc * 20);
  const WL = [-13.5, 0], WR = [13.5, 0];
  const cy = cuffY ?? 16;
  const AL = [-17 - sleeve, arm], AR = [17 + sleeve, arm];
  const CL = [-15.5, cy], CR = [15.5, cy];
  const crotch = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2 + 3.5];
  const c0 = [-13.5, -38];
  const cs = [1, 2, 3].map((i) => crotch(fingers[i - 1].at(-1), fingers[i][0]));
  const palmR = [[22.5, -30], [17.5, -12]];
  const segs = [
    [AL, [-17 - sleeve * 0.6, cy + 6], CL, WL, [-17, -10], ...thumb, c0],
    [c0, ...fingers[0], cs[0]],
    [cs[0], ...fingers[1], cs[1]],
    [cs[1], ...fingers[2], cs[2]],
    [cs[2], ...fingers[3], ...palmR, WR, CR, [17 + sleeve * 0.6, cy + 6], AR],
  ];
  const groupsBy = { one: [[0, 1, 2, 3, 4]], two: [[0, 1], [2, 3, 4]], three: [[0], [1, 2], [3, 4]], fingers: [[0], [1], [2], [3], [4]] }[split];
  const strokes = groupsBy.map((g) => {
    const pts = [];
    g.forEach((si, j) => pts.push(...(j ? segs[si].slice(1) : segs[si])));
    return curve(place(pts, o));
  });
  if (cuff) strokes.push(curve(place([[-18 - sleeve * 0.4, cy + 1], [0, cy + 4], [18 + sleeve * 0.4, cy]], o)));
  const all = [];
  segs.forEach((sg, j) => all.push(...(j ? sg.slice(1) : sg)));
  return { ink: strokes.join(' '), fill: (dx = 5, dy = 4) => curve(place(all, o).map(([px, py]) => [px + dx, py + dy]), true) };
}
/*
 * A pointing hand seen from the thumb side, index out along +x. Wrist at 0,0.
 * o: x y s r flip arm | split 'one'|'three'
 */
function pointHand(o = {}) {
  const { arm = 34, cuff = true, reach = 1 } = o;
  const L = 30 * reach;
  const back = [[-arm, -20], [-16, -19], [-12, -17.5], [-4, -17.5], [8, -20], [26, -20], [40, -17.5], [40 + L * 0.55, -16.5], [40 + L, -15], [45.5 + L, -9.5], [40 + L, -3.5], [40 + L * 0.55, -3.5], [46, -4]];
  const thumb = [[24, -9], [38, -8], [50, -2.5], [53, 2], [48, 5], [36, 5]];
  const curled = [[46, -4], [53, -0.5], [52, 6], [44, 8], [50, 11.5], [49, 17.5], [41, 18.5], [45, 22], [43, 27.5], [34, 28], [22, 27], [8, 21], [-4, 17], [-12, 17], [-16, 18.5], [-arm, 19]];
  const strokes = [curve(place(back, o)), curve(place(thumb, o)), curve(place(curled, o))];
  if (cuff) strokes.push(curve(place([[-13, -18.5], [-15, 0], [-13, 18.5]], o)));
  const outline = [...back, ...curled.slice(1)];
  return { ink: strokes.join(' '), fill: (dx = 5, dy = 4) => curve(place(outline, o).map(([px, py]) => [px + dx, py + dy]), true) };
}
/*
 * A hand gripping a horizontal bar (rail, plate edge) seen from the back: knuckles above,
 * fingers wrapping over the front of the bar at y=0. Arm goes up (-y). Wrist at 0,-46.
 */
function gripHand(o = {}) {
  const { arm = 60, cuff = true, wrap = 16 } = o;
  const xs = [-15, -4.5, 6, 16];
  const tops = [-12, -14, -13.5, -10];
  const ws = [11, 11.5, 11, 9.5];
  const fingers = xs.map((x, i) => {
    const t = tops[i], w = ws[i] / 2, b = wrap - (i === 3 ? 4 : i === 0 ? 1 : 0);
    const lean = (i - 1.5) * 1.2;
    return [[x - w, t + 2], [x - w - 0.5 + lean * 0.3, t + (b - t) * 0.45], [x - w * 0.8 + lean, b - 2], [x + lean, b + w * 0.7], [x + w * 0.8 + lean, b - 2], [x + w + 0.3 + lean * 0.3, t + (b - t) * 0.45], [x + w, t + 2]];
  });
  const left = [[-15 - 2, -46 - arm], [-16.5, -60], [-15, -46], [-20, -28], [-22, -16], [-21, -11]];
  const thumb = [[-20, -26], [-27, -14], [-28, 0], [-25, 9], [-20, 8], [-19, 0]];
  const right = [[21, -10], [22, -22], [16, -38], [15, -46], [16.5, -60], [17 + 2, -46 - arm]];
  const strokes = [curve(place(left, o)), curve(place(thumb, o)), ...fingers.map((f) => curve(place(f, o))), curve(place(right, o))];
  if (cuff) strokes.push(curve(place([[-17, -58], [0, -55], [18, -58]], o)));
  const outline = [...left, ...fingers.flatMap((f) => f), ...right];
  return { ink: strokes.join(' '), fill: (dx = 5, dy = 4) => curve(place(outline, o).map(([px, py]) => [px + dx, py + dy]), true) };
}
// a hand as one entrance group: misregistered paper under ink
function handNode(h, { at = 0, anim = 'rise', fill = 'bone', w = 4.5, color = 'ink', dx = 5, dy = 4, loop, origin, loopAt } = {}) {
  const group = [];
  if (fill) group.push({ paper: h.fill(dx, dy), fill });
  group.push({ ink: h.ink, w, color, at: at + 0.1 });
  const g = { group, anim, at };
  if (loop) Object.assign(g, { loop, origin, loopAt: loopAt ?? at + 1 });
  return g;
}
// ---- end hand kit ----

// silhouette pieces, local: head centre at 0,0
const BODY = 'M-118 280 L -108 190 C -104 124, -72 88, -24 74 L -15 40 C -30 30, -34 12, -30 -6 C -26 -28, -12 -37, 0 -37 C 14 -37, 28 -28, 31 -6 C 34 14, 28 30, 15 40 L 24 74 C 72 88, 104 124, 108 190 L 118 280 Z';
const COLLAR = 'M-24 76 L -2 138 M24 76 L 4 128';
const HAT = 'M-60 4 C -46 -6, -34 -6, -29 -8 C -32 -32, -24 -48, -10 -50 C -4 -45, 4 -45, 10 -50 C 24 -48, 32 -32, 29 -8 C 34 -6, 46 -6, 60 4 C 44 12, -44 12, -60 4 Z';
const BAND = 'M-29 -10 C -10 -6, 10 -6, 29 -10 L 30 -20 C 10 -16, -10 -16, -30 -20 Z';
const boss = { x: 200, y: 262, s: 1 };
const left = { x: 82, y: 300, s: 0.82, r: -4 };
const right = { x: 320, y: 312, s: 0.78, r: 5 };
const lHat = { x: 82, y: 278, s: 0.86, r: -10 };
const rHat = { x: 320, y: 292, s: 0.8, r: 12 };
const bHat = { x: 222, y: 186, s: 1.02, r: 16 }; // lifted off the head
const tipHand = openHand({ x: 254, y: 258, s: 0.9, r: -4, spread: 9, arm: 130, curl: [0.2, 0, 0, 0.1, 0.2] });
const star = (x, y, s) => `M${x} ${y - 7 * s} L ${x + 2 * s} ${y - 2 * s} L ${x + 7 * s} ${y} L ${x + 2 * s} ${y + 2 * s} L ${x} ${y + 7 * s} L ${x - 2 * s} ${y + 2 * s} L ${x - 7 * s} ${y} L ${x - 2 * s} ${y - 2 * s} Z`;
const eyes = (o, w = 1) => tp('M-16 -2 C -12 -5, -6 -5, -4 -2 C -6 0, -12 0, -16 -2 Z M4 -2 C 6 -5, 12 -5, 16 -2 C 12 0, 6 0, 4 -2 Z', { ...o, s: (o.s ?? 1) * w });

export default {
  id: 'mafia-wins',
  title: 'Three fedora-wearing silhouettes against a huge moon; the boss tips his hat with a sly grin',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    // the moon
    { paper: 'M200 40 C 296 38, 372 114, 370 210 C 368 306, 294 380, 200 380 C 104 380, 30 306, 30 210 C 30 114, 106 42, 200 40 Z', fill: 'periwinkle', anim: 'grow', at: 0.1 },
    { ink: 'M206 30 C 312 30, 384 112, 380 214 C 376 316, 296 390, 196 388 C 92 386, 20 302, 24 202', w: 2.5, color: 'bone', at: 0.4, dur: 1 },
    { group: [{ paper: `${star(54, 52, 1.1)} ${star(352, 418, 0.9)}`, fill: 'bone' }], loop: 'flicker', origin: '200 200', anim: 'pop', at: 0.6 },
    { group: [{ paper: `${star(366, 40, 0.8)} ${star(40, 430, 1)} ${star(24, 120, 0.6)}`, fill: 'bone' }], loop: 'flicker', origin: '200 200', anim: 'pop', at: 0.8, loopAt: 2.2 },
    // the two henchmen
    { group: [
      { paper: tp(BODY, left), fill: 'ink' },
      { paper: tp(HAT, lHat), fill: 'ink' },
      { paper: tp(BAND, lHat), fill: 'blood' },
      { ink: tp(COLLAR, left), w: 3, color: 'bone', at: 1.1 },
    ], anim: 'rise', at: 0.6 },
    { group: [
      { paper: tp(BODY, right), fill: 'ink' },
      { paper: tp(HAT, rHat), fill: 'ink' },
      { paper: tp(BAND, rHat), fill: 'blood' },
      { ink: tp(COLLAR, right), w: 3, color: 'bone', at: 1.2 },
    ], anim: 'rise', at: 0.8 },
    { group: [{ paper: eyes({ x: 84, y: 290, r: -4 }, 0.8), fill: 'bone' }, { paper: eyes({ x: 318, y: 304, r: 5 }, 0.75), fill: 'bone' }], loop: 'blink', origin: '200 297', anim: 'fade', at: 2.2, loopAt: 3 },
    // the boss
    { group: [
      { paper: tp(BODY, boss), fill: 'ink' },
      { ink: tp(COLLAR, boss), w: 3.5, color: 'bone', at: 1.3 },
      { paper: tp('M236 352 C 244 346, 254 350, 252 360 C 250 368, 240 370, 235 364 C 231 360, 232 355, 236 352 Z', { x: -76, y: 0 }), fill: 'blood', anim: 'pop', at: 2.6 },
    ], anim: 'rise', at: 1.0 },
    { group: [{ paper: eyes({ x: 200, y: 254 }), fill: 'bone' }], loop: 'blink', origin: '200 252', anim: 'fade', at: 2.0, loopAt: 3.4 },
    { ink: 'M186 280 C 194 288, 208 288, 218 276', w: 3, color: 'bone', at: 2.3, dur: 0.3 },
    // tipping the hat
    { group: [
      { paper: tipHand.fill(0, 0), fill: 'ink' },
      { paper: tp(HAT, bHat), fill: 'ink' },
      { paper: tp(BAND, bHat), fill: 'blood' },
      { ink: tp('M-50 10 C -30 15, 40 15, 60 7', { ...bHat, y: bHat.y + 3 }), w: 2.5, color: 'bone', at: 1.9 },
    ], anim: 'rise', at: 1.6, loop: 'bob', origin: '254 330', loopAt: 2.8 },
  ],
};
