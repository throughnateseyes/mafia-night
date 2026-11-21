/*
 * The big shared screen: the table device after the narrator takes over, or a TV.
 * Lobby: the join code and who's here. In game: the scene, the roster, the timer.
 */
import { PLAYER_LIMITS, ROLES } from '../config/game.js';
import { artHTML, avatarHTML, icon } from '../art/index.js';
import { links, watch } from '../game/session.js';
import { roleCounts } from '../game/roles.js';
import { $, countdown, esc, h, keepAwake, statusBadge } from '../ui/kit.js';
import { qrSvg } from '../ui/qr.js';
import { renderStage, sceneTile } from '../ui/stage.js';

export function rosterHTML(players, { showRoles = false } = {}) {
  return players
    .map(
      (p, i) => `<li class="chip ${p.alive ? '' : 'dead'} ${p.honoree ? 'honoree' : ''}" style="--i:${i}" data-id="${esc(p.id)}">
        <span class="chip-av">${avatarHTML(p.avatar)}</span>
        <span class="chip-name">${esc(p.name)}</span>
        ${p.honoree ? `<span class="chip-crown" title="Birthday!">${icon('crown', { size: 20 })}</span>` : ''}
        ${(showRoles || !p.alive) && p.role ? `<span class="chip-role" data-role="${p.role}">${ROLES[p.role].name}</span>` : ''}
      </li>`,
    )
    .join('');
}

export function mixLine(n) {
  if (n < PLAYER_LIMITS.min) return `Need at least ${PLAYER_LIMITS.min} to start · ${PLAYER_LIMITS.min - n} more`;
  const c = roleCounts(Math.min(n, PLAYER_LIMITS.max));
  return `${c.mafia} Mafia · 1 Doctor · 1 Detective · ${c.villager} Villagers`;
}

/** Lobby panel with the join QR. Shared by the table and the TV. */
export function lobbyHTML(room, state) {
  const n = state?.players?.length ?? 0;
  return `
    <section class="join-card">
      <div class="qr-frame">${qrSvg(links(room).join, { label: 'Scan to join the game' })}</div>
      <div class="join-copy">
        <h1>Scan to join</h1>
        <p class="say soft">Everyone points their camera here. One code for the whole table.</p>
      </div>
    </section>
    <section class="roster-card">
      <h3>At the table <span class="count">${n}</span></h3>
      <ul class="chips">${rosterHTML(state?.players ?? [])}</ul>
      ${n === 0 ? `<p class="empty say soft">No one yet. Be the first.</p>` : ''}
      <p class="mix small">${mixLine(n)}</p>
    </section>`;
}

export function renderDisplayInto(main, room, st) {
  if (!st) return;
  const lobby = st.phase === 'lobby';
  document.body.classList.toggle('dark', !lobby && ['night', 'dusk'].includes(sceneTile(st.scene)));
  if (lobby) {
    main.dataset.mode = 'lobby';
    main.innerHTML = lobbyHTML(room, st);
    return;
  }
  if (main.dataset.mode !== 'game') {
    main.dataset.mode = 'game';
    main.innerHTML = `<div class="stage"></div><aside class="strip"><div class="timer" hidden><span class="timer-num"></span></div><ul class="chips"></ul></aside>`;
  }
  renderStage($('.stage', main), st.scene);
  $('.strip .chips', main).innerHTML = rosterHTML(st.players, { showRoles: st.phase === 'end' });
  countdown($('.timer', main), st.timer);
}

export function renderTV(root, arg) {
  const [roomId, rk, broker] = (arg ?? '').split('.');
  if (!roomId || !rk) {
    root.innerHTML = `<main class="view center"><h2>That link looks broken.</h2></main>`;
    return;
  }
  const room = { roomId, rk, broker: Number(broker) || 0 };
  root.innerHTML = `<main class="view display" data-mode=""><div class="waiting">${artHTML('lobby')}<p class="say">Finding the game…</p></div></main>`;
  const main = $('main', root);
  const w = watch(room, { onState: (st) => renderDisplayInto(main, room, st) });
  root.prepend(h('<div class="corner"></div>'));
  $('.corner', root).append(statusBadge(w.relay));
  keepAwake();
  return () => w.relay.close();
}
