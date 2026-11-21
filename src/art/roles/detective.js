// Role portrait: the Ranger. A flashlight sweeps the dark;
// a moth has found the beam.

// rotate a path written as "x y" pairs around (0, 0), then move it to (dx, dy)
const P = (d, deg, dx, dy, k = 1) => {
  const c = Math.cos((deg * Math.PI) / 180);
  const s = Math.sin((deg * Math.PI) / 180);
  return d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${(k * (+x * c - +y * s) + dx).toFixed(1)} ${(k * (+x * s + +y * c) + dy).toFixed(1)}`);
};
const F = (d) => P(d, -32, 196, 228, 1.14); // the flashlight's local frame: head at (0, 0), pointing +x

export default {
  id: 'role-detective',
  title: 'The Ranger: a flashlight beam cuts across the dark and catches a moth',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'ember',
  layers: [
    // the beam
    { shape: F('M46 -30 L300 -150 L300 150 L46 30 Z'), fill: 'cream', opacity: 0.22, at: 0.6, anim: 'fade' },
    { shape: F('M46 -24 L300 -84 L300 84 L46 24 Z'), fill: 'cream', opacity: 0.22, at: 0.75, anim: 'fade' },
    // the flashlight
    {
      group: [
        { shape: F('M-150 -22 C -160 -22, -166 -14, -166 0 C -166 14, -160 22, -150 22 L-8 22 L2 36 L40 40 L40 -40 L2 -36 L-8 -22 Z'), fill: 'pine' },
        { shape: F('M40 -36 L50 -36 L50 36 L40 36 Z'), fill: 'candle' },
        { shape: F('M-78 -22 L-50 -22 L-50 -30 L-78 -30 Z'), fill: 'pine' },
      ],
      at: 0.2,
      anim: 'slide-l',
    },
    // the moth
    {
      group: [
        { shape: 'M306 158 C 290 138, 272 142, 276 158 C 278 168, 294 168, 306 160 Z', fill: 'dusk' },
        { shape: 'M310 158 C 326 138, 344 142, 340 158 C 338 168, 322 168, 310 160 Z', fill: 'dusk' },
        { shape: 'M306 160 C 298 172, 302 180, 308 178 C 314 180, 318 172, 310 160 Z', fill: 'dusk' },
        { line: 'M306 156 C 304 148, 300 142, 294 138 M310 156 C 312 148, 316 142, 322 138', w: 2, color: 'dusk', draw: false },
      ],
      at: 1.2,
      anim: 'fade',
      loop: 'float',
      origin: '308 160',
      loopAt: 1.8,
    },
  ],
};
