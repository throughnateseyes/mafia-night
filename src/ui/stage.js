/*
 * The stage: what is lying on the desk right now. One composition per scene, shown on
 * every phone and the big screen, and summarised on the narrator's phone.
 *
 *   renderStage(el, scene, { players, round, compact })
 *
 * Only re-renders when the scene (or the people in it) actually change.
 */
import { EVENT, ROLES, SCENES } from '../config/game.js';
import { edition } from '../config/gazette.js';
import { esc } from './kit.js';
import { cabin, crimeTape, folder, gazette, kraft, mug, photoSrc, pin, pinboard, polaroid, stamp, tilt } from './props.js';

const def = (scene) => SCENES[scene.key] ?? { kind: 'photo', caption: scene.caption ?? '', sub: scene.sub ?? '' };

/** Lights out for this scene? (night, and the Mafia's win) */
export const sceneIsDark = (scene) => Boolean(def(scene).dark);

/** The words for a scene: { kicker, caption, sub, note, cap }. Plain text, not escaped. */
export function sceneText(scene, { players = [], round = 1 } = {}) {
  const d = def(scene);
  const role = scene.role ? ROLES[scene.role]?.name ?? '' : '';
  const n = players.length;
  const fill = (t = '') => t.replace('{name}', scene.name ?? 'Someone').replace('{role}', role).replace('{round}', Math.max(1, round)).replace('{n}', NUM[n] ?? n);
  const caption = d.kind === 'cabin' && n === 1 ? d.captionOne : d.kind === 'cabin' && n === 0 ? 'No suspects yet' : d.caption;
  const sub = scene.role || !d.subHidden ? d.sub : d.subHidden;
  return { kicker: fill(d.kicker), caption: fill(scene.caption ?? caption), sub: fill(scene.sub ?? sub), note: fill(d.note), cap: fill(d.cap) };
}
const NUM = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen'];

const birthdayName = (players) => players.find((p) => p.honoree)?.name;

/* ---------- compositions ---------- */

const COMPOSE = {
  cabin: (scene, ctx, el) => {
    const seen = (el._seen ??= new Set());
    const first = seen.size === 0;
    const enter = new Set(first ? [] : ctx.players.filter((p) => !seen.has(p.id)).map((p) => p.id));
    ctx.players.forEach((p) => seen.add(p.id));
    return `<div class="stage-prop is-cabin">${cabin(ctx.players, { enter })}</div>`;
  },

  files: () =>
    `<div class="stage-prop is-files">${folder(
      `<p class="typed stage-files-line">One file per suspect.<br>Yours is on your phone.</p><div class="stage-files-stamp">${stamp('Eyes only', { sm: true, rot: -6 })}</div>`,
      { tab: `Case no. ${EVENT.caseNo}`, rot: -1.5 },
    )}</div>`,

  photo: (scene, ctx, el, d, t) => `<div class="stage-prop is-photo drop">${polaroid(d.photo, { cap: t.cap, rot: -2, glow: d.dark, colour: d.colour, alt: t.caption })}</div>`,

  gazette: (scene, ctx) => `<div class="stage-prop is-gazette">${gazette(edition(scene, ctx.round), { spin: true })}</div>`,

  board: (scene, ctx) =>
    `<div class="stage-prop is-board cork">${kraft('Who did it?', { rot: -1.5, cls: 'stage-board-label' })}<div class="stage-board-pins">${pinboard(ctx.players)}</div>${crimeTape('bottom:calc(var(--u) * 2);transform:rotate(4deg)')}</div>`,

  verdict: (scene, ctx) => {
    const p = ctx.players.find((x) => x.id === scene.victim);
    const avatar = scene.avatar ?? p?.avatar ?? 0;
    const role = scene.role ? ROLES[scene.role] : null;
    return `<div class="stage-prop is-verdict drop">${mug(avatar, { name: scene.name ?? '', rot: -3, extra: pin('top:calc(var(--u) * -1.6);left:46%') })}<div class="stage-verdict-stamp">${stamp(role ? role.name : 'Out', { thud: true, ink: role ? role.team !== 'mafia' : true, rot: -9 })}</div></div>`;
  },

  closed: (scene, ctx, el, d, t) => {
    const rows = ctx.players.map((p) => `<div class="leader ${ROLES[p.role]?.team === 'mafia' ? 'red' : ''}"><span>${esc(p.name)}</span><span>${esc(ROLES[p.role]?.name ?? '?')}</span></div>`).join('');
    const cap = scene.key === 'town' ? `happy ${EVENT.age}th!` : t.cap;
    return `<div class="stage-prop is-closed">${folder(
      `<div class="stage-closed-list ${ctx.players.length > 8 ? 'many' : ''}">${rows}</div><div class="stage-closed-row">${polaroid(d.photo, { cap, rot: -4, colour: d.colour, extra: pin('top:calc(var(--u) * -1.6);left:44%'), style: 'width:44%;flex:none' })}<div class="stage-closed-stamp">${stamp(d.stamp, { sm: true, thud: true, rot: -8, at: '0.9s' })}</div></div>`,
      { tab: `Case no. ${EVENT.caseNo}`, rot: 1 },
    )}</div>`;
  },
};

/** A small picture that stands for a scene (narrator's preview, scene picker). */
export function sceneThumb(scene) {
  const d = def(scene);
  const id = d.photo ?? { lobby: 'cabin-map', dealt: 'role-villager', dead: 'morning-dead', clear: 'morning-clear', vote: 'cabin-watching', out: 'out' }[scene.key] ?? 'cabin-watching';
  return photoSrc(id);
}

/**
 * Render `scene` into `el` if it changed. Returns true when it re-rendered.
 * opts.players: public players. opts.round. opts.compact: one-line summary (narrator's preview).
 */
export function renderStage(el, scene, opts = {}) {
  const ctx = { players: opts.players ?? [], round: opts.round ?? 1 };
  const d = def(scene);
  const who = ['cabin', 'board', 'closed', 'verdict'].includes(d.kind) ? ctx.players.map((p) => `${p.id}${p.alive === false ? 'x' : ''}${p.honoree ? 'b' : ''}${p.role ?? ''}`).join(',') : '';
  const sig = `${scene.key}|${scene.at}|${scene.name ?? ''}|${opts.compact ? 'c' : ''}|${who}`;
  if (el.dataset.sig === sig) return false;
  const sameScene = el.dataset.scene === `${scene.key}|${scene.at}`;
  el.dataset.sig = sig;
  el.dataset.scene = `${scene.key}|${scene.at}`;
  const t = sceneText(scene, ctx);
  const dark = sceneIsDark(scene);
  // the campers' win is also a birthday card, if the narrator marked who it's for
  if (scene.key === 'town' && birthdayName(ctx.players)) t.note = `happy birthday, ${birthdayName(ctx.players)}`;

  if (opts.compact) {
    el.className = 'stage compact';
    el.innerHTML = `<img class="stage-thumb" src="${sceneThumb(scene)}" alt=""><div class="stage-compact-text"><p class="kicker">On every screen now · tap to see it</p><p class="stage-compact-caption typed">${esc(t.caption)}</p></div>`;
    return true;
  }

  // a preview (the narrator looking at a player's screen) must not dim the narrator's own desk
  if (!opts.preview) document.body.classList.toggle('lights-out', dark);
  // the lobby updates in place as people walk in; everything else is set down fresh
  if (sameScene && d.kind === 'cabin' && el.querySelector('.is-cabin')) {
    el.querySelector('.is-cabin').outerHTML = COMPOSE.cabin(scene, ctx, el);
    el.querySelector('.stage-caption').textContent = t.caption;
    return true;
  }
  if (!sameScene) el._seen = undefined;
  el.className = `stage stage-${d.kind} ${dark ? 'is-dark' : ''}`;
  el.innerHTML = `
    ${t.kicker ? `<p class="kicker stage-kicker">${esc(t.kicker)}</p>` : ''}
    ${(COMPOSE[d.kind] ?? COMPOSE.photo)(scene, ctx, el, d, t)}
    <div class="stage-text">
      <h2 class="stage-caption title">${esc(t.caption)}</h2>
      ${t.sub ? `<p class="stage-sub lede">${esc(t.sub)}</p>` : ''}
      ${t.note ? `<p class="stage-note note gold">${esc(t.note)}</p>` : ''}
    </div>`;
  return true;
}

export { tilt };

/** @deprecated kept only so screens that have not been rebuilt yet still load. */
export const sceneTile = (scene) => (sceneIsDark(scene) ? 'night' : 'cream');
