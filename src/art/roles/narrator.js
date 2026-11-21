// Role portrait: the Narrator. An open storybook: on the left page the story so
// far (the cabin, a pine, the moon); on the right, a hand with a quill writing
// the next line. A red ribbon bookmark hangs out of the spine.

// place a path drawn around a local origin: scale s, rotate deg, move to (dx, dy).
// Only for paths written as "x y" pairs with M L C Q Z.
const R = (d, s, deg, dx, dy) => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const n = Math.sin(a);
  return d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => {
    const X = +x * s;
    const Y = +y * s;
    return `${(X * c - Y * n + dx).toFixed(1)} ${(X * n + Y * c + dy).toFixed(1)}`;
  });
};

// the hand, drawn around the pinch at (0, 0), fingers pointing left
const H = { s: 1.1, deg: -22, x: 236, y: 244 };
const h = (d, ox = 0, oy = 0) => R(d, H.s, H.deg, H.x + ox, H.y + oy);

export default {
  id: 'role-narrator',
  title: 'The Narrator: a hand with a quill writes in an open storybook that shows a cabin under the moon',
  viewBox: '0 0 400 400',
  tile: 'clay',
  layers: [
    // the book
    { paper: 'M38 226 C 100 208, 160 214, 180 228 C 200 214, 262 208, 334 226 L340 338 C 272 324, 212 328, 180 344 C 148 328, 90 324, 32 338 Z', fill: 'ink', rough: 1, anim: 'rise', at: 0.1 },
    { paper: 'M52 214 C 104 198, 162 204, 182 220 C 202 204, 262 198, 322 214 L324 326 C 272 316, 212 320, 182 334 C 152 320, 102 316, 50 326 Z', fill: 'bone', rough: 1.2, anim: 'rise', at: 0.25 },
    {
      ink: [
        'M178 216 C 158 200, 100 194, 48 210 L46 322 C 100 312, 150 316, 178 330', // left page
        'M180 216 C 200 200, 262 194, 318 210 L320 322 C 268 312, 210 316, 180 330', // right page
        'M179 220 L179 328', // spine
      ].join(' '),
      w: 4.5,
      at: 0.4,
    },
    // the ribbon
    { paper: 'M176 334 L188 334 L200 388 L191 378 L184 392 Z', fill: 'blood', rough: 0.5, anim: 'unfold', at: 0.8 },

    // the story so far, on the left page
    { ink: 'M64 300 L64 274 L86 254 L108 274 L108 300 M80 300 L80 286 L92 286 L92 300 M128 300 L128 254 M118 282 L128 262 L138 282 M114 298 L128 276 L142 298', w: 3, at: 1.0 },
    // ...and someone in a fedora, lurking behind the pine
    { paper: 'M148 300 L147 282 C 147 278, 150 277, 153 276 L153 274 C 151 273, 151 270, 152 268 L145 268 L147 265 L152 265 C 152 258, 160 258, 160 265 L165 265 L167 268 L160 268 C 161 270, 161 273, 159 274 L159 276 C 162 277, 165 278, 165 282 L164 300 Z', fill: 'ink', rough: 0.3, anim: 'pop', at: 1.4 },
    {
      group: [{ paper: 'M82 226 C 82 218, 96 216, 98 226 C 98 236, 84 236, 82 226 Z', fill: 'candle', rough: 0.4 }],
      loop: 'pulse',
      origin: '90 226',
      anim: 'pop',
      at: 1.5,
      loopAt: 3,
    },

    // the right page: lines already written, and the one being written now
    { ink: 'M198 236 C 214 232, 232 234, 250 230 M198 254 C 212 250, 228 252, 246 249 M198 272 C 206 270, 212 274, 218 270 C 222 268, 224 272, 226 274', w: 2.5, at: 2.3, taper: 0.4 },

    // the hand and the quill
    {
      group: [
        // quill: vane, shaft, nib
        { paper: 'M250 204 C 244 168, 252 126, 270 98 L266 90 L278 86 C 288 64, 304 48, 326 36 C 330 58, 324 80, 314 98 L320 104 L308 110 C 298 136, 282 170, 262 202 Z', fill: 'bone', rough: 1 },
        { ink: 'M246 198 C 240 164, 248 124, 266 96 M274 84 C 284 62, 300 46, 322 34 C 326 56, 320 78, 310 96 M304 108 C 294 134, 280 164, 262 194 M266 96 L276 92 M310 96 L302 106', w: 4, at: 1.7 },
        { ink: 'M226 274 L248 216 C 262 176, 290 96, 320 40', w: 3, at: 1.6, taper: 0.3 },

        { paper: R('M-2 -10 C 6 -26, 30 -46, 74 -48 C 100 -54, 130 -54, 170 -52 L170 60 C 140 56, 116 52, 100 46 C 84 48, 70 50, 60 48 C 52 46, 50 40, 54 34 C 48 28, 40 24, 30 20 C 18 20, 4 18, 2 12 C 0 8, 2 4, 0 0 C -4 -2, -4 -6, -2 -10 Z', H.s, H.deg, H.x + 4, H.y + 3), fill: 'bone', rough: 0.8 },
        { paper: h('M14 -2 C 22 -10, 32 -16, 42 -16 C 52 -16, 56 -10, 54 -4 C 50 2, 40 2, 30 2 C 22 2, 16 1, 14 -2 Z'), fill: 'clay', rough: 0.3 },
        {
          ink: [
            h('M160 -50 C 120 -54, 92 -52, 74 -46 C 56 -48, 36 -42, 22 -32 C 10 -22, 2 -12, -1 -3 C -2 3, 4 6, 9 2'), // back of the hand, knuckle, index
            h('M9 2 C 16 -8, 26 -16, 38 -19 C 48 -21, 56 -16, 60 -9 C 62 -2, 60 3, 56 6 C 42 4, 28 4, 14 5 C 4 7, 2 14, 10 16 C 28 19, 50 22, 72 24'), // inside of the index, web, thumb
            h('M92 26 C 76 26, 60 30, 56 38 C 54 46, 64 48, 72 44 C 80 40, 90 40, 100 42'), // middle finger, curled
            h('M100 42 C 112 46, 130 50, 150 52'), // underside, into the wrist
            h('M136 -58 C 128 -22, 128 28, 138 66'), // sleeve cuff
          ].join(' '),
          w: 4.5,
          at: 1.9,
        },
        // a dark sleeve
        { paper: R('M138 -62 L260 -70 L260 80 L140 70 C 130 30, 128 -20, 138 -62 Z', H.s, H.deg, H.x, H.y), fill: 'ink', rough: 1 },
      ],
      loop: 'sway',
      origin: '226 274',
      anim: 'slide-l',
      at: 1.5,
      loopAt: 3.2,
    },
  ],
};
