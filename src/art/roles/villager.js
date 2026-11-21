// Role portrait: the Camper. A speckled enamel mug of cocoa,
// one marshmallow bobbing on top, steam curling up.
export default {
  id: 'role-villager',
  title: 'The Camper: an enamel mug of cocoa with a marshmallow and a curl of steam',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'birch',
  layers: [
    // shadow
    { shape: 'M110 334 C 110 322, 300 322, 300 334 C 300 346, 110 346, 110 334 Z', fill: 'smoke', opacity: 0.5, at: 0, anim: 'fade' },
    {
      group: [
        // handle
        { shape: 'M262 196 C 334 196, 334 300, 262 300 L262 274 C 302 274, 302 222, 262 222 Z', fill: 'pine' },
        // body
        { shape: 'M126 176 L274 176 L274 312 C 274 326, 264 336, 250 336 L150 336 C 136 336, 126 326, 126 312 Z', fill: 'pine' },
        // speckles
        { circle: [154, 236, 3.5], fill: 'cream', opacity: 0.8 },
        { circle: [232, 268, 3], fill: 'cream', opacity: 0.8 },
        { circle: [182, 298, 3], fill: 'cream', opacity: 0.8 },
        { circle: [248, 214, 2.5], fill: 'cream', opacity: 0.8 },
        // rim and cocoa
        { shape: 'M124 176 A76 17 0 1 0 276 176 A76 17 0 1 0 124 176 Z', fill: 'cream' },
        { shape: 'M134 177 A66 12 0 1 0 266 177 A66 12 0 1 0 134 177 Z', fill: '#8A5A3E' },
      ],
      at: 0.2,
      anim: 'rise',
    },
    // the marshmallow, bobbing
    {
      group: [
        { shape: 'M176 142 L224 146 L222 180 C 210 186, 188 186, 176 180 Z', fill: 'paper' },
        { shape: 'M176 142 C 176 134, 224 138, 224 146 C 224 154, 176 150, 176 142 Z', fill: '#EADBC8' },
      ],
      at: 0.8,
      anim: 'drop',
    },
    // steam
    { line: 'M188 118 C 176 98, 200 88, 188 64 M216 114 C 206 98, 228 90, 218 70', w: 3, color: '#A79E90', at: 1.2 },
  ],
};
