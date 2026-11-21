// Role portrait: the Detective. A cut-paper head in a deerstalker cap; inside
// the head, a magnifying glass, and in the lens one big suspicious eye.

const HEAD =
  'M118 392 L124 330 C 104 314, 92 288, 92 256 C 92 232, 94 214, 98 200 L60 214 C 54 206, 68 186, 102 172 C 112 120, 156 82, 206 80 C 254 80, 290 110, 300 150 C 318 152, 340 164, 352 180 C 340 186, 318 180, 300 176 C 302 186, 304 194, 306 200 C 318 214, 330 226, 336 236 C 330 244, 318 246, 310 246 L314 258 C 308 262, 306 266, 312 272 C 312 284, 306 292, 294 296 C 284 298, 272 298, 266 302 L262 340 L270 392 Z';

export default {
  id: 'role-detective',
  title: 'The Detective: a paper head in a deerstalker cap with a magnifying glass and a big eye inside it',
  viewBox: '0 0 400 400',
  tile: 'terracotta',
  layers: [
    { paper: HEAD, fill: 'bone', rough: 1.4, anim: 'rise', at: 0.1 },

    // profile, cap line, the brims
    {
      ink: [
        'M298 196 C 312 210, 326 224, 332 236 C 326 242, 316 244, 306 244 C 308 250, 307 255, 304 259 C 308 265, 308 272, 304 278 C 303 286, 298 292, 288 294', // nose, lips, chin
        'M96 196 C 140 182, 240 172, 296 172', // the cap's edge
        'M296 172 C 316 174, 334 178, 348 184', // front bill
        'M102 188 C 86 194, 72 202, 62 212', // back bill
        'M198 82 C 210 100, 214 130, 212 176', // cap seam
      ].join(' '),
      w: 4.5,
      at: 0.5,
    },
    // the little bow on top of the cap
    { ink: 'M206 80 C 196 64, 182 66, 188 76 C 192 82, 202 80, 206 80 C 214 66, 230 68, 224 78 C 220 84, 210 82, 206 80', w: 3, at: 1.1 },

    // the pipe, puffing
    { ink: 'M304 266 C 316 270, 326 274, 334 276', w: 6, at: 1.0, taper: 0.2 },
    { paper: 'M328 262 L354 260 C 356 280, 350 294, 340 294 C 330 292, 326 280, 328 262 Z', fill: 'ink', rough: 0.5, anim: 'pop', at: 1.2 },
    {
      group: [{ ink: 'M342 252 C 332 238, 352 228, 344 212 C 338 200, 348 188, 354 182', w: 4, color: 'bone', taper: 0.8, at: 2.4 }],
      loop: 'drift',
      origin: '342 252',
      at: 2.4,
      loopAt: 3,
    },

    // the magnifying glass
    {
      group: [
        { paper: 'M144 266 L160 280 L122 334 C 116 340, 104 332, 108 324 Z', fill: 'ink', rough: 0.5 },
        { paper: 'M138 232 A56 56 0 1 1 250 232 A56 56 0 1 1 138 232 Z', fill: 'stone', rough: 0.6, opacity: 0.9 },
        { ink: 'M194 176 C 228 175, 252 200, 250 233 C 248 264, 224 290, 192 288 C 160 286, 136 262, 138 228 C 140 198, 164 178, 197 179', w: 6.5, taper: 0.3 },
        { ink: 'M210 188 C 226 192, 238 204, 242 218', w: 3, color: 'bone', taper: 0.6 }, // glint
        // the eye
        {
          group: [
            { paper: 'M154 236 C 172 210, 218 208, 236 234 C 218 258, 174 260, 154 236 Z', fill: 'bone', rough: 0.4 },
            { ink: 'M152 236 C 172 208, 218 206, 238 234 C 218 260, 174 262, 152 236', w: 3.5, taper: 0.5 },
            { paper: 'M200 234 C 200 220, 222 220, 222 234 C 222 248, 200 248, 200 234 Z', fill: 'ink', rough: 0.3 },
            { paper: 'M208 228 C 208 224, 214 224, 214 228 C 214 232, 208 232, 208 228 Z', fill: 'bone', rough: 0.1 },
          ],
          loop: 'blink',
          origin: '195 235',
          loopAt: 3.2,
        },
        // one suspicious eyebrow
        { ink: 'M158 204 C 178 190, 206 190, 230 200', w: 4, at: 2.2, taper: 0.7 },
      ],
      loop: 'sway',
      origin: '120 326',
      anim: 'pop',
      at: 1.4,
      loopAt: 3.6,
    },
  ],
};
