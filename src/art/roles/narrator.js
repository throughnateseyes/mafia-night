// Role portrait: the Narrator, the storyteller at the campfire.
// An open book lies in front of the fire; sparks drift up.

// a log: rounded bar from (x1, y1) to (x2, y2), thickness t
const log = (x1, y1, x2, y2, t) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const L = Math.hypot(dx, dy);
  const nx = (-dy / L) * (t / 2);
  const ny = (dx / L) * (t / 2);
  const f = (n) => n.toFixed(1);
  return `M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} A${t / 2} ${t / 2} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(y1 - ny)} A${t / 2} ${t / 2} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)} Z`;
};

export default {
  id: 'role-narrator',
  title: 'The Narrator: an open book in front of a crackling campfire',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'dusk',
  layers: [
    // firelight
    { circle: [200, 220, 160], fill: 'candle', opacity: 0.06, at: 0, anim: 'grow' },
    { circle: [200, 226, 112], fill: 'candle', opacity: 0.06, at: 0.1, anim: 'grow' },
    // logs
    { shape: log(136, 292, 262, 258, 24), fill: '#8A5F43', at: 0.2, anim: 'rise' },
    { shape: log(138, 258, 264, 292, 24), fill: '#6E4A35', at: 0.25, anim: 'rise' },
    // the fire
    {
      group: [
        { shape: 'M200 98 C 220 140, 262 176, 262 228 C 262 264, 236 284, 200 284 C 164 284, 138 264, 138 228 C 138 196, 156 176, 168 146 C 178 168, 184 180, 194 190 C 200 160, 196 128, 200 98 Z', fill: 'ember' },
        { shape: 'M204 168 C 214 196, 234 212, 234 240 C 234 264, 218 278, 200 278 C 182 278, 166 264, 166 242 C 166 220, 184 206, 190 186 C 196 200, 200 206, 204 214 C 206 198, 206 184, 204 168 Z', fill: 'candle' },
      ],
      at: 0.4,
      anim: 'grow',
      loop: 'flicker',
      origin: '200 280',
      loopAt: 1.4,
    },
    // sparks
    { group: [
        { circle: [246, 106, 3.5], fill: 'candle' },
        { circle: [160, 86, 2.5], fill: 'candle' },
        { circle: [228, 66, 2], fill: 'candle' },
      ], at: 1.4, anim: 'fade', loop: 'drift', origin: '200 90', loopAt: 1.8 },
    // the open book
    {
      group: [
        { shape: 'M200 318 C 170 300, 128 298, 96 306 L90 352 C 128 344, 168 348, 200 364 C 232 348, 272 344, 310 352 L304 306 C 272 298, 230 300, 200 318 Z', fill: 'pine' },
        { shape: 'M200 316 C 174 298, 134 294, 104 300 L100 340 C 136 334, 172 340, 200 354 Z', fill: 'cream' },
        { shape: 'M200 316 C 226 298, 266 294, 296 300 L300 340 C 264 334, 228 340, 200 354 Z', fill: 'paper' },
      ],
      at: 0.9,
      anim: 'rise',
    },
  ],
};
