// Role portrait: the Villager. Two sweater-sleeved hands hug a mug of cocoa,
// a marshmallow bobbing in it. One curl of steam bends into a question mark.
// Cozy, innocent, a little nervous (the mug trembles).

export default {
  id: 'role-villager',
  title: 'The Villager: two hands in sweater sleeves hug a mug of cocoa, its steam curling into a question mark',
  viewBox: '0 0 400 400',
  tile: 'sand',
  layers: [
    // steam (drawn first so it rises out from behind the rim)
    {
      group: [
        { ink: 'M168 150 C 156 132, 178 122, 168 104 C 160 90, 170 78, 176 70', w: 3.5, at: 2.0, taper: 0.8 },
        { ink: 'M214 152 C 216 140, 206 134, 212 124 C 220 112, 252 116, 254 92 C 256 66, 222 58, 210 76', w: 4.5, at: 2.3, taper: 0.7 },
      ],
      loop: 'drift',
      origin: '200 150',
      loopAt: 3.4,
    },

    {
      group: [
        // the mug
        { blob: 'M137 176 C 137 150, 273 150, 273 176 L267 310 C 266 330, 143 330, 143 310 Z', fill: 'terracotta', anim: 'rise', at: 0.1 },
        { paper: 'M146 172 C 146 160, 256 160, 256 172 C 256 184, 146 184, 146 172 Z', fill: 'ink', rough: 0.4, anim: 'fade', at: 0.6 },
        { ink: 'M132 172 C 132 152, 268 152, 268 172 C 268 192, 132 192, 132 172', w: 5, at: 0.3 },
        { ink: 'M134 178 L140 306 C 152 326, 248 326, 260 306 L266 178 M266 202 C 300 196, 312 218, 306 242 C 302 262, 284 272, 262 270', w: 5.5, at: 0.6 },

        // nervous little shiver marks
        { ink: 'M112 168 L96 158 M108 188 L90 183 M290 164 L306 154 M296 184 L314 179', w: 4, at: 2.5, taper: 0.15 },

        // the marshmallow
        {
          group: [
            { paper: 'M204 160 L226 156 L230 172 L208 177 Z', fill: 'bone', rough: 0.6 },
            { ink: 'M204 160 L226 156 L229 172', w: 2.5, taper: 0.4 },
          ],
          loop: 'bob',
          origin: '216 170',
          anim: 'drop',
          at: 1.7,
          loopAt: 3,
        },

        // left hand: sleeve, back of hand, thumb, four fingers wrapped round the mug
        { paper: 'M44 400 L58 330 C 76 320, 108 318, 128 324 L132 400 Z', fill: 'sage', rough: 1, anim: 'rise', at: 0.9 },
        { paper: 'M116 215 C 124 199, 140 183, 156 177 C 170 173, 176 187, 166 195 L164 199 C 180 203, 200 207, 206 209 C 214 213, 216 225, 210 229 C 218 233, 224 245, 212 253 C 218 259, 216 273, 204 275 C 200 281, 200 293, 186 297 C 168 301, 150 299, 134 301 C 130 313, 128 321, 128 329 L66 337 C 74 303, 84 273, 96 243 C 102 229, 108 221, 116 215 Z', fill: 'bone', rough: 0.8, anim: 'rise', at: 1.0 },
        {
          ink: [
            'M124 200 C 104 212, 90 234, 82 264 C 76 290, 70 312, 64 332', // back of the hand to the wrist
            'M112 212 C 120 196, 134 182, 150 176 C 162 172, 170 182, 162 190 C 154 198, 146 204, 140 210', // thumb, up toward the rim
            'M136 208 C 156 214, 178 216, 194 210 C 204 206, 208 218, 198 224 C 180 230, 156 228, 138 226', // index
            'M138 230 C 160 236, 186 238, 204 232 C 214 228, 216 244, 204 248 C 184 254, 160 252, 138 250', // middle
            'M138 252 C 158 258, 180 260, 196 254 C 206 250, 208 266, 196 270 C 178 276, 156 274, 136 272', // ring
            'M134 274 C 150 280, 168 282, 180 278 C 190 274, 192 290, 180 292 C 164 296, 146 294, 128 296 C 126 306, 124 316, 124 326', // pinky, into the wrist
          ].join(' '),
          w: 4.5,
          at: 1.2,
        },
        { ink: 'M58 332 C 80 322, 110 320, 130 326 M84 336 L80 394 M110 334 L112 394', w: 3, at: 1.9 },

        // right hand: three fingers curled round the handle, thumb on top
        { paper: 'M318 400 L322 330 C 340 322, 372 322, 392 330 L400 400 Z', fill: 'sage', rough: 1, anim: 'rise', at: 1.4 },
        { paper: 'M304 189 C 324 189, 344 195, 358 207 C 372 229, 376 273, 374 333 L330 337 C 334 307, 336 291, 338 279 C 320 279, 302 279, 296 271 C 292 263, 294 257, 296 255 C 286 251, 284 239, 294 235 C 284 231, 286 217, 296 213 C 288 207, 290 191, 304 189 Z', fill: 'bone', rough: 0.8, anim: 'slide-l', at: 1.5 },
        {
          ink: [
            'M350 204 C 336 194, 316 188, 300 188 C 290 188, 290 198, 300 200 C 314 202, 328 204, 340 210', // thumb over the handle
            'M344 212 C 326 208, 306 206, 294 210 C 284 214, 286 226, 296 227 C 310 228, 326 228, 342 230', // index
            'M342 232 C 324 230, 302 230, 292 234 C 282 238, 284 250, 294 250 C 310 251, 326 250, 340 252', // middle
            'M340 254 C 324 253, 308 254, 300 258 C 292 262, 294 272, 304 272 C 316 272, 326 272, 336 274 C 332 290, 330 306, 330 330', // ring, into the wrist
            'M352 206 C 364 226, 368 260, 366 290 C 364 306, 364 318, 366 330', // back of the hand
          ].join(' '),
          w: 4.5,
          at: 1.7,
        },
        { ink: 'M322 332 C 340 324, 370 324, 392 332 M346 336 L344 394 M374 336 L378 394', w: 3, at: 2.1 },
      ],
      loop: 'shake',
      origin: '200 300',
      loopAt: 4,
    },
  ],
};
