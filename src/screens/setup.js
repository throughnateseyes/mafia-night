import { EVENT, PLAYER_LIMITS, ROLES, TEAMS } from '../config/game.js';
import { clampCount, roleCounts, roleList } from '../game/roles.js';
import { createGame, loadPrefs, savePrefs } from '../game/state.js';
import { cabinScene, icons, roleArt, suspect } from '../ui/art.js';
import { openRules } from '../ui/rules-sheet.js';
import { navigate } from '../router.js';

const buzz = () => navigator.vibrate?.(8);

export function renderSetup(root) {
  const prefs = loadPrefs();
  let count = clampCount(prefs.count ?? PLAYER_LIMITS.default);

  root.innerHTML = `
  <main class="screen setup">
    <header class="title-block">
      <p class="stamp case-stamp"><span>Case file No. ${EVENT.caseNo}</span><span>${EVENT.honoree}'s ${EVENT.occasion}</span></p>
      <h1 class="title">Mafia<br><em>Night</em></h1>
      <p class="hand tagline">a cabin, a cake, &amp; a killer among us</p>
      ${cabinScene()}
    </header>

    <section class="section" aria-labelledby="count-label">
      <div class="deco-rule"><span></span></div>
      <h2 id="count-label">How many suspects?</h2>
      <p class="caption">Count everyone playing. Don't count yourself: you're the narrator.</p>
      <div class="stepper">
        <button class="btn btn-round" type="button" data-step="-1" aria-label="One fewer player">${icons.minus}</button>
        <output class="count" id="count" aria-live="polite" aria-labelledby="count-label">${count}</output>
        <button class="btn btn-round" type="button" data-step="1" aria-label="One more player">${icons.plus}</button>
      </div>
      <div class="lineup" aria-hidden="true"></div>
    </section>

    <section class="section" aria-labelledby="cast-label">
      <div class="deco-rule"><span></span></div>
      <div class="section-head">
        <h2 id="cast-label">The cast</h2>
        <p class="hand note">tap a card for its rules ↓</p>
      </div>
      <ul class="cast" role="list"></ul>
      <div class="win-strip">
        <p><span class="dot dot-mafia"></span><strong>Mafia</strong> ${TEAMS.mafia.win}</p>
        <p><span class="dot dot-town"></span><strong>Town</strong> ${TEAMS.town.win}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="pin-label">
      <div class="deco-rule"><span></span></div>
      <h2 id="pin-label">Narrator's PIN</h2>
      <p class="caption">Four digits. It locks your host screen so nobody peeks at who's who.</p>
      <label class="pin">
        <span class="sr-only">Four digit PIN</span>
        <input id="pin" type="password" inputmode="numeric" pattern="[0-9]*"
               autocomplete="off" placeholder="····" aria-describedby="pin-hint" />
      </label>
      <p class="caption pin-hint" id="pin-hint">Remember it. You'll need it after every night.</p>
    </section>

    <div class="deal-bar">
      <button class="btn btn-primary" id="deal" type="button" disabled>${icons.cards}<span>Deal the cards</span></button>
    </div>
  </main>`;

  const $ = (sel) => root.querySelector(sel);
  const countEl = $('#count');
  const lineup = $('.lineup');
  const cast = $('.cast');
  const pin = $('#pin');
  const dealBtn = $('#deal');

  function renderCast() {
    const counts = roleCounts(count);
    cast.innerHTML = Object.entries(ROLES)
      .map(
        ([id, role]) => `
        <li>
          <button class="cast-card paper" type="button" data-role="${id}"
                  aria-label="${role.name}, ${counts[id]} in play. Show rules.">
            ${roleArt(id, { size: 60, color: `var(--color-${role.color}-ink)` })}
            <span class="cast-text">
              <span class="cast-name">${role.name}</span>
              <span class="cast-line">${role.tagline}</span>
            </span>
            <span class="cast-count" data-team="${role.team}">×${counts[id]}</span>
          </button>
        </li>`,
      )
      .join('');
  }

  function renderLineup(prev) {
    const roles = roleList(count);
    lineup.innerHTML = roles
      .map((id, i) => suspect(id).replace('<svg', `<svg style="--i:${i}"${i >= prev ? ' data-new' : ''}`))
      .join('');
  }

  function setCount(next, { animate = true } = {}) {
    const prev = count;
    count = clampCount(next);
    countEl.textContent = count;
    if (animate && prev !== count) {
      countEl.classList.remove('bump');
      void countEl.offsetWidth; // restart the animation
      countEl.classList.add('bump');
      buzz();
    }
    root.querySelector('[data-step="-1"]').disabled = count <= PLAYER_LIMITS.min;
    root.querySelector('[data-step="1"]').disabled = count >= PLAYER_LIMITS.max;
    renderLineup(animate ? prev : count);
    renderCast();
    savePrefs({ count });
  }

  root.querySelectorAll('[data-step]').forEach((btn) =>
    btn.addEventListener('click', () => setCount(count + Number(btn.dataset.step))),
  );

  cast.addEventListener('click', (e) => {
    const card = e.target.closest('[data-role]');
    if (card) openRules(card.dataset.role);
  });

  pin.addEventListener('input', () => {
    pin.value = pin.value.replace(/\D/g, '').slice(0, 4);
    dealBtn.disabled = pin.value.length !== 4;
  });

  dealBtn.addEventListener('click', async () => {
    if (pin.value.length !== 4) return;
    dealBtn.disabled = true;
    await createGame({ count, pin: pin.value });
    buzz();
    navigate('/deal');
  });

  setCount(count, { animate: false });
}
