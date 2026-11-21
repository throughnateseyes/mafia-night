/*
 * The device that started the game (a laptop, an iPad, a phone on the table).
 * Runs the game until the narrator scans their code, then becomes the big screen.
 */
import { EVENT } from '../config/game.js';
import { Host, links, savedHost, watch } from '../game/session.js';
import { publicView } from '../game/engine.js';
import { navigate } from '../router.js';
import { $, buzz, esc, h, keepAwake, sheet, statusBadge, toast } from '../ui/kit.js';
import { kraft, tapeStrip } from '../ui/props.js';
import { qrCard, renderDisplayInto, renderLobbyInto } from './display.js';
import { eventLine } from './home.js';

/** A code on a white card inside a sheet: typed title, one line, the QR, and whatever goes under it. */
const codeSheet = ({ title, line, link, label, under = '' }) =>
  sheet(
    `<div class="code">
      <h2 class="code-title title">${title}</h2>
      <p class="code-line">${line}</p>
      <div class="code-card">${tapeStrip('top:calc(var(--u) * -3.4);left:50%;margin-left:calc(var(--u) * -11);transform:rotate(-3deg)')}${qrCard(link, label)}</div>
      ${under}
    </div>`,
    { className: 'code-sheet' },
  );

export function renderTable(root, roomId) {
  const saved = savedHost(roomId);
  if (!saved) {
    root.innerHTML = `<main class="frame"><div class="view lost-case">${kraft(eventLine())}<h2 class="title">This case is open on another device.</h2><p class="lede">Scan the join code on that screen instead, or start a new one here.</p><a class="btn paper" href="#/">Start over</a></div></main>`;
    return;
  }
  const room = { roomId, rk: saved.rk, nk: saved.nk, broker: saved.broker };
  root.innerHTML = `<div class="corner"></div><main class="frame wide display table" data-mode=""></main>`;
  const main = $('main', root);
  keepAwake();
  let host = null;
  let watcher = null;

  const narratorButton = () => `
    <section class="narrator-card slide" style="--at:500ms">
      <button class="btn paper" id="narrator" type="button">I’m the narrator</button>
      ${EVENT.narrator ? `<p class="narrator-note note gold">${esc(EVENT.narrator)}, that’s you</p>` : ''}
    </section>`;

  function renderLobby(st) {
    const fresh = main.dataset.mode !== 'lobby';
    renderLobbyInto(main, room, st, { below: st.narrator ? '' : narratorButton() });
    if (fresh) $('#narrator', main)?.addEventListener('click', openNarratorCode);
    else if (st.narrator) $('.narrator-card', main)?.remove();
  }

  function openNarratorCode() {
    const s = codeSheet({
      title: 'Lead detective’s code',
      line: 'Scan this with your own phone. Don’t let anyone else see it.',
      link: links(room).narrator,
      label: 'Narrator code',
      under: `<button class="link" id="here" type="button">Narrate on this device instead</button>`,
    });
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
    const b = h(`<button class="corner-link" type="button" title="Show this on a TV">TV code</button>`);
    b.addEventListener('click', () =>
      codeSheet({
        title: 'Put it on the TV',
        line: 'Scan this with the TV or a laptop to show every scene to the room.',
        link: links(room).tv,
        label: 'TV code',
        under: `<p class="code-url typed">${esc(links(room).tv)}</p>`,
      }),
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
          toast(`${info.joined} has been booked`);
        }
        render(publicView(game, { narrator: host?.narratorHere }));
      },
      onDemote: () => {
        toast('The narrator has the case. This is the big screen now.');
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
          const btn = h(`<button class="corner-link" type="button">Try another relay</button>`);
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
