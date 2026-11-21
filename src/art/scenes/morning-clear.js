/*
 * Everyone woke up. The sun clears the far hills over a still lake;
 * a canoe waits at the dock, and someone's cocoa is still steaming.
 */
export default {
  id: 'morning-clear',
  title: 'Everyone made it',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'cream',
  layers: [
    // sun lifting over the hills
    { circle: [196, 262, 74], fill: 'candle', at: 0.1, anim: 'rise' },
    // far hills, then the near treeline
    { shape: 'M-1200 300 L0 300 C 70 278, 130 282, 186 300 C 250 280, 330 268, 400 288 C 450 280, 520 294, 600 300 L1600 300 L1600 330 L-1200 330 Z', fill: 'moss', at: 0, anim: 'fade' },
    { group: [
        { shape: 'M-14 324 L30 210 L74 324 Z', fill: 'pine' },
        { shape: 'M36 324 L84 176 L132 324 Z', fill: 'pine' },
        { shape: 'M340 324 L370 242 L400 324 Z', fill: 'pine' },
      ], at: 0.3, anim: 'rise' },
    // the lake
    { rect: [-1200, 318, 2800, 1382], fill: 'lake', at: 0, anim: 'fade' },
    // sun on the water
    { line: 'M156 342 L236 342 M172 358 L220 358 M186 374 L206 374', w: 3, color: 'paper', at: 0.7, opacity: 0.9 },
    // dock and posts
    { group: [
        { rect: [262, 360, 1400, 10, 2], fill: 'clay' },
        // posts every 82, continuing past the edge with the planks
        { shape: 'M280 370 L288 370 L288 400 L280 400 Z M362 370 L370 370 L370 400 L362 400 Z M444 370 L452 370 L452 400 L444 400 Z M526 370 L534 370 L534 400 L526 400 Z M608 370 L616 370 L616 400 L608 400 Z M690 370 L698 370 L698 400 L690 400 Z M772 370 L780 370 L780 400 L772 400 Z M854 370 L862 370 L862 400 L854 400 Z M936 370 L944 370 L944 400 L936 400 Z M1018 370 L1026 370 L1026 400 L1018 400 Z M1100 370 L1108 370 L1108 400 L1100 400 Z M1182 370 L1190 370 L1190 400 L1182 400 Z M1264 370 L1272 370 L1272 400 L1264 400 Z M1346 370 L1354 370 L1354 400 L1346 400 Z M1428 370 L1436 370 L1436 400 L1428 400 Z M1510 370 L1518 370 L1518 400 L1510 400 Z M1592 370 L1600 370 L1600 400 L1592 400 Z', fill: '#B98462' },
      ], at: 0.5, anim: 'slide-r' },
    // canoe tied up
    { shape: 'M120 378 C 160 386, 236 386, 280 376 C 268 400, 134 400, 120 378 Z', fill: 'pine', at: 0.8, anim: 'slide-l' },
    // the cocoa mug at the end of the dock
    { group: [
        { rect: [326, 338, 20, 22, 3], fill: 'paper' },
        { line: 'M346 343 C 354 343, 354 354, 346 354', w: 3, color: 'paper', draw: false },
      ], at: 1.1, anim: 'rise' },
    { group: [
        { line: 'M332 330 C 326 320, 338 314, 332 302 M341 328 C 337 320, 345 314, 341 306', w: 2.5, color: 'smoke', at: 1.4 },
      ], loop: 'float', origin: '336 316', loopAt: 2 },
  ],
};
