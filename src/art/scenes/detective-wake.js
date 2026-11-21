/*
 * The Ranger wakes: a flashlight beam cuts through the pines and lands on one camper
 * in a beanie. Their shadow on the tree behind them is wearing a fedora.
 */
const f = (n) => +n.toFixed(1);
const SRC = [90, 362];
const C = [286, 300];
const R = 66;
const [dx, dy] = [C[0] - SRC[0], C[1] - SRC[1]];
const len = Math.hypot(dx, dy);
const [ux, uy] = [dx / len, dy / len];
const [px, py] = [-uy, ux];
const edgeA = [f(C[0] + px * R), f(C[1] + py * R)];
const edgeB = [f(C[0] - px * R), f(C[1] - py * R)];
// flashlight + mitten, laid out along the beam from the flashlight's head
const at = (along, across) => `${f(SRC[0] - ux * along + px * across)} ${f(SRC[1] - uy * along + py * across)}`;
const torch = `M${at(0, -12)} L${at(0, 12)} L${at(18, 8)} L${at(72, 8)} L${at(72, -8)} L${at(18, -8)} Z`;
const mitten = `M${at(26, -13)} C${at(26, -21)} ${at(52, -21)} ${at(52, -13)} L${at(52, 15)} C${at(52, 23)} ${at(26, 23)} ${at(26, 15)} Z`;

// the camper, and the same camper's shadow (bigger, up and to the right)
const body = (x, base, s) => `M${f(x - 34 * s)} ${base} C${f(x - 34 * s)} ${f(base - 50 * s)} ${f(x - 20 * s)} ${f(base - 66 * s)} ${x} ${f(base - 66 * s)} C${f(x + 20 * s)} ${f(base - 66 * s)} ${f(x + 34 * s)} ${f(base - 50 * s)} ${f(x + 34 * s)} ${base} Z`;
const SH = '#1E3328';

export default {
  id: 'detective-wake',
  title: 'A flashlight beam through the pines landing on a camper whose shadow wears a fedora',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'dusk',
  layers: [
    // far pines
    { shape: 'M14 384 L58 214 L102 384 Z M104 384 L144 246 L184 384 Z', fill: '#2A3542', at: 0, anim: 'fade' },
    // the tree behind the suspect
    { shape: 'M230 386 L318 106 L406 386 Z', fill: 'pine', at: 0.2, anim: 'rise' },
    // ground
    { shape: 'M-1200 380 L0 380 C 120 370, 280 370, 400 382 L1600 382 L1600 1700 L-1200 1700 Z', fill: '#18202A', at: 0, anim: 'fade' },
    // the beam
    { shape: `M${SRC} L${edgeA} L${edgeB} Z`, fill: 'candle', opacity: 0.13, at: 0.7, anim: 'fade' },
    { circle: [...C, R], fill: 'candle', opacity: 0.16, at: 0.8, anim: 'fade' },
    // the shadow on the tree, in a fedora
    { group: [
        { shape: 'M286 378 C286 290 302 250 326 250 C350 250 366 290 366 378 Z', fill: SH },
        { circle: [326, 222, 21], fill: SH },
        { shape: 'M311 206 C311 192 315 184 322 186 L326 189 L330 186 C337 184 341 192 341 206 Z', fill: SH },
        { rect: [297, 203, 58, 7, 3.5], fill: SH },
      ], at: 1.6, anim: 'fade' },
    // the camper in the light, in a beanie
    { group: [
        { shape: body(286, 380, 1), fill: 'birch' },
        { circle: [286, 290, 18], fill: 'birch' },
        { shape: 'M267 287 C267 266 305 266 305 287 Z', fill: 'smoke' },
        { circle: [286, 268, 4.5], fill: 'smoke' },
      ], at: 1.0, anim: 'fade' },
    { group: [
        { circle: [279.5, 295, 2.2], fill: 'ink' },
        { circle: [292.5, 295, 2.2], fill: 'ink' },
      ], at: 1.3, anim: 'fade', loop: 'blink', origin: '286 295', loopAt: 2.2 },
    // the Ranger's mitten and flashlight
    { group: [
        { shape: torch, fill: 'birch' },
        { shape: mitten, fill: 'clay' },
      ], at: 0.4, anim: 'slide-l' },
  ],
};
