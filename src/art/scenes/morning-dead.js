/*
 * Morning, someone didn't wake up: the sun comes up over the lake, a tent stands
 * with its flap tied open and nobody inside, and a party hat lies in the grass.
 */
export default {
  id: 'morning-dead',
  title: 'Sunrise over the lake, an open empty tent and a party hat knocked over in the grass',
  style: 'clean',
  viewBox: '0 0 400 500',
  tile: 'cream',
  layers: [
    // the sun coming up
    { circle: [262, 252, 54], fill: 'clay', at: 0.1, anim: 'rise' },
    // far shore
    { shape: 'M-14 252 L12 196 L38 252 Z M22 252 L40 216 L58 252 Z M324 252 L344 200 L364 252 Z M356 252 L376 214 L396 252 Z', fill: '#B6C1AA', at: 0.3, anim: 'fade' },
    // the lake
    { rect: [-1200, 250, 2800, 74, 0], fill: 'lake', at: 0, anim: 'fade' },
    { group: [
        { line: 'M234 268 L290 268 M244 282 L280 282 M254 296 L270 296', w: 3, color: 'paper', opacity: 0.7, draw: false },
      ], at: 0.6, anim: 'fade', loop: 'breathe', origin: '262 282', loopAt: 1.6 },
    // grass
    { shape: 'M-1200 316 L0 316 C 120 304, 280 304, 400 318 L1600 318 L1600 1700 L-1200 1700 Z', fill: 'moss', at: 0, anim: 'fade' },
    // the tent, flap open, nobody home
    { group: [
        { shape: 'M84 394 L170 282 L256 394 Z', fill: 'pine' },
        { shape: 'M142 394 L170 322 L198 394 Z', fill: '#1C2B23' },
        { shape: 'M170 322 L198 394 L228 384 Z', fill: '#4E6A58' },
      ], at: 0.8, anim: 'rise' },
    // the party hat, knocked over
    { group: [
        { shape: 'M284 350 L276 392 L340 382 Z', fill: 'ember' },
        { circle: [298, 372, 3.2], fill: 'paper' },
        { circle: [318, 378, 2.6], fill: 'paper' },
        { circle: [341, 382, 6], fill: 'paper' },
      ], at: 1.5, anim: 'drop' },
  ],
};
