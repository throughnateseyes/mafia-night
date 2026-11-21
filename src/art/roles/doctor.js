// Role portrait: the Medic (camp first aid).
// A cream first-aid tin with a berry cross, warmed by a lantern glow behind it.
export default {
  id: 'role-doctor',
  title: 'The Medic: a first-aid tin with a red cross, glowing in lantern light',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'moss',
  layers: [
    // lantern glow
    { circle: [200, 210, 170], fill: 'cream', opacity: 0.1, at: 0, anim: 'grow' },
    { circle: [200, 210, 128], fill: 'cream', opacity: 0.12, at: 0.15, anim: 'grow' },
    // shadow
    { shape: 'M96 318 C 96 306, 304 306, 304 318 C 304 330, 96 330, 96 318 Z', fill: 'pine', opacity: 0.3, at: 0.3, anim: 'fade' },
    // the tin
    {
      group: [
        // handle
        { shape: 'M162 146 L162 124 C 162 110, 172 102, 186 102 L214 102 C 228 102, 238 110, 238 124 L238 146 L224 146 L224 126 C 224 120, 220 116, 214 116 L186 116 C 180 116, 176 120, 176 126 L176 146 Z', fill: 'pine' },
        // body
        { rect: [104, 152, 192, 164, 18], fill: 'cream' },
        // lid
        { rect: [98, 138, 204, 40, 14], fill: 'paper' },
        // latch
        { rect: [188, 170, 24, 16, 4], fill: 'pine' },
        // cross
        { rect: [180, 196, 40, 104, 6], fill: 'berry' },
        { rect: [148, 228, 104, 40, 6], fill: 'berry' },
      ],
      at: 0.4,
      anim: 'rise',
    },
    // a bandage stuck across the corner
    {
      group: [
        { shape: 'M252 176 L284 144 C 290 138, 300 138, 306 144 C 312 150, 312 160, 306 166 L274 198 C 268 204, 258 204, 252 198 C 246 192, 246 182, 252 176 Z', fill: 'clay' },
        { shape: 'M268 172 L280 160 L290 170 L278 182 Z', fill: '#C48E6B' },
      ],
      at: 1.2,
      anim: 'pop',
    },
  ],
};
