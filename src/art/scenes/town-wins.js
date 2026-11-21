/*
 * The town wins. Steph's cake under the string lights,
 * the "2" and "6" candles lit, a little confetti in the air.
 */
const r1 = (v) => Math.round(v * 10) / 10;

// scale + move an absolute path (M L C Q A Z), drawn around (200, 394)
function fit(d, { cx, by, s }) {
  const tok = d.match(/[A-Za-z]|-?\d*\.?\d+/g);
  const X = (v) => r1(cx + (v - 200) * s);
  const Y = (v) => r1(by + (v - 394) * s);
  let out = '';
  let cmd = '';
  for (let i = 0; i < tok.length; ) {
    if (/[A-Za-z]/.test(tok[i])) { cmd = tok[i++]; out += ` ${cmd}`; if (cmd === 'Z') continue; }
    if (cmd === 'A') {
      const [rx, ry, rot, laf, sf, x, y] = tok.slice(i, i + 7).map(Number);
      out += ` ${r1(rx * s)} ${r1(ry * s)} ${rot} ${laf} ${sf} ${X(x)} ${Y(y)}`;
      i += 7;
    } else {
      out += ` ${X(+tok[i])} ${Y(+tok[i + 1])}`;
      i += 2;
    }
  }
  return out.trim();
}

// string lights: a scalloped wire and its bulbs, repeating far past both edges
function stringLights() {
  let wire = 'M-1200 58';
  const bulbs = [];
  for (let x0 = -1200; x0 < 1600; x0 += 200) {
    const even = ((x0 / 200) % 2 + 2) % 2 === 0;
    const [ya, yb] = even ? [58, 70] : [70, 58];
    const cx = x0 + (even ? 97 : 103);
    wire += ` Q ${cx} 130, ${x0 + 200} ${yb}`;
    for (const t of even ? [0.33, 0.7] : [0.3, 0.67]) {
      const q = (a, c, b) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
      const bx = r1(q(x0, cx, x0 + 200));
      const by = r1(q(ya, 130, yb) + 4);
      bulbs.push(`M${r1(bx - 6.5)} ${by} A6.5 6.5 0 1 0 ${r1(bx + 6.5)} ${by} A6.5 6.5 0 1 0 ${r1(bx - 6.5)} ${by} Z`);
    }
  }
  return { wire, bulbs: bulbs.join(' ') };
}
const LIGHTS = stringLights();

// the birthday cake: plate, body, drippy frosting, "2" and "6" number candles
function cake(o, { plate, body, frosting, candles, lit, at }) {
  const R = (x, y, w, h, rx) => [r1(o.cx + (x - 200) * o.s), r1(o.by + (y - 394) * o.s), r1(w * o.s), r1(h * o.s), r1(rx * o.s)];
  const layers = [
    { group: [
        { rect: R(96, 384, 208, 10, 5), fill: plate },
        { rect: R(120, 300, 160, 88, 10), fill: body },
        { shape: fit('M120 310 Q120 298 132 298 L268 298 Q280 298 280 310 L280 330 Q280 338 273 338 Q266 338 266 330 L266 322 Q266 316 258 316 L232 316 Q224 316 224 324 L224 340 Q224 348 216 348 Q208 348 208 340 L208 322 Q208 316 200 316 L166 316 Q158 316 158 322 L158 332 Q158 340 150 340 Q142 340 142 332 L142 322 Q142 316 134 316 L128 316 Q120 316 120 322 Z', o), fill: frosting },
      ], at, anim: 'rise' },
    { group: [
        // "2"
        { shape: fit('M158 252 A18 18 0 0 1 194 252 C194 263, 188 271, 177 283 L194 283 L194 296 L158 296 L158 287 L176 266 C181 260, 183 256, 183 252 A7 7 0 0 0 169 252 Z', o), fill: candles },
        // "6"
        { shape: fit('M206 278 A18 18 0 0 0 242 278 A18 18 0 0 0 206 278 Z M231 278 A7 7 0 0 1 217 278 A7 7 0 0 1 231 278 Z', o), fill: candles },
        { shape: fit('M206 278 C206 252, 216 236, 238 234 L240 245 C226 246, 217 257, 217 278 Z', o), fill: candles },
      ], at: at + 0.35, anim: 'rise' },
  ];
  return layers;
}

const O = { cx: 200, by: 392, s: 1.05 };

export default {
  id: 'town-wins',
  title: 'The town wins',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'lake',
  layers: [
    // string lights
    { line: LIGHTS.wire, w: 2, color: 'dusk', at: 0.1, draw: false, anim: 'fade' },
    { shape: LIGHTS.bulbs, fill: 'candle', at: 0.7, anim: 'fade' },
    // ground
    { shape: 'M-1200 400 L0 400 C 120 392, 280 392, 400 400 L1600 400 L1600 1700 L-1200 1700 Z', fill: '#89A6B7', at: 0, anim: 'fade' },
    ...cake(O, { plate: 'paper', body: 'ember', frosting: 'cream', candles: 'paper', at: 0.3 }),
    // wicks
    { line: `M${r1(200 + (176 - 200) * O.s)} ${r1(392 + (234 - 394) * O.s)} L${r1(200 + (176 - 200) * O.s)} ${r1(392 + (226 - 394) * O.s)} M${r1(200 + (238 - 200) * O.s)} ${r1(392 + (234 - 394) * O.s)} L${r1(200 + (238 - 200) * O.s)} ${r1(392 + (226 - 394) * O.s)}`, w: 2, color: 'ink', at: 1, draw: false },
    // flames
    { group: [
        { shape: fit('M176 198 C 183 208, 187 215, 183 222 C 180 228, 172 228, 169 222 C 165 215, 169 208, 176 198 Z', O), fill: 'candle' },
        { shape: fit('M238 198 C 245 208, 249 215, 245 222 C 242 228, 234 228, 231 222 C 227 215, 231 208, 238 198 Z', O), fill: 'candle' },
      ], at: 1.2, anim: 'grow', origin: '207 222', loop: 'flicker', loopAt: 1.9 },
    // confetti
    { group: [
        { shape: 'M70 180 L84 174 L88 182 L74 188 Z', fill: 'cream' },
        { circle: [330, 170, 5], fill: 'ember' },
        { shape: 'M300 236 L310 226 L316 232 L306 242 Z', fill: 'pine' },
        { circle: [96, 262, 4], fill: 'pine' },
        { circle: [60, 330, 4], fill: 'ember' },
      ], at: 1.4, anim: 'fade', loop: 'float', origin: '200 240', loopAt: 2.1 },
  ],
};
