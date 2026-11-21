/*
 * Home hero: Steph's 26th, seen from inside the cabin.
 * An arched window onto the night (moon, two pines), and on the sill a cake stand
 * with a "2" and a "6" candle burning. The one quiet hint: a fedora left on the sill.
 */
const P = (ox, oy) => (x, y) => `${+(ox + x).toFixed(1)} ${+(oy + y).toFixed(1)}`;

// number candles, 22 x 34, built from flat shapes (no glyphs)
const two = (ox, oy) => {
  const p = P(ox, oy);
  return `M${p(0, 10)} C${p(0, 4)} ${p(5, 0)} ${p(11, 0)} C${p(17, 0)} ${p(22, 4)} ${p(22, 10)} C${p(22, 15)} ${p(19, 18)} ${p(15, 21.5)} L${p(9.5, 27)} L${p(22, 27)} L${p(22, 34)} L${p(0, 34)} L${p(0, 28.5)} L${p(11, 18)} C${p(13.5, 15.8)} ${p(15, 14)} ${p(15, 11)} C${p(15, 8.5)} ${p(13.3, 7)} ${p(11, 7)} C${p(8.7, 7)} ${p(7, 8.5)} ${p(7, 11)} L${p(0, 11)} Z`;
};
const six = (ox, oy) => {
  const p = P(ox, oy);
  return `M${p(0, 23)} L${p(0, 13)} C${p(0, 5)} ${p(5, 0)} ${p(13, 0)} L${p(19, 0)} L${p(19, 7)} L${p(13, 7)} C${p(9.5, 7)} ${p(7, 9)} ${p(7, 13)} L${p(7, 23)} Z `
    + `M${p(0, 23)} A11 11 0 1 1 ${p(22, 23)} A11 11 0 1 1 ${p(0, 23)} Z `
    + `M${p(7.5, 23)} A4 4 0 1 0 ${p(15.5, 23)} A4 4 0 1 0 ${p(7.5, 23)} Z`;
};
const flame = (x, y) => `M${x} ${y - 20} C ${x - 8} ${y - 9}, ${x - 6} ${y}, ${x} ${y} C ${x + 6} ${y}, ${x + 8} ${y - 9}, ${x} ${y - 20} Z`;

// frosting: a band across the top with a few drips of different lengths
const drips = [[222, 13], [198, 5], [174, 17], [148, 8]];
const frosting = (() => {
  const base = 230;
  let d = `M126 222 C126 218 129 216 133 216 L227 216 C231 216 234 218 234 222 L234 ${base}`;
  for (const [cx, depth] of drips) {
    d += ` L${cx + 5} ${base} C${cx + 5} ${base + depth + 5}, ${cx - 5} ${base + depth + 5}, ${cx - 5} ${base}`;
  }
  return `${d} L126 ${base} Z`;
})();

const WINDOW = '#2A3542';

export default {
  id: 'home',
  title: 'A birthday cake with a 2 and a 6 candle on a cabin windowsill at night, a fedora left beside it',
  style: 'clean',
  viewBox: '0 0 360 400',
  tile: null,
  layers: [
    // the arched window onto the night
    { shape: 'M70 352 L70 168 A110 110 0 0 1 290 168 L290 352 Z', fill: WINDOW, at: 0, anim: 'fade' },
    { group: [
        { circle: [232, 118, 21], fill: 'cream' },
        { circle: [242, 111, 19], fill: WINDOW },
        { circle: [128, 104, 1.6], fill: 'cream' },
        { circle: [170, 142, 1.3], fill: 'cream' },
      ], at: 0.2, anim: 'fade' },
    // pines outside
    { shape: 'M74 352 L104 222 L134 352 Z', fill: 'pine', at: 0.3, anim: 'rise' },
    { shape: 'M238 352 L262 254 L286 352 Z', fill: 'pine', at: 0.4, anim: 'rise' },
    // the sill
    { rect: [52, 350, 256, 12, 3], fill: 'clay', at: 0.5, anim: 'fade' },
    // cake stand + cake
    { group: [
        { shape: 'M170 297 L190 297 L197 340 L163 340 Z', fill: 'birch' },
        { rect: [144, 338, 72, 12, 3], fill: 'birch' },
        { rect: [94, 290, 172, 8, 4], fill: 'birch' },
        { rect: [128, 222, 104, 68, 4], fill: 'clay' },
        { shape: frosting, fill: 'paper' },
      ], at: 0.7, anim: 'rise' },
    // 2 and 6
    { group: [
        { shape: two(152, 182), fill: 'paper' },
        { shape: six(186, 182), fill: 'paper' },
      ], at: 1.1, anim: 'rise' },
    { group: [
        { shape: flame(163, 176), fill: 'candle' },
        { shape: flame(197, 176), fill: 'candle' },
      ], at: 1.5, anim: 'grow', origin: '180 170', loop: 'flicker', loopAt: 2.2 },
    // the fedora someone left on the sill
    { group: [
        { shape: 'M230 345 C230 330 234 321 243 323 L249 326 L255 323 C264 321 268 330 268 345 Z', fill: 'ink' },
        { rect: [230, 336, 38, 5.5, 1], fill: 'smoke' },
        { rect: [217, 343, 64, 7, 3.5], fill: 'ink' },
      ], at: 1.9, anim: 'fade' },
  ],
};
