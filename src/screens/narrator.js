/*
 * The narrator's phone: the whole game in one hand. Runs the game itself (it takes over
 * from the table when it connects), so nothing depends on the table staying awake.
 */
import { EVENT, NIGHT_STEPS, PLAYER_LIMITS, ROLES, SCENES, TEAMS } from '../config/game.js';
import { artHTML, avatarHTML, icon } from '../art/index.js';
import { publicView } from '../game/engine.js';
import { links, narrate, parseRoomArg } from '../game/session.js';
import { navigate } from '../router.js';
import { $, $$, buzz, countdown, esc, h, holdToPeek, keepAwake, sheet, statusBadge, toast } from '../ui/kit.js';
import { qrSvg } from '../ui/qr.js';
import { renderStage, sceneText } from '../ui/stage.js';
import { mixLine } from './display.js';

const roleName = (id) => ROLES[id]?.name ?? '';

export function renderNarrator(root, arg) {
  const room = parseRoomArg(arg, 'n');
  if (!room) {
    root.innerHTML = `<main class="view center"><h2>That narrator code looks smudged.</h2></main>`;
    return;
  }
  keepAwake();
  root.innerHTML = `
    <main class="view narr">
      <header class="narr-bar">
        <span class="narr-badge">${icon('sparkle', { size: 22 })}<span>Narrator</span></span>
        <span class="narr-round"></span>
        <span class="narr-net"></span>
        <button class="btn-round small" id="menu" type="button" aria-label="Narrator menu">${icon('users', { size: 22 })}</button>
      </header>
      <section class="narr-screen">
        <div class="stage"></div>
        <p class="narr-screen-label small">On everyone’s screen</p>
      </section>
      <section class="narr-body"><div class="center"><div class="knock-art">${artHTML('role-narrator')}</div><h2>Taking over the table…</h2><p class="say soft">Grabbing the game from the device that started it.</p></div></section>
    </main>`;
  const body = $('.narr-body', root);
  let host = null;
  let lastPanel = '';

  const send = async (cmd) => {
    buzz(10);
    const err = await host.dispatch(cmd);
    if (err) toast(err, { tone: 'warn' });
    return err;
  };

  narrate(room, {
    onChange: () => render(),
    onDemote: () => {
      body.innerHTML = `<div class="center"><h2>Another phone took over</h2><p class="say soft">Someone opened the narrator code on another device. Open it here again to take it back.</p><button class="btn" id="back" type="button">Take it back</button></div>`;
      $('#back', body).addEventListener('click', () => location.reload());
    },
  }).then((h0) => {
    host = h0;
    host.setNarratorHere(true);
    $('.narr-net', root).append(statusBadge(host.relay));
    toast('You’re narrating. The table is now the big screen.');
    render();
  });

  $('#menu', root).addEventListener('click', () => host && openMenu());

  /* ---------- render ---------- */

  function render() {
    if (!host) return;
    const g = host.game;
    $('.narr-round', root).textContent = g.round ? `Round ${g.round}` : '';
    renderStage($('.narr-screen .stage', root), g.scene, { compact: true });
    const panel = `${g.phase}|${g.night?.step ?? ''}|${g.scene.key}`;
    const fresh = panel !== lastPanel;
    lastPanel = panel;
    const html = PANELS[g.phase]?.(g) ?? '';
    body.innerHTML = html;
    if (fresh) body.firstElementChild?.classList.add('panel-in');
    wire(g);
  }

  const playerButtons = (g, { pickKind, chosen, disable = () => false, badge = () => '', includeDead = false } = {}) => `
    <div class="pick-grid">
      ${g.players
        .filter((p) => includeDead || p.alive)
        .map((p) => {
          const off = disable(p);
          return `<button class="pick ${chosen === p.id ? 'chosen' : ''}" type="button" data-pick="${esc(p.id)}" ${pickKind ? `data-kind="${pickKind}"` : ''} ${off ? 'disabled' : ''}>
            <span class="chip-av">${avatarHTML(p.avatar)}</span>
            <span class="pick-name">${esc(p.name)}</span>
            ${badge(p)}
          </button>`;
        })
        .join('')}
    </div>`;

  const roleTag = (p) => `<span class="chip-role" data-role="${p.role}">${roleName(p.role)}</span>`;

  const PANELS = {
    lobby: (g) => `
      <div class="panel">
        <h2>Who’s here <span class="count">${g.players.length}</span></h2>
        <p class="mix small">${mixLine(g.players.length)}</p>
        <ul class="narr-roster">
          ${g.players.map((p) => `<li><span class="chip-av">${avatarHTML(p.avatar)}</span><span>${esc(p.name)}</span><button class="kick" type="button" data-kick="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">${icon('close', { size: 18 })}</button></li>`).join('')}
        </ul>
        <div class="row">
          <button class="btn btn-quiet" data-show="join" type="button">${icon('qr', { size: 22 })}<span>Show join code</span></button>
        </div>
        <button class="btn btn-big" data-cmd="deal" type="button" ${g.players.length < PLAYER_LIMITS.min ? 'disabled' : ''}>${icon('sparkle', { size: 24 })}<span>Deal the roles</span></button>
      </div>`,

    dealt: (g) => `
      <div class="panel">
        <h2>Roles are out</h2>
        <p class="say soft">Everyone’s peeking at their phone. Once they’ve all seen it, start the first night.</p>
        ${secretRoster(g)}
        <button class="btn btn-big" data-cmd="night" type="button">${icon('moon', { size: 24 })}<span>Start night 1</span></button>
      </div>`,

    night: (g) => {
      const step = NIGHT_STEPS[g.night.step];
      const last = g.night.step === NIGHT_STEPS.length - 1;
      const actors = step.role ? g.players.filter((p) => p.role === step.role) : [];
      const actorsAlive = actors.some((p) => p.alive);
      let pick = '';
      if (step.pick) {
        if (!actorsAlive) {
          pick = `<p class="note">${icon('skull', { size: 22 })} The ${roleName(step.role)} is dead. Read it anyway and wait a few seconds, so nobody can tell.</p>`;
        } else {
          pick = `<h3 class="ask">${esc(step.ask)}</h3>${playerButtons(g, {
            pickKind: step.pick,
            chosen: g.night[step.pick],
            disable: (p) => step.pick === 'save' && p.id === g.lastSave,
            badge: (p) => (p.role === step.role ? `<span class="badge">${roleName(p.role)}</span>` : step.pick === 'save' && p.id === g.lastSave ? '<span class="badge">saved last night</span>' : ''),
          })}`;
          if (step.pick === 'check' && g.night.check) {
            const checked = g.players.find((p) => p.id === g.night.check);
            const isMafia = ROLES[checked.role].team === 'mafia';
            pick += `<div class="verdict ${isMafia ? 'yes' : 'no'}">${icon('hand', { size: 40 })}<div><strong>Thumbs ${isMafia ? 'UP' : 'DOWN'}</strong><span>${esc(checked.name)} is ${isMafia ? '' : 'not '}Mafia</span></div></div>`;
          }
        }
      }
      return `
        <div class="panel night-panel">
          <ol class="steps">${NIGHT_STEPS.map((s, i) => `<li class="${i < g.night.step ? 'done' : i === g.night.step ? 'now' : ''}"></li>`).join('')}</ol>
          <div class="step-art">${artHTML(step.art)}</div>
          <p class="read-label small">Read aloud</p>
          <p class="read say">${esc(step.say)}</p>
          ${pick}
          <div class="row nav">
            <button class="btn btn-quiet" data-step="${g.night.step - 1}" type="button" ${g.night.step === 0 ? 'disabled' : ''}>${icon('arrow-left', { size: 22 })}<span>Back</span></button>
            ${last ? `<button class="btn btn-big" data-cmd="dawn" type="button">${icon('sun', { size: 24 })}<span>Wake everyone up</span></button>` : `<button class="btn btn-big" data-step="${g.night.step + 1}" type="button"><span>Next</span>${icon('arrow-right', { size: 22 })}</button>`}
          </div>
        </div>`;
    },

    morning: (g) => {
      const afterVote = ['out', 'hung'].includes(g.scene.key);
      const lastNight = [...g.log].reverse().find((l) => 'target' in l && l.round === g.round);
      const name = (id) => esc(g.players.find((p) => p.id === id)?.name ?? 'nobody');
      const summary =
        !afterVote && lastNight
          ? `<ul class="summary">
            <li>${icon('knife', { size: 20 })} Mafia chose <strong>${lastNight.target ? name(lastNight.target) : 'nobody'}</strong></li>
            <li>${icon('heart', { size: 20 })} Doctor saved <strong>${lastNight.save ? name(lastNight.save) : 'nobody'}</strong>${lastNight.saved ? ' <span class="badge good">saved!</span>' : ''}</li>
            <li>${icon('eye', { size: 20 })} Detective checked <strong>${lastNight.check ? name(lastNight.check) : 'nobody'}</strong></li>
          </ul>`
          : '';
      if (g.winner) {
        return `<div class="panel"><h2>That’s the game</h2><p class="say">${esc(TEAMS[g.winner].name)} wins. Build the suspense, then reveal it.</p>${summary}<button class="btn btn-big" data-cmd="finish" type="button">${icon('crown', { size: 24 })}<span>Reveal the winner</span></button></div>`;
      }
      return `
        <div class="panel">
          <h2>${afterVote ? (g.scene.key === 'out' ? `${esc(g.scene.name)} is out` : 'No one is out') : sceneText(g.scene).caption}</h2>
          ${summary}
          ${afterVote ? '' : `<h3 class="ask">Let them talk</h3>
          <div class="row chips-row">
            ${[0, 2, 3, 5].map((m) => `<button class="btn btn-chip" data-talk="${m}" type="button">${m ? `${m} min` : 'No timer'}</button>`).join('')}
          </div>`}
          <div class="row">
            ${afterVote ? '' : `<button class="btn btn-quiet" data-cmd="vote" type="button">${icon('hand', { size: 22 })}<span>Skip to the vote</span></button>`}
          </div>
          ${afterVote ? `<button class="btn btn-big" data-cmd="night" type="button">${icon('moon', { size: 24 })}<span>Start night ${g.round + 1}</span></button>` : ''}
        </div>`;
    },

    day: (g) => `
      <div class="panel">
        <h2>Discussion</h2>
        <div class="timer big" hidden><span class="timer-num"></span></div>
        <div class="row chips-row">
          ${[1, 2, 3].map((m) => `<button class="btn btn-chip" data-timer="${m}" type="button">+${m} min</button>`).join('')}
          <button class="btn btn-chip" data-timer="0" type="button">Stop timer</button>
        </div>
        <button class="btn btn-big" data-cmd="vote" type="button">${icon('hand', { size: 24 })}<span>Start the vote</span></button>
      </div>`,

    vote: (g) => `
      <div class="panel">
        <h2>Who did the town vote out?</h2>
        <p class="say soft">Count to three, everyone points. Tap whoever got the most.</p>
        ${playerButtons(g, { pickKind: 'vote' })}
        <button class="btn btn-quiet wide" data-eliminate="" type="button">${icon('close', { size: 22 })}<span>Tie or no one</span></button>
      </div>`,

    end: (g) => `
      <div class="panel">
        <h2>${esc(TEAMS[g.winner]?.name ?? '')} wins</h2>
        <ul class="narr-roster reveal-all">
          ${g.players.map((p) => `<li class="${p.alive ? '' : 'dead'}"><span class="chip-av">${avatarHTML(p.avatar)}</span><span>${esc(p.name)}</span>${roleTag(p)}</li>`).join('')}
        </ul>
        <button class="btn btn-big" data-cmd="again" type="button">${icon('refresh', { size: 24 })}<span>Play again, new roles</span></button>
        <button class="btn btn-quiet wide" data-cmd="lobby" type="button">${icon('users', { size: 22 })}<span>Back to the lobby (let people join)</span></button>
      </div>`,
  };

  function secretRoster(g) {
    return `<div class="secret">
      <button class="secret-hold" type="button">${icon('eye', { size: 22 })}<span>Hold to see the roles</span></button>
      <ul class="narr-roster secret-list">${g.players.map((p) => `<li><span class="chip-av">${avatarHTML(p.avatar)}</span><span>${esc(p.name)}</span>${roleTag(p)}</li>`).join('')}</ul>
    </div>`;
  }

  /* ---------- wiring ---------- */

  function wire(g) {
    $$('[data-cmd]', body).forEach((b) => b.addEventListener('click', () => send({ type: b.dataset.cmd })));
    $$('[data-step]', body).forEach((b) => b.addEventListener('click', () => send({ type: 'step', step: Number(b.dataset.step) })));
    $$('[data-kick]', body).forEach((b) => b.addEventListener('click', () => send({ type: 'kick', id: b.dataset.kick })));
    $$('[data-talk]', body).forEach((b) => b.addEventListener('click', () => send({ type: 'talk', minutes: Number(b.dataset.talk) })));
    $$('[data-timer]', body).forEach((b) =>
      b.addEventListener('click', () => {
        const add = Number(b.dataset.timer);
        const left = g.timer ? Math.max(0, g.timer.ends - Date.now()) / 60000 : 0;
        send({ type: 'timer', minutes: add ? left + add : 0 });
      }),
    );
    $$('[data-pick]', body).forEach((b) =>
      b.addEventListener('click', () => {
        const kind = b.dataset.kind;
        if (kind === 'vote') return confirmVote(b.dataset.pick);
        const id = g.night?.[kind] === b.dataset.pick ? null : b.dataset.pick;
        send({ type: 'pick', kind, id });
      }),
    );
    $$('[data-eliminate]', body).forEach((b) => b.addEventListener('click', () => send({ type: 'eliminate', id: null })));
    $$('[data-show]', body).forEach((b) => b.addEventListener('click', showJoin));
    const hold = $('.secret-hold', body);
    if (hold) {
      const list = $('.secret-list', body);
      holdToPeek(hold, { onShow: () => list.classList.add('shown'), onHide: () => list.classList.remove('shown') });
    }
    const timer = $('.timer', body);
    if (timer) countdown(timer, g.timer);
  }

  function confirmVote(id) {
    const p = host.game.players.find((x) => x.id === id);
    const s = sheet(
      `<div class="confirm"><span class="chip-av big">${avatarHTML(p.avatar, { animate: true })}</span><h2>Vote out ${esc(p.name)}?</h2><p class="say soft">Everyone’s screen will show it.</p><button class="btn btn-big" id="yes" type="button">${icon('check', { size: 24 })}<span>Yes, they’re out</span></button></div>`,
      { className: 'confirm-sheet' },
    );
    $('#yes', s.el).addEventListener('click', () => {
      s.close();
      send({ type: 'eliminate', id });
    });
  }

  function showJoin() {
    sheet(`<div class="narr-code"><p class="kicker">Join code</p><h2>Scan to join</h2><div class="qr-frame small">${qrSvg(links(room).join, { label: 'Join code' })}</div></div>`, { className: 'code-sheet' });
  }

  /* ---------- menu ---------- */

  function openMenu() {
    const g = host.game;
    const victim = [...g.players].reverse().find((p) => !p.alive);
    const scenes = Object.entries(SCENES).filter(([key]) => !['dead', 'out'].includes(key) || victim);
    const s = sheet(
      `<div class="menu">
        <p class="kicker">Narrator tools</p>
        <div class="row">
          <button class="btn btn-quiet" id="undo" type="button">${icon('arrow-left', { size: 22 })}<span>Undo last step</span></button>
          <button class="btn btn-quiet" id="join" type="button">${icon('qr', { size: 22 })}<span>Join code</span></button>
        </div>
        <h3>Put a scene on every screen</h3>
        <div class="scene-grid">
          ${scenes
            .map(([key, def]) => `<button class="scene-btn" type="button" data-scene="${key}"><span class="scene-thumb">${artHTML(def.art, { animate: false, boil: false, slots: { name: victim?.name ?? '' } })}</span><span class="small">${esc(sceneText({ key, name: victim?.name, role: victim?.role }).caption)}</span></button>`)
            .join('')}
        </div>
        ${g.players.some((p) => p.role) ? `<h3>Fix a mistake</h3>
        <ul class="narr-roster fix">${g.players.map((p) => `<li class="${p.alive ? '' : 'dead'}"><span class="chip-av">${avatarHTML(p.avatar)}</span><span>${esc(p.name)}</span><button class="btn btn-chip" type="button" data-fix="${esc(p.id)}" data-alive="${p.alive}">${p.alive ? 'Mark dead' : 'Bring back'}</button></li>`).join('')}</ul>` : ''}
        <label class="toggle"><input type="checkbox" id="reveal" ${g.reveal ? 'checked' : ''}/> <span>Show a player’s role when they die</span></label>
        <button class="btn btn-quiet wide danger" id="close" type="button">${icon('close', { size: 22 })}<span>End the night and close the room</span></button>
      </div>`,
      { className: 'menu-sheet' },
    );
    $('#undo', s.el).addEventListener('click', async () => {
      if (!(await send({ type: 'undo' }))) toast('Undone');
    });
    $('#join', s.el).addEventListener('click', () => {
      s.close();
      setTimeout(showJoin, 260);
    });
    $$('[data-scene]', s.el).forEach((b) =>
      b.addEventListener('click', () => {
        const key = b.dataset.scene;
        const extra = ['dead', 'out'].includes(key) ? { name: victim.name, role: g.reveal ? victim.role : null } : {};
        send({ type: 'scene', key, extra });
        s.close();
      }),
    );
    $$('[data-fix]', s.el).forEach((b) =>
      b.addEventListener('click', () => {
        send({ type: b.dataset.alive === 'true' ? 'kill' : 'revive', id: b.dataset.fix });
        s.close();
      }),
    );
    $('#reveal', s.el).addEventListener('change', (e) => send({ type: 'reveal', on: e.target.checked }));
    $('#close', s.el).addEventListener('click', async () => {
      if (!confirm('Close the room? Everyone’s phone will lose the game.')) return;
      await host.close();
      s.close();
      navigate('/');
    });
  }

  return () => host?.relay.close();
}
