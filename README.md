# Mafia Night

Secret roles for a game of Mafia, dealt by QR code. Built for Steph's birthday cabin trip.

**Live:** https://throughnateseyes.github.io/mafia-night/

No server: the host's phone shuffles the roles, shows one QR code per player, and keeps the game in `localStorage`. See [PLAN.md](PLAN.md) for milestones and the "Cabin Noir" design direction.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173/mafia-night/
npm test         # role scaling and dealing
npm run build
```

Every push to `main` runs the tests, builds, and deploys to GitHub Pages (`.github/workflows/deploy.yml`).

## Where things live

| File | What it holds |
|---|---|
| `src/config/game.js` | Honoree, player limits, role-scaling table, every word of role rules |
| `src/styles/tokens.css` | All colors, type, spacing, motion. Nothing else hard-codes a value |
| `src/ui/art.js` | Hand-drawn SVG illustrations (roles, cabin scene, lineup figures) |
| `src/ui/rules-sheet.js` | The role rules card, openable from any screen |
| `src/game/` | Pure game logic (scaling, shuffle) and saved state |
| `src/screens/` | One file per screen |

## Contrast

Text pairs used in the UI pass WCAG AA (4.5:1). Two surfaces are decorative only and never carry text: `--color-paper-shade` and `--color-surface-raised`.
