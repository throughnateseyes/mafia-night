/*
 * Talk it out. Two speech shapes square off over the campfire:
 * one just talking, one with a single narrowed eye.
 */
export default {
  id: 'discussion',
  title: 'Talk it out',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'birch',
  layers: [
    // ground
    { shape: 'M-1200 396 L0 396 C 120 384, 280 384, 400 396 L1600 396 L1600 1700 L-1200 1700 Z', fill: '#D8CFC0', at: 0, anim: 'fade' },
    // log seats
    { group: [{ rect: [34, 366, 100, 28, 14], fill: 'clay' }, { circle: [48, 380, 11], fill: '#E9C9AE' }], at: 0.2, anim: 'slide-l' },
    { group: [{ rect: [266, 366, 100, 28, 14], fill: 'clay' }, { circle: [352, 380, 11], fill: '#E9C9AE' }], at: 0.2, anim: 'slide-r' },
    // fire logs
    { group: [
        { shape: 'M162 388 L234 370 L238 382 L166 400 Z', fill: 'ink' },
        { shape: 'M238 388 L166 370 L162 382 L234 400 Z', fill: 'ink' },
      ], at: 0.3, anim: 'fade' },
    // the fire
    { group: [
        { shape: 'M200 286 C 214 314, 238 328, 234 358 C 231 380, 214 390, 200 390 C 186 390, 169 380, 166 358 C 162 330, 186 318, 200 286 Z', fill: 'ember' },
        { shape: 'M200 330 C 208 346, 218 354, 216 368 C 214 380, 206 386, 200 386 C 194 386, 186 380, 184 368 C 182 354, 192 346, 200 330 Z', fill: 'candle' },
      ], at: 0.5, anim: 'grow', origin: '200 390', loop: 'flicker', loopAt: 1.2 },
    // left speech shape: just talking
    { group: [
        { rect: [40, 150, 148, 96, 48], fill: 'pine' },
        { shape: 'M86 238 L72 282 L124 240 Z', fill: 'pine' },
        { circle: [86, 198, 7], fill: 'cream' },
        { circle: [114, 198, 7], fill: 'cream' },
        { circle: [142, 198, 7], fill: 'cream' },
      ], at: 0.9, anim: 'rise' },
    // right speech shape: suspicious
    { group: [
        { rect: [212, 118, 148, 96, 48], fill: 'dusk' },
        { shape: 'M314 206 L330 252 L276 210 Z', fill: 'dusk' },
      ], at: 1.2, anim: 'rise' },
    { group: [
        { shape: 'M248 168 C 266 152, 306 152, 324 168 C 306 182, 266 182, 248 168 Z', fill: 'cream' },
        { circle: [268, 168, 8], fill: 'ink' },
        { rect: [244, 146, 84, 16, 0], fill: 'dusk' },
      ], at: 1.5, anim: 'fade', loop: 'blink', origin: '286 168', loopAt: 2.2 },
  ],
};
