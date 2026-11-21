// Role portrait: the Doctor. A cracked heart, stitched shut with white thread;
// the thread loops up to a needle pinched in a hand in a white-coat cuff.
// The heart beats.

const P = (d, s, dx, dy) =>
  d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => `${(+x * s + dx).toFixed(1)} ${(+y * s + dy).toFixed(1)}`);

// the hand, drawn around the pinch point at (0, 0), fingers pointing left
const H = { s: 1.3, x: 258, y: 126 };
const h = (d) => P(d, H.s, H.x, H.y);

const HEART = 'M150 178 C 134 132, 66 128, 60 186 C 56 232, 104 276, 168 336 C 222 270, 262 222, 250 172 C 238 122, 170 128, 150 178 Z';

export default {
  id: 'role-doctor',
  title: 'The Doctor: a hand with a needle stitches a cracked heart back together',
  viewBox: '0 0 400 400',
  tile: 'sage',
  layers: [
    {
      group: [
        { paper: P(HEART, 1, 7, 5), fill: 'blood', rough: 1.2, anim: 'grow', at: 0.1 },
        { ink: HEART, w: 6, at: 0.3 },
        // the crack
        { ink: 'M150 182 L136 212 L164 236 L140 266 L160 298', w: 3.5, at: 0.9, taper: 0.8 },
        // stitches: one thread zigzagging across the crack
        { ink: 'M126 196 L156 206 M136 226 L166 216 M140 244 L168 258 M130 270 L158 280 M146 296 L172 288', w: 4.5, color: 'bone', at: 1.3, taper: 0.3 },
      ],
      loop: 'pulse',
      origin: '158 240',
      loopAt: 3,
    },

    // the hand with the needle
    {
      group: [
        { paper: P('M-2 -10 C 6 -26, 30 -46, 74 -48 C 100 -54, 130 -54, 170 -52 L170 60 C 150 58, 138 56, 126 52 C 118 60, 98 62, 98 54 C 90 52, 92 46, 96 44 C 84 46, 70 50, 60 48 C 52 46, 50 40, 54 34 C 48 28, 40 24, 30 20 C 18 20, 4 18, 2 12 C 0 8, 2 4, 0 0 C -4 -2, -4 -6, -2 -10 Z', H.s, H.x + 4, H.y + 3), fill: 'bone', rough: 0.8 },
        { paper: h('M14 -2 C 22 -12, 34 -20, 46 -21 C 60 -23, 72 -16, 72 -6 C 72 2, 62 4, 50 3 C 36 3, 22 3, 14 -2 Z'), fill: 'sage', rough: 0.3 },
        { ink: 'M286 62 L242 168', w: 3.5, taper: 0.2, wobble: 0.4 }, // needle
        { paper: 'M237 170 C 237 162, 247 162, 247 170 C 247 178, 237 178, 237 170 Z', fill: 'sage', rough: 0.2 },
        {
          ink: [
            h('M160 -50 C 120 -54, 92 -52, 74 -46 C 56 -48, 36 -42, 22 -32 C 10 -22, 2 -12, -1 -3 C -2 3, 4 6, 9 2'), // back of the hand, knuckle, index finger bending down to the needle
            h('M9 2 C 16 -8, 28 -18, 42 -22 C 54 -25, 66 -22, 72 -14 C 76 -6, 76 2, 70 6 C 52 3, 30 3, 14 5 C 4 7, 2 14, 10 16 C 28 19, 50 22, 72 24'), // inside of the index, the web, the thumb
            h('M8 8 C 13 7, 17 9, 17 13'), // thumbnail
            h('M92 26 C 76 26, 60 30, 56 38 C 54 46, 64 48, 72 44 C 80 40, 90 40, 100 42'), // middle finger, curled
            h('M100 42 C 92 50, 94 58, 104 58 C 112 58, 120 54, 128 50 C 138 54, 150 54, 166 52'), // ring finger, curled, into the wrist
            h('M140 -60 C 132 -24, 132 26, 142 64'), // white coat cuff
          ].join(' '),
          w: 4.5,
          at: 1.8,
        },
      ],
      loop: 'bob',
      origin: '340 110',
      anim: 'slide-l',
      at: 1.6,
      loopAt: 3.4,
    },

    // the thread, from the top stitch up to the needle's eye
    { ink: 'M152 196 C 128 120, 192 74, 208 124 C 214 150, 226 174, 242 170', w: 2.5, color: 'bone', at: 2.3, taper: 0.4 },
  ],
};
