/*
 * Nobody goes. An empty Adirondack chair, a mug still warm on the arm,
 * and beside it a marshmallow stick balanced dead level on a stump.
 */
const r1 = (v) => Math.round(v * 10) / 10;
const P = (p) => `${r1(p[0])} ${r1(p[1])}`;

// a stadium shape from a to b, radius r (both ends round)
function capsule(a, b, r) {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = [(-(b[1] - a[1]) / len) * r, ((b[0] - a[0]) / len) * r];
  return `M${P([a[0] + n[0], a[1] + n[1]])} L${P([b[0] + n[0], b[1] + n[1]])} A${r} ${r} 0 0 0 ${P([b[0] - n[0], b[1] - n[1]])} L${P([a[0] - n[0], a[1] - n[1]])} A${r} ${r} 0 0 0 ${P([a[0] + n[0], a[1] + n[1]])} Z`;
}

export default {
  id: 'no-elimination',
  title: 'Nobody leaves',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'birch',
  layers: [
    // a quiet disc behind everything
    { circle: [200, 250, 150], fill: '#DDD3C3', at: 0, anim: 'fade' },
    // ground
    { shape: 'M-1200 396 L0 396 C 120 386, 280 386, 400 396 L1600 396 L1600 1700 L-1200 1700 Z', fill: '#D8CFC0', at: 0, anim: 'fade' },
    // the empty chair, side on, facing left
    { group: [
        { shape: capsule([212, 390], [252, 306], 7), fill: '#24392D' },
        { shape: capsule([208, 310], [250, 144], 19), fill: 'pine' },
        { shape: capsule([112, 290], [218, 314], 8), fill: 'pine' },
        { rect: [120, 250, 13, 146, 3], fill: '#24392D' },
        { shape: capsule([100, 250], [238, 244], 6), fill: 'pine' },
      ], at: 0.2, anim: 'rise' },
    // mug on the armrest
    { rect: [106, 221, 22, 23, 3], fill: 'ember', at: 0.8, anim: 'rise' },
    { group: [
        { line: 'M113 213 C 107 203, 119 197, 113 185 M122 211 C 118 203, 126 197, 122 189', w: 2.5, color: 'smoke', at: 1.1 },
      ], loop: 'float', origin: '117 199', loopAt: 1.8 },
    // stump with the stick balanced on top
    { rect: [304, 348, 44, 48, 4], fill: 'clay', at: 0.5, anim: 'rise' },
    { group: [
        { rect: [262, 344, 128, 4, 2], fill: 'ink' },
        { rect: [270, 335, 24, 22, 6], fill: 'paper' },
        { rect: [358, 335, 24, 22, 6], fill: 'paper' },
      ], at: 1.2, anim: 'fade', loop: 'sway', origin: '326 348', loopAt: 1.8 },
  ],
};
