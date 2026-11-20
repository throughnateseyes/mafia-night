# Mafia Night — Build Plan

Source spec: [Mafia Night Web App: Build Spec](https://claude.ai/artifact/LQMHD5CCXrfXiD9EMq1hbp)

## Stack decisions

| Decision | Choice | Why |
|---|---|---|
| Build | Vite + vanilla JS (ES modules) | Spec allows "a small Vite build". No framework needed for ~6 screens. |
| Routing | Hash routes (`#/setup`, `#/r/<token>`, `#/host`) | GitHub Pages has no SPA fallback; hash routes never 404. |
| Styling | Plain CSS, all values from `src/styles/tokens.css` | Spec: tokens defined once as CSS custom properties. |
| Fonts | Fraunces, Big Shoulders Display, Caveat, Inter, self-hosted via `@fontsource` | Cabin Wi-Fi may be flaky; no third-party font request. |
| Role config | `src/config/game.js` | Spec: scaling table configurable in one constants file. |
| Randomness | `crypto.getRandomValues` Fisher–Yates | Fair shuffle, no `Math.random` bias. |
| Host state | `localStorage` | Spec: refresh must not lose the game. |
| QR | `qrcode` npm package (client side) | Spec suggestion; no server. |
| Tests | Vitest for pure game logic | Role scaling, shuffle, encoding, win check. |
| Deploy | GitHub Actions → GitHub Pages | Every push to `main` redeploys. |

## Design direction: "Cabin Noir"

This replaces the spec's original token values, per Nate's direction on 2026-11-20: organic, hand-drawn (in the spirit of Anthropic's illustration style), very on-theme murder mystery, made for Steph's birthday cabin trip, replayable, every role one tap away from its full rules.

- **Setting:** a cabin at night. Warm ink-dark background (not blue-black), a faint firelight glow at the top of each screen.
- **Paper on the table:** role cards, rules, and case files are ivory paper with grain, sitting a hair askew like real cards.
- **Hand-drawn ink:** every illustration is loose line art run through one shared SVG `#wobble` filter, over a spot-color blob printed a little off-register.
- **Deco brass:** thin rules with a diamond, letterspaced stamps ("CASE FILE No. 11·20"), brass primary buttons.
- **Type system:** Fraunces (soft and wonky axes maxed) for names and titles · Big Shoulders Display (modeled on 1920s Chicago) for stamps and labels · Caveat for the narrator's handwritten notes and tips · Inter for small UI text.
- **Color meaning:** red is Mafia only. Town is a dusty blue, Doctor sage, Detective brass-gold. Each has a bright version for night and a deep `-ink` version for paper.
- **Birthday touches:** string lights on the cabin eave, the honoree on the case-file stamp (`EVENT` in `src/config/game.js`), "a cabin, a cake, & a killer among us".
- **Rules on tap:** `openRules(roleId)` shows the role's index card (night, day, how to win, narrator's tip) from anywhere. Copy lives in `ROLES` in `src/config/game.js`.
- **Replay:** the last player count is remembered; a "Play again" reshuffle (same group, new roles) arrives with the host view.

## Milestones (maps to the spec's Agent Tasks)

1. **Repo + Pages** — repo, Actions deploy workflow, Pages enabled. ✅ this session
2. **Setup screen** — player count stepper (5–14), live role breakdown, host PIN, Start shuffles roles and saves the game. ✅ this session
3. **Role links + reveal screen** — encode `{seed, seat, role}` into an obfuscated token; player screen with "Tap to reveal" → card flip → tap to hide, plus a "How do I play?" button that opens the role's rules card.
4. **Host QR flow** — one QR at a time, "Player 3 of 9", Next / Back, host QR last.
5. **Host view** — PIN gate, role list, night slides, morning deaths, vote-outs, win check.
6. **Visuals** — role icons ✅ (first pass) · Night → Morning → Vote loop graphic · how-to-win strip ✅ (on setup) · printable rules page · reveal-card flip animation.
7. **Device test** — iPhone + Android, 8–10 phones, real Pages URL.

## Screen map

```
#/            Home: round loop, how to win, "Host a game"
#/setup       Setup: count, roles preview, PIN, Start         ← built
#/deal        Host QR handoff, one player at a time           ← placeholder
#/r/<token>   Player reveal (opened from QR)
#/host        PIN-gated host control panel
#/rules       Printable rules page
```

## Open questions for Nate

- Should players be named on the host's list, or just "Player 1…N"? (Setup currently uses seat numbers; names can be added on the deal screen.)
- Jester or other optional roles: the config supports adding roles, but the toggle UI is deferred.
