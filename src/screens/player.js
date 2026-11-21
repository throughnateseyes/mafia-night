/*
 * A suspect's phone. Get booked → wait in the cabin → open your file → watch the case unfold.
 * Styles: src/styles/player.css. Everything on screen is a prop from src/ui/props.js.
 */
import { EVENT, ROLES, TEAMS } from '../config/game.js';
import { Player, parseRoomArg } from '../game/session.js';
import { $, $$, buzz, countdown, esc, holdToPeek, keepAwake, sheet, statusBadge } from '../ui/kit.js';
import { circled, clip, face, folder, kraft, mug, photoSrc, polaroid, redact, stamp, SUSPECTS, SUSPECT_NAMES, tilt } from '../ui/props.js';
import { openHowToPlay, openRole } from '../ui/rules.js';
import { renderStage, sceneIsDark } from '../ui/stage.js';

const ackKey = (roomId) => `mn:ack:${roomId}`;
const getAck = (roomId) => Number(localStorage.getItem(ackKey(roomId)) || 0);
const setAck = (roomId, deal) => {
  try {
    localStorage.setItem(ackKey(roomId), String(deal));
  } catch {
    /* ignore */
  }
};

/* a thumbprint, pressed in red ink: wobbly broken rings inside a thumb-shaped clip */
const THUMBPRINT = (() => {
  let rings = '';
  for (let k = 1; k <= 9; k++) rings += `<ellipse cx="50" cy="${(52 - k * 0.6).toFixed(1)}" rx="${(k * 4.2).toFixed(1)}" ry="${(k * 5.4).toFixed(1)}" stroke-dasharray="${14 + k * 5} ${2 + (k % 3)}" transform="rotate(${k * 9} 50 50)"/>`;
  return `<svg class="thumbprint" viewBox="0 0 100 110" aria-hidden="true"><defs><clipPath id="thumb-clip"><ellipse cx="50" cy="55" rx="36" ry="48"/></clipPath></defs><g clip-path="url(#thumb-clip)" fill="none" stroke="currentColor" stroke-width="1.5">${rings}</g></svg>`;
})();

/* the words that are blacked out in each role's file until it has been open for a moment */
const CLASSIFIED = {
  mafia: ['hiding', 'your crew', 'take out'],
  doctor: ['first-aid kit', 'save'],
  detective: ['these woods', 'flashlight'],
  villager: ['s’mores', 'vote'],
};
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A typed line with two or three words under redaction bars. Escapes the text. */
function censored(line, phrases = []) {
  let hide = phrases.filter((p) => line.includes(p));
  // the copy changed and the listed words are gone: black out the two longest words instead
  if (hide.length < 2) hide = [...new Set(line.match(/[\p{L}’'-]{5,}/gu) ?? [])].sort((a, b) => b.length - a.length).slice(0, 2);
  if (!hide.length) return esc(line);
  const re = new RegExp(`(${hide.sort((a, b) => b.length - a.length).map(reEsc).join('|')})`, 'gu');
  return line
    .split(re)
    .map((part, i) => (i % 2 ? `<span class="censor" style="--i:${(i - 1) / 2}">${esc(part)}${redact(0)}</span>` : esc(part)))
    .join('');
}

const frame = (mode, inner = '') => `<main class="frame"><div class="view player mode-${mode}">${inner}</div></main>`;
const caseLabel = () => kraft(`Case no. ${EVENT.caseNo}`, { rot: -2 });

export function renderPlayer(root, arg) {
  const room = parseRoomArg(arg, 'j');
  if (!room) {
    root.innerHTML = frame('locked', `${caseLabel()}<h2 class="title">That code looks smudged.</h2><p class="lede">Ask whoever is hosting to show the join code again.</p>`);
    return;
  }
  keepAwake();
  root.innerHTML = `<div class="corner"></div>${frame('')}`;
  const main = $('.view', root);
  let mode = '';
  let state = null;
  let role = null;
  let whoSheet = null;

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
  const myName = () => esc(player.me?.name ?? '');

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
      // a new file was dealt (or we left the game): yesterday's answers come off the desk
      whoSheet?.close();
      whoSheet = null;
      ({ join: renderJoin, knocking: renderKnocking, locked: renderLocked, lobby: renderLobby, reveal: renderReveal, play: renderPlay })[mode]();
    } else {
      ({ lobby: updateLobby, play: updatePlay })[mode]?.();
    }
    // the stage switches the lights for the scenes it draws; every other screen is paperwork by day
    const onStage = mode === 'lobby' || mode === 'play';
    if (!onStage) document.body.classList.remove('lights-out');
    document.body.classList.toggle('dark', mode === 'play' && sceneIsDark(state.scene));
  }

  /* ---------- join: suspect intake, form 26-B ---------- */

  function renderJoin() {
    const pick = Math.floor(Math.random() * SUSPECTS.length);
    main.innerHTML = `
      <form class="join-form" autocomplete="off">
        <div class="paper sheetpaper intake drop" style="--r0:2deg">
          <p class="kicker">${esc(EVENT.town)} sheriff’s office · form ${EVENT.caseNo}-B</p>
          <h1 class="title">Suspect intake</h1>
          <label class="field">
            <span class="field-label">Name of suspect</span>
            <input id="name" name="name" maxlength="16" autocomplete="given-name" autocapitalize="words" enterkeyhint="done" placeholder="First name" required />
          </label>
          <fieldset class="av-set">
            <legend class="field-label">Pick your mugshot</legend>
            <div class="av-grid">
              ${SUSPECTS.map((id, i) => `
                <label class="av">
                  <input type="radio" name="avatar" value="${i}" ${i === pick ? 'checked' : ''} />
                  ${mug(i, { name: null, rot: tilt(i, 0.5) })}
                  <span class="sr-only">${esc(SUSPECT_NAMES[id] ?? `Suspect ${i + 1}`)}</span>
                </label>`).join('')}
            </div>
          </fieldset>
          <div class="oath">
            <div class="thumb-box">${THUMBPRINT}</div>
            <div class="oath-text">
              <p class="field-label">Right thumb</p>
              <p class="oath-line">I swear I had nothing to do with it.</p>
              <p class="note pen oath-sign" aria-hidden="true"><span>x</span><span class="oath-name"></span></p>
            </div>
          </div>
        </div>
        <div class="join-go"><button class="btn red" type="submit" disabled>Book me in</button></div>
      </form>`;
    const form = $('.join-form', main);
    const name = $('#name', main);
    const submit = $('button[type=submit]', main);
    const sign = $('.oath-name', main);
    name.addEventListener('input', () => {
      const typed = name.value.trim();
      submit.disabled = !typed;
      sign.textContent = typed; // they sign for it as they type
      form.classList.toggle('signed', Boolean(typed));
    });
    // the red pen circles whichever mugshot is picked
    const circle = () =>
      $$('.av', main).forEach((label) => {
        const on = $('input', label).checked;
        const ring = $('.circled', label);
        if (on && !ring) label.insertAdjacentHTML('beforeend', circled());
        if (!on) ring?.remove();
      });
    circle();
    $$('.av input', main).forEach((r) =>
      r.addEventListener('change', () => {
        buzz(6);
        circle();
      }),
    );
    form.addEventListener('submit', async (e) => {
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
    main.innerHTML = `${caseLabel()}
      <h2 class="title">${player.joined ? 'Knocking on the cabin door…' : 'Finding the case…'}</h2>`;
  }

  function renderLocked() {
    main.innerHTML = `${caseLabel()}
      <h2 class="title">The case is already open. You can get booked next round.</h2>`;
  }

  /* ---------- lobby: the cabin, filling up ---------- */

  function renderLobby() {
    main.innerHTML = `
      <p class="note gold lobby-hello slide">you’re in, ${myName()}</p>
      <div class="stage"></div>
      <button class="link lobby-how" id="how" type="button">how does this work?</button>`;
    $('#how', main).addEventListener('click', openHowToPlay);
    updateLobby();
  }

  function updateLobby() {
    renderStage($('.stage', main), state.scene, { players: state.players, round: state.round });
  }

  /* ---------- reveal: your file, for your eyes only ---------- */

  const crewLine = () => (role.crew.length ? `<p class="file-crew">Your crew: <strong>${role.crew.map(esc).join(', ')}</strong></p>` : '');

  /** What is inside the folder. Only ever in the page while the folder is held open. */
  function fileInside() {
    const r = ROLES[role.role];
    return `
      <span class="file-top">
        ${polaroid(r.photo, { cap: 'exhibit A', rot: -3, extra: clip('top:calc(var(--u) * -5);left:calc(var(--u) * 5);transform:rotate(-6deg)') })}
        <span class="file-line">${censored(r.line, CLASSIFIED[role.role])}</span>
      </span>
      <span class="file-stamp">${stamp(r.name, { thud: true, ink: r.team !== 'mafia', at: '0.42s' })}</span>
      ${crewLine()}
      <span class="note red file-note">tell no one.</span>`;
  }

  function renderReveal() {
    const honoree = me()?.honoree;
    // have all four photos ready so the file opens with its picture in place (and says nothing about which)
    Object.values(ROLES).forEach((r) => (new Image().src = photoSrc(r.photo)));
    main.innerHTML = `
      <p class="kicker">For ${myName()}’s eyes only</p>
      <h1 class="title reveal-title">${honoree ? `Happy ${EVENT.age}th. This one’s yours.` : 'This file is yours.'}</h1>
      <div class="reveal-desk">
        <div class="peek-card drop" role="button" tabindex="0" aria-label="Hold to open your file" style="--r0:3deg">
          ${folder(
            `<span class="card-front" data-role="${role.role}"></span>
             <span class="file-cover">
               <span class="file-cover-back"></span>
               <span class="file-cover-front">
                 <span class="cover-head">${esc(EVENT.town)} sheriff’s office<br>Case no. ${EVENT.caseNo} · suspect file</span>
                 <span class="cover-stamp">${stamp('Hold to open', { sm: true, rot: -6 })}</span>
                 <span class="cover-foot">Not to be opened in front of other suspects.</span>
               </span>
             </span>`,
            { tab: `${player.me.name} · confidential`, rot: -1.2 },
          )}
        </div>
      </div>
      <p class="note gold reveal-hint">let go and it closes</p>
      <div class="reveal-go"><button class="btn red" id="gotit" type="button" hidden>Got it. Lips sealed.</button></div>`;
    const card = $('.peek-card', main);
    const front = $('.card-front', main);
    const gotit = $('#gotit', main);
    holdToPeek(card, {
      onShow: () => {
        front.innerHTML = fileInside();
        card.classList.add('open');
      },
      onHide: () => {
        card.classList.remove('open');
        // once the cover is back down, take the role out of the page entirely
        setTimeout(() => !card.classList.contains('open') && (front.innerHTML = ''), 600);
        if (gotit.hidden) {
          gotit.hidden = false;
          gotit.classList.add('slide');
        }
      },
    });
    gotit.addEventListener('click', () => {
      setAck(room.roomId, role.deal);
      buzz(10);
      update();
    });
  }

  /* ---------- play: whatever the detective has put on the desk ---------- */

  function renderPlay() {
    main.innerHTML = `
      <div class="timer" hidden><span class="timer-num"></span></div>
      <div class="stage"></div>
      <nav class="dock">
        <div class="dock-status"></div>
        <div class="peek-pop" aria-hidden="true"></div>
        <div class="dock-row">
          <button class="peek-hold" type="button">${kraft('hold to check your file', { rot: -1.5 })}</button>
          <button class="link dock-rules" id="rules" type="button" aria-label="The rules for my role">the rules</button>
        </div>
      </nav>`;
    const pop = $('.peek-pop', main);
    holdToPeek($('.peek-hold', main), {
      onShow: () => {
        const r = ROLES[role.role];
        pop.innerHTML = folder(`<span class="pop-stamp">${stamp(r.name, { thud: true, ink: r.team !== 'mafia', rot: -5, at: '0.12s' })}</span>${crewLine()}`, { tab: `${player.me.name} · confidential`, rot: 0 });
        pop.dataset.role = role.role;
        pop.classList.add('show');
      },
      onHide: () => {
        pop.classList.remove('show');
        // and the file goes back in the drawer
        setTimeout(() => {
          if (pop.classList.contains('show')) return;
          pop.innerHTML = '';
          delete pop.dataset.role;
        }, 400);
      },
    });
    $('#rules', main).addEventListener('click', () => openRole(role.role, { crew: role.crew }));
    updatePlay();
  }

  let endShown = 0;
  function updatePlay() {
    main.style.setProperty('--n', state.players.length); // the closed-case folder is sized by its list
    renderStage($('.stage', main), state.scene, { players: state.players, round: state.round });
    countdown($('.timer', main), state.timer);
    const m = me();
    const status = $('.dock-status', main);
    const won = state.phase === 'end' && state.winner && ROLES[role.role].team === state.winner;
    const show = state.phase === 'end' ? (won ? 'won' : 'lost') : m && !m.alive ? 'ghost' : '';
    // only set a slip down when it changes, so it isn't dropped again on every heartbeat
    if (status.dataset.show !== show) {
      status.dataset.show = show;
      if (state.phase === 'end') {
        status.innerHTML = `<button class="btn paper dock-banner ${show} slide" type="button" id="whowas"><span class="whowas-result">${won ? 'You won.' : 'You lost.'}</span><span>See who was who</span></button>`;
        $('#whowas', main).addEventListener('click', openWhoWasWho);
      } else if (show === 'ghost') {
        status.innerHTML = `<p class="dock-banner ghost torn slide" style="--bg:var(--paper)"><strong>Cold case.</strong> You’re out — no talking, no hints, but you can watch.</p>`;
      } else {
        status.innerHTML = '';
      }
    }
    if (state.phase === 'end' && endShown !== state.scene.at) {
      endShown = state.scene.at;
      setTimeout(() => mode === 'play' && state.phase === 'end' && openWhoWasWho(), 4200);
    }
  }

  function openWhoWasWho() {
    if (document.querySelector('.who-sheet')) return;
    const mafia = (p) => ROLES[p.role]?.team === 'mafia';
    whoSheet = sheet(
      `<article class="who on-paper">
        <p class="kicker">${state.winner ? `${esc(TEAMS[state.winner].name)} won` : 'The end'} · case no. ${EVENT.caseNo}</p>
        <h2 class="title">Who was who</h2>
        <ul class="who-list">${state.players
          .map(
            (p, i) =>
              `<li class="leader who-row ${mafia(p) ? 'red' : ''}"><span class="who-who">${face(p.avatar, { out: !p.alive, rot: tilt(i) })}<span class="who-name">${esc(p.name)}${p.alive ? '' : ' <span class="who-out">(out)</span>'}${p.id === player.me?.id ? ' <span class="note pen who-you">you</span>' : ''}</span></span><span class="chip-role" data-role="${esc(p.role ?? '')}">${esc(ROLES[p.role]?.name ?? '')}</span></li>`,
          )
          .join('')}</ul>
        <p class="note red who-foot">stay put. ${esc(EVENT.narrator)} can deal new files.</p>
      </article>`,
      { className: 'who-sheet', onClose: () => (whoSheet = null) },
    );
  }

  update();
  return () => player.relay.close();
}
