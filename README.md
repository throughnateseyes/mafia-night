# Mafia Night

A hand-drawn Mafia game for Steph's birthday cabin trip. No cards, no app store, no accounts:
everyone scans one code and their phone tells them who they are.

**Play:** https://throughnateseyes.github.io/mafia-night/
**See every drawing:** https://throughnateseyes.github.io/mafia-night/#/gallery

## How a game runs

1. Open the site on a laptop or TV and tap **Host a game**. A big join code appears.
2. Everyone scans it, types a name and picks a doodle. They show up on the big screen.
3. Nate taps **Get your secret code** and scans that second code with his phone. His phone
   becomes the narrator: it runs the game and reads him the script. The big screen just shows scenes.
4. Nate taps **Deal**. Every phone gets a role. Hold your thumb on the card to peek; let go and it hides.
5. Night, morning, talk, vote, repeat. Each step Nate taps changes the scene on every phone and
   the big screen: night falls, someone didn't wake up, everyone woke up, the vote, the reveal.
6. **Play again** re-deals new roles to the same people.

Anyone can tap the book button on their phone to read their role's rules any time.

## How it works

- **Static site** on GitHub Pages (Vite + plain JS). Pushing to `main` deploys.
- **Realtime with zero setup:** phones talk through a free public MQTT relay
  (`broker.emqx.io`, with HiveMQ and Mosquitto as fallbacks the table can switch to).
- **Private by design:** everything is end-to-end encrypted before it leaves a phone.
  The room key lives only in the join code's `#fragment` (never sent to any server), each role is
  sealed to one phone's own key, and the narrator's code carries a key nobody else has.
- **The game runs on the narrator's phone** (a pure reducer in `src/game/engine.js`), and is saved
  on that phone, so a refresh or a dropped connection picks up where it left off.
- **The art is code:** every drawing is a data file in `src/art/` drawn by a brush-ink engine
  (`src/art/ink.js`, `render.js`): tapered strokes, cut paper, a draw-on animation and a little
  line boil so everything feels alive.

## Change things

- Words, roles, role counts, scenes, the honoree: `src/config/game.js`.
- Colors and type: `src/styles/tokens.css`.
- A drawing: its file in `src/art/scenes`, `src/art/roles`, `avatars.js` or `icons.js`.
  Preview with `node scripts/render-art.mjs <file>` or at `#/gallery`.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/mafia-night/
npm test           # game rules
node scripts/e2e.mjs http://localhost:5173/mafia-night/   # a full game: table, 5 phones, narrator
node scripts/check-qr.mjs                                  # QR codes decode
```

## If the free relay is ever flaky

The public relays are free and shared, with no guarantees. If phones keep showing "Connecting…",
tap **Try another relay** on the big screen. For a guaranteed connection, swap
`src/net/relay.js` to a free private broker (HiveMQ Cloud or EMQX Serverless both have free tiers).
