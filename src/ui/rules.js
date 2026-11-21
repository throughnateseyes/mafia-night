/*
 * The briefing (how this works) and each role's file. One tap away on every screen.
 * Both are sheets of typing paper slid up from the bottom of the desk. Styles: src/styles/rules.css.
 */
import { BRIEFING, EVENT, ROLES, TEAMS } from '../config/game.js';
import { esc, sheet } from './kit.js';
import { polaroid, stamp, tilt } from './props.js';

/** One role's file: photo, name stamp, what to do at night and by day, and the detective's aside. */
export function openRole(roleId, { crew = [] } = {}) {
  const r = ROLES[roleId];
  if (!r) return;
  const team = TEAMS[r.team];
  sheet(
    `<article class="rules role-rules on-paper" data-team="${r.team}">
      <p class="kicker">${esc(team.name)} · case no. ${EVENT.caseNo}</p>
      <div class="role-head">
        <div class="role-photo">${polaroid(r.photo, { cap: 'exhibit A', rot: -3, alt: r.name })}</div>
        <div class="role-id">
          <h2 class="role-stamp">${stamp(r.name, { sm: true, ink: r.team !== 'mafia', rot: -5 })}</h2>
          <p class="role-line">${esc(r.line)}</p>
        </div>
      </div>
      ${crew.length ? `<p class="role-crew">Your crew: <strong>${crew.map(esc).join(', ')}</strong></p>` : ''}
      <dl class="role-facts">
        <div><dt>At night</dt><dd>${esc(r.night)}</dd></div>
        <div><dt>By day</dt><dd>${esc(r.day)}</dd></div>
        <div><dt>You win when</dt><dd>${esc(team.win)}</dd></div>
        <div class="off-record"><dt>Off the record</dt><dd class="note red">${esc(r.tip)}</dd></div>
      </dl>
    </article>`,
    { className: 'rules-sheet' },
  );
}

/** The briefing: five typed lines, the one rule, who is who, and how each side wins. */
export function openHowToPlay() {
  const s = sheet(
    `<article class="rules how on-paper">
      <p class="kicker">Case no. ${EVENT.caseNo} · briefing for all suspects</p>
      <h2 class="title">How this works</h2>
      <ol class="brief">
        ${BRIEFING.lines.map((line, i) => `<li><span class="note red brief-num" aria-hidden="true">${i + 1}</span><span>${esc(line)}</span></li>`).join('')}
      </ol>
      <p class="note red brief-rule">${esc(BRIEFING.rule)}</p>
      <h3 class="rules-head">Who you might be</h3>
      <div class="role-rows">
        ${Object.entries(ROLES)
          .map(
            ([id, r], i) =>
              `<button class="role-row" type="button" data-role="${id}"><span class="role-thumb">${polaroid(r.photo, { rot: tilt(i + 1, 0.8) })}</span><span class="role-row-text"><span class="role-row-name ${r.team === 'mafia' ? 'red' : ''}">${esc(r.name)}</span><span class="role-row-line">${esc(r.line)}</span></span></button>`,
          )
          .join('')}
      </div>
      <h3 class="rules-head">How it ends</h3>
      <dl class="role-facts wins">
        <div><dt>${esc(TEAMS.town.name)} win</dt><dd>${esc(TEAMS.town.win)}</dd></div>
        <div class="red"><dt>${esc(TEAMS.mafia.name)} win</dt><dd>${esc(TEAMS.mafia.win)}</dd></div>
      </dl>
    </article>`,
    { className: 'rules-sheet' },
  );
  // tap a role to pull its file
  s.el.querySelectorAll('[data-role]').forEach((b) =>
    b.addEventListener('click', () => {
      s.close();
      setTimeout(() => openRole(b.dataset.role), 260);
    }),
  );
}
