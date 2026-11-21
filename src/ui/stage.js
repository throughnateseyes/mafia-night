/*
 * The stage: one scene, full bleed, with its caption. Used on every phone, the TV and
 * the narrator's preview. Only re-renders when the narrator actually changes the scene.
 */
import { ROLES, SCENES } from '../config/game.js';
import { getArt, mountArt } from '../art/index.js';
import { PALETTE } from '../art/palette.js';
import { bounceText, esc } from './kit.js';

const DARK = new Set(['night', 'dusk', 'ink']);

export function sceneText(scene) {
  const def = SCENES[scene.key] ?? { caption: scene.caption ?? '', sub: scene.sub ?? '' };
  const role = scene.role ? ROLES[scene.role]?.name ?? '' : '';
  const fill = (t = '') => t.replace('{name}', scene.name ?? 'Someone').replace('{role}', role);
  const sub = scene.role || !def.subHidden ? def.sub : def.subHidden;
  return { caption: fill(scene.caption ?? def.caption), sub: fill(scene.sub ?? sub), art: def.art ?? scene.art, dark: def.dark };
}

export function sceneTile(scene) {
  const { art } = sceneText(scene);
  return getArt(art).tile ?? 'cream';
}

/**
 * Render `scene` into `el` if it changed. Returns true when it re-rendered.
 * opts.compact: smaller caption (narrator preview); opts.quiet: no caption.
 */
export function renderStage(el, scene, opts = {}) {
  const sig = `${scene.key}|${scene.at}|${scene.name ?? ''}|${opts.compact ? 'c' : ''}`;
  if (el.dataset.sig === sig) return false;
  el.dataset.sig = sig;
  const { caption, sub, art } = sceneText(scene);
  const data = getArt(art);
  const tile = data.tile ?? 'cream';
  // a scene can say its caption sits on something dark (`dark`), or that its art should fade out before the caption (`fade`)
  const dark = data.dark ?? DARK.has(tile);
  el.className = `stage ${dark ? 'is-dark' : ''} ${data.fade ? 'fade' : ''} ${opts.compact ? 'compact' : ''} ${opts.className ?? ''}`;
  el.style.setProperty('--tile', PALETTE[tile] ?? tile);
  el.innerHTML = `
    <div class="stage-art"></div>
    ${opts.quiet ? '' : `<div class="stage-text">
      <h2 class="stage-caption">${bounceText(caption, { delay: 0.5 })}</h2>
      ${sub ? `<p class="stage-sub">${esc(sub)}</p>` : ''}
    </div>`}`;
  mountArt(el.querySelector('.stage-art'), art, { slots: { name: scene.name ?? '' }, label: caption });
  return true;
}
