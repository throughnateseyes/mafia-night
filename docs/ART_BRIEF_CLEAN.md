# Art brief v2: minimal, made for Steph's cabin weekend

The first art pass was rejected: heavy black outlines everywhere, thick brush strokes,
busy compositions, and it read as "AI hand-drawn". This pass replaces all of it.

## The occasion

Mafia Night, played at **Steph's 26th birthday cabin weekend**: a cabin in the pines by a lake,
a campfire, s'mores, string lights, cocoa, flannel, a birthday cake. A murder mystery on top.
Every drawing should feel like it was made for *this* weekend, not for "a Mafia app".
Small, specific touches win: a single party hat, a "26" made of two number candles,
a marshmallow on a stick, the lit cabin window.

Roles, re-themed for camp (the game logic is unchanged):
- **Mafia**: hidden among the campers. Keep the fedora as their mark.
- **Medic** (was Doctor): saves one camper each night.
- **Ranger** (was Detective): checks one suspect each night with a flashlight.
- **Camper** (was Villager): no night moves; reads the room and votes.

## The style

**Flat, minimal, intentional.** Think a well-made national-park poster or a mid-century
picture book, simplified: big quiet shapes, generous empty space, one idea per drawing.

- **No outlines on shapes. Ever.** Shapes are flat color sitting on flat color.
- **Few shapes.** A scene is about 6–20 nodes. If it needs more to read, the idea is too complicated.
- **Depth from tone, not lines.** Use two or three tones (night → dusk → pine) to layer near and far.
- **Thin lines only as accents**, `w` 2–3 at the 400 scale: smoke, steam, a string-light wire,
  a flashlight beam edge, stitches. Never to outline a filled shape.
- **One accent per drawing** (ember, candle or berry). Berry red (blood) is rare and small.
- **Silhouettes and geometry over detail.** Hands, if used at all, are simple flat mitten shapes, no finger lines.
  Faces: at most two small dots for eyes.
- **No text, no letters, no numbers drawn as glyphs** (the app sets all type). The only exception:
  number candles "2" and "6" built from simple shapes are allowed on the birthday cake.
- Compose for a **portrait phone screen**: keep the key shape in the upper-middle; the bottom
  ~20% of scenes sits behind a caption, so keep it calm (ground, water, floor).

## Palette (keys from src/art/palette.js)

cream `#F4EFE6`, paper `#FBF8F3`, birch `#E6DED0`, smoke `#BDB5A8`, ink `#1F1E1C`,
pine `#2E4A3B`, moss `#7F9672`, lake `#9CB7C7`, ember `#DE6F3E`, clay `#D7A27F`,
candle `#F1C24F`, berry `#B03A2E`, night `#121820`, dusk `#1F2833`.
Any hex also works for an in-between tone (e.g. a lighter dusk `#2A3542`), but stay close to the palette.

## Format

Each file default-exports one object (or an array for avatars):

```js
export default {
  id: 'night-falls', title: 'Night falls', style: 'clean',
  viewBox: '0 0 400 500', tile: 'night',
  layers: [ /* nodes, back to front */ ],
};
```

Use only the **clean nodes** (see the top of `src/art/render.js`):

- `{ shape: 'M..Z', fill, opacity, at, anim }` exact flat fill (absolute commands; curves welcome)
- `{ circle: [cx, cy, r], fill, at, anim }`
- `{ rect: [x, y, w, h, rx], fill, at, anim }`
- `{ line: 'M.. M..', w: 2.5, color, at, dur, opacity, draw: true }` monoline that draws itself on
- `{ group: [...], at, anim, loop, origin: 'cx cy', loopAt }` for moving things together

**Motion:** quiet and deliberate.
- Entrances: use `fade`, `rise`, `grow`, `slide-l` and `slide-r`; use `pop` and `drop` rarely.
- Stagger the entrances over about 0–1.8s, so the scene assembles back to front.
- Loops: one or two per drawing, subtle. Use `flicker` for flames and lit windows, `blink` for eyes, `float`, `breathe` or `drift` for smoke and steam, and `sway` for a lantern. Set `loopAt` after the entrance, and set `origin` at the pivot.

Read `src/art/scenes/_clean-example.js` first. It's the reference for the level of simplicity. Do better than it: it's correct but plain. Aim for the same simplicity, with a stronger composition and one delightful detail.

## Check your work

```bash
node scripts/render-art.mjs src/art/scenes/<file>.js --out .art-preview/<your-folder> --width 500
node scripts/render-art.mjs <several files> --sheet --out .art-preview/<your-folder>
```

Open the PNGs and critique them honestly, at least three rounds per piece. Check:
- Does it read in one second at phone size?
- Is anything outlined? (It shouldn't be.)
- Is it too busy?
- Does it feel like Steph's cabin weekend?
- Does the set look like one artist made it?

Also check small sizes: avatars at 44px, roles at 120px.

Work only in your assigned files. Don't run git or start servers.
