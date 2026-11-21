/*
 * The Mafia took the cabin. Two fedoras fill the lit doorway;
 * out front, the birthday candles are blown out and the string lights are dark.
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

// a fedora silhouette, head-and-shoulders, centered on x with the brim at y
const fedora = (x, y) => [
  // shoulders (down to the threshold at y 398) + head
  { shape: `M${x - 26} 398 L${x - 26} ${y + 50} C ${x - 26} ${y + 34}, ${x + 26} ${y + 34}, ${x + 26} ${y + 50} L${x + 26} 398 Z M${x - 13} ${y + 17} A13 13 0 1 0 ${x + 13} ${y + 17} A13 13 0 1 0 ${x - 13} ${y + 17} Z`, fill: 'ink' },
  // crown + brim
  { shape: `M${x - 12} ${y} L${x - 10} ${y - 15} C ${x - 5} ${y - 20}, ${x + 5} ${y - 20}, ${x + 10} ${y - 15} L${x + 12} ${y} L${x + 21} ${y} C ${x + 24} ${y}, ${x + 24} ${y + 5}, ${x + 21} ${y + 5} L${x - 21} ${y + 5} C ${x - 24} ${y + 5}, ${x - 24} ${y}, ${x - 21} ${y} Z`, fill: 'ink' },
];

const O = { cx: 318, by: 396, s: 0.56 };

export default {
  id: 'mafia-wins',
  title: 'The Mafia wins',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'night',
  layers: [
    // the string lights, switched off now
    { line: LIGHTS.wire, w: 2, color: '#2A3542', at: 0.2, draw: false, anim: 'fade' },
    { shape: LIGHTS.bulbs, fill: '#3A4656', at: 0.6, anim: 'fade' },
    // pines behind the cabin
    { group: [
        { shape: 'M2 398 L44 236 L86 398 Z', fill: 'pine' },
        { shape: 'M196 398 L238 226 L280 398 Z', fill: 'pine' },
      ], at: 0.1, anim: 'rise' },
    // ground
    { shape: 'M-1200 396 L0 396 C 120 386, 280 386, 400 396 L1600 396 L1600 1700 L-1200 1700 Z', fill: 'dusk', at: 0, anim: 'fade' },
    // the cabin, door open
    { group: [
        { rect: [30, 270, 206, 128, 2], fill: '#2A3542' },
        { shape: 'M14 276 L133 190 L252 276 Z', fill: '#2A3542' },
        { rect: [88, 292, 90, 106, 2], fill: 'candle' },
      ], at: 0.3, anim: 'rise' },
    // two fedoras in the doorway
    { group: fedora(114, 318), at: 1, anim: 'fade' },
    { group: fedora(152, 324), at: 1.2, anim: 'fade' },
    // the cake out front, candles out
    { group: [
        { rect: [O.cx - 104 * O.s, O.by - 10 * O.s, 208 * O.s, 10 * O.s, 5 * O.s], fill: 'smoke' },
        { rect: [O.cx - 80 * O.s, O.by - 94 * O.s, 160 * O.s, 88 * O.s, 10 * O.s], fill: '#8A4A35' },
        { shape: fit('M120 310 Q120 298 132 298 L268 298 Q280 298 280 310 L280 330 Q280 338 273 338 Q266 338 266 330 L266 322 Q266 316 258 316 L232 316 Q224 316 224 324 L224 340 Q224 348 216 348 Q208 348 208 340 L208 322 Q208 316 200 316 L166 316 Q158 316 158 322 L158 332 Q158 340 150 340 Q142 340 142 332 L142 322 Q142 316 134 316 L128 316 Q120 316 120 322 Z', O), fill: 'smoke' },
        { shape: fit('M158 252 A18 18 0 0 1 194 252 C194 263, 188 271, 177 283 L194 283 L194 296 L158 296 L158 287 L176 266 C181 260, 183 256, 183 252 A7 7 0 0 0 169 252 Z', O), fill: 'birch' },
        { shape: fit('M206 278 A18 18 0 0 0 242 278 A18 18 0 0 0 206 278 Z M231 278 A7 7 0 0 1 217 278 A7 7 0 0 1 231 278 Z', O), fill: 'birch' },
        { shape: fit('M206 278 C206 252, 216 236, 238 234 L240 245 C226 246, 217 257, 217 278 Z', O), fill: 'birch' },
      ], at: 0.6, anim: 'rise' },
    // smoke curling off the wicks
    { group: [
        { line: fit('M176 232 C 168 216, 184 204, 176 188 C 170 176, 182 166, 176 152 M238 232 C 230 218, 246 206, 238 192 C 232 180, 244 170, 238 158', O), w: 2, color: 'smoke', at: 1.5, opacity: 0.8 },
      ], loop: 'drift', origin: '318 300', loopAt: 2.4 },
  ],
};
