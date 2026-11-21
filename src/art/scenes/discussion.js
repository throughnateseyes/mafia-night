// Discussion: "Talk it out. Who's lying?" Two hands point at each other, squabbling speech, a big side-eye watches.
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

const accuser = pointHand({ x: 8, y: 246, s: 1.75, r: 9, arm: 60, reach: 1.4 });
const accused = pointHand({ x: 394, y: 318, s: 1.75, r: 10, flip: true, arm: 60, reach: 1.4 });
// speech bubble: an ellipse with a tail pointing at angle `ta` (deg, 0 = right, 90 = down)
const bubble = (cx, cy, rx, ry, ta, len) => {
  const P = (a) => `${r1(cx + rx * Math.cos(a * D))} ${r1(cy + ry * Math.sin(a * D))}`;
  const tip = `${r1(cx + (rx + len) * Math.cos(ta * D))} ${r1(cy + (ry + len) * Math.sin(ta * D))}`;
  return `M${P(ta + 13)} A ${rx} ${ry} 0 1 1 ${P(ta - 13)} L ${tip} Z`;
};
const squiggle = (x, y, n, step, h) => {
  let d = `M${x} ${y}`;
  for (let i = 0; i < n; i++) {
    const a = x + i * step;
    d += ` C ${a + step * 0.2} ${y - h}, ${a + step * 0.9} ${y - h}, ${a + step * 0.6} ${y} C ${a + step * 0.5} ${y + h * 0.4}, ${a + step * 0.9} ${y + h * 0.4}, ${a + step} ${y}`;
  }
  return d;
};
const b1 = bubble(112, 352, 62, 30, -110, 22);
const b2 = bubble(298, 206, 58, 28, 70, 24);

export default {
  id: 'discussion',
  title: 'Two hands point accusingly at each other between squabbling speech bubbles while a big eye glances sideways',
  viewBox: '0 0 400 500',
  tile: 'stone',
  layers: [
    // the side-eye
    { blob: 'M200 44 C 262 42, 300 76, 298 112 C 296 150, 256 172, 200 170 C 140 168, 102 146, 104 108 C 106 70, 144 46, 200 44 Z', fill: 'terracotta', anim: 'grow', at: 0.1 },
    { group: [
      { paper: 'M114 114 C 150 92, 250 88, 292 110 C 252 140, 162 144, 114 114 Z', fill: 'bone', anim: 'unfold', at: 0.3 },
      { paper: 'M142 102 C 140 120, 150 132, 163 132 C 177 132, 186 120, 184 100 Z', fill: 'ink', anim: 'pop', at: 0.9 },
      { paper: 'M170 108 C 175 107, 178 112, 175 115 C 172 118, 167 115, 168 111 C 168 109, 169 108, 170 108 Z', fill: 'bone', anim: 'pop', at: 1.0 },
      { ink: 'M108 112 C 150 94, 250 88, 296 106 M116 116 C 160 144, 248 142, 288 112', w: 5.5, at: 0.4, dur: 0.6 },
      { ink: 'M130 102 L 118 84 M156 94 L 150 74 M262 92 L 270 74', w: 3.5, at: 0.9 },
    ], loop: 'blink', origin: '200 114', loopAt: 2.5 },
    { ink: 'M120 74 C 160 56, 230 50, 282 62', w: 6, at: 1.0, dur: 0.4 },
    // the squabble
    { group: [{ paper: bubble(107, 356, 62, 30, -110, 22), fill: 'bone' }, { ink: b1, w: 4, at: 1.2 }, { ink: squiggle(76, 354, 5, 14.5, 10), w: 3, at: 1.5 }], anim: 'pop', at: 1.2, loop: 'bob', origin: '112 352', loopAt: 2.6 },
    { group: [{ paper: bubble(303, 210, 58, 28, 70, 24), fill: 'periwinkle' }, { ink: b2, w: 4, at: 1.4 }, { ink: squiggle(262, 208, 5, 14.5, 10), w: 3, at: 1.7 }], anim: 'pop', at: 1.4, loop: 'bob', origin: '298 206', loopAt: 3 },
    { ...handNode(accuser, { at: 0.5, anim: 'slide-l', w: 5 }), loop: 'shake', origin: '8 246', loopAt: 2.4 },
    handNode(accused, { at: 0.8, anim: 'slide-r', w: 5 }),
    { ink: 'M180 240 L 198 220 M188 266 L 214 264 M180 292 L 198 310', w: 4, taper: 0.3, at: 2.2, dur: 0.4 },
  ],
};
