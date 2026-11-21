// Home hero: the whole game in one picture.
// A birthday cake under a cut-paper moon and string lights. A knife stands in it,
// one drop of red runs down the frosting, and a fedora has snuffed out one of the candles.

const bulb = (x, y) => `M${x} ${y} L${x + 5} ${y + 7} C ${x + 7} ${y + 15}, ${x - 7} ${y + 15}, ${x - 5} ${y + 7} Z`;
const flame = (x, y) => `M${x} ${y - 24} C ${x - 10} ${y - 10}, ${x - 8} ${y}, ${x} ${y} C ${x + 8} ${y}, ${x + 10} ${y - 10}, ${x} ${y - 24} Z`;

export default {
  id: 'home',
  title: 'A birthday cake under the moon and string lights, a knife standing in it, a drop of red on the frosting, and a fedora snuffing out one candle',
  viewBox: '0 0 360 400',
  tile: null,
  layers: [
    // the moon
    { paper: 'M184 36 C 248 34, 298 84, 296 148 C 294 212, 244 260, 180 258 C 116 256, 68 206, 70 142 C 72 80, 120 38, 184 36 Z', fill: 'periwinkle', anim: 'grow', at: 0.1, origin: '184 148' },
    { ink: 'M60 122 C 70 66, 124 26, 188 26 C 254 28, 302 76, 308 138', w: 3.5, at: 0.3, taper: 0.8 },

    // string lights
    { ink: 'M-6 30 C 80 92, 260 96, 366 24', w: 3, at: 0.4, dur: 0.5 },
    { group: [
      { paper: [bulb(42, 56), bulb(100, 76), bulb(160, 84), bulb(220, 82), bulb(282, 68), bulb(334, 46)].join(' '), fill: 'candle', rough: 0.3 },
    ], anim: 'pop', at: 0.8, loop: 'flicker', origin: '180 70', loopAt: 3.2 },

    // the cake
    { paper: 'M86 244 C 88 226, 276 224, 282 242 L284 330 C 240 344, 126 344, 84 330 Z', fill: 'bone', anim: 'rise', at: 0.6 },
    { paper: 'M80 238 C 82 222, 278 220, 280 236 L280 258 C 272 274, 262 274, 258 262 C 250 280, 232 280, 228 262 C 218 276, 204 276, 200 262 C 190 282, 170 282, 166 262 C 156 276, 140 276, 136 262 C 126 278, 108 278, 104 262 C 96 274, 84 272, 80 258 Z', fill: 'terracotta', rough: 0.8, anim: 'fade', at: 0.9 },
    { ink: 'M78 238 C 80 218, 278 216, 282 236 C 282 256, 80 258, 78 238 M78 240 L76 326 C 120 342, 240 344, 284 326 L282 238', w: 5, at: 1.0 },
    { ink: 'M50 340 C 120 356, 240 356, 310 340 M180 350 L180 376 M142 382 C 164 374, 196 374, 218 382', w: 4.5, at: 1.4 },

    // candles: two lit, one snuffed by a fedora
    { paper: 'M174 238 L175 182 L187 182 L186 238 Z M221 238 L221 186 L233 186 L234 238 Z M127 240 L127 196 L139 196 L139 240 Z', fill: 'sky', rough: 0.5, anim: 'rise', at: 1.6 },
    { ink: 'M176 222 L186 212 M176 202 L186 192 M222 222 L232 212 M222 204 L232 194', w: 2.5, at: 1.7 },
    { group: [{ paper: flame(181, 178), fill: 'candle' }], anim: 'pop', at: 1.9, loop: 'flicker', origin: '181 178' },
    { group: [{ paper: flame(227, 182), fill: 'candle' }], anim: 'pop', at: 2.0, loop: 'flicker', origin: '227 182' },
    { group: [
      { paper: 'M104 196 C 112 190, 124 188, 130 188 C 128 172, 132 160, 140 154 C 146 150, 150 156, 152 158 C 156 152, 162 150, 166 156 C 170 164, 168 176, 166 186 C 172 188, 178 192, 176 198 C 172 204, 150 204, 128 204 C 114 204, 100 202, 104 196 Z', fill: 'ink', rough: 0.6 },
      { paper: 'M130 182 C 142 184, 156 184, 167 180 L166 188 C 154 192, 142 192, 129 190 Z', fill: 'blood', rough: 0.4 },
      { ink: 'M138 152 C 130 164, 128 176, 130 188', w: 2.5, color: 'bone', taper: 0.9 },
    ], anim: 'drop', at: 2.2, origin: '140 200' },
    { group: [
      { ink: 'M110 196 C 98 186, 112 176, 100 164 C 90 154, 102 144, 94 134', w: 2.5, taper: 0.9 },
    ], anim: 'fade', at: 2.6, loop: 'drift', origin: '108 196' },

    // the knife, last, standing in it
    { group: [
      { paper: 'M238 246 C 248 210, 266 168, 280 140 L302 148 L262 250 Z', fill: 'bone' },
      { ink: 'M234 242 C 244 206, 262 166, 276 136 L298 144 L258 248', w: 4 },
      { ink: 'M272 134 L306 148', w: 6, taper: 0.2 },
      { ink: 'M291 144 L318 72', w: 18, taper: 0.12 },
      { ink: 'M302 116 L304 117 M310 94 L312 95', w: 3.5, color: 'bone', taper: 0 },
    ], anim: 'drop', at: 2.6, origin: '250 244' },
    { paper: 'M244 250 C 250 250, 252 262, 250 272 C 252 280, 246 284, 242 280 C 240 274, 242 264, 240 254 C 240 250, 242 250, 244 250 Z', fill: 'blood', rough: 0.4, anim: 'grow', at: 3.1, origin: '245 250' },
  ],
};
