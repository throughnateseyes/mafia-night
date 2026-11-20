import { ROLES, TEAMS } from '../config/game.js';
import { icons, roleArt } from './art.js';

/*
 * The role's full rules, as an index card that slides up from the bottom.
 * Reused everywhere a role appears: setup, the reveal screen, the host view.
 */

let dialog;

function ensureDialog() {
  if (dialog) return dialog;
  dialog = document.createElement('dialog');
  dialog.className = 'rules-sheet';
  dialog.addEventListener('click', (e) => {
    // tap on the dimmed backdrop closes it
    if (e.target === dialog) close();
  });
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  document.body.append(dialog);
  return dialog;
}

function close() {
  dialog.classList.add('closing');
  dialog.addEventListener(
    'animationend',
    () => {
      dialog.classList.remove('closing');
      dialog.close();
    },
    { once: true },
  );
}

export function openRules(roleId) {
  const role = ROLES[roleId];
  const team = TEAMS[role.team];
  const d = ensureDialog();
  d.dataset.team = role.team;
  d.dataset.role = roleId;
  d.setAttribute('aria-labelledby', 'rules-title');
  d.innerHTML = `
    <article class="rules-card paper">
      <button class="rules-close" type="button" aria-label="Close rules">${icons.close}</button>
      <span class="team-stamp">${team.short}</span>
      <div class="rules-head">
        ${roleArt(roleId, { size: 112, color: `var(--color-${role.color}-ink)` })}
        <p class="rules-eyebrow">Role card</p>
        <h2 id="rules-title" class="rules-name">${role.name}</h2>
        <p class="rules-tagline">${role.tagline}</p>
      </div>
      <dl class="rules-list">
        <div><dt>At night</dt><dd>${role.night}</dd></div>
        <div><dt>By day</dt><dd>${role.day}</dd></div>
        <div><dt>You win when</dt><dd>${team.win}</dd></div>
      </dl>
      <p class="rules-tip"><span>Narrator's tip:</span> ${role.tip}</p>
      <button class="btn rules-done" type="button">Got it</button>
    </article>`;
  d.querySelector('.rules-close').addEventListener('click', close);
  d.querySelector('.rules-done').addEventListener('click', close);
  d.showModal();
  d.querySelector('.rules-done').focus({ preventScroll: true });
}
