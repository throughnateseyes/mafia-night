/*
 * The Mafia wake: two fedoras between the pines, eyes open. One points, without
 * a word, at the tent with the lantern still on. A third pair watches from the tree.
 */
const FIG = '#323E4E';
const f = (n) => +n.toFixed(1);

const figure = (x, base, s) => {
  const p = (dx, dy) => `${f(x + dx * s)} ${f(base + dy * s)}`;
  return [
    { shape: `M${p(-34, 0)} C${p(-34, -38)} ${p(-20, -50)} ${p(0, -50)} C${p(20, -50)} ${p(34, -38)} ${p(34, 0)} Z`, fill: FIG },
    { circle: [x, f(base - 70 * s), f(18 * s)], fill: FIG },
    // fedora: crown + brim in one shape
    { shape: `M${p(-15, -84)} C${p(-15, -98)} ${p(-11, -106)} ${p(-4, -104)} L${p(0, -101)} L${p(4, -104)} C${p(11, -106)} ${p(15, -98)} ${p(15, -84)} Z `
      + `M${p(-25, -87)} L${p(25, -87)} A${f(3 * s)} ${f(3 * s)} 0 0 1 ${p(25, -81)} L${p(-25, -81)} A${f(3 * s)} ${f(3 * s)} 0 0 1 ${p(-25, -87)} Z`, fill: FIG },
  ];
};
const eyes = (x, y, s = 1) => [
  { circle: [f(x - 7 * s), y, f(2.6 * s)], fill: 'cream' },
  { circle: [f(x + 7 * s), y, f(2.6 * s)], fill: 'cream' },
];
// a straight limb from a to b, w wide, with round ends
const limb = ([ax, ay], [bx, by], w) => {
  const l = Math.hypot(bx - ax, by - ay);
  const [nx, ny] = [(-(by - ay) / l) * (w / 2), ((bx - ax) / l) * (w / 2)];
  return `M${f(ax + nx)} ${f(ay + ny)} L${f(bx + nx)} ${f(by + ny)} A${w / 2} ${w / 2} 0 0 0 ${f(bx - nx)} ${f(by - ny)} L${f(ax - nx)} ${f(ay - ny)} A${w / 2} ${w / 2} 0 0 0 ${f(ax + nx)} ${f(ay + ny)} Z`;
};

// right figure + pointing arm
const RX = 198, RB = 384, RS = 1.15;
const shoulder = [RX + 26 * RS, RB - 36 * RS];
const hand = [272, 318];
const dir = [(hand[0] - shoulder[0]), (hand[1] - shoulder[1])];
const dl = Math.hypot(...dir);
const tip = [hand[0] + (dir[0] / dl) * 17, hand[1] + (dir[1] / dl) * 17];

export default {
  id: 'mafia-wake',
  title: 'Two fedora silhouettes between the pines, one pointing at a lit tent',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    { group: [
        { circle: [310, 86, 1.6], fill: 'cream' },
        { circle: [214, 128, 1.4], fill: 'cream' },
      ], at: 0.1, anim: 'fade' },
    // back ridge of pines
    { shape: 'M84 384 L132 196 L180 384 Z M188 384 L236 234 L284 384 Z M244 384 L300 176 L356 384 Z', fill: 'dusk', at: 0, anim: 'fade' },
    // ground
    { shape: 'M-1200 380 L0 380 C 120 370, 280 370, 400 380 L1600 380 L1600 1700 L-1200 1700 Z', fill: 'dusk', at: 0, anim: 'fade' },
    // the tent they have chosen
    { group: [
        { shape: 'M266 384 L326 302 L386 384 Z', fill: FIG },
        { group: [{ shape: 'M316 384 L326 342 L336 384 Z', fill: 'candle' }], loop: 'flicker', origin: '326 384', loopAt: 2.4 },
      ], at: 0.4, anim: 'fade' },
    // two fedoras
    { group: figure(108, 386, 1.02), at: 0.7, anim: 'rise' },
    { group: [
        ...figure(RX, RB, RS),
        // arm, mitten and pointing finger in one shape
        { shape: `${limb(shoulder, hand, 12)} M${hand[0] - 8.5} ${hand[1]} A8.5 8.5 0 1 1 ${hand[0] + 8.5} ${hand[1]} A8.5 8.5 0 1 1 ${hand[0] - 8.5} ${hand[1]} Z ${limb(hand, tip, 6)}`, fill: FIG },
      ], at: 0.9, anim: 'rise' },
    // the big pine on the left, with someone in it
    { shape: 'M-36 390 L32 104 L100 390 Z', fill: 'pine', at: 0.3, anim: 'rise' },
    { group: eyes(36, 262, 0.9), at: 1.7, anim: 'fade', loop: 'blink', origin: '36 262', loopAt: 3.1 },
    { group: [...eyes(108, f(386 - 68 * 1.02), 1.02), ...eyes(RX, f(RB - 68 * RS), RS)], at: 1.3, anim: 'fade', loop: 'blink', origin: '153 309', loopAt: 2 },
  ],
};
