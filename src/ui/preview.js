/*
 * The narrator's look at a player's phone: the scene every player has in front of them right
 * now, drawn exactly as it is on their phone (a small copy of it), and kept up to date as the
 * game moves. Nothing in it can be tapped. Styles: the "peekscreen" rules in narrator.css.
 */
import { icon } from '../art/index.js';
import { $, countdown, h } from './kit.js';
import { kraft } from './props.js';
import { renderStage, sceneIsDark } from './stage.js';

const NOTE = {
  lobby: 'they’re waiting in the cabin',
  dealt: 'after each of them has opened their own file',
  end: 'plus a button to see who was who',
};

/** Open the preview. Call update(view) with the public view on every change. Returns { update, close }. */
export function openPreview({ onClose } = {}) {
  const d = h(`
    <dialog class="peekscreen" aria-label="What every player sees right now">
      <header class="peekscreen-bar" tabindex="-1">
        <div><p class="kicker">What every player sees right now</p><p class="note gold peekscreen-note"></p></div>
        <button class="guide-x peekscreen-x" type="button" aria-label="Close">${icon('close', { size: 22 })}</button>
      </header>
      <div class="peekscreen-phone" inert>
        <div class="frame"><div class="view peekscreen-view">
          <div class="timer" hidden><span class="timer-num"></span></div>
          <p class="note gold lobby-hello">you’re in</p>
          <div class="stage"></div>
          <span class="link lobby-how">how does this work?</span>
          <nav class="dock"><div class="dock-row"><span class="peek-hold">${kraft('hold to check your file', { rot: -1.5 })}</span><span class="link dock-rules">the rules</span></div></nav>
        </div></div>
      </div>
    </dialog>`);
  const phone = $('.peekscreen-phone', d);
  const view = $('.peekscreen-view', d);
  const stage = $('.stage', d);
  const timer = $('.timer', d);
  let mode = '';

  function update(st) {
    if (!st) return;
    const next = st.phase === 'lobby' ? 'lobby' : 'play';
    if (next !== mode) {
      mode = next;
      view.classList.toggle('mode-lobby', mode === 'lobby');
      view.classList.toggle('mode-play', mode === 'play');
      // the layout changed: draw the scene again
      delete stage.dataset.sig;
      delete stage.dataset.scene;
    }
    view.style.setProperty('--n', st.players.length);
    renderStage(stage, st.scene, { players: st.players, round: st.round, preview: true });
    phone.classList.toggle('lights-out', sceneIsDark(st.scene));
    countdown(timer, mode === 'play' ? st.timer : null);
    $('.peekscreen-note', d).textContent = NOTE[st.phase] ?? '';
  }

  function close() {
    if (!d.isConnected) return;
    clearInterval(timer._t);
    d.close();
    d.parentNode.removeChild(d);
    onClose?.();
  }

  d.addEventListener('click', (e) => (e.target === d || e.target.closest('.peekscreen-x')) && close());
  d.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  document.body.append(d);
  d.showModal();
  // rest on the label, not the close button, so nothing is ringed when it opens
  $('.peekscreen-bar', d).focus({ preventScroll: true });
  return { update, close };
}
