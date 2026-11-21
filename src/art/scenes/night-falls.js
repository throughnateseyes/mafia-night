/*
 * Night falls: the moon over the lake, the A-frame cabin with one lit window,
 * its reflection in the water. In the pines, a pair of eyes, closed.
 */
export default {
  id: 'night-falls',
  title: 'Night over the cabin and the lake, everyone with their eyes closed',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    // stars + moon
    { group: [
        { circle: [72, 92, 1.8], fill: 'cream' },
        { circle: [128, 150, 1.4], fill: 'cream' },
        { circle: [340, 66, 1.6], fill: 'cream' },
      ], at: 0.1, anim: 'fade' },
    { group: [
        { circle: [266, 132, 46], fill: 'cream' },
        { circle: [288, 117, 42], fill: 'night' },
      ], at: 0.2, anim: 'fade' },
    // far shore
    { shape: 'M-1200 296 L0 296 C 80 268, 160 266, 240 284 C 300 298, 350 280, 400 274 L1600 274 L1600 318 L-1200 318 Z', fill: 'dusk', at: 0, anim: 'fade' },
    // the lake
    { rect: [-1200, 316, 2800, 1384, 0], fill: '#18202B', at: 0, anim: 'fade' },
    // pines on the shore
    { shape: 'M10 318 L40 188 L70 318 Z M62 318 L84 226 L106 318 Z', fill: 'pine', at: 0.4, anim: 'rise' },
    { shape: 'M308 318 L340 168 L372 318 Z M356 318 L380 222 L404 318 Z', fill: 'pine', at: 0.5, anim: 'rise' },
    // the A-frame
    { group: [
        { shape: 'M138 318 L190 234 L242 318 Z', fill: 'ink' },
        { group: [{ rect: [182, 286, 16, 18, 2], fill: 'candle' }], loop: 'flicker', origin: '190 295', loopAt: 2 },
      ], at: 0.7, anim: 'rise' },
    // reflections
    { group: [
        { line: 'M246 344 L286 344 M254 358 L278 358 M261 372 L271 372', w: 2.5, color: 'cream', opacity: 0.35, draw: false },
      ], at: 1.2, anim: 'fade', loop: 'breathe', origin: '266 358', loopAt: 2 },
    { line: 'M183 332 L197 332 M186 342 L194 342', w: 2.5, color: 'candle', opacity: 0.55, at: 1.3, draw: false },
    // eyes in the pines, closed
    { line: 'M29 262 C31 266.5 36 266.5 38 262 M43 262 C45 266.5 50 266.5 52 262', w: 2.2, color: 'cream', at: 1.6, dur: 0.5 },
  ],
};
