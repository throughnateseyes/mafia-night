/*
 * A player's phone. Join → wait at the table → peek at your role → watch the story.
 */
import { EVENT, ROLES, TEAMS } from '../config/game.js';
import { AVATARS, artHTML, avatarHTML, icon, mountArt } from '../art/index.js';
import { Player, parseRoomArg } from '../game/session.js';
import { $, $$, buzz, countdown, esc, h, holdToPeek, keepAwake, sheet, statusBadge } from '../ui/kit.js';
import { openHowToPlay, openRole } from '../ui/rules.js';
import { renderStage, sceneTile } from '../ui/stage.js';
import { rosterHTML } from './display.js';
import { eventLine } from './home.js';

const ackKey = (roomId) => `mn:ack:${roomId}`;
const getAck = (roomId) => Number(localStorage.getItem(ackKey(roomId)) || 0);
const setAck = (roomId, deal) => {
  try {
    localStorage.setItem(ackKey(roomId), String(deal));
  } catch {
    /* ignore */
  }
};

export function renderPlayer(root, arg) {
  const room = parseRoomArg(arg, 'j');
  if (!room) {
    root.innerHTML = `<main class="view center"><h2>That code looks smudged.</h2><p class="soft">Ask the host to show the join code again.</p></main>`;
    return;
  }
  keepAwake();
  root.innerHTML = `<div class="corner"></div><main class="view player"></main>`;
  const main = $('main', root);
  let mode = '';
  let state = null;
  let role = null;
  const seen = new Set();

  const player = new Player(room, {
    onState: (st) => {
      state = st;
      update();
    },
    onRole: (r) => {
      const changed = r?.deal !== role?.deal;
      role = r;
      if (changed) buzz([20, 40, 20]);
      update();
    },
  });
  $('.corner', root).append(statusBadge(player.relay));

  const me = () => state?.players?.find((p) => p.id === player.me?.id);

  function pickMode() {
    if (!player.joined) return 'join';
    if (!state || !me()) return state && state.phase !== 'lobby' && !me() ? 'locked' : 'knocking';
    if (state.phase === 'lobby') return 'lobby';
    if (!role) return 'knocking';
    if (getAck(room.roomId) < role.deal) return 'reveal';
    return 'play';
  }

  function update() {
    const next = pickMode();
    if (next !== mode) {
      mode = next;
      main.className = `view player mode-${mode}`;
      ({ join: renderJoin, knocking: renderKnocking, locked: renderLocked, lobby: renderLobby, reveal: renderReveal, play: renderPlay })[mode]();
    } else {
      ({ lobby: updateLobby, play: updatePlay })[mode]?.();
    }
    const dark = mode === 'play' && ['night', 'dusk'].includes(sceneTile(state.scene));
    document.body.classList.toggle('dark', dark);
  }

  /* ---------- join ---------- */

  function renderJoin() {
    const pick = Math.floor(Math.random() * Math.max(1, AVATARS.length));
    main.innerHTML = `
      <header class="welcome">
        <p class="kicker">${eventLine()}</p>
        <h1>Welcome to <em>the cabin</em>.</h1>
        <p class="soft">Tonight, someone here is a killer. First things first: who are you?</p>
      </header>
      <form class="join-form" autocomplete="off">
        <label class="field">
          <span class="field-label">Your name</span>
          <input id="name" name="name" maxlength="16" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="First name" required />
        </label>
        <fieldset class="avatars">
          <legend class="field-label">Pick your camp badge</legend>
          <div class="av-grid">
            ${(AVATARS.length ? AVATARS : Array.from({ length: 12 })).map((a, i) => `
              <label class="av" style="--i:${i}">
                <input type="radio" name="avatar" value="${i}" ${i === pick ? 'checked' : ''} />
                <span class="av-art">${avatarHTML(i, { animate: true })}</span>
                <span class="sr-only">${esc(a?.title ?? `Badge ${i + 1}`)}</span>
              </label>`).join('')}
          </div>
        </fieldset>
        <div class="join-go"><button class="btn btn-big" type="submit" disabled><span>Join the game</span>${icon('arrow-right')}</button></div>
      </form>`;
    const name = $('#name', main);
    const submit = $('button[type=submit]', main);
    name.addEventListener('input', () => {
      submit.disabled = !name.value.trim();
    });
    $$('.av input', main).forEach((r) => r.addEventListener('change', () => buzz(6)));
    $('.join-form', main).addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!name.value.trim()) return;
      submit.disabled = true;
      buzz(15);
      const avatar = Number(new FormData(e.currentTarget).get('avatar') ?? 0);
      await player.join(name.value, avatar);
      update();
    });
  }

  function renderKnocking() {
    main.innerHTML = `<div class="center">
      <div class="knock-art">${artHTML('lobby', { className: 'calm' })}</div>
      <h2>${player.joined ? 'Knocking on the cabin door…' : 'Finding the game…'}</h2>
      <p class="soft">Hang tight. This takes a second.</p></div>`;
  }

  function renderLocked() {
    main.innerHTML = `<div class="center">
      <div class="knock-art">${artHTML('role-ghost')}</div>
      <h2>The game already started</h2>
      <p class="soft">You can jump in next round. Ask the narrator to go back to the lobby.</p></div>`;
  }

  /* ---------- lobby ---------- */

  function renderLobby() {
    main.innerHTML = `
      <div class="stage"></div>
      <section class="lobby-panel">
        <h3 class="section-head">Around the fire <span class="count"></span></h3>
        <ul class="chips"></ul>
        <button class="btn wide" id="how" type="button">${icon('rules')}<span>How to play</span></button>
      </section>`;
    $('#how', main).addEventListener('click', openHowToPlay);
    const name = player.me.name;
    renderStage($('.stage', main), { key: 'lobby', at: 1, caption: `You’re in, ${name}`, sub: 'Waiting for the narrator to hand out roles.' });
    updateLobby();
  }

  function updateLobby() {
    const list = $('.chips', main);
    list.innerHTML = rosterHTML(state.players);
    list.querySelectorAll('.chip').forEach((li) => {
      if (li.dataset.id === player.me.id) li.classList.add('me');
      if (!seen.has(li.dataset.id)) {
        li.classList.add('new');
        seen.add(li.dataset.id);
      }
    });
    $('.count', main).textContent = state.players.length;
  }

  /* ---------- reveal ---------- */

  function roleFront() {
    const r = ROLES[role.role];
    return `
      <div class="front-art">${artHTML(r.art, { label: r.name })}</div>
      <p class="front-kicker">You are ${r.team === 'mafia' ? '' : 'a '}</p>
      <h2 class="front-name">${r.team === 'mafia' ? 'the Mafia' : esc(r.name)}</h2>
      <p class="front-line">${esc(r.line)}</p>
      ${role.crew.length ? `<p class="front-crew">Your crew: <strong>${role.crew.map(esc).join(', ')}</strong></p>` : ''}`;
  }

  function renderReveal() {
    const honoree = me()?.honoree;
    main.innerHTML = `
      <p class="kicker">Top secret · ${esc(player.me.name)} only</p>
      <h1 class="reveal-title">${honoree ? `Happy 26th, ${esc(player.me.name)}. <em>Here’s your role.</em>` : 'Your role <em>is in</em>.'}</h1>
      <button class="peek-card" type="button" aria-label="Hold to see your role">
        <span class="card-inner">
          <span class="card-back">
            <span class="card-back-mark serif">?</span>
            <span class="card-back-label">${icon('eye')}<span>Hold to reveal</span></span>
          </span>
          <span class="card-front" data-role="${role.role}"></span>
        </span>
      </button>
      <p class="soft reveal-hint">Let go and it hides. Tilt your screen away from your neighbors.</p>
      <button class="btn btn-big" id="gotit" type="button" hidden><span>Got it, lips sealed</span>${icon('check')}</button>`;
    const card = $('.peek-card', main);
    const front = $('.card-front', main);
    const gotit = $('#gotit', main);
    holdToPeek(card, {
      onShow: () => {
        front.innerHTML = roleFront();
        card.classList.add('flipped');
      },
      onHide: () => {
        card.classList.remove('flipped');
        // once it has turned back over, take the role out of the page entirely
        setTimeout(() => !card.classList.contains('flipped') && (front.innerHTML = ''), 600);
        gotit.hidden = false;
        gotit.classList.add('appear');
      },
    });
    gotit.addEventListener('click', () => {
      setAck(room.roomId, role.deal);
      buzz(10);
      update();
    });
  }

  /* ---------- play ---------- */

  function renderPlay() {
    main.innerHTML = `
      <div class="stage"></div>
      <div class="timer" hidden><span class="timer-num"></span></div>
      <div class="peek-pop" aria-hidden="true"></div>
      <nav class="dock">
        <div class="dock-status"></div>
        <button class="peek-pill" type="button">${icon('eye')}<span>Hold to see your role</span></button>
        <button class="btn-round" id="rules" type="button" aria-label="Rules for my role">${icon('rules')}</button>
      </nav>`;
    const pop = $('.peek-pop', main);
    holdToPeek($('.peek-pill', main), {
      onShow: () => {
        const r = ROLES[role.role];
        pop.innerHTML = `<div class="pop-card" data-role="${role.role}"><div class="pop-art">${artHTML(r.art, { speed: 0.6 })}</div><h2 class="pop-name">${esc(r.name)}</h2>${role.crew.length ? `<p class="front-crew">Crew: ${role.crew.map(esc).join(', ')}</p>` : ''}</div>`;
        pop.classList.add('show');
      },
      onHide: () => pop.classList.remove('show'),
    });
    $('#rules', main).addEventListener('click', () => openRole(role.role, { crew: role.crew }));
    updatePlay();
  }

  let endShown = 0;
  function updatePlay() {
    renderStage($('.stage', main), state.scene);
    countdown($('.timer', main), state.timer);
    const m = me();
    const status = $('.dock-status', main);
    if (state.phase === 'end') {
      const won = state.winner && ROLES[role.role].team === state.winner;
      status.innerHTML = `<button class="dock-banner ${won ? 'won' : 'lost'}" type="button" id="whowas">${icon(won ? 'crown' : 'skull')}<span>${won ? 'You won.' : 'You lost.'} See who was who</span>${icon('arrow-right')}</button>`;
      $('#whowas', main).addEventListener('click', openWhoWasWho);
      if (endShown !== state.scene.at) {
        endShown = state.scene.at;
        setTimeout(openWhoWasWho, 4200);
      }
    } else if (m && !m.alive) {
      status.innerHTML = `<div class="dock-banner ghost"><span class="ghost-art">${artHTML('role-ghost', { animate: false })}</span><span>You’re out. Ghosts don’t talk, but you can watch.</span></div>`;
    } else {
      status.innerHTML = '';
    }
  }

  function openWhoWasWho() {
    if (document.querySelector('.who-sheet')) return;
    const team = (p) => ROLES[p.role]?.team;
    sheet(
      `<div class="who">
        <p class="kicker">${state.winner ? TEAMS[state.winner].name + ' won' : 'The end'}</p>
        <h2>Who was who</h2>
        <ul class="who-list">${state.players
          .map((p, i) => `<li style="--i:${i}" data-team="${team(p)}"><span class="chip-av">${avatarHTML(p.avatar)}</span><span class="who-name">${esc(p.name)}${p.alive ? '' : ' <span class="soft small">(out)</span>'}</span><span class="chip-role" data-role="${p.role}">${ROLES[p.role]?.name ?? ''}</span></li>`)
          .join('')}</ul>
        <p class="soft">Stick around: the narrator can start a new round with new roles.</p>
      </div>`,
      { className: 'who-sheet' },
    );
  }

  update();
  return () => player.relay.close();
}
