/* How to play, and each role's full rules. One tap away on every screen. */
import { ROLES, ROUND, TEAMS } from '../config/game.js';
import { artHTML, icon } from '../art/index.js';
import { esc, sheet } from './kit.js';

export function openRole(roleId, { crew = [] } = {}) {
  const r = ROLES[roleId];
  const team = TEAMS[r.team];
  sheet(
    `<article class="rules role-rules" data-team="${r.team}">
      <div class="rules-tile">${artHTML(r.art, { label: r.name })}</div>
      <p class="kicker">${team.name}</p>
      <h2>${r.name}</h2>
      <p class="lead">${esc(r.line)}</p>
      ${crew.length ? `<p class="crew">Your crew: <strong>${crew.map(esc).join(', ')}</strong></p>` : ''}
      <dl>
        <div><dt>${icon('moon')} At night</dt><dd>${esc(r.night)}</dd></div>
        <div><dt>${icon('sun')} By day</dt><dd>${esc(r.day)}</dd></div>
        <div><dt>${icon('crown')} You win when</dt><dd>${esc(team.win)}</dd></div>
      </dl>
      <p class="tip">${esc(r.tip)}</p>
    </article>`,
    { className: 'rules-sheet' },
  );
}

export function openHowToPlay() {
  const s = sheet(
    `<article class="rules how">
      <p class="kicker">How to play</p>
      <h2>Someone at this cabin is <em>a killer</em>.</h2>
      <p class="lead">Everyone gets a secret role on their phone. The Mafia know each other. The campers don’t know who to trust.</p>
      <ol class="loop">
        ${ROUND.map((step, i) => `<li style="--i:${i}"><span class="loop-icon">${icon(step.icon)}</span><div><h3>${step.name}</h3><p>${esc(step.text)}</p></div></li>`).join('')}
      </ol>
      <p class="soft small">Repeat until one side wins.</p>
      <div class="win-row">
        <div class="win win-town"><h3>Campers win</h3><p>${esc(TEAMS.town.win)}</p></div>
        <div class="win win-mafia"><h3>Mafia wins</h3><p>${esc(TEAMS.mafia.win)}</p></div>
      </div>
      <h3 class="section-title">The roles</h3>
      <div class="role-grid">
        ${Object.entries(ROLES)
          .map(([id, r]) => `<button class="role-chip" type="button" data-role="${id}"><span class="role-chip-art">${artHTML(r.art, { animate: false, boil: false })}</span><span>${r.name}</span></button>`)
          .join('')}
      </div>
    </article>`,
    { className: 'rules-sheet' },
  );
  s.el.querySelectorAll('[data-role]').forEach((b) =>
    b.addEventListener('click', () => {
      s.close();
      setTimeout(() => openRole(b.dataset.role), 260);
    }),
  );
}
