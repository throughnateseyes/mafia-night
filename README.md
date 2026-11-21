# Steph’s birthday weekend in Pioneer · Case no. 26

A Mafia game made for Steph's 26th birthday cabin weekend, dressed as a murder case file.
No cards, no app store, no accounts: everyone scans one code, gets booked as a suspect, and
their phone hands them a confidential file with their role.

**Play:** https://throughnateseyes.github.io/mafia-night/
**Style guide (every prop and scene):** https://throughnateseyes.github.io/mafia-night/#/gallery

## How a game runs

1. Open the site on a laptop or TV and tap **Open the case**. A join code appears, taped to the desk.
2. Everyone scans it, types a name and picks a mugshot (sixteen woodland suspects). They walk into
   the cabin on the big screen as they join.
3. Nate taps **I'm the narrator** and scans that second code with his phone. His phone becomes the
   lead detective's folder: it runs the game and gives him the script. The big screen just shows scenes.
4. On his phone, Nate taps the cake next to the birthday girl (whatever name she typed), then
   **Hand out the files**. Every phone gets a role. Hold the folder to open it; let go and it closes.
5. Night, morning, talk, vote, repeat. Every tap of **Next** changes every phone and the big screen:
   the lights go out, the morning paper lands, the suspects go up on the pinboard, a verdict is stamped.
6. **Play again** deals new files to the same people.

Roles: **Mafia** (pick a victim each night), **Medic** (saves one person each night), **Ranger**
(checks one suspect each night) and **Campers** (argue, then vote).

The narrator's phone has four tabs: **Briefing** (what to say to explain the rules), **Tonight**
(the script and the one thing to tap), **Suspects** (birthday marker, peek at roles, remove someone)
and **Scenes** (put any scene on every screen, or fix a mistake).

## How it works

- **Static site** on GitHub Pages (Vite + plain JS). Pushing to `main` deploys.
- **Realtime with zero setup:** phones talk through a free public MQTT relay (`broker.emqx.io`,
  with HiveMQ and Mosquitto as fallbacks the table can switch to). Every phone needs internet.
- **Private by design:** everything is end-to-end encrypted before it leaves a phone. The room key
  lives only in the join code's `#fragment`, each role is sealed to one phone's own key, and the
  narrator's code carries a key nobody else has.
- **The game lives on the narrator's device** (a pure reducer in `src/game/engine.js`) and is saved
  there, so a refresh or a locked screen picks up where it left off. Players' phones remember who they are.
- **One design system:** every screen is composed from the same props (`src/ui/props.js`,
  `src/styles/props.css`): folder, index card, photo print, booking photo, cabin map, pinboard,
  Gazette clipping, stamps, tape. Scenes are composed once in `src/ui/stage.js`. The rules are in
  `docs/DESIGN_SYSTEM.md`.
- **Images** (`src/assets/`) were generated in Runway: booking photos, evidence and scene photos,
  cut-out props and material textures.

## Change things

- Words, roles, role counts, scenes, the trip (`EVENT`), the narrator's briefing: `src/config/game.js`.
- The morning paper's stories: `src/config/gazette.js`.
- Colours, type, spacing, motion: `src/styles/tokens.css`.
- A photo: replace the file in `src/assets/` (same name).

## Develop

```bash
npm install
npm run dev        # http://localhost:5173/mafia-night/
npm test           # game rules
node scripts/e2e.mjs http://localhost:5173/mafia-night/   # a full game: table, 5 phones, narrator, refresh mid-game
node scripts/check-qr.mjs                                  # QR codes decode
```

## If the free relay is ever flaky

The public relays are free and shared, with no guarantees. If phones keep showing "Connecting…",
tap **Try another relay** on the big screen. For a guaranteed connection, swap `src/net/relay.js`
to a free private broker (HiveMQ Cloud or EMQX Serverless both have free tiers).
