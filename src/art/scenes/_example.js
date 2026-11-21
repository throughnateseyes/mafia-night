// Pipeline test + style sample: a birthday cake with a knife in it.
export default {
  id: 'example-cake',
  title: 'A birthday cake with a knife in it',
  viewBox: '0 0 400 400',
  tile: 'sand',
  layers: [
    { blob: 'M200 92 C 282 92, 330 150, 322 226 C 314 300, 262 336, 196 334 C 124 332, 76 286, 78 214 C 80 146, 126 92, 200 92 Z', fill: 'terracotta', anim: 'grow', at: 0 },
    { paper: 'M110 212 C 150 196, 250 194, 290 208 L294 296 C 230 306, 170 306, 106 298 Z', fill: 'bone', anim: 'rise', at: 0.2 },
    { ink: 'M110 212 C 150 194, 250 192, 290 208 M110 214 L106 298 M290 208 L294 296 M88 300 C 160 312, 240 312, 314 298', w: 6, at: 0.4 },
    { ink: 'M112 222 C 120 244, 134 244, 136 226 C 142 250, 160 250, 162 228 C 172 246, 186 246, 190 226 C 198 252, 214 252, 218 228 C 226 244, 240 244, 244 226 C 252 248, 270 248, 288 222', w: 4, at: 1 },
    { ink: 'M160 204 L159 160 M200 199 L201 150 M240 202 L239 158', w: 5, at: 1.5 },
    { group: [{ paper: 'M159 132 C 149 146, 151 158, 159 158 C 167 158, 169 146, 159 132 Z', fill: 'candle' }], loop: 'flicker', origin: '159 158', anim: 'pop', at: 1.9 },
    { group: [{ paper: 'M201 122 C 191 136, 193 148, 201 148 C 209 148, 211 136, 201 122 Z', fill: 'candle' }], loop: 'flicker', origin: '201 148', anim: 'pop', at: 2 },
    { group: [{ paper: 'M239 130 C 229 144, 231 156, 239 156 C 247 156, 249 144, 239 130 Z', fill: 'candle' }], loop: 'flicker', origin: '239 156', anim: 'pop', at: 2.1 },
    { group: [
      { paper: 'M262 262 L326 132 C 334 118, 350 122, 344 138 L278 270 Z', fill: 'bone' },
      { ink: 'M262 262 L326 132 C 334 118, 350 122, 344 138 L278 270', w: 4.5 },
      { ink: 'M344 134 L372 82', w: 16, taper: 0.2 },
    ], anim: 'drop', at: 2.4 },
  ],
};
