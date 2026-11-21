// Role portrait: the Ghost (you died). A bedsheet ghost in a crooked party hat,
// a limp party blower hanging from its mouth, waving bye-bye. Floats.

export default {
  id: 'role-ghost',
  title: 'The Ghost: a bedsheet ghost in a crooked party hat waves goodbye, a limp party blower hanging from its mouth',
  viewBox: '0 0 400 400',
  tile: 'periwinkle',
  layers: [
    // its shadow on the floor
    {
      group: [{ paper: 'M130 362 C 130 350, 270 350, 270 362 C 270 374, 130 374, 130 362 Z', fill: 'ink', opacity: 0.16, rough: 0.6 }],
      loop: 'breathe',
      origin: '200 362',
      anim: 'fade',
      at: 0.1,
    },

    {
      group: [
        // the sheet
        { paper: 'M212 116 C 164 114, 138 152, 134 202 C 130 248, 116 284, 84 312 C 100 326, 116 312, 128 324 C 140 340, 160 318, 174 332 C 190 346, 204 320, 220 334 C 238 346, 252 320, 268 330 C 282 338, 292 320, 302 318 C 294 282, 292 244, 292 202 C 292 150, 262 118, 212 116 Z', fill: 'bone', rough: 1.2, anim: 'rise', at: 0.1 },
        { ink: 'M207 112 C 159 110, 133 148, 129 198 C 125 244, 111 280, 79 308 C 95 322, 111 308, 123 320 C 135 336, 155 314, 169 328 C 185 342, 199 316, 215 330 C 233 342, 247 316, 263 326 C 277 334, 287 316, 297 314 C 289 278, 287 240, 287 198 C 287 146, 257 114, 207 112', w: 5.5, at: 0.3 },
        { ink: 'M156 250 C 160 276, 156 300, 146 320 M270 262 C 268 284, 270 302, 276 318', w: 3, at: 1.1, taper: 0.8 },

        // the waving arm
        {
          group: [
            { paper: 'M292 214 C 308 202, 320 182, 326 164 C 330 152, 344 154, 344 168 C 342 192, 320 222, 294 238 Z', fill: 'bone', rough: 0.8 },
            { ink: 'M288 208 C 306 198, 316 178, 322 160 C 326 148, 340 150, 340 164 C 338 190, 316 220, 292 234', w: 5, taper: 0.5 },
          ],
          loop: 'wave',
          origin: '294 228',
          anim: 'pop',
          at: 1.3,
          loopAt: 2.8,
        },

        // eyes: two droopy holes; mouth
        {
          group: [
            { paper: 'M180 186 C 180 172, 196 168, 198 180 C 200 192, 194 200, 188 200 C 182 200, 180 194, 180 186 Z', fill: 'ink', rough: 0.4 },
            { paper: 'M224 180 C 226 168, 242 172, 242 186 C 242 194, 238 200, 232 200 C 226 200, 222 192, 224 180 Z', fill: 'ink', rough: 0.4 },
          ],
          loop: 'blink',
          origin: '212 186',
          anim: 'pop',
          at: 0.9,
          loopAt: 3.6,
        },
        { ink: 'M180 170 C 186 168, 192 165, 197 161 M224 160 C 230 163, 236 166, 242 170', w: 3.5, at: 1.0, taper: 0.6 },
        { paper: 'M206 222 C 206 214, 218 214, 218 222 C 218 230, 206 230, 206 222 Z', fill: 'ink', rough: 0.3, anim: 'pop', at: 1.1 },

        // the limp party blower
        { paper: 'M214 222 C 232 226, 248 236, 254 252 C 258 264, 256 278, 250 288 L240 286 C 246 276, 248 264, 244 256 C 238 242, 226 234, 212 230 Z', fill: 'terracotta', rough: 0.6, anim: 'unfold', at: 1.6 },
        { ink: 'M216 220 C 236 222, 252 236, 256 254 C 258 266, 256 278, 250 290 M212 230 C 228 234, 240 244, 244 258 C 246 268, 244 278, 240 288', w: 3, at: 1.7, taper: 0.4 },
        { ink: 'M232 228 L226 239 M247 244 L238 251 M250 266 L240 266', w: 4, color: 'bone', at: 1.9, taper: 0.05, wobble: 0.3 },

        // the party hat, knocked crooked
        { paper: 'M174 132 L198 46 L242 114 C 220 124, 196 132, 174 132 Z', fill: 'candle', rough: 0.8, anim: 'drop', at: 2.0 },
        { ink: 'M170 128 L196 44 L238 110 M172 130 C 194 128, 218 120, 240 112', w: 4.5, at: 2.1 },
        { paper: 'M188 38 C 180 30, 186 18, 196 22 C 202 14, 214 20, 210 30 C 216 38, 206 48, 198 44 C 192 50, 182 46, 188 38 Z', fill: 'terracotta', rough: 0.8, anim: 'pop', at: 2.5 },
        { paper: 'M196 82 C 196 76, 204 76, 204 82 C 204 88, 196 88, 196 82 Z M210 104 C 210 98, 218 98, 218 104 C 218 110, 210 110, 210 104 Z M186 112 C 186 106, 194 106, 194 112 C 194 118, 186 118, 186 112 Z', fill: 'terracotta', rough: 0.3, anim: 'pop', at: 2.4 },
      ],
      loop: 'float',
      origin: '200 220',
      loopAt: 2.6,
    },

    // a few sad bits of confetti, already on the floor
    { paper: 'M94 362 L106 355 L109 360 L97 367 Z M318 366 L331 364 L332 370 L319 372 Z', fill: 'terracotta', rough: 0.3, anim: 'drop', at: 2.6 },
    { paper: 'M292 350 L298 348 L304 360 L298 362 Z', fill: 'candle', rough: 0.3, anim: 'drop', at: 2.7 },
  ],
};
