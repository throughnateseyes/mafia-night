/*
 * The device that started the game (a laptop, an iPad, a phone on the table).
 * Runs the game until the narrator scans their code, then becomes the big screen.
 */
import { artHTML, icon } from '../art/index.js';
import { EVENT } from '../config/game.js';
import { Host, links, savedHost, watch } from '../game/session.js';
import { publicView } from '../game/engine.js';
import { navigate } from '../router.js';
import { $, buzz, esc, h, keepAwake, sheet, statusBadge, toast } from '../ui/kit.js';
import { qrSvg } from '../ui/qr.js';
import { lobbyHTML, renderDisplayInto, rosterHTML, mixLine } from './display.js';

export function renderTable(root, roomId) {
  const saved = savedHost(roomId);
  if (!saved) {
    root.innerHTML = `<main class="view center"><div class="center-art">${artHTML('role-ghost')}</div><h2>This game lives on another device.</h2><p class="say soft">Scan the join code instead, or start a new game.</p><a class="btn" href="#/">Start over</a></main>`;
    return;
  }
  const room = { roomId, rk: saved.rk, nk: saved.nk, broker: saved.broker };
  root.innerHTML = `<div class="corner"></div><main class="view display table" data-mode=""></main>`;
  const main = $('main', root);
  keepAwake();
  let host = null;
  let watcher = null;
  const seen = new Set();

  const narratorButton = () => `
    <section class="narrator-card">
      <button class="btn btn-narrator" id="narrator" type="button">${icon('lock', { size: 24 })}<span>${esc(EVENT.narrator ?? 'Narrator')}? Get your secret code</span></button>
    </section>`;

  function renderLobby(st) {
    if (main.dataset.mode !== 'lobby') {
      main.dataset.mode = 'lobby';
      main.innerHTML = lobbyHTML(room, st) + (st.narrator ? '' : narratorButton());
      $('#narrator', main)?.addEventListener('click', openNarratorCode);
      st.players.forEach((p) => seen.add(p.id));
      return;
    }
    // update only the roster so the QR stays put and only new faces animate in
    const list = $('.roster-card .chips', main);
    list.innerHTML = rosterHTML(st.players);
    list.querySelectorAll('.chip').forEach((li) => {
      if (!seen.has(li.dataset.id)) {
        li.classList.add('new');
        seen.add(li.dataset.id);
      }
    });
    $('.roster-card .count', main).textContent = st.players.length;
    $('.roster-card .mix', main).textContent = mixLine(st.players.length);
    $('.roster-card .empty', main)?.remove();
    const card = $('.narrator-card', main);
    if (st.narrator && card) card.remove();
  }

  function openNarratorCode() {
    const s = sheet(
      `<div class="narr-code">
        <p class="kicker">For the narrator only</p>
        <h2>Your secret code</h2>
        <p class="say soft">Scan this with your phone. It becomes your control panel: the role list, the night script, every scene.</p>
        <div class="qr-frame small">${qrSvg(links(room).narrator, { label: 'Narrator code' })}</div>
        <button class="btn btn-quiet" id="here" type="button">${icon('users', { size: 22 })}<span>No, I’ll narrate on this device</span></button>
      </div>`,
      { className: 'code-sheet' },
    );
    $('#here', s.el).addEventListener('click', () => {
      s.close();
      navigate(`/n/${room.roomId}.${room.rk}.${room.nk}.${room.broker}`);
    });
  }

  function render(st) {
    if (!st) return;
    if (st.phase === 'lobby') renderLobby(st);
    else renderDisplayInto(main, room, st);
  }

  function becomeDisplay() {
    host?.relay.close();
    host = null;
    watcher = watch(room, { onState: render });
    $('.corner', root).replaceChildren(statusBadge(watcher.relay), tvButton());
  }

  const tvButton = () => {
    const b = h(`<button class="btn btn-tiny" type="button" title="Show this on a TV">${icon('qr', { size: 18 })}<span>TV</span></button>`);
    b.addEventListener('click', () =>
      sheet(`<div class="narr-code"><p class="kicker">Big screen</p><h2>Put it on the TV</h2><p class="say soft">Open this code on a laptop or TV browser to show the scenes to the room.</p><div class="qr-frame small">${qrSvg(links(room).tv, { label: 'TV code' })}</div><p class="small soft break">${esc(links(room).tv)}</p></div>`, { className: 'code-sheet' }),
    );
    return b;
  };

  if (saved.demoted) {
    becomeDisplay();
  } else {
    host = new Host(saved, 'table', {
      onChange: (game, info) => {
        if (info?.joined) {
          buzz(8);
          toast(`${info.joined} pulled up a chair`);
        }
        render(publicView(game, { narrator: host?.narratorHere }));
      },
      onDemote: () => {
        toast('The narrator has the game. This is the big screen now.');
        becomeDisplay();
      },
    });
    $('.corner', root).append(statusBadge(host.relay), tvButton());
    render(publicView(saved.game, { narrator: false }));
    host.start().then((ok) => {
      if (!ok) return;
      // the relay may be unreachable from this network: offer another one
      setTimeout(() => {
        if (host?.relay.status !== 'online' && host?.game.players.length === 0) {
          const btn = h(`<button class="btn btn-tiny" type="button">Try another relay</button>`);
          btn.addEventListener('click', () => {
            saved.broker = (saved.broker + 1) % 3;
            localStorage.setItem(`mn:host:${roomId}`, JSON.stringify(saved));
            location.reload();
          });
          $('.corner', root).append(btn);
        }
      }, 9000);
    });
  }

  return () => {
    host?.relay.close();
    watcher?.relay.close();
  };
}
