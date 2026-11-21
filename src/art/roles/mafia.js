// Role portrait: the Mafia. A fedora silhouette against a huge flat moon,
// shifty eyes under the brim, one bone-white glove raised: "shhh".
// A blood-red carnation on the lapel is the only warm thing in the picture.

// place a path drawn around a local origin: scale s, rotate deg, move to (dx, dy).
// Only for paths written as "x y" pairs with M L C Q Z.
const P = (d, s, dx, dy, deg = 0) => {
  const c = Math.cos((deg * Math.PI) / 180);
  const n = Math.sin((deg * Math.PI) / 180);
  return d.replace(/(-?\d*\.?\d+) (-?\d*\.?\d+)/g, (_, x, y) => {
    const X = +x * s;
    const Y = +y * s;
    return `${(X * c - Y * n + dx).toFixed(1)} ${(X * n + Y * c + dy).toFixed(1)}`;
  });
};

// the glove in profile, drawn around the base of the index finger at (0, 0);
// the palm faces left, so we see the thumb side: finger up, thumb tucked under
const G = { s: 1.25, x: 204, y: 276, deg: 6 };
const g = (d) => P(d, G.s, G.x, G.y, G.deg);

export default {
  id: 'role-mafia',
  title: 'The Mafia: a man in a fedora, black against a huge moon, holds one white-gloved finger to his lips',
  viewBox: '0 0 400 400',
  tile: 'night',
  layers: [
    // the moon
    { paper: 'M46 158 A136 136 0 1 1 318 158 A136 136 0 1 1 46 158 Z', fill: 'sky', rough: 0.7, anim: 'grow', at: 0.1 },

    // the silhouette: fedora, head, shoulders (black paper on black night: it melts into the dark)
    {
      paper:
        'M108 148 C 128 146, 146 145, 156 145 C 154 118, 158 98, 168 90 C 182 80, 196 86, 206 94 C 218 82, 238 80, 248 90 C 256 100, 258 122, 254 146 C 274 148, 292 152, 304 158 C 316 164, 310 173, 294 172 C 276 171, 260 169, 246 168 L 247 205 C 247 228, 238 244, 228 252 L 230 264 C 284 270, 330 288, 348 330 L 372 400 L 28 400 L 52 330 C 70 288, 120 270, 180 264 L 182 252 C 170 244, 164 230, 163 214 C 157 212, 156 198, 162 196 L 162 166 C 144 164, 122 160, 106 158 C 94 156, 94 149, 108 148 Z',
      fill: 'ink',
      rough: 1.2,
      anim: 'rise',
      at: 0.4,
    },

    // hat band + brim edge catching moonlight, coat lapels
    { ink: 'M158 138 C 190 133, 226 133, 254 140 M296 162 C 266 158, 200 155, 120 152', w: 3, color: 'bone', at: 0.9, wobble: 1.2 },
    { ink: 'M182 266 C 172 290, 166 316, 170 346 L 158 400 M230 266 C 244 292, 250 316, 246 346 L 258 400', w: 3, color: 'bone', at: 1.1 },

    // shifty eyes under the brim, glancing sideways
    {
      group: [
        { paper: 'M174 187 C 180 177, 196 177, 201 185 C 195 192, 181 193, 174 187 Z', fill: 'bone', rough: 0.5 },
        { paper: 'M211 185 C 217 176, 232 176, 238 184 C 232 191, 218 192, 211 185 Z', fill: 'bone', rough: 0.5 },
        { paper: 'M177 185 C 177 180, 186 180, 186 185 C 186 190, 177 190, 177 185 Z', fill: 'ink', rough: 0.2 },
        { paper: 'M213 184 C 213 179, 222 179, 222 184 C 222 189, 213 189, 213 184 Z', fill: 'ink', rough: 0.2 },
        { ink: 'M172 175 C 182 170, 194 170, 202 175 M211 176 C 219 168, 232 167, 241 172', w: 3, color: 'bone', taper: 0.8 },
      ],
      loop: 'blink',
      origin: '206 185',
      anim: 'pop',
      at: 1.3,
      loopAt: 3,
    },

    // the mouth, mostly hidden by the finger
    { ink: 'M176 233 C 192 230, 214 231, 228 231 C 234 231, 238 228, 241 224', w: 3.5, color: 'bone', at: 1.5, taper: 0.4 },

    // the glove: index finger to the lips
    {
      group: [
        {
          paper: g('M-8 0 L-8 -50 C -8 -62, 9 -62, 9 -50 L9 -6 C 26 -6, 42 4, 46 22 C 50 40, 44 56, 36 66 L 58 92 C 40 102, 20 104, 4 100 L 2 64 C -10 58, -20 50, -22 42 C -34 40, -34 28, -24 26 C -36 24, -36 12, -24 12 C -34 8, -30 -2, -8 0 Z'),
          fill: 'bone',
          rough: 0.8,
        },
        {
          ink: [
            g('M-6 2 L-7 -50 C -7 -61, 8 -61, 9 -50 L10 -4'), // index finger, up over the lips
            g('M10 -4 C 26 -4, 40 6, 44 22 C 48 40, 42 56, 34 66'), // back of the hand to the wrist
            g('M-6 2 C -26 -2, -32 10, -20 14 C -34 14, -34 28, -20 28 C -32 30, -30 42, -18 42'), // three curled fingers, seen from the side
            g('M32 30 C 20 22, 6 14, -6 12 C -15 11, -17 21, -9 23 C 4 26, 16 34, 24 44'), // thumb, tucked under
            g('M-18 42 C -14 52, -6 60, 2 64'), // heel of the palm
            g('M2 66 L4 100 M34 68 L56 92 M0 100 C 20 106, 42 102, 60 90'), // the cuff
          ].join(' '),
          w: 4.5,
          at: 1.8,
        },
      ],
      loop: 'sway',
      origin: `${G.x + 20} ${G.y + 110}`,
      anim: 'rise',
      at: 1.6,
      loopAt: 3.2,
    },

    // the carnation
    {
      group: [
        { paper: 'M140 300 C 132 292, 138 282, 146 286 C 148 276, 160 276, 162 286 C 170 282, 178 292, 170 300 C 178 306, 172 318, 162 314 C 160 324, 146 324, 145 314 C 136 318, 130 308, 140 300 Z', fill: 'blood', rough: 1.4 },
        { ink: 'M146 296 C 152 292, 160 296, 156 302 C 152 306, 148 302, 152 299', w: 2.5, color: 'ink', taper: 0.7 },
      ],
      loop: 'pulse',
      origin: '155 302',
      anim: 'pop',
      at: 2.4,
      loopAt: 4,
    },
  ],
};
