/*
 * On three, everyone points. Four flannel sleeves rise from the bottom,
 * every mitten aimed the same way, at someone just off the top-right.
 * One of them is still holding their marshmallow stick.
 */
const r1 = (v) => Math.round(v * 10) / 10;
const P = (p) => `${r1(p[0])} ${r1(p[1])}`;

// a stadium shape from a to b, radius r (both ends round)
function capsule(a, b, r) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = [(-(b[1] - a[1]) / len) * r, ((b[0] - a[0]) / len) * r];
  return `M${P([a[0] + n[0], a[1] + n[1]])} L${P([b[0] + n[0], b[1] + n[1]])} A${r} ${r} 0 0 0 ${P([b[0] - n[0], b[1] - n[1]])} L${P([a[0] - n[0], a[1] - n[1]])} A${r} ${r} 0 0 0 ${P([a[0] + n[0], a[1] + n[1]])} Z`;
}

const ANGLE = 27; // degrees right of straight up: every arm points the same way
const U = [Math.sin((ANGLE * Math.PI) / 180), -Math.cos((ANGLE * Math.PI) / 180)];
const N = [U[1], -U[0]]; // thumb side

// one raised arm: sleeve, then a mitten (knit cuff, body, thumb) in one color
function arm({ x, reach, w = 38, sleeve, mitten, at, stick = false, loop }) {
  const A = (k, side = 0) => [x + U[0] * k + N[0] * side, 530 + U[1] * k + N[1] * side];
  const group = [
    { shape: `M${P(A(-1400, w / 2))} L${P(A(reach, w / 2))} L${P(A(reach, -w / 2))} L${P(A(-1400, -w / 2))} Z`, fill: sleeve }, // runs far past the bottom edge
    { shape: capsule(A(reach + 14, w * 0.32), A(reach + 30, w * 0.32 + 11), 8), fill: mitten },
    { shape: capsule(A(reach - 2), A(reach + 8), w / 2 + 3), fill: mitten },
    { shape: capsule(A(reach + 12), A(reach + 50), w / 2), fill: mitten },
  ];
  if (stick) {
    group.splice(1, 0, { shape: capsule(A(reach + 30, -4), A(reach + 140, -4), 2), fill: 'ink' });
    group.splice(2, 0, { shape: capsule(A(reach + 132, -4), A(reach + 150, -4), 10), fill: 'paper' });
  }
  if (!loop) return { group, at, anim: 'rise' };
  const [ox, oy] = A(reach);
  return { group, at, anim: 'rise', loop, origin: `${r1(ox)} ${r1(oy)}`, loopAt: at + 0.8 };
}

export default {
  id: 'vote',
  title: 'Point on three',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'clay',
  fade: true,
  layers: [
    arm({ x: -70, reach: 330, sleeve: 'pine', mitten: 'cream', at: 0.2 }),
    arm({ x: 16, reach: 390, sleeve: 'dusk', mitten: 'ember', at: 0.4, loop: 'bob' }),
    arm({ x: 104, reach: 352, sleeve: 'moss', mitten: 'cream', at: 0.6, stick: true }),
    arm({ x: 196, reach: 300, sleeve: 'pine', mitten: 'cream', at: 0.8 }),
  ],
};
