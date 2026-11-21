# Mafia Night: Art Brief

You are drawing for a party game web app: a game of Mafia played at **Steph's birthday cabin trip**, 8–10 friends, one narrator (Nate). Everyone's phone becomes part of the show: it tells them their secret role, then plays a hand-drawn animated scene each time the narrator moves the story along (night falls, someone was found dead, a clear morning, the vote, the finale).

The goal is to **wow** people the moment they see their phone. It must not look like a template or "AI-made". It should look like a talented illustrator drew every frame by hand.

## The style

Study the references (Read these image files):

- `/private/tmp/claude-501/-Users-nate-Library-Application-Support-Claude-scratch-workspaces-35190d1e-d4d4-415f-abe0-8aa64cfa2c3d-7fdb0b5d-2b15-4f17-ae19-d656b47cf291-scratch-2026-11-20-f419c5/92033a3a-cd6c-48e4-8c68-abf831a6be91/images/1.webp` — **the core style**: colored rounded tiles (sand, terracotta, sage, periwinkle, clay), bold confident black brush linework, flat bone-white cut-paper shapes with scissor-cut edges, a printed/mottled terracotta dot behind a hand. Hands everywhere. Iconic, simple, lots of negative space.
- `.../images/2.png` — posters: a single bold motif per tile (a head profile with a network inside, a crowd of raised hands, abstract cut shapes + a hand).
- `.../images/3.png` — loose pen-line observational drawing (shows how far "hand-drawn" can go: casual, confident, imperfect).
- `.../images/4.png` — **night mood**: a black silhouette figure whose head becomes a tree of branches, standing in front of a big flat periwinkle-blue circle on black. Surreal, graphic, eerie.
- `.../images/5.png` — pencil sketches: imagination, odd details, curiosity.

(Same folder for all five: replace `...` with the folder in the first path.)

Blend: **the Anthropic tile illustration style (1, 2)** as the base, with the **eerie graphic night silhouettes of (4)** for night/Mafia moments. Tone: playful-dark murder mystery at a birthday party in a cabin in the woods. Witty, a little spooky, never gory. Original compositions only: do not copy any reference.

Recurring motifs you can use: hands (pointing, raised, cupped, holding), the moon, fedoras, a birthday cake (candles, a knife stuck in it), party hats, string lights, pines, a cabin, eyes (open/closed), footprints, a lantern, chalk outlines, confetti, keys, a magnifying glass, a stitched heart.

## How art is made here (the engine)

You do not write SVG. You write **data**: centerlines and shapes. The engine (`src/art/render.js`, `src/art/ink.js`) turns centerlines into tapered brush strokes with wobble, cuts paper shapes with irregular edges, adds printed grain to blobs, and in the app animates everything: ink **draws itself on** in the order you list it, paper pops/rises in, and every line "boils" (re-drawn 3 slightly different ways, cycling, like hand-drawn animation).

Read `src/art/render.js` (top comment lists node types) and the sample `src/art/scenes/_example.js`.

A module default-exports one art object (or an array):

```js
export default {
  id: 'night-falls',            // unique, kebab-case
  title: 'Night falls',         // used as the accessible label: describe the picture
  viewBox: '0 0 400 500',
  tile: 'night',                // background color key, or null for transparent
  layers: [ /* drawn back to front */ ],
};
```

Node types:

| Node | Use |
|---|---|
| `{ paper: 'M..Z', fill: 'bone', rough: 1, at, anim }` | flat cut-paper shape |
| `{ blob: 'M..Z', fill: 'terracotta', at, anim }` | shape with printed mottled grain |
| `{ ink: 'M.. M..', w: 5, color: 'ink', at, dur, wobble: 1, taper: 0.6 }` | brush strokes; **each `M` is a separate stroke**, drawn in order |
| `{ group: [...], loop: 'float', origin: 'cx cy', at, anim, loopAt }` | group with a looping micro-animation |
| `{ text: 'WORD', x, y, size: 40, align: 'middle', w: 4.5, color, at, maxWidth }` | hand-lettered brush text (y = top of caps) |
| `{ slot: 'name', x, y, size, align, maxWidth, at }` | same, filled at runtime (e.g. the victim's name) |

- Entrance `anim`: `pop` `rise` `drop` `fade` `grow` `slide-l` `slide-r` `unfold`. `at` = start time in seconds.
- Loops: `float` `sway` `bob` `flicker` `blink` (scaleY squash, for eyes) `wave` `pulse` `spin` `drift` `shake` `breathe`. Set `origin` to the pivot point in viewBox units (e.g. a candle flame pivots at its base, a hand waves from the wrist).
- Colors (keys only): `ink` `bone` `sand` `stone` `terracotta` `clay` `sage` `periwinkle` `sky` `night` `dusk` `blood` `candle`.

## Rules

1. **Only absolute uppercase path commands** (`M L C Q Z`, also `S T H V A` are ok). No lowercase relative commands. Every subpath in `ink` starts with `M`.
2. Ink widths at a 400-unit scale: main lines 4.5–7, details 2.5–3.5. On dark tiles use `color: 'bone'` for ink.
3. **Print feel:** offset the paper fill from its ink outline by 3–6 units (misregistered), like the references. Don't trace fills exactly.
4. Budget (performance on phones): scenes ≤ 45 ink subpaths, role tiles ≤ 28, avatars/icons ≤ 10. Prefer a few bold strokes over many small ones. No hatching walls.
5. Draw order = how a person would draw it. Total entrance ≤ 3.5 s. First thing appears by `at: 0.1`. The key moment (the victim's name, the role's face) lands by ~2 s.
6. Loops are subtle and few (2–4 per scene). The scene must read instantly at phone size (~360 px wide) and from across the room on a TV.
7. Pure data modules: no imports, no code beyond the object (helpers inside the file are fine if they return plain data).
8. Stay in your assigned files. Don't run git, don't start servers, don't edit the engine. If the engine truly blocks you, say so in your final report instead.

## Check your work (required)

```bash
node scripts/render-art.mjs src/art/scenes/your-file.js              # → .art-preview/<id>.png
node scripts/render-art.mjs src/art/scenes/morning-dead.js --slot name=STEPH
node scripts/render-art.mjs --sheet src/art/roles/*.js               # contact sheet
```

Then **Read the PNG and critique it hard** against the references: Is it bold and iconic? Does it read at small size? Is anything stiff, symmetrical, clip-arty, or cluttered? Are hands believable (they are the hardest part: draw fingers as separate confident strokes with knuckle bends)? Iterate at least three rounds per piece. Static renders show the final frame; animations run in the app.

## Final report

List each file, each art id, the slots it uses, and one line on the idea. Note anything you are unsure about.
