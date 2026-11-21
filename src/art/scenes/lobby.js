/*
 * Lobby: pull up a chair. Two pines with string lights swagged between them,
 * a fire laid but not lit, and four empty camp chairs around it. The gap at the
 * front of the ring is yours. One chair already has a party hat on it.
 */
const chair = (x, base, s, fabric) => {
  const p = (dx, dy) => `${+(x + dx * s).toFixed(1)} ${+(base + dy * s).toFixed(1)}`;
  return [
    { rect: [+(x - 17 * s).toFixed(1), +(base - 56 * s).toFixed(1), +(34 * s).toFixed(1), +(31 * s).toFixed(1), +(3 * s).toFixed(1)], fill: fabric },
    { shape: `M${p(-20, -26)} L${p(20, -26)} L${p(18, -21)} L${p(-18, -21)} Z `
      + `M${p(-16, -21)} L${p(-11, -21)} L${p(16, 0)} L${p(11, 0)} Z `
      + `M${p(16, -21)} L${p(11, -21)} L${p(-16, 0)} L${p(-11, 0)} Z`, fill: 'ink' },
  ];
};

// string-light wire and bulbs along it
const W = [[66, 138], [150, 190], [250, 190], [334, 146]];
const bez = (t) => {
  const u = 1 - t;
  const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  return [0, 1].map((i) => +(k.reduce((s, kk, j) => s + kk * W[j][i], 0)).toFixed(1));
};
const bulbs = [0.14, 0.32, 0.5, 0.68, 0.86].map(bez);
const mid = bulbs[2];

export default {
  id: 'lobby',
  title: 'Empty camp chairs around a fire pit, not lit yet, under string lights',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'cream',
  layers: [
    // ground
    { shape: 'M-1200 300 L0 300 C 120 286, 280 286, 400 300 L1600 300 L1600 1700 L-1200 1700 Z', fill: 'birch', at: 0, anim: 'fade' },
    // two pines holding up the lights
    { shape: 'M-6 332 L44 92 L94 332 Z', fill: 'pine', at: 0.2, anim: 'rise' },
    { shape: 'M306 332 L352 120 L398 332 Z', fill: 'pine', at: 0.3, anim: 'rise' },
    { line: `M${W[0]} C ${W[1]}, ${W[2]}, ${W[3]}`, w: 2, color: 'ink', opacity: 0.5, at: 0.6, dur: 0.8 },
    { group: bulbs.filter((_, i) => i !== 2).map(([x, y]) => ({ circle: [x, y + 6, 5.5], fill: 'candle' })), at: 1.2, anim: 'fade' },
    { group: [{ circle: [mid[0], mid[1] + 6, 5.5], fill: 'candle' }], at: 1.3, anim: 'fade', loop: 'flicker', origin: `${mid[0]} ${mid[1] + 6}`, loopAt: 2 },
    // back chairs
    { group: chair(124, 308, 0.85, 'lake'), at: 0.7, anim: 'rise' },
    { group: chair(276, 308, 0.85, 'moss'), at: 0.8, anim: 'rise' },
    // fire pit, laid but not lit
    { group: [
        { shape: 'M156 334 C156 324 176 318 200 318 C224 318 244 324 244 334 C244 344 224 350 200 350 C176 350 156 344 156 334 Z', fill: 'smoke' },
        { shape: 'M168 333 C168 327 182 324 200 324 C218 324 232 327 232 333 C232 339 218 342 200 342 C182 342 168 339 168 333 Z', fill: 'dusk' },
        { shape: 'M182 338 L198 294 L203 296 L189 339 Z M218 338 L202 294 L197 296 L211 339 Z M198 340 L199 292 L203 292 L204 340 Z', fill: 'clay' },
      ], at: 0.9, anim: 'fade' },
    // front chairs, seen from behind, facing the pit
    { group: chair(118, 394, 1.2, 'clay'), at: 1.0, anim: 'rise' },
    { group: chair(282, 394, 1.2, 'pine'), at: 1.1, anim: 'rise' },
    // the birthday girl's seat
    { group: [
        { shape: 'M112 288 L124 256 L136 288 Z', fill: 'candle' },
        { circle: [124, 256, 4], fill: 'paper' },
      ], at: 1.7, anim: 'drop' },
  ],
};
