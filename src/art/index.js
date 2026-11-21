/*
 * Art registry. Every art module in this folder is picked up automatically,
 * so the app keeps building while artists add files.
 */
import { renderArt } from './render.js';

const modules = import.meta.glob(['./scenes/*.js', './roles/*.js', './title.js', '!./scenes/_*.js'], { eager: true });
const avatarMod = import.meta.glob('./avatars.js', { eager: true });
const iconMod = import.meta.glob('./icons.js', { eager: true });

export const ART = {};
for (const mod of Object.values(modules)) {
  for (const art of [mod.default].flat().filter(Boolean)) ART[art.id] = art;
}

export const AVATARS = Object.values(avatarMod)[0]?.default ?? [];
export const ICONS = Object.values(iconMod)[0]?.default ?? {};

/** A plain placeholder so a missing piece never breaks a screen. */
function placeholder(id) {
  return {
    id,
    title: id,
    viewBox: '0 0 400 400',
    tile: 'stone',
    layers: [{ ink: 'M120 200 C 160 140, 240 140, 280 200 C 240 260, 160 260, 120 200 M200 180 C 210 180, 214 190, 210 198', w: 6, at: 0.1 }],
  };
}

export const getArt = (id) => ART[id] ?? placeholder(id);

/** Render art into an element. Returns the svg element. */
export function mountArt(el, id, opts = {}) {
  const art = typeof id === 'string' ? getArt(id) : id;
  el.innerHTML = renderArt(art, opts);
  return el.firstElementChild;
}

export function artHTML(id, opts = {}) {
  return renderArt(typeof id === 'string' ? getArt(id) : id, opts);
}

/** Brush icon (falls back to a tiny drawn dot if the icon set isn't in yet). */
export function icon(name, { size = 24, animate = false, label = '' } = {}) {
  const art = ICONS[name] ?? { id: `i-${name}`, viewBox: '0 0 48 48', layers: [{ ink: 'M16 24 C 20 18, 28 18, 32 24 C 28 30, 20 30, 16 24', w: 3.2 }] };
  const svg = renderArt(art, { animate, boil: false, label });
  return `<span class="icon" style="--size:${size}px">${svg}</span>`;
}

export function avatarHTML(index, { animate = false, boil = false } = {}) {
  const art = AVATARS.length ? AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length] : null;
  if (!art) return `<span class="avatar-fallback">${index + 1}</span>`;
  return renderArt(art, { animate, boil, label: '' });
}
