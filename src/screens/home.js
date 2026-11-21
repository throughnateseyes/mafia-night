import { EVENT } from '../config/game.js';
import { artHTML, icon } from '../art/index.js';
import { createRoom, lastRoom } from '../game/session.js';
import { navigate } from '../router.js';
import { $, buzz, esc } from '../ui/kit.js';
import { openHowToPlay } from '../ui/rules.js';

export function renderHome(root) {
  const last = lastRoom();
  const resume =
    last && Date.now() - last.at < 1000 * 60 * 60 * 18
      ? last.kind === 'table'
        ? `/t/${last.roomId}`
        : last.kind === 'narrator'
          ? `/n/${last.roomId}.${last.rk}.${last.nk}.${last.broker}`
          : `/j/${last.roomId}.${last.rk}.${last.broker}`
      : null;

  root.innerHTML = `
  <main class="view home">
    <div class="home-title">${artHTML('title', { className: 'title-art', label: 'Mafia Night' })}</div>
    <div class="home-hero">${artHTML('home', { delay: 0.6 })}</div>
    <p class="home-for say">A murder mystery for ${esc(EVENT.honoree)}’s ${esc(EVENT.occasion)}</p>
    <div class="home-actions">
      <button class="btn btn-big" id="host" type="button"><span>Host a game</span>${icon('arrow-right', { size: 26 })}</button>
      <div class="home-row">
        <button class="btn btn-quiet" id="how" type="button">${icon('rules', { size: 22 })}<span>How to play</span></button>
        ${resume ? `<a class="btn btn-quiet" href="#${resume}">${icon('refresh', { size: 22 })}<span>Back to my game</span></a>` : ''}
      </div>
    </div>
  </main>`;

  $('#how', root).addEventListener('click', openHowToPlay);
  $('#host', root).addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    buzz(15);
    const room = await createRoom(0);
    navigate(`/t/${room.roomId}`);
  });
}
