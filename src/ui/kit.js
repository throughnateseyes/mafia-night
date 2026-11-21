/* Small UI toolkit shared by every screen. */
import { icon } from '../art/index.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function h(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const buzz = (pattern = 10) => navigator.vibrate?.(pattern);

/* ---------- keep the screen on during the game ---------- */

let lock = null;
export async function keepAwake() {
  if (!('wakeLock' in navigator)) return;
  const get = async () => {
    try {
      lock = await navigator.wakeLock.request('screen');
    } catch {
      /* not allowed right now (e.g. low battery); fine */
    }
  };
  await get();
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && get());
}

/* ---------- caption: letters bounce in one by one ---------- */

export function bounceText(text, { delay = 0, step = 0.028 } = {}) {
  let i = 0;
  return [...String(text)]
    .map((ch) => (ch === ' ' ? ' ' : `<span class="ch" style="--d:${(delay + i++ * step).toFixed(3)}s">${esc(ch)}</span>`))
    .join('')
    .replace(/(<span class="ch"[^>]*>[^<]*<\/span>)+/g, (m) => `<span class="word">${m}</span>`);
}

/* ---------- toast ---------- */

export function toast(msg, { tone = '' } = {}) {
  const el = h(`<div class="toast ${tone}" role="status">${esc(msg)}</div>`);
  document.body.append(el);
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3100);
}

/* ---------- bottom sheet ---------- */

export function sheet(html, { className = '', onClose } = {}) {
  const d = h(`<dialog class="sheet ${className}"><div class="sheet-card on-paper" tabindex="-1" autofocus><button class="sheet-x" type="button" aria-label="Close">${icon('close', { size: 20 })}</button>${html}</div></dialog>`);
  document.body.append(d);
  const close = () => {
    if (d.classList.contains('closing')) return;
    d.classList.add('closing');
    setTimeout(() => {
      d.close();
      d.remove();
      onClose?.();
    }, 240);
  };
  d.addEventListener('click', (e) => e.target === d && close());
  d.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  $('.sheet-x', d).addEventListener('click', close);
  d.showModal();
  return { el: d, close };
}

/* ---------- hold to peek ---------- */

/**
 * Show something only while a finger (or Space) is held down.
 * Hides on release, on leaving the element, and when the page is hidden.
 */
export function holdToPeek(el, { onShow, onHide }) {
  let held = false;
  const show = (e) => {
    if (e?.button > 0) return;
    if (held) return;
    held = true;
    el.classList.add('held');
    buzz(12);
    onShow();
  };
  const hide = () => {
    if (!held) return;
    held = false;
    el.classList.remove('held');
    onHide();
  };
  el.addEventListener('pointerdown', (e) => {
    el.setPointerCapture?.(e.pointerId);
    show(e);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => el.addEventListener(ev, hide));
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  el.addEventListener('keydown', (e) => (e.key === ' ' || e.key === 'Enter') && (e.preventDefault(), show()));
  el.addEventListener('keyup', (e) => (e.key === ' ' || e.key === 'Enter') && hide());
  el.addEventListener('blur', hide);
  document.addEventListener('visibilitychange', hide);
  return hide;
}

/* ---------- connection status ---------- */

export function statusBadge(relay) {
  const el = h('<span class="net" aria-live="polite"><span class="net-dot"></span><span class="net-text"></span></span>');
  relay.onStatus((s) => {
    el.dataset.status = s;
    $('.net-text', el).textContent = s === 'online' ? '' : s === 'offline' ? 'Offline. Retrying…' : 'Connecting…';
  });
  return el;
}

/* ---------- countdown ---------- */

export function countdown(el, timer) {
  clearInterval(el._t);
  if (!timer) {
    el.hidden = true;
    return;
  }
  el.hidden = false;
  const tick = () => {
    const left = Math.max(0, timer.ends - Date.now());
    const m = Math.floor(left / 60000);
    const s = Math.floor((left % 60000) / 1000);
    el.style.setProperty('--p', (left / timer.total).toFixed(4));
    el.querySelector('.timer-num').textContent = `${m}:${String(s).padStart(2, '0')}`;
    el.classList.toggle('done', left === 0);
    if (left === 0) clearInterval(el._t);
  };
  tick();
  el._t = setInterval(tick, 250);
}

/* ---------- full screen (laptop / TV) ---------- */

/**
 * A quiet "full screen" link for the big-screen views. Returns null where the browser
 * cannot do it (iPhone Safari), so callers can just skip it. Pressing F toggles it too.
 */
export function fullscreenLink() {
  const root = document.documentElement;
  const request = root.requestFullscreen ?? root.webkitRequestFullscreen;
  if (!request || document.fullscreenEnabled === false) return null;
  const current = () => document.fullscreenElement ?? document.webkitFullscreenElement;
  const toggle = () => {
    try {
      const p = current() ? (document.exitFullscreen ?? document.webkitExitFullscreen).call(document) : request.call(root, { navigationUI: 'hide' });
      p?.catch?.(() => {});
    } catch {
      /* not allowed right now; ignore */
    }
  };
  const b = h('<button class="corner-link fs-link" type="button" title="Press F"></button>');
  const sync = () => {
    b.textContent = current() ? 'exit full screen' : 'full screen';
  };
  b.addEventListener('click', toggle);
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((ev) => document.addEventListener(ev, sync));
  if (!window.__fsKey) {
    window.__fsKey = true;
    document.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() !== 'f' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.target.closest?.('input, textarea, [contenteditable]')) return;
      if (document.querySelector('.fs-link')) toggle();
    });
  }
  sync();
  return b;
}
