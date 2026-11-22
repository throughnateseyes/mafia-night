# Case no. 26 — design system

"A weekend in Pioneer" is a murder case file. The whole app is a detective's desk at a cabin
in the woods, and everyone playing is a suspect. Every screen is made of physical things lying
on that desk: a manila folder, a typed form, a newspaper clipping, a pinboard, a photograph.

The visual reference is `design/case-file.html` (open it at
`http://localhost:5180/mafia-night/design/case-file.html`). The app must look like that mock,
built from the shared props below, and work at every screen size.

## The rules

1. **Everything is a thing.** No floating rounded cards, no pills, no gradients-as-decoration.
   If you need a container, it is a folder, a sheet of paper, a clipping, a label or the board.
2. **One prop carries each screen.** Restraint. The rest is typed text on the desk or the page.
3. **Two moods.** By day: paperwork under a lamp. At night (`body.lights-out`, set by the stage):
   the desk is black and only the fire and one photo are lit. Don't add other dark modes.
4. **Type voices** (never mix them up):
   - Typed (`--f-type`, Special Elite): headings, labels, buttons, facts. Sentence case, always.
   - Body (`--f-body`, Courier Prime): anything longer than two lines.
   - Pen scrawl (`--f-hand`, Reenie Beanie; class `.note`): asides and things a detective wrote.
     Red (`.note.red`) on paper, gold (`.note.gold`) on the dark desk, blue (`.note.pen`) for what a suspect signed.
   - Newspaper faces only inside the Gazette. Stamp face only inside stamps.
   - **Never use all-caps, letter-spaced labels, pill badges, emoji as icons** (the one 🎂 marker is the exception).
5. **Colour.** Ink, paper, manila, desk wood, cork. Red is ink for stamps, circles and danger.
   Yellow is crime tape and small labels on the dark desk. Photos are black and white; colour
   is reserved for the night photo and the birthday cake.
6. **Nothing sits square.** Props are tilted 1–4° (use `tilt(i)`), overlap slightly, and cast one
   consistent shadow (`--lift-1`, `--lift-2`).
7. **Motion is physical.** Things are set down (`.drop`), slid in (`.slide`), stamped (`thud`),
   or drawn by a pen. Nothing fades up from nowhere, nothing bounces. Respect reduced motion (base.css does).
8. **Spacing.** Use the `--s1…--s8` scale and `--gutter`. Text blocks get `--s4`–`--s5` between them;
   props get `--s5`–`--s6` of air. Never let text touch a prop's edge or another prop.

## Sizing: desk units

`1u = 1%` of the nearest container's width, capped (`--u` in tokens.css). Props are drawn with
`calc(var(--u) * n)`. Type uses `--t-xs … --t-h1`, `--t-hand`, `--t-hand-lg` (these have pixel floors).

- Phone screens: `<main class="frame"><div class="view">…</div></main>`. `.frame` is a 480px-max
  column centred on the desk and is the container. `.view` is a full-height flex column with the
  standard padding. Use `.grow` as a spacer.
- Laptop/TV: `<main class="frame wide">`, and wrap each column in `<div class="cq">` so the props
  in it scale to that column. Lay columns out with CSS grid and collapse to one column under ~820px.
- Tap targets are at least 44px. Test at 320×568, 390×844, 768×1024, 1366×768 and 1920×1080.

## Props (import from `src/ui/props.js`; styles in `src/styles/props.css`)

| Helper | What it is |
|---|---|
| `titleCard()` | "A weekend in / Pioneer" typed on an index card with the case stamp |
| `folder(innerHTML, { tab, rot })` | manila folder with a tab label |
| `polaroid(photoId, { cap, rot, glow, colour, extra })` | a photo print (ids = files in `src/assets/photo`) |
| `mug(avatar, { name, out, rot, extra })` | booking photo with the name typed under it |
| `face(avatar, { out })` | round face crop, for lists and tokens |
| `cabin(players, { enter })` | the cabin from above with everyone by the fire |
| `pinboard(players)` | mugshots pinned to cork with red string (parent needs a height) |
| `gazette(edition)` | torn Pioneer Gazette clipping (`edition()` in `src/config/gazette.js`) |
| `stamp(text, { sm, ink, thud, rot })`, `roundStamp(a, b)` | rubber stamps |
| `kraft(text)`, `crimeTape(style)`, `redact(w)`, `circled()` | torn label, tape, blacked-out word, red pen circle |
| `clip(style)`, `tapeStrip(style)`, `pin(style)` | paper clip, masking tape, push pin (absolutely placed) |
| `jitter(text)`, `tilt(i)` | uneven typewriter letters, a stable small rotation |

CSS classes for composing: `.paper` `.cork` `.on-paper` (surfaces), `.btn` (+ `.red` `.paper` `.manila`),
`.link` (hand-written text button), `.chipbtn`, `.field`, `.tabs` + `.tab[aria-selected]`, `.leader`
(typed row with dotted leader), `.kicker`, `.title`, `.lede`, `.note`, `.typed`, `.hand`, `.drop`, `.slide`,
`.timer`, `.net`, `.corner`, `.toast`, `.sheet`. Icons: `icon(name)` from `src/art/index.js` (monoline, inherits colour); use sparingly.

Scenes: `renderStage(el, scene, { players, round, compact })` from `src/ui/stage.js` draws whatever
the narrator has put on every screen (lobby cabin, night photo, morning paper, pinboard, verdict,
case closed) and switches the lights. Screens give it a `.stage` element inside a `.view` or `.cq` column.

## Voice

Dry, deadpan, true-crime. Players are "suspects", joining is "getting booked", roles come in a
"file", the lobby is "the cabin", the narrator is the lead detective. Short sentences. No
exclamation marks except the birthday. Roles: Mafia, Medic, Ranger, Camper.

## Don'ts

- Don't edit `tokens.css`, `base.css`, `props.css`, `props.js`, `stage.js`, `stage.css`, `kit.js` or
  anything under `src/game`, `src/net`, `src/config`. If a prop is missing or wrong, say so in your report.
- Don't hand-roll a prop that exists. Don't add new fonts, colours or shadows.
- Don't change behaviour, routes, element ids or `data-*` hooks.

## Layout rhythm

Every screen reads top to bottom in three bands, and nothing floats between them:

1. **Running head** at the top: the kicker (what this is), in the same place on every screen.
2. **One group** in the middle: the prop and the words about it, centred together. A caption sits `--s5` under the thing it describes, never at the far end of the screen.
3. **What you can do** at the bottom: the dock, the button, the hand-written link.

Spacing inside a group uses three steps only: `--s2` between a label and its value, `--s4` between things that belong together, `--s7` between sections. Pick one alignment axis per column (the big-screen lobby hangs on the cabin's centre line) and keep everything in the column on it.

## The field guide

How to play is a small book (`src/ui/rules.js`) that covers the whole screen, with the close button in the same corner on every page. Page 1 is the briefing; the four roles are manila files on it, each with a page number and a pen arrow, so it is obvious they open. Pages turn on a tap, the arrows at the foot, a swipe, or the arrow keys. Anything else that needs explaining at length gets a page in the guide, not a new sheet.
