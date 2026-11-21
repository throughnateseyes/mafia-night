/*
 * The big shared screen: the table device after the narrator takes over, or a TV.
 * Lobby: the join code taped to the desk, and the cabin filling up as people scan in.
 * In game: the stage, with the list of suspects down the side and the stopwatch.
 */
import { PLAYER_LIMITS, ROLES } from '../config/game.js';
import { links, watch } from '../game/session.js';
import { roleCounts } from '../game/roles.js';
import { $, countdown, esc, keepAwake, statusBadge } from '../ui/kit.js';
import { face, kraft, tapeStrip } from '../ui/props.js';
import { qrSvg } from '../ui/qr.js';
import { renderStage, sceneIsDark } from '../ui/stage.js';
import { eventLine } from './home.js';

/**
 * The suspect list: one `.chip` per player with their face, typed name, a cake for the birthday
 * person, and their role (`.chip-role`) once the public state reveals it. Dead suspects are crossed out.
 * opts.showRoles: show every role the state carries. opts.faces: false for a names-only list.
 */
export function rosterHTML(players, { showRoles = false, faces = true } = {}) {
  return players
    .map((p, i) => {
      const out = p.alive === false;
      const role = (showRoles || out) && p.role ? ROLES[p.role] : null;
      return `<li class="chip ${out ? 'dead' : ''} ${p.honoree ? 'honoree' : ''}" style="--i:${i}" data-id="${esc(p.id)}">
        ${faces ? `<span class="chip-face">${face(p.avatar, { out })}</span>` : ''}
        <span class="chip-name">${esc(p.name)}</span>
        ${p.honoree ? '<span class="chip-cake" title="Birthday">🎂</span>' : ''}
        ${role ? `<span class="chip-role torn" data-role="${p.role}" data-team="${role.team}">${role.name}</span>` : ''}
      </li>`;
    })
    .join('');
}

export function mixLine(n) {
  if (n < PLAYER_LIMITS.min) return `Need at least ${PLAYER_LIMITS.min} to start · ${PLAYER_LIMITS.min - n} more`;
  const c = roleCounts(Math.min(n, PLAYER_LIMITS.max));
  return `${c.mafia} Mafia · 1 ${ROLES.doctor.name} · 1 ${ROLES.detective.name} · ${c.villager} ${ROLES.villager.name}s`;
}

/** A QR code on a white card. The code itself is flat: no tilt beyond the card's, no filter, nothing over it. */
export const qrCard = (link, label, { cls = '' } = {}) => `<div class="qr-frame ${cls}">${qrSvg(link, { label })}</div>`;

/**
 * Lobby: the join code taped to the desk on the left, the cabin on the right.
 * Shared by the table and the TV. `below` is trusted HTML set under the join card (the narrator hand-off).
 * The `.stage` is empty until renderLobbyInto() fills it.
 */
export function lobbyHTML(room, state, { below = '' } = {}) {
  const players = state?.players ?? [];
  return `
    <div class="big-lobby">
      <div class="cq big-join">
        <section class="join-card drop" style="--r0:-7deg">
          ${tapeStrip('top:calc(var(--u) * -3.4);left:50%;margin-left:calc(var(--u) * -11);transform:rotate(3deg)')}
          ${qrCard(links(room).join, 'Scan to join the game')}
          <p class="join-title typed">Scan to get booked</p>
          <p class="join-note hand">your phone does the rest</p>
        </section>
        ${below}
      </div>
      <div class="cq big-cabin">
        ${kraft(eventLine(), { cls: 'big-label' })}
        <div class="stage"></div>
        <section class="roster-card">
          <p class="mix typed">${mixLine(players.length)}</p>
          <ul class="chips">${rosterHTML(players, { faces: false })}</ul>
        </section>
      </div>
    </div>`;
}

/** Draw or update the lobby in `main`. The QR stays put; only new suspects walk in. */
export function renderLobbyInto(main, room, st, opts = {}) {
  const players = st?.players ?? [];
  if (main.dataset.mode !== 'lobby') {
    main.dataset.mode = 'lobby';
    main.innerHTML = lobbyHTML(room, st, opts);
    main._seen = new Set(players.map((p) => p.id));
  } else {
    const list = $('.roster-card .chips', main);
    list.innerHTML = rosterHTML(players, { faces: false });
    list.querySelectorAll('.chip').forEach((li) => {
      if (main._seen.has(li.dataset.id)) return;
      li.classList.add('new');
      main._seen.add(li.dataset.id);
    });
    $('.roster-card .mix', main).textContent = mixLine(players.length);
  }
  renderStage($('.stage', main), st?.scene ?? { key: 'lobby', at: 0 }, { players, round: st?.round });
}

const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen'];
const headLine = (players) => {
  const n = players.length;
  const alive = players.filter((p) => p.alive !== false).length;
  return alive === n ? `${NUM[n] ?? n} suspects` : `${NUM[alive] ?? alive} of ${(NUM[n] ?? String(n)).toLowerCase()} still breathing`;
};

export function renderDisplayInto(main, room, st) {
  if (!st) return;
  const lobby = st.phase === 'lobby';
  document.body.classList.toggle('dark', !lobby && sceneIsDark(st.scene));
  if (lobby) {
    renderLobbyInto(main, room, st);
    return;
  }
  if (main.dataset.mode !== 'game') {
    main.dataset.mode = 'game';
    main.innerHTML = `
      <div class="big-game">
        <div class="cq big-stage"><div class="stage"></div></div>
        <aside class="cq big-strip">
          <div class="timer big" hidden><span class="timer-num"></span></div>
          <p class="big-strip-head kicker"></p>
          <ul class="chips"></ul>
        </aside>
      </div>`;
  }
  renderStage($('.stage', main), st.scene, { players: st.players, round: st.round });
  // only touch the list when someone in it changed, so faces don't reload on every tick
  const showRoles = st.phase === 'end';
  const sig = `${showRoles}|${st.players.map((p) => `${p.id}:${p.name}:${p.avatar}:${p.alive}:${p.honoree}:${p.role ?? ''}`).join(',')}`;
  const list = $('.big-strip .chips', main);
  if (list.dataset.sig !== sig) {
    list.dataset.sig = sig;
    list.dataset.n = st.players.length > 10 ? 'many' : st.players.length > 7 ? 'some' : 'few';
    list.innerHTML = rosterHTML(st.players, { showRoles });
    $('.big-strip-head', main).textContent = headLine(st.players);
  }
  countdown($('.timer', main), st.timer);
}

export function renderTV(root, arg) {
  const [roomId, rk, broker] = (arg ?? '').split('.');
  if (!roomId || !rk) {
    root.innerHTML = `<main class="frame"><div class="view lost-case">${kraft(eventLine())}<h2 class="title">That link looks broken.</h2><p class="lede">Open the TV code from the table screen again.</p><a class="btn paper" href="#/">Start over</a></div></main>`;
    return;
  }
  const room = { roomId, rk, broker: Number(broker) || 0 };
  root.innerHTML = `<div class="corner"></div><main class="frame wide display" data-mode=""><div class="big-waiting">${kraft(eventLine())}<p class="title">Finding the case</p><p class="note gold">one moment</p></div></main>`;
  const main = $('main', root);
  const w = watch(room, { onState: (st) => renderDisplayInto(main, room, st) });
  $('.corner', root).append(statusBadge(w.relay));
  keepAwake();
  return () => w.relay.close();
}
