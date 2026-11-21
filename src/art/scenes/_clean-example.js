/*
 * Reference for the clean style (not registered: files starting with _ are skipped).
 * Night over the cabin: a moon, three pines, the cabin with one lit window,
 * and two eyes in the trees. Flat shapes, one thin line, nothing outlined.
 */
export default {
  id: 'clean-example',
  title: 'Night over the cabin',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    { circle: [262, 150, 62], fill: 'cream', at: 0.1, anim: 'fade' },
    { circle: [290, 132, 58], fill: 'night', at: 0.1, anim: 'fade' },
    // ground
    { shape: 'M0 400 C 120 384, 280 384, 400 398 L400 500 L0 500 Z', fill: 'dusk', at: 0, anim: 'fade' },
    // pines
    { group: [{ shape: 'M70 404 L104 300 L138 404 Z', fill: 'pine' }], at: 0.3, anim: 'rise' },
    { group: [{ shape: 'M110 404 L152 262 L194 404 Z', fill: 'pine' }], at: 0.4, anim: 'rise' },
    { group: [{ shape: 'M318 404 L346 318 L374 404 Z', fill: 'pine' }], at: 0.5, anim: 'rise' },
    // cabin
    { group: [
        { rect: [196, 336, 112, 68, 2], fill: 'ink' },
        { shape: 'M186 340 L252 290 L318 340 Z', fill: 'ink' },
        { group: [{ rect: [222, 356, 22, 20, 2], fill: 'candle' }], loop: 'flicker', origin: '233 366' },
      ], at: 0.6, anim: 'rise' },
    // smoke from the chimney
    { line: 'M290 304 C 284 290, 298 282, 290 268 C 284 256, 296 248, 290 236', w: 2.5, color: 'smoke', at: 1.1, opacity: 0.7 },
    // eyes in the trees
    { group: [
        { circle: [140, 352, 3.2], fill: 'cream' },
        { circle: [154, 352, 3.2], fill: 'cream' },
      ], at: 1.6, anim: 'fade', loop: 'blink', origin: '147 352', loopAt: 2 },
  ],
};
