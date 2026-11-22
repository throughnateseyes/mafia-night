/*
 * The field guide: how the game works, then a page for every role. One tap away on every screen.
 * It is a small book that covers the whole screen. Page 1 is the briefing with the four files
 * listed on it; tap a file (or the arrows at the foot, or swipe) and the page turns.
 * Styles: src/styles/rules.css.
 */
import { icon } from '../art/index.js';
import { BRIEFING, EVENT, ROLES, TEAMS } from '../config/game.js';
import { $, esc, h } from './kit.js';
import { polaroid, stamp, tilt } from './props.js';

const PAGES = ['how', ...Object.keys(ROLES)];
const TURN_MS = 640;
const label = (id) => (id === 'how' ? 'The rules' : ROLES[id].name);

/** A pen-drawn arrow. */
const arrow = (dir = 'next') =>
  `<svg class="guide-arrow ${dir}" viewBox="0 0 28 14" aria-hidden="true"><path d="M1.5 7.5c7-1 15-1 23.5-.4M19.6 1.8c2 2 3.9 3.6 6.2 5.3-2.5 1.5-4.5 3.2-6.5 5.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** Page 1: five typed lines, the one rule, the four files, and how each side wins. */
const howPage = () => `
  <article class="rules how">
    <h2 class="guide-title">How this works</h2>
    <ol class="brief">
      ${BRIEFING.lines.map((line, i) => `<li><span class="note red brief-num" aria-hidden="true">${i + 1}</span><span>${esc(line)}</span></li>`).join('')}
    </ol>
    <p class="note red brief-rule">${esc(BRIEFING.rule)}</p>

    <section class="guide-section">
      <h3 class="rules-head">Who you might be</h3>
      <p class="note pen guide-hint">tap a file to read it</p>
      <div class="guide-files">
        ${Object.entries(ROLES)
          .map(
            ([id, r], i) =>
              `<button class="guide-file" type="button" data-go="${i + 1}" style="--rot:${tilt(i + 2, 0.4)}deg">
                <span class="guide-file-thumb">${polaroid(r.photo, { rot: tilt(i + 1, 0.8) })}</span>
                <span class="guide-file-text"><span class="guide-file-name ${r.team === 'mafia' ? 'red' : ''}">${esc(r.name)}</span><span class="guide-file-line">${esc(r.line)}</span></span>
                <span class="guide-file-go"><span>p. ${i + 2}</span>${arrow()}</span>
              </button>`,
          )
          .join('')}
      </div>
    </section>

    <section class="guide-section">
      <h3 class="rules-head">How it ends</h3>
      <dl class="role-facts wins">
        <div><dt>${esc(TEAMS.town.name)} win</dt><dd>${esc(TEAMS.town.win)}</dd></div>
        <div class="red"><dt>${esc(TEAMS.mafia.name)} win</dt><dd>${esc(TEAMS.mafia.win)}</dd></div>
      </dl>
    </section>
  </article>`;

/** One role's page: photo, name stamp, what to do at night and by day, and the aside in red pen. */
const rolePage = (id) => {
  const r = ROLES[id];
  const team = TEAMS[r.team];
  return `
  <article class="rules role-rules" data-team="${r.team}" data-role="${id}">
    <p class="kicker">${esc(team.name)} · case no. ${EVENT.caseNo}</p>
    <div class="role-head">
      <div class="role-photo">${polaroid(r.photo, { cap: 'exhibit A', rot: -3, alt: r.name })}</div>
      <div class="role-id">
        <h2 class="role-stamp">${stamp(r.name, { sm: true, ink: r.team !== 'mafia', rot: -5 })}</h2>
        <p class="role-line">${esc(r.line)}</p>
      </div>
    </div>
    <dl class="role-facts">
      <div><dt>At night</dt><dd>${esc(r.night)}</dd></div>
      <div><dt>By day</dt><dd>${esc(r.day)}</dd></div>
      <div><dt>You win when</dt><dd>${esc(team.win)}</dd></div>
      <div class="off-record"><dt>Off the record</dt><dd class="note red">${esc(r.tip)}</dd></div>
    </dl>
  </article>`;
};

function pageEl(i) {
  const id = PAGES[i];
  const prev = PAGES[i - 1];
  const next = PAGES[i + 1];
  return h(`
    <section class="guide-page cq on-paper" data-page="${i}" tabindex="-1" aria-label="${esc(label(id))}, page ${i + 1} of ${PAGES.length}">
      <header class="guide-bar">
        ${i === 0 ? `<p class="kicker">Case no. ${EVENT.caseNo} · field guide</p>` : `<button class="guide-nav back" type="button" data-go="0">${arrow('prev')}<span>the rules</span></button>`}
      </header>
      <div class="guide-body">${i === 0 ? howPage() : rolePage(id)}</div>
      <footer class="guide-foot">
        ${prev ? `<button class="guide-nav prev" type="button" data-go="${i - 1}">${arrow('prev')}<span>${esc(label(prev))}</span></button>` : '<span></span>'}
        <span class="guide-folio">${i + 1} of ${PAGES.length}</span>
        ${next ? `<button class="guide-nav next" type="button" data-go="${i + 1}"><span>${esc(label(next))}</span>${arrow()}</button>` : '<span></span>'}
      </footer>
      <div class="guide-shade" aria-hidden="true"></div>
    </section>`);
}

let current = null;

/** Open the guide at a page (0 = how this works). Returns { el, go, close }. */
function openGuide(start = 0) {
  current?.close(true);
  const d = h(`<dialog class="guide" aria-label="How this works"><div class="guide-book"><button class="guide-x" type="button" aria-label="Close">${icon('close', { size: 22 })}</button></div></dialog>`);
  const book = $('.guide-book', d);
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches || typeof Element.prototype.animate !== 'function';
  let at = -1;
  let busy = false;

  function go(i) {
    if (busy || i === at || i < 0 || i >= PAGES.length) return;
    const from = $('.guide-page', book);
    const to = pageEl(i);
    const forward = i > at;
    at = i;
    if (!from || calm) {
      from?.remove();
      book.append(to);
      to.focus({ preventScroll: true });
      return;
    }
    // forward: the old page lifts off the new one. back: the earlier page swings down over this one.
    busy = true;
    const turning = forward ? from : to;
    const under = forward ? to : from;
    turning.classList.add('turning');
    under.classList.add('under');
    book.append(to);
    const opts = { duration: TURN_MS, easing: 'cubic-bezier(0.45, 0, 0.2, 1)', fill: 'both', direction: forward ? 'normal' : 'reverse' };
    const turn = turning.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-96deg)' }], opts);
    $('.guide-shade', turning).animate([{ opacity: 0 }, { opacity: 0.5 }], opts);
    $('.guide-shade', under).animate([{ opacity: 0.42 }, { opacity: 0 }], { ...opts, easing: 'ease-out' });
    const done = () => {
      if (!busy) return;
      busy = false;
      from.remove();
      to.classList.remove('turning', 'under');
      // drop the finished animations so the page rests flat with no leftover transform
      [to, $('.guide-shade', to)].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      to.focus({ preventScroll: true });
    };
    turn.finished.then(done, done);
    setTimeout(done, TURN_MS + 900); // never leave the book stuck mid-turn
  }

  function close(now = false) {
    if (d.classList.contains('closing')) return;
    d.classList.add('closing');
    document.removeEventListener('keydown', onKey);
    if (current?.el === d) current = null;
    const end = () => {
      if (d.open) d.close();
      d.remove();
    };
    if (now) end();
    else setTimeout(end, 260);
  }

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(at + 1);
    if (e.key === 'ArrowLeft') go(at - 1);
  };

  d.addEventListener('click', (e) => {
    if (e.target === d) return close(); // the desk beside the book
    const b = e.target.closest('button');
    if (!b) return;
    if (b.classList.contains('guide-x')) return close();
    if (b.dataset.go !== undefined) go(Number(b.dataset.go));
  });
  d.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  document.addEventListener('keydown', onKey);

  // swipe to turn (not from the very edge: that belongs to the browser's own back gesture)
  let touch = null;
  book.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    touch = e.touches.length === 1 && t.clientX > 28 && t.clientX < innerWidth - 28 ? { x: t.clientX, y: t.clientY } : null;
  }, { passive: true });
  book.addEventListener('touchend', (e) => {
    if (!touch) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.x;
    const dy = t.clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.8) go(at + (dx < 0 ? 1 : -1));
  }, { passive: true });

  document.body.append(d);
  go(start);
  d.showModal();
  // start on the page itself, not the close button, so nothing is ringed when it opens
  $('.guide-page', book)?.focus({ preventScroll: true });
  current = { el: d, go, close };
  return current;
}

/** The guide, opened at the briefing. */
export const openHowToPlay = () => openGuide(0);

/** The guide, opened at one role's page. */
export const openRole = (roleId) => (ROLES[roleId] ? openGuide(PAGES.indexOf(roleId)) : null);
