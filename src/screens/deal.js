import { loadGame, clearGame } from '../game/state.js';
import { navigate } from '../router.js';

/* Placeholder until milestone 4 (one QR code at a time). */
export function renderDeal(root) {
  const game = loadGame();
  if (!game) {
    navigate('/');
    return;
  }
  root.innerHTML = `
  <main class="screen placeholder">
    <p class="stamp">Cards shuffled</p>
    <h1>${game.count} roles<br><em>dealt face down</em></h1>
    <p class="hand">The QR handoff comes next: one code per suspect, passed around the room.</p>
    <p class="caption">Game ${game.seed} is saved on this phone. Refreshing won't lose it.</p>
    <button class="btn" id="restart" type="button">Back to setup</button>
  </main>`;
  root.querySelector('#restart').addEventListener('click', () => {
    clearGame();
    navigate('/');
  });
}
