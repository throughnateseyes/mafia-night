/*
 * The narrator's phone: the lead detective's case folder, and the remote for the whole game.
 * Runs the game itself (it takes over from the table when it connects), so nothing depends
 * on the table staying awake.
 *
 * Four folder tabs over one sheet of typing paper:
 *   Briefing  what to say before the first night
 *   Tonight   the step you are on: the script to read out, then the one thing to tap
 *   Suspects  everyone who is booked, the birthday marker, a peek at the roles
 *   Scenes    put any scene on every screen, and fix a mistake
 */
import { BRIEFING, EVENT, NIGHT_STEPS, PLAYER_LIMITS, ROLES, SCENES, TEAMS } from '../config/game.js';
import { publicView } from '../game/engine.js';
import { roleCounts } from '../game/roles.js';
import { links, narrate, parseRoomArg } from '../game/session.js';
import { navigate } from '../router.js';
import { $, $$, buzz, countdown, esc, holdToPeek, keepAwake, sheet, statusBadge, toast } from '../ui/kit.js';
import { circled, face, kraft, mug, stamp, tapeStrip, tilt } from '../ui/props.js';
import { qrSvg } from '../ui/qr.js';
import { openPreview } from '../ui/preview.js';
import { renderStage, sceneText, sceneThumb } from '../ui/stage.js';

const TABS = [
  ['briefing', 'Briefing'],
  ['tonight', 'Tonight'],
  ['suspects', 'Suspects'],
  ['scenes', 'Scenes'],
];

const roleName = (id) => ROLES[id]?.name ?? '';
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen'];
const num = (n) => NUM[n] ?? String(n);

/** Who gets what at this head count, or how many more are needed. */
function mixLine(n) {
  if (n < PLAYER_LIMITS.min) return `Need at least ${PLAYER_LIMITS.min} to start · ${PLAYER_LIMITS.min - n} more`;
  const c = roleCounts(Math.min(n, PLAYER_LIMITS.max));
  return `${c.mafia} ${ROLES.mafia.name} · 1 ${ROLES.doctor.name} · 1 ${ROLES.detective.name} · ${c.villager} ${ROLES.villager.name}${c.villager === 1 ? '' : 's'}`;
}

/** A message on the bare desk: a torn label, a typed line, maybe one button. */
const plain = ({ label, title, text, extra = '' }) =>
  `<div class="narr-plain">${kraft(label)}<h1 class="title">${title}</h1><p class="lede">${text}</p>${extra}</div>`;

export function renderNarrator(root, arg) {
  const room = parseRoomArg(arg, 'n');
  if (!room) {
    root.innerHTML = `<main class="frame"><div class="view narr">${plain({
      label: `Case no. ${EVENT.caseNo}`,
      title: 'That narrator code looks smudged.',
      text: 'Scan the narrator code on the big screen again.',
    })}</div></main>`;
    return;
  }
  keepAwake();
  root.innerHTML = `<main class="frame"><div class="view narr">${plain({
    label: 'Lead detective',
    title: 'Taking over the table…',
    text: 'Grabbing the game from the device that started it.',
  })}</div></main>`;
  const view = $('.narr', root);

  let host = null;
  let gone = false; // another phone took over
  let tab = 'tonight';
  let lastPhase = null;
  let preview = null; // the open look at a player's screen, if any
  let lastKey = '';
  let lastSig = '';
  let stageEl = null;
  let paper = null;

  const send = async (cmd) => {
    buzz(10);
    const err = await host.dispatch(cmd);
    if (err) toast(err, { tone: 'warn' });
    return err;
  };

  narrate(room, {
    onChange: () => render(),
    onDemote: () => {
      gone = true;
      view.innerHTML = plain({
        label: 'Lead detective',
        title: 'Another phone took over',
        text: 'Someone opened the narrator code on another device. Open it here again to take it back.',
        extra: '<button class="btn paper" id="back" type="button">Take it back</button>',
      });
    },
  }).then((h0) => {
    host = h0;
    host.setNarratorHere(true);
    if (gone) return;
    view.innerHTML = `
      <header class="narr-top"><button class="narr-see" type="button" aria-label="See what every player sees right now"><div class="stage"></div></button><span class="narr-net"></span></header>
      <div class="tabs" role="tablist" aria-label="Case folder">
        ${TABS.map(([id, name]) => `<button class="tab" type="button" role="tab" id="narr-tab-${id}" data-tab="${id}" aria-controls="narr-panel" aria-selected="false" tabindex="-1">${name}</button>`).join('')}
      </div>
      <section class="paper narr-paper" id="narr-panel" role="tabpanel" aria-labelledby="narr-tab-tonight"></section>`;
    stageEl = $('.stage', view);
    paper = $('.narr-paper', view);
    $('.narr-net', view).append(statusBadge(host.relay));
    toast('You’re narrating. The table is now the big screen.');
    render();
  });

  /* ---------- render ---------- */

  function render() {
    if (!host || gone || !paper) return;
    const g = host.game;
    // every phase change lands the narrator back on the step they need next
    if (g.phase !== lastPhase) {
      lastPhase = g.phase;
      tab = 'tonight';
    }
    renderStage(stageEl, g.scene, { compact: true, players: publicView(g).players, round: g.round });
    preview?.update(publicView(g));
    $$('.tab', view).forEach((b) => {
      const on = b.dataset.tab === tab;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
    });
    paper.setAttribute('aria-labelledby', `narr-tab-${tab}`);

    // body scrolls inside the sheet; pin (the Ranger's answer) and foot (the one thing to tap) never leave it
    const { body, pin = '', foot = '', footCls = '' } = PAGES[tab](g);
    const html = `<div class="narr-scroll"><div class="narr-page">${body}</div></div>${pin ? `<div class="narr-pin">${pin}</div>` : ''}${foot ? `<div class="narr-foot ${footCls}">${foot}</div>` : ''}`;
    const sig = `${html}|${g.timer?.ends ?? ''}`;
    if (sig === lastSig) return; // nothing on the page changed (a heartbeat, a reconnect)
    lastSig = sig;
    const key = `${tab}|${g.phase}|${g.night?.step ?? ''}|${g.scene.key}`;
    const fresh = key !== lastKey;
    lastKey = key;
    const top = fresh ? 0 : ($('.narr-scroll', paper)?.scrollTop ?? 0);
    paper.innerHTML = html;
    const scroll = $('.narr-scroll', paper);
    if (fresh) scroll.firstElementChild.classList.add('slide');
    else scroll.scrollTop = top;
    if (!fresh) $('.pick.chosen', paper)?.scrollIntoView({ block: 'nearest' });

    const hold = $('.secret-hold', paper);
    if (hold) {
      const list = $('.secret-list', paper);
      holdToPeek(hold, { onShow: () => list.classList.add('shown'), onHide: () => list.classList.remove('shown') });
    }
    const timer = $('.timer', paper);
    if (timer) countdown(timer, g.timer);
  }

  function setTab(next, { focus = false, reveal = '' } = {}) {
    tab = next;
    render();
    if (focus) $(`#narr-tab-${next}`, view)?.focus();
    if (reveal) $(reveal, paper)?.scrollIntoView({ block: 'start' });
  }

  /* ---------- pieces ---------- */

  /** The top of a page: where we are (typed kicker), then either the script to read out or a plain title. */
  const head = ({ where, count = '', say = '', title = '', text = '' }) => `
    <header class="narr-head">
      <p class="kicker narr-where"><span>${where}</span>${count ? `<span>${count}</span>` : ''}</p>
      ${say ? `<p class="narr-say">“${esc(say)}”</p>` : ''}
      ${title ? `<h2 class="narr-title">${title}</h2>` : ''}
      ${text ? `<p class="narr-text">${text}</p>` : ''}
    </header>`;

  /** Everyone as a face with their name in pen. Tap one: it gets circled. The dead are greyed and can't be picked. */
  const picks = (g, { kind, chosen = null, off = () => false, tag = () => '' }) => `
    <div class="narr-picks ${g.players.length > 6 ? 'many' : ''}">
      ${g.players
        .map((p, i) => {
          const dead = !p.alive;
          const on = chosen === p.id;
          const t = tag(p);
          return `<button class="pick ${on ? 'chosen' : ''} ${dead ? 'dead' : ''}" type="button" data-pick="${esc(p.id)}" data-kind="${kind}" aria-pressed="${on}" ${dead || off(p) ? 'disabled' : ''}>
            <span class="pick-face">${face(p.avatar, { out: dead, rot: tilt(i) })}${on ? circled() : ''}</span>
            <span class="pick-name">${esc(p.name)}</span>
            ${t ? `<span class="pick-tag">${esc(t)}</span>` : ''}
          </button>`;
        })
        .join('')}
    </div>`;

  /**
   * One suspect per row: face, typed name, then whatever this list is for.
   * opts.roles: the role, blacked out until .secret-list gets .shown. opts.cake: the birthday marker.
   * opts.kick: remove from the game. opts.fix: mark dead / bring back.
   * The name is always the row's second child (the full-game test reads it there).
   */
  const roster = (g, { roles = false, cake = false, kick = false, fix = false, cls = '' } = {}) => `
    <ul class="narr-roster ${cls}">
      ${g.players
        .map((p, i) => {
          const bday = Boolean(p.bday);
          return `<li class="${p.alive ? '' : 'dead'} ${bday && cake ? 'bday' : ''}">
            <span class="narr-face">${face(p.avatar, { out: !p.alive, rot: tilt(i) })}</span>
            <span class="narr-name">${esc(p.name)}</span>
            ${bday && cake ? `<span class="note red narr-bday">${esc(EVENT.birthdayNoun)}</span>` : ''}
            ${roles && p.role ? `<span class="chip-role" data-role="${p.role}">${roleName(p.role)}</span>` : ''}
            ${cake ? `<button class="narr-cake" type="button" data-bday="${esc(p.id)}" aria-pressed="${bday}" aria-label="${bday ? `${esc(p.name)} is the ${esc(EVENT.birthdayNoun)}. Tap to clear` : `Mark ${esc(p.name)} as the ${esc(EVENT.birthdayNoun)}`}">🎂</button>` : ''}
            ${kick ? `<button class="narr-x" type="button" data-kick="${esc(p.id)}" aria-label="Remove ${esc(p.name)}">x</button>` : ''}
            ${fix ? `<button class="chipbtn" type="button" data-fix="${esc(p.id)}" data-alive="${p.alive}">${p.alive ? 'Mark dead' : 'Bring back'}</button>` : ''}
          </li>`;
        })
        .join('')}
    </ul>`;

  const holdLink = '<button class="link secret-hold" type="button">hold to peek at roles</button>';
  const cakeLine = `<p class="narr-hint">Tap the cake to mark the ${esc(EVENT.birthdayNoun)}, whatever name she typed.</p>`;
  const canKick = (g) => g.phase === 'lobby' || g.phase === 'end';
  const dealt = (g) => g.players.some((p) => p.role);

  /* ---------- Tonight: one step at a time ---------- */

  const TONIGHT = {
    lobby: (g) => {
      const n = g.players.length;
      return {
        body: `
          ${head({
            where: 'The cabin · before the first night',
            title: n === 0 ? 'Nobody’s booked yet' : `${num(n)} suspect${n === 1 ? '' : 's'} booked`,
            text: n === 0 ? 'Show the join code and let them scan in.' : '',
          })}
          <p class="narr-hint mix">${mixLine(n)}</p>
          ${n ? `${roster(g, { cake: true, kick: true })}${cakeLine}` : ''}`,
        foot: `
          <button class="btn" data-cmd="deal" type="button" ${n < PLAYER_LIMITS.min ? 'disabled' : ''}>Hand out the files</button>
          <button class="link" data-show="join" type="button">show join code</button>`,
      };
    },

    dealt: (g) => ({
      body: `
        ${head({
          where: 'Before night 1',
          title: 'The files are out',
          text: 'Everyone’s checking their phone. Once they’ve all seen it, start the first night.',
        })}
        ${roster(g, { roles: true, cls: 'secret-list' })}`,
      foot: `
        <button class="btn" data-cmd="night" type="button">Start night 1</button>
        ${holdLink}`,
    }),

    night: (g) => {
      const i = Math.min(g.night.step, NIGHT_STEPS.length - 1);
      const step = NIGHT_STEPS[i];
      const last = i === NIGHT_STEPS.length - 1;
      const actors = step.role ? g.players.filter((p) => p.role === step.role) : [];
      const actorsAlive = actors.some((p) => p.alive);
      let pick = '';
      let verdict = '';
      if (step.pick) {
        if (!actorsAlive) {
          pick = `<p class="note red narr-aside">The ${roleName(step.role)} is dead. Read it anyway and wait a few seconds, so nobody can tell.</p>`;
        } else {
          pick = `<p class="narr-ask">${esc(step.ask)}</p>${picks(g, {
            kind: step.pick,
            chosen: g.night[step.pick],
            off: (p) => step.pick === 'save' && p.id === g.lastSave,
            tag: (p) => (step.pick === 'save' && p.id === g.lastSave ? 'saved last night' : p.role === step.role ? roleName(p.role) : ''),
          })}`;
          if (step.pick === 'check' && g.night.check) {
            const checked = g.players.find((p) => p.id === g.night.check);
            const isMafia = ROLES[checked.role].team === 'mafia';
            verdict = `<div class="verdict ${isMafia ? 'yes' : 'no'}">
              ${isMafia ? stamp('Mafia', { sm: true, thud: true, rot: -6, at: '0.1s' }) : stamp('Not Mafia', { sm: true, ink: true, thud: true, rot: -4, at: '0.1s' })}
              <p><strong>Thumbs ${isMafia ? 'up' : 'down'}</strong>Show the ${roleName(step.role)}, silently.</p>
            </div>`;
          }
        }
      }
      return {
        body: `
          ${head({ where: `Night ${g.round} · read this out loud`, count: `step ${i + 1} of ${NIGHT_STEPS.length}`, say: step.say })}
          ${pick}`,
        pin: verdict,
        footCls: 'steps',
        foot: `
          ${last ? '<button class="btn" data-cmd="dawn" type="button">Wake everyone up</button>' : `<button class="btn" data-step="${i + 1}" type="button">Next</button>`}
          <div class="narr-links">
            ${i > 0 ? `<button class="link" data-step="${i - 1}" type="button">back<span class="narr-more"> a step</span></button>` : ''}
            <button class="link" data-goto="fix" type="button">fix a mistake</button>
          </div>`,
      };
    },

    morning: (g) => {
      const afterVote = ['out', 'hung'].includes(g.scene.key);
      const lastNight = [...g.log].reverse().find((l) => 'target' in l && l.round === g.round);
      const name = (id) => esc(g.players.find((p) => p.id === id)?.name ?? 'nobody');
      const fact = (what, who, aside = '') => `<div class="leader"><span>${what}</span><span>${who ? name(who) : 'nobody'}${aside}</span></div>`;
      const facts =
        !afterVote && lastNight
          ? `<div class="narr-facts">
              <p class="narr-ask">Last night, for your eyes only</p>
              ${fact('Mafia chose', lastNight.target)}
              ${fact(`${ROLES.doctor.name} saved`, lastNight.save, lastNight.saved ? ' <span class="note red">it worked</span>' : '')}
              ${fact(`${ROLES.detective.name} checked`, lastNight.check)}
            </div>`
          : '';
      const t = sceneText(g.scene, { players: g.players, round: g.round });
      if (g.winner) {
        return {
          body: `${head({ where: `Case no. ${EVENT.caseNo} · it’s over`, title: 'That’s the game', text: `${esc(TEAMS[g.winner].name)} won. Build the suspense, then reveal it.` })}${facts}`,
          foot: '<button class="btn" data-cmd="finish" type="button">Reveal the winner</button>',
        };
      }
      if (afterVote) {
        return {
          body: head({ where: `Day ${g.round} · after the vote`, title: g.scene.key === 'out' ? `${esc(g.scene.name)} is out` : 'No one is out', text: esc(t.sub) }),
          foot: `<button class="btn" data-cmd="night" type="button">Start night ${g.round + 1}</button>`,
        };
      }
      return {
        body: `
          ${head({ where: `Morning ${g.round} · break the news`, title: esc(t.caption), text: esc(t.sub) })}
          ${facts}
          <div class="narr-group">
            <p class="narr-ask">Then let them talk. Put a timer on it?</p>
            <div class="narr-chips">${[2, 3, 5].map((m) => `<button class="chipbtn" data-talk="${m}" type="button">${m} min</button>`).join('')}</div>
          </div>`,
        foot: `
          <button class="btn" data-talk="0" type="button">Let them talk</button>
          <button class="link" data-cmd="vote" type="button">skip to the vote</button>`,
      };
    },

    day: (g) => ({
      body: `
        ${head({ where: `Day ${g.round} · by the fire`, say: SCENES.talk.sub })}
        <div class="timer big" hidden><span class="timer-num"></span></div>
        <div class="narr-group">
          <p class="narr-ask">The timer shows on every screen</p>
          <div class="narr-chips">
            ${[1, 2, 3].map((m) => `<button class="chipbtn" data-timer="${m}" type="button">+${m} min</button>`).join('')}
            <button class="chipbtn" data-timer="0" type="button">Stop timer</button>
          </div>
        </div>`,
      foot: `
        <button class="btn" data-cmd="vote" type="button">Start the vote</button>
        <button class="link" data-goto="fix" type="button">fix a mistake</button>`,
    }),

    vote: (g) => ({
      body: `
        ${head({ where: `Day ${g.round} · the vote · read this out loud`, say: SCENES.vote.sub })}
        <p class="narr-ask">Count to three, everyone points. Who got the most?</p>
        ${picks(g, { kind: 'vote' })}`,
      foot: '<button class="link" data-eliminate="" type="button">a tie, or no one is out</button>',
    }),

    end: (g) => ({
      body: `
        ${head({ where: `Case no. ${EVENT.caseNo} · closed`, title: `${esc(TEAMS[g.winner]?.name ?? '')} won` })}
        ${roster(g, { roles: true, cls: 'reveal-all secret-list shown' })}`,
      foot: `
        <button class="btn" data-cmd="again" type="button">Play again, new files</button>
        <button class="link" data-cmd="lobby" type="button">let more people join</button>`,
    }),
  };

  /* ---------- the four tabs ---------- */

  const PAGES = {
    tonight: (g) => TONIGHT[g.phase]?.(g) ?? { body: '' },

    briefing: () => ({
      body: `
        ${head({ where: esc(BRIEFING.intro) })}
        <ol class="narr-brief">
          ${BRIEFING.lines.map((line, i) => `<li><span class="narr-brief-n" aria-hidden="true">${i + 1}</span><span>${esc(line)}</span></li>`).join('')}
        </ol>
        <p class="note red narr-rule">${esc(BRIEFING.rule)}</p>
        <div class="narr-group">
          <p class="narr-ask">What each role does, if anyone asks</p>
          <dl class="narr-roles">
            ${Object.values(ROLES).map((r) => `<div><dt>${esc(r.name)}</dt><dd>${esc(r.line)}</dd></div>`).join('')}
          </dl>
        </div>`,
    }),

    suspects: (g) => {
      const n = g.players.length;
      const out = g.players.filter((p) => !p.alive).length;
      const secret = dealt(g) && g.phase !== 'end';
      return {
        body: `
          ${head({ where: `${num(n)} booked${out ? ` · ${num(out).toLowerCase()} out` : ''}` })}
          ${n ? cakeLine : '<p class="narr-text">Nobody’s booked yet.</p>'}
          ${n ? roster(g, { cake: true, kick: canKick(g), roles: dealt(g), cls: `secret-list ${secret ? '' : 'shown'}` }) : ''}
          <label class="narr-toggle"><input type="checkbox" id="reveal" ${g.reveal ? 'checked' : ''}/><span>Show a player’s role when they die</span></label>`,
        // pinned under the list, so a thumb can hold it however long the list is
        foot: secret ? holdLink : '',
      };
    },

    scenes: (g) => {
      const victim = [...g.players].reverse().find((p) => !p.alive);
      const scenes = Object.entries(SCENES).filter(([key]) => !['dead', 'out'].includes(key) || victim);
      return {
        body: `
          ${head({ where: 'Put a scene on every screen', text: g.phase === 'lobby' && g.scene.key !== 'lobby' ? 'The waiting room is hidden right now. Tap the cabin to bring it back.' : '' })}
          <div class="narr-scenes">
            ${scenes
              .map(([key, def], i) => {
                const on = g.scene.key === key;
                const name = key === 'lobby' ? 'The waiting room' : sceneText({ key, name: victim?.name, role: victim?.role }, { players: g.players, round: g.round }).caption;
                return `<button class="narr-scene" type="button" data-scene="${key}" aria-pressed="${on}">
                  <span class="pol no-cap" style="transform:rotate(${tilt(i, 0.5)}deg)"><img class="pol-img" src="${sceneThumb({ key })}" alt="" loading="lazy" ${def.colour ? '' : 'style="filter:contrast(1.05) brightness(1.15) sepia(.18)"'}>${on ? circled() : ''}</span>
                  <span class="narr-scene-name">${esc(name)}</span>
                </button>`;
              })
              .join('')}
          </div>
          <div class="narr-group narr-fix">
            <p class="narr-ask">Fix a mistake</p>
            <ul class="narr-tools">
              <li><button class="narr-tool" id="undo" type="button">Undo the last step</button></li>
              <li><button class="narr-tool" data-show="join" type="button">Show the join code</button></li>
              ${g.phase === 'lobby' ? '' : '<li><button class="narr-tool" id="to-lobby" type="button">Back to the cabin, let people join</button></li>'}
              <li><button class="narr-tool danger" id="close" type="button">End the night and close the room</button></li>
            </ul>
          </div>
          ${dealt(g) ? `<div class="narr-group"><p class="narr-ask">Someone marked wrong?</p>${roster(g, { fix: true })}</div>` : ''}`,
      };
    },
  };

  /* ---------- wiring: one listener on the folder, so re-renders never drop a tap ---------- */

  view.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.disabled || !view.contains(b)) return;
    if (b.id === 'back') return location.reload();
    if (!host || gone) return;
    const d = b.dataset;
    const g = host.game;
    if (b.classList.contains('narr-see')) {
      preview = openPreview({ onClose: () => (preview = null) });
      return preview.update(publicView(g));
    }
    if (d.tab) return setTab(d.tab);
    if (d.goto === 'fix') return setTab('scenes', { reveal: '.narr-fix' });
    if (d.cmd) return send({ type: d.cmd });
    if (d.step !== undefined) return send({ type: 'step', step: Number(d.step) });
    if (d.kick) return send({ type: 'kick', id: d.kick });
    if (d.bday) return send({ type: 'birthday', id: d.bday });
    if (d.talk !== undefined) return send({ type: 'talk', minutes: Number(d.talk) });
    if (d.timer !== undefined) {
      const add = Number(d.timer);
      const left = g.timer ? Math.max(0, g.timer.ends - Date.now()) / 60000 : 0;
      return send({ type: 'timer', minutes: add ? left + add : 0 });
    }
    if (d.pick) {
      if (d.kind === 'vote') return confirmVote(d.pick);
      return send({ type: 'pick', kind: d.kind, id: g.night?.[d.kind] === d.pick ? null : d.pick });
    }
    if (d.eliminate !== undefined) return send({ type: 'eliminate', id: null });
    if (d.show === 'join') return showJoin();
    if (d.scene) {
      const victim = [...g.players].reverse().find((p) => !p.alive);
      const extra = ['dead', 'out'].includes(d.scene) && victim ? { name: victim.name, role: g.reveal ? victim.role : null, victim: victim.id, avatar: victim.avatar, bday: Boolean(victim.bday) } : {};
      return send({ type: 'scene', key: d.scene, extra });
    }
    if (d.fix) return send({ type: d.alive === 'true' ? 'kill' : 'revive', id: d.fix });
    if (b.id === 'undo') return send({ type: 'undo' }).then((err) => err || toast('Undone'));
    if (b.id === 'to-lobby') return toLobby();
    if (b.id === 'close') return closeRoom();
  });

  view.addEventListener('change', (e) => {
    if (e.target.id === 'reveal' && host && !gone) send({ type: 'reveal', on: e.target.checked });
  });

  // folder tabs: arrow keys move between them
  view.addEventListener('keydown', (e) => {
    if (!e.target.matches?.('.tab') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const ids = TABS.map(([id]) => id);
    const at = ids.indexOf(tab);
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? ids.length - 1 : (at + (e.key === 'ArrowRight' ? 1 : -1) + ids.length) % ids.length;
    setTab(ids[next], { focus: true });
  });

  /* ---------- small sheets of paper ---------- */

  /** Ask before something everyone will see. Resolves true on yes. */
  function ask({ html, yes, red = true }) {
    return new Promise((resolve) => {
      let answer = false;
      const s = sheet(
        `<div class="narr-confirm on-paper">${html}<button class="btn ${red ? 'red' : ''}" id="yes" type="button">${yes}</button><button class="link" id="no" type="button">never mind</button></div>`,
        { className: 'confirm-sheet', onClose: () => resolve(answer) },
      );
      $('#yes', s.el).addEventListener('click', () => {
        answer = true;
        s.close();
        resolve(true);
      });
      $('#no', s.el).addEventListener('click', () => s.close());
    });
  }

  async function confirmVote(id) {
    const p = host.game.players.find((x) => x.id === id);
    if (!p) return;
    const yes = await ask({
      html: `<div class="narr-confirm-mug">${mug(p.avatar, { name: p.name, rot: -3 })}</div><h2 class="narr-title">Vote out ${esc(p.name)}?</h2><p class="narr-text">Everyone’s screen will show it.</p>`,
      yes: 'Yes, they’re out',
    });
    if (yes) send({ type: 'eliminate', id });
  }

  async function toLobby() {
    const yes = await ask({
      html: '<h2 class="narr-title">Back to the cabin?</h2><p class="narr-text">Every file is taken back and new people can join. Undo brings the game back.</p>',
      yes: 'Back to the cabin',
      red: false,
    });
    if (yes) send({ type: 'lobby' });
  }

  async function closeRoom() {
    const yes = await ask({
      html: '<h2 class="narr-title">Close the room?</h2><p class="narr-text">Everyone’s phone will lose the game.</p>',
      yes: 'End the night',
    });
    if (!yes) return;
    await host.close();
    navigate('/');
  }

  function showJoin() {
    sheet(
      `<div class="narr-code on-paper"><p class="kicker">Join code</p><h2 class="narr-title">Scan to get booked</h2><div class="narr-qr">${tapeStrip('top:calc(var(--u) * -3);left:50%;margin-left:calc(var(--u) * -11);transform:rotate(3deg)')}${qrSvg(links(room).join, { label: 'Join code' })}</div></div>`,
      { className: 'code-sheet' },
    );
  }

  return () => host?.relay.close();
}
