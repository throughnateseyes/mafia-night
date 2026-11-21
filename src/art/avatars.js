// Player avatars: a flat colored disc with one cabin-weekend object on it.
// Shown in the lobby, the narrator's roster and on the TV at ~30–46 px,
// so each symbol is 1–4 flat shapes, no outlines, and almost no motion.

// rotate a path written as "x y" pairs (M L C Z only) by deg around (cx, cy)
const rot = (d, deg, cx = 60, cy = 60) => {
  const c = Math.cos((deg * Math.PI) / 180);
  const s = Math.sin((deg * Math.PI) / 180);
  return d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => {
    const X = +x - cx;
    const Y = +y - cy;
    return `${(X * c - Y * s + cx).toFixed(1)} ${(X * s + Y * c + cy).toFixed(1)}`;
  });
};

// a rounded bar from (x1, y1) to (x2, y2), thickness t (a log, a stick)
const bar = (x1, y1, x2, y2, t) => {
  const L = Math.hypot(x2 - x1, y2 - y1);
  const nx = (-(y2 - y1) / L) * (t / 2);
  const ny = ((x2 - x1) / L) * (t / 2);
  const f = (n) => n.toFixed(1);
  const r = t / 2;
  return `M${f(x1 + nx)} ${f(y1 + ny)} L${f(x2 + nx)} ${f(y2 + ny)} A${r} ${r} 0 0 0 ${f(x2 - nx)} ${f(y2 - ny)} L${f(x1 - nx)} ${f(y1 - ny)} A${r} ${r} 0 0 0 ${f(x1 + nx)} ${f(y1 + ny)} Z`;
};

const av = (id, title, disc, layers) => ({
  id,
  title,
  style: 'clean',
  viewBox: '0 0 120 120',
  tile: null,
  layers: [{ circle: [60, 60, 56], fill: disc, at: 0, anim: 'grow' }, { group: layers, at: 0.15, anim: 'fade' }],
});

const fedora = av('av-fedora', 'Fedora', 'candle', [
  { shape: 'M38 68 C 37 53, 41 41, 48 36 C 53 33, 56 39, 60 39 C 64 39, 67 33, 72 36 C 79 41, 83 53, 82 68 Z', fill: 'ink' },
  { shape: 'M38 60 C 50 57, 70 57, 82 60 L82 66 C 70 63, 50 63, 38 66 Z', fill: 'berry' },
  { shape: 'M18 70 C 30 63, 46 62, 60 62 C 74 62, 90 63, 102 70 C 94 77, 76 79, 60 79 C 44 79, 26 77, 18 70 Z', fill: 'ink' },
]);

const tent = av('av-tent', 'Tent', 'pine', [
  { shape: 'M22 88 L60 26 L98 88 Z', fill: 'cream' },
  { shape: 'M49 88 L60 62 L71 88 Z', fill: 'candle' },
]);

const mug = av('av-mug', 'Mug of cocoa', 'ember', [
  { shape: 'M70 52 C 92 52, 92 82, 70 82 L70 73 C 81 73, 81 61, 70 61 Z', fill: 'cream' },
  { shape: 'M33 46 L73 46 L73 82 C 73 88, 69 92, 63 92 L43 92 C 37 92, 33 88, 33 82 Z', fill: 'cream' },
  { line: 'M47 38 C 43 32, 51 28, 47 21 M59 38 C 55 32, 63 28, 59 21', w: 3, color: 'cream', opacity: 0.8, draw: false },
]);

const pine = av('av-pine', 'Pine tree', 'lake', [
  { shape: 'M60 18 L80 48 L70 48 L88 76 L66 76 L66 94 L54 94 L54 76 L32 76 L50 48 L40 48 Z', fill: 'pine' },
]);

const mallow = av('av-marshmallow', 'Marshmallow on a stick', 'ember', [
  { shape: bar(22, 100, 66, 56, 4), fill: '#8A5F43' },
  { shape: rot('M64 30 L88 30 C 93 30, 96 33, 96 38 L96 52 C 96 57, 93 60, 88 60 L64 60 C 59 60, 56 57, 56 52 L56 38 C 56 33, 59 30, 64 30 Z', -45, 76, 45), fill: 'paper' },
  { shape: rot('M84 30 L88 30 C 93 30, 96 33, 96 38 L96 52 C 96 57, 93 60, 88 60 L84 60 Z', -45, 76, 45), fill: 'clay' },
]);

const partyHat = av('av-party-hat', 'Party hat', 'moss', [
  { shape: rot('M60 26 L84 92 L36 92 Z', 10), fill: 'ember' },
  { circle: [65.9, 26.5, 8], fill: 'candle' },
  { circle: [58, 68, 3.5], fill: 'cream' },
  { circle: [68, 52, 3], fill: 'cream' },
]);

const canoe = av('av-canoe', 'Canoe', '#4F6B7A', [
  { shape: 'M14 50 C 20 70, 36 80, 60 80 C 84 80, 100 70, 106 50 C 86 60, 34 60, 14 50 Z', fill: 'ember' },
  { shape: 'M20 54 C 38 62, 82 62, 100 54 C 82 66, 38 66, 20 54 Z', fill: '#B4532B' },
  { line: 'M28 90 C 38 87, 48 93, 60 90 C 72 87, 82 93, 92 90', w: 3, color: 'lake', draw: false },
]);

const cake = av('av-cake', 'Slice of birthday cake', 'clay', [
  { shape: 'M24 70 L94 54 L94 88 L24 88 Z', fill: 'paper' },
  { shape: 'M24 78 L94 68 L94 75 L24 83 Z', fill: 'berry' },
  { rect: [80, 32, 7, 20, 2], fill: 'cream' },
  { shape: 'M83.5 14 C 90 22, 91 27, 83.5 30 C 76 27, 77 22, 83.5 14 Z', fill: 'paper' },
]);

const campfire = av('av-campfire', 'Campfire', '#2A3542', [
  { shape: bar(30, 90, 90, 76, 9), fill: '#8A5F43' },
  { shape: bar(30, 76, 90, 90, 9), fill: 'clay' },
  { shape: 'M60 22 C 72 40, 82 52, 82 66 C 82 79, 72 86, 60 86 C 48 86, 38 79, 38 66 C 38 55, 45 48, 49 38 C 53 46, 56 50, 58 54 C 61 44, 61 33, 60 22 Z', fill: 'ember' },
  { shape: 'M61 50 C 67 60, 72 66, 72 73 C 72 80, 67 84, 60 84 C 53 84, 48 80, 48 73 C 48 66, 54 62, 57 55 C 58 59, 60 61, 61 63 C 62 58, 62 54, 61 50 Z', fill: 'candle' },
]);

const balloon = av('av-balloon', 'Balloon', 'candle', [
  { line: 'M60 80 C 54 88, 66 94, 58 104', w: 2.5, color: 'ink', opacity: 0.7, draw: false },
  { shape: 'M60 18 C 76 18, 86 32, 86 46 C 86 64, 72 78, 60 78 C 48 78, 34 64, 34 46 C 34 32, 44 18, 60 18 Z', fill: 'berry' },
  { shape: 'M55 83 L65 83 L60 76 Z', fill: 'berry' },
  { shape: 'M44 40 C 44 32, 50 27, 55 27 C 50 31, 48 36, 48 42 Z', fill: 'cream', opacity: 0.55 },
]);

const fish = av('av-fish', 'Fish', 'pine', [
  { shape: 'M78 60 L98 44 C 93 53, 93 67, 98 76 Z', fill: 'lake' },
  { shape: 'M24 60 C 36 42, 66 40, 82 60 C 66 80, 36 78, 24 60 Z', fill: 'lake' },
  { circle: [38, 57, 3.5], fill: 'pine' },
]);

const lantern = av('av-lantern', 'Lantern', '#3B4F66', [
  { circle: [60, 62, 34], fill: 'candle', opacity: 0.16 },
  { line: 'M50 34 C 50 22, 70 22, 70 34', w: 3, color: 'smoke', draw: false },
  { shape: 'M44 42 L76 42 L70 33 L50 33 Z', fill: 'smoke' },
  { rect: [47, 42, 26, 34, 5], fill: 'candle' },
  { rect: [42, 76, 36, 9, 3], fill: 'smoke' },
]);

const smore = av('av-smore', "S'more", 'lake', [
  { rect: [28, 72, 64, 16, 4], fill: 'clay' },
  { rect: [32, 54, 56, 14, 7], fill: 'paper' },
  { rect: [34, 66, 52, 7, 1], fill: '#5A3A2A' },
  { rect: [28, 36, 64, 16, 4], fill: 'clay' },
  { group: [
      { circle: [44, 44, 2.2], fill: '#B07E5C' },
      { circle: [60, 44, 2.2], fill: '#B07E5C' },
      { circle: [76, 44, 2.2], fill: '#B07E5C' },
    ] },
]);

const moon = av('av-moon', 'Moon', 'dusk', [
  { circle: [56, 62, 30], fill: 'cream' },
  { circle: [72, 50, 26], fill: 'dusk' },
  { circle: [84, 36, 3.5], fill: 'candle' },
]);

const candles = av('av-26', 'Number candles 2 and 6', 'berry', [
  { line: 'M32 54 C 32 44, 52 43, 52 54 C 52 64, 32 72, 32 86 L54 86', w: 8, color: 'cream', draw: false },
  { line: 'M84 48 C 72 48, 66 60, 66 72 C 66 81, 70 86, 76 86 C 82 86, 87 81, 87 74 C 87 67, 82 63, 76 63 C 71 63, 67 66, 66 70', w: 8, color: 'cream', draw: false },
  { shape: 'M42 24 C 47 30, 48 35, 42 37 C 36 35, 37 30, 42 24 Z', fill: 'candle' },
  { shape: 'M78 24 C 83 30, 84 35, 78 37 C 72 35, 73 30, 78 24 Z', fill: 'candle' },
]);

const cabin = av('av-cabin', 'Cabin with a lit window', 'moss', [
  { rect: [70, 30, 9, 20, 1], fill: 'ink' },
  { shape: 'M24 62 L60 30 L96 62 Z', fill: 'ink' },
  { rect: [32, 58, 56, 34, 2], fill: 'ink' },
  { rect: [51, 66, 18, 16, 2], fill: 'candle' },
]);

export default [fedora, tent, mug, pine, campfire, partyHat, cake, canoe, candles, fish, balloon, mallow, smore, moon, lantern, cabin];
