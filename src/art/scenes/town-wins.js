// Town wins: "The town wins!" Two hands hoist the birthday cake into a sunrise; confetti and a tossed party hat.
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

const liftL = gripHand({ x: 134, y: 270, s: 1.3, r: 192, arm: 150, wrap: 18 });
const liftR = gripHand({ x: 268, y: 266, s: 1.18, r: 171, arm: 170, wrap: 15, flip: true });
const bit = (x, y, r, s, shape = 0) => tp(['M-8 -4 L 9 -6 L 7 5 L -9 4 Z', 'M0 -9 L 8 6 L -8 5 Z', 'M-10 -2 C -4 -7, 4 3, 10 -2 L 10 3 C 4 8, -4 -2, -10 3 Z'][shape], { x, y, r, s: s * 1.6 });
const confetti = [
  [[44, 70, 20, 1.1, 0, 'terracotta'], [318, 40, -30, 1, 1, 'bone'], [366, 160, 50, 1.2, 2, 'bone'], [92, 150, 10, 1, 1, 'candle'], [260, 70, 30, 0.8, 0, 'periwinkle']],
  [[140, 40, 70, 1, 2, 'terracotta'], [24, 190, -20, 1.1, 0, 'bone'], [372, 236, 0, 1, 2, 'terracotta'], [120, 92, -50, 0.8, 0, 'periwinkle']],
  [[220, 24, -20, 0.9, 1, 'candle'], [36, 300, 60, 1, 1, 'terracotta'], [352, 88, 0, 0.9, 2, 'candle'], [60, 116, 40, 0.9, 2, 'bone']],
];
const HAT = { x: 300, y: 150, r: 28, s: 0.6 };

export default {
  id: 'town-wins',
  title: 'Two hands hoist the birthday cake into a rising sun, with confetti and a party hat flying',
  viewBox: '0 0 400 500',
  tile: 'sky',
  layers: [
    { paper: 'M200 196 C 300 194, 376 262, 376 352 C 376 440, 300 506, 200 506 C 100 506, 24 440, 24 352 C 24 262, 100 198, 200 196 Z', fill: 'candle', anim: 'rise', at: 0.1 },
    { ink: 'M200 160 C 330 158, 410 250, 410 340 M-10 340 C -10 250, 70 160, 200 160', w: 3, color: 'bone', at: 0.3, dur: 0.8 },
    // the cake
    { group: [
      { paper: 'M104 268 C 164 280, 244 280, 306 268 C 308 276, 304 282, 300 284 C 244 296, 164 296, 108 284 Z', fill: 'bone' },
      { paper: 'M128 262 C 130 236, 132 210, 134 186 C 170 178, 234 178, 270 186 C 272 212, 272 238, 274 262 Z', fill: 'bone' },
      { paper: 'M128 236 C 170 244, 232 244, 274 236 L 274 254 C 232 262, 170 262, 128 254 Z', fill: 'terracotta' },
      { ink: 'M132 182 C 168 172, 236 172, 272 182 M132 184 C 130 210, 128 236, 126 262 M272 184 C 274 210, 276 236, 278 262', w: 5.5, at: 0.6, dur: 0.6 },
      { ink: 'M134 192 C 140 214, 154 214, 156 196 C 162 220, 178 220, 182 198 C 190 214, 204 214, 208 196 C 214 222, 232 222, 236 198 C 242 212, 256 212, 268 192', w: 4, at: 1.0 },
      { ink: 'M100 262 C 160 274, 240 274, 302 262 C 304 268, 302 272, 298 274 C 240 286, 160 286, 104 274 C 98 272, 98 266, 100 262', w: 5, at: 0.9 },
      { ink: 'M168 176 L 166 138 M202 174 L 203 128 M236 176 L 238 140', w: 5, at: 1.3 },
      { group: [{ paper: 'M166 112 C 156 126, 158 136, 166 136 C 174 136, 176 126, 166 112 Z', fill: 'terracotta' }], loop: 'flicker', origin: '166 136', anim: 'pop', at: 1.6 },
      { group: [{ paper: 'M203 102 C 193 116, 195 126, 203 126 C 211 126, 213 116, 203 102 Z', fill: 'terracotta' }], loop: 'flicker', origin: '203 126', anim: 'pop', at: 1.7, loopAt: 2.3 },
      { group: [{ paper: 'M238 114 C 228 128, 230 138, 238 138 C 246 138, 248 128, 238 114 Z', fill: 'terracotta' }], loop: 'flicker', origin: '238 138', anim: 'pop', at: 1.8, loopAt: 2.6 },
      handNode(liftL, { at: 0.4, anim: 'rise', w: 4.5 }),
      handNode(liftR, { at: 0.5, anim: 'rise', w: 4.5 }),
    ], loop: 'bob', origin: '200 300', anim: 'rise', at: 0.4, loopAt: 2.4 },
    // confetti
    ...confetti.map((set, i) => ({ group: set.map(([x, y, r, s, sh, fill]) => ({ paper: bit(x, y, r, s, sh), fill, rough: 0.5 })), anim: 'pop', at: 2.0 + i * 0.2, loop: ['drift', 'float', 'sway'][i], origin: '200 140', loopAt: 2.6 + i * 0.3 })),
    // a tossed party hat
    { group: [
      { paper: tp('M-34 -2 L 0 -86 L 36 -4 C 14 6, -14 6, -34 -2 Z', { ...HAT, x: HAT.x + 4, y: HAT.y + 3 }), fill: 'periwinkle' },
      { ink: tp('M-36 -4 L -2 -88 L 36 -6 M-36 -4 C -14 6, 14 6, 36 -6', HAT), w: 4, at: 2.5 },
      { paper: tp('M-2 -110 C 8 -112, 13 -102, 9 -94 C 5 -87, -8 -89, -9 -97 C -10 -104, -6 -109, -2 -110 Z', HAT), fill: 'terracotta' },
    ], anim: 'drop', at: 2.4, loop: 'float', origin: '310 120', loopAt: 3 },
  ],
};
