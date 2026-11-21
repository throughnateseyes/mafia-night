// Lobby: "Pull up a chair." A hand pulls out an empty chair with a party hat on it, under string lights.
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

const C = { x: 0, y: 0, r: -4 };
const HAT = { x: 196, y: 322, r: -14, s: 0.85 }; // hat local: brim centre at 0,0 // the chair leans a touch as it is pulled
const crest = 'M120 142 C 160 130, 214 128, 254 134 L 252 162 C 214 156, 162 158, 123 170 Z';
const slat = 'M134 212 C 170 205, 210 203, 244 205 L 244 220 C 210 218, 170 220, 134 227 Z';
const seat = 'M132 298 L 248 292 L 284 340 L 106 350 Z';
const chairInk = tp(
  `${crest} M131 170 L 138 300 M246 160 L 248 294 ${slat} ${seat} ` +
  'M110 352 L 114 434 M280 342 L 286 426 M142 304 L 146 398 M246 298 L 250 390',
  C);
const hand = gripHand({ x: 230, y: 146, s: 1.2, r: 30, arm: 160, wrap: 18 });
const bulbsAt = [[30, 50], [92, 78], [158, 94], [232, 93], [300, 78], [364, 52]];
const bulb = ([x, y]) => ({ paper: `M${x - 4} ${y + 6} C ${x - 13} ${y + 14}, ${x - 12} ${y + 31}, ${x} ${y + 32} C ${x + 12} ${y + 31}, ${x + 13} ${y + 14}, ${x + 4} ${y + 6} Z`, fill: 'candle' });

export default {
  id: 'lobby',
  title: 'A hand pulls out an empty chair with a party hat on the seat, under a string of party lights',
  viewBox: '0 0 400 500',
  tile: 'sand',
  layers: [
    { blob: 'M196 150 C 288 144, 342 214, 336 294 C 330 370, 270 418, 196 414 C 118 410, 60 356, 64 278 C 68 202, 116 154, 196 150 Z', fill: 'terracotta', anim: 'grow', at: 0.1 },
    { ink: 'M-10 30 C 80 78, 150 98, 200 98 C 260 98, 330 76, 410 30', w: 3, at: 0.3, dur: 0.8 },
    { group: bulbsAt.filter((_, i) => i % 2 === 0).map(bulb), loop: 'flicker', origin: '200 80', anim: 'pop', at: 0.8 },
    { group: bulbsAt.filter((_, i) => i % 2 === 1).map(bulb), loop: 'flicker', origin: '200 80', anim: 'pop', at: 1.0, loopAt: 2.3 },
    { paper: bulbsAt.map(([x, y]) => `M${x - 5} ${y - 3} L ${x + 5} ${y - 3} L ${x + 5} ${y + 9} L ${x - 5} ${y + 9} Z`).join(' '), fill: 'ink', rough: 0.6, anim: 'fade', at: 0.6 },
    { group: [
      { paper: tp(crest, { ...C, x: 5, y: 5 }), fill: 'bone', anim: 'pop', at: 0.9 },
      { paper: tp(slat, { ...C, x: 5, y: 5 }), fill: 'bone', anim: 'pop', at: 1.0 },
      { paper: tp(seat, { ...C, x: 6, y: 4 }), fill: 'bone', anim: 'pop', at: 1.1 },
      { ink: chairInk, w: 5, at: 1.0, dur: 1.4 },
      // party hat left on the seat
      { paper: tp(tp('M-34 -2 L 0 -86 L 36 -4 C 14 6, -14 6, -34 -2 Z', { x: -4, y: 3 }), HAT), fill: 'periwinkle', anim: 'pop', at: 2.1 },
      { ink: tp('M-36 -4 L -2 -88 L 36 -6 M-36 -4 C -14 6, 14 6, 36 -6 M-20 -42 C -6 -36, 10 -38, 20 -44', HAT), w: 4.5, at: 2.2 },
      { group: [{ paper: tp('M-2 -110 C 8 -112, 13 -102, 9 -94 C 5 -87, -8 -89, -9 -97 C -10 -104, -6 -109, -2 -110 Z', HAT), fill: 'candle' }], anim: 'pop', at: 2.7 },
      handNode(hand, { at: 2.4, anim: 'slide-r', w: 4.2 }),
    ], loop: 'sway', origin: '112 430', loopAt: 3.2 },
  ],
};
