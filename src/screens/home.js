import { EVENT } from '../config/game.js';
import { artHTML, icon } from '../art/index.js';
import { createRoom, lastRoom } from '../game/session.js';
import { navigate } from '../router.js';
import { $, buzz, esc } from '../ui/kit.js';
import { openHowToPlay } from '../ui/rules.js';

/** "Steph’s 26th · Cabin weekend": the line that says this was made for tonight. */
export const eventLine = () => `${esc(EVENT.honoree)}’s ${EVENT.age}th · Cabin weekend`;

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
    <header class="home-head">
      <p class="kicker">${eventLine()}</p>
      <h1 class="home-title">Mafia <em>Night</em></h1>
    </header>
    <div class="home-hero">${artHTML('home', { delay: 0.3 })}</div>
    <footer class="home-foot">
      <p class="home-for soft">Someone at the cabin isn’t who they say they are.</p>
      <button class="btn btn-big" id="host" type="button"><span>Host a game</span>${icon('arrow-right')}</button>
      <div class="home-row">
        <button class="btn btn-quiet" id="how" type="button">${icon('rules')}<span>How to play</span></button>
        ${resume ? `<a class="btn btn-quiet" href="#${resume}">${icon('refresh')}<span>Back to my game</span></a>` : ''}
      </div>
    </footer>
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
