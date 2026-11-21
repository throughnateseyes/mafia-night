// Role portrait: the Mafia, hidden among the campers.
// A fedora silhouette against the moon, two eyes under the brim,
// pines closing in on both sides. The berry hat band is the one accent.
export default {
  id: 'role-mafia',
  title: 'The Mafia: a figure in a fedora stands black against the moon among the pines, two eyes under the brim',
  style: 'clean',
  viewBox: '0 0 400 400',
  tile: 'night',
  layers: [
    // the moon
    { circle: [200, 170, 112], fill: 'birch', at: 0, anim: 'fade' },
    // two stars
    { circle: [72, 84, 2.5], fill: 'cream', opacity: 0.7, at: 0.2, anim: 'fade' },
    { circle: [338, 58, 2], fill: 'cream', opacity: 0.6, at: 0.3, anim: 'fade' },
    // far ridge
    { shape: 'M0 330 C 90 314, 300 312, 400 326 L400 400 L0 400 Z', fill: 'dusk', at: 0.1, anim: 'fade' },
    // the figure: head and shoulders
    {
      group: [
        { shape: 'M164 212 L164 252 C 164 274, 180 290, 200 290 C 220 290, 236 274, 236 252 L236 212 Z', fill: 'ink' },
        { shape: 'M186 282 L186 300 C 144 306, 108 324, 94 362 L86 400 L314 400 L306 362 C 292 324, 256 306, 214 300 L214 282 Z', fill: 'ink' },
        // the fedora: crown, band, brim
        { shape: 'M140 210 C 138 172, 146 136, 162 122 C 174 113, 186 126, 200 126 C 214 126, 226 113, 238 122 C 254 136, 262 172, 260 210 Z', fill: 'ink' },
        { shape: 'M141 192 C 170 186, 230 186, 259 192 L260 206 C 230 201, 170 201, 140 206 Z', fill: 'berry' },
        { shape: 'M92 214 C 118 202, 160 199, 200 199 C 240 199, 282 202, 308 214 C 296 224, 252 228, 200 228 C 148 228, 104 224, 92 214 Z', fill: 'ink' },
      ],
      at: 0.4,
      anim: 'rise',
    },
    // eyes under the brim
    {
      group: [
        { circle: [184, 248, 5], fill: 'cream' },
        { circle: [216, 248, 5], fill: 'cream' },
      ],
      at: 1.2,
      anim: 'fade',
      loop: 'blink',
      origin: '200 248',
      loopAt: 2.2,
    },
    // the pines close in
    { group: [{ shape: 'M-6 400 L52 238 L110 400 Z', fill: 'pine' }], at: 0.6, anim: 'rise' },
    { group: [{ shape: 'M62 400 L104 286 L146 400 Z', fill: '#26402F' }], at: 0.75, anim: 'rise' },
    { group: [{ shape: 'M290 400 L348 228 L406 400 Z', fill: 'pine' }], at: 0.7, anim: 'rise' },
    { group: [{ shape: 'M252 400 L292 300 L332 400 Z', fill: '#26402F' }], at: 0.85, anim: 'rise' },
  ],
};
