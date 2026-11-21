/*
 * The Medic wakes: a lantern swings low over one sleeping camper, the first-aid
 * tin beside them. They sleep on, breathing, none the wiser.
 */
export default {
  id: 'doctor-wake',
  title: 'A lantern over a sleeping camper, a first-aid tin beside them',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'dusk',
  layers: [
    // glow
    { circle: [200, 196, 150], fill: 'candle', opacity: 0.06, at: 0.6, anim: 'fade' },
    { circle: [200, 196, 92], fill: 'candle', opacity: 0.11, at: 0.7, anim: 'fade' },
    // the lantern on its cord
    { group: [
        { line: 'M200 -1200 L200 146', w: 2, color: 'smoke', draw: false },
        { line: 'M185 160 C185 140 215 140 215 160', w: 2.5, color: 'clay', draw: false },
        { rect: [178, 157, 44, 11, 4], fill: 'clay' },
        { rect: [184, 168, 32, 50, 8], fill: 'candle' },
        { rect: [178, 216, 44, 11, 4], fill: 'clay' },
      ], at: 0.2, anim: 'fade', loop: 'sway', origin: '200 0', loopAt: 1.2 },
    // ground
    { shape: 'M-1200 368 L0 368 C 120 358, 280 358, 400 368 L1600 368 L1600 1700 L-1200 1700 Z', fill: '#18202A', at: 0, anim: 'fade' },
    // the sleeping camper
    { group: [
        { rect: [96, 334, 172, 36, 18], fill: 'lake' },
        { rect: [96, 334, 54, 36, 18], fill: '#B9CDD8' },
        { circle: [108, 338, 17], fill: 'clay' },
        { line: 'M100 340 C101.5 343 105 343 106.5 340 M112 340 C113.5 343 117 343 118.5 340', w: 1.8, color: 'ink', draw: false },
      ], at: 0.9, anim: 'rise', loop: 'breathe', origin: '182 370', loopAt: 1.8 },
    // first-aid tin
    { group: [
        { rect: [304, 326, 22, 8, 3], fill: 'moss' },
        { rect: [286, 331, 58, 40, 6], fill: 'moss' },
        { rect: [308.5, 339, 13, 24, 1.5], fill: 'paper' },
        { rect: [303, 344.5, 24, 13, 1.5], fill: 'paper' },
      ], at: 1.4, anim: 'rise' },
  ],
};
