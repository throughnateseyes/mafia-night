/*
 * Voted out. A small canoe paddles off into the sunset;
 * their party hat is left behind on the dock.
 */
export default {
  id: 'eliminated',
  title: 'Leaving camp',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'ember',
  dark: true,
  layers: [
    // setting sun
    { circle: [200, 292, 76], fill: 'candle', at: 0.1, anim: 'rise' },
    // far pines, left and right shores
    { group: [
        { shape: 'M-16 296 L18 196 L52 296 Z', fill: '#B4532E' },
        { shape: 'M30 296 L64 218 L98 296 Z', fill: '#B4532E' },
        { shape: 'M300 296 L332 222 L364 296 Z', fill: '#B4532E' },
        { shape: 'M344 296 L380 186 L416 296 Z', fill: '#B4532E' },
        { shape: 'M-120 296 L-86 214 L-52 296 Z M-70 296 L-40 230 L-10 296 Z M420 296 L452 210 L484 296 Z M470 296 L498 236 L526 296 Z', fill: '#B4532E' },
      ], at: 0.3, anim: 'rise' },
    // the lake
    { rect: [-1200, 292, 2800, 1408], fill: 'dusk', at: 0, anim: 'fade' },
    // sunlight on the water
    { line: 'M146 318 L254 318 M166 336 L234 336 M186 354 L214 354', w: 3, color: 'candle', at: 0.6, opacity: 0.85 },
    // the canoe, far out, against the sun
    { group: [
        { shape: 'M174 288 C 190 295, 224 295, 240 286 C 233 300, 182 300, 174 288 Z', fill: 'ink' },
        { circle: [210, 270, 6.5], fill: 'ink' },
        { shape: 'M202 290 L204 279 C 206 275, 214 275, 216 279 L218 290 Z', fill: 'ink' },
        { line: 'M194 266 L224 300', w: 2.5, color: 'ink', draw: false },
      ], at: 0.9, anim: 'fade', loop: 'drift', origin: '207 284', loopAt: 1.6 },
    // the dock in the foreground
    { group: [
        { rect: [-1200, 376, 1386, 12, 0], fill: 'ink' },
        { rect: [-60, 388, 9, 30, 1], fill: 'ink' },
        { rect: [40, 388, 9, 30, 1], fill: 'ink' },
        { rect: [150, 388, 9, 30, 1], fill: 'ink' },
      ], at: 0.5, anim: 'slide-l' },
    // the party hat they left behind
    { group: [
        { shape: 'M130 326 L150 376 L104 376 Z', fill: 'cream' },
        { shape: 'M120.1 345 L137.6 345 L140 351 L117 351 Z', fill: 'candle' },
        { shape: 'M111.8 361 L144 361 L146.4 367 L108.7 367 Z', fill: 'candle' },
        { circle: [130, 325, 6.5], fill: 'candle' },
      ], at: 1.3, anim: 'drop' },
  ],
};
