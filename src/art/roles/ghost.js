// Role portrait: you're out. A sheet ghost in a tiny party hat,
// still at the party, just a little see-through about it.
export default {
  id: 'role-ghost',
  title: 'You are out: a sheet ghost wearing a tiny party hat',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'lake',
  layers: [
    // shadow
    { group: [{ shape: 'M136 346 C 136 336, 264 336, 264 346 C 264 356, 136 356, 136 346 Z', fill: '#86A3B4' }], at: 0.2, anim: 'fade', loop: 'breathe', origin: '200 346', loopAt: 1.4 },
    {
      group: [
        // the sheet
        { shape: 'M124 296 L124 194 C 124 138, 158 104, 200 104 C 242 104, 276 138, 276 194 L276 296 C 266 312, 250 312, 238 300 C 228 290, 214 290, 206 302 C 196 314, 180 314, 170 302 C 162 292, 148 290, 140 302 C 134 310, 126 306, 124 296 Z', fill: 'paper' },
        // eyes
        { group: [
            { shape: 'M168 180 C 168 170, 182 170, 182 180 L182 192 C 182 202, 168 202, 168 192 Z', fill: 'ink' },
            { shape: 'M218 180 C 218 170, 232 170, 232 180 L232 192 C 232 202, 218 202, 218 192 Z', fill: 'ink' },
          ], loop: 'blink', origin: '200 186', loopAt: 2.4 },
        // the tiny party hat
        { shape: 'M212 112 L258 126 L246 62 Z', fill: 'ember' },
        { circle: [246, 60, 8], fill: 'candle' },
      ],
      at: 0.3,
      anim: 'rise',
      loop: 'float',
      origin: '200 200',
      loopAt: 1.2,
    },
  ],
};
