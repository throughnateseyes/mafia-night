/*
 * #/gallery — the living style guide. Every prop and every scene, with sample data,
 * so a change to the design system can be checked in one place at any screen size.
 */
import { EVENT, SCENES } from '../config/game.js';
import { $, h } from '../ui/kit.js';
import { cabin, circled, clip, crimeTape, face, folder, gazette, kraft, mug, pin, pinboard, polaroid, redact, stamp, SUSPECTS, tapeStrip, titleCard } from '../ui/props.js';
import { edition } from '../config/gazette.js';
import { renderStage } from '../ui/stage.js';

const NAMES = ['Ava', 'Steph', 'Cleo', 'Ben', 'Dev', 'Mia', 'Jo', 'Kai', 'Rae', 'Sam', 'Lee', 'Mo', 'Priya', 'Alex'];
const people = (n) => NAMES.slice(0, n).map((name, i) => ({ id: `p${i}`, name, avatar: i, alive: i !== 4, honoree: i === 1, role: ['detective', 'villager', 'doctor', 'mafia', 'villager', 'villager', 'mafia'][i % 7] }));

export function renderGallery(root) {
  const sample = { victim: 'p4', name: 'Dev', role: 'villager', avatar: 4 };
  root.innerHTML = `<main class="frame wide"><div class="view" style="gap:var(--s6);max-width:1200px;margin:0 auto">
    <header><p class="kicker">Case no. ${EVENT.caseNo} · style guide</p><h1 class="title">Everything on the desk</h1></header>
    <section class="g-grid" id="props"></section>
    <h2 class="title">Scenes (as a phone sees them)</h2>
    <section class="g-grid" id="scenes"></section>
  </div></main>`;
  const cell = (name, html, cls = '') => `<figure class="g-cell cq"><div class="g-box ${cls}">${html}</div><figcaption class="kicker">${name}</figcaption></figure>`;
  $('#props', root).innerHTML = [
    cell('titleCard', titleCard()),
    cell('folder + clip + stamp', folder(`<p class="typed">Subject is ${redact(16)} and knows these woods.</p><div style="margin-top:var(--s4)">${stamp('Ranger')}</div>${clip('top:calc(var(--u) * -4);right:calc(var(--u) * 10)')}`, { tab: 'Ava · confidential' })),
    cell('polaroid', `<div style="width:70%;margin:auto;position:relative">${polaroid('cabin-watching', { cap: 'the cabin, 9 pm', rot: -3, extra: tapeStrip('top:calc(var(--u) * -3);left:30%;transform:rotate(-4deg)') })}</div>`),
    cell('polaroid (colour, glow)', `<div style="width:70%;margin:auto">${polaroid('cabin-dusk', { cap: 'night one', rot: 2, colour: true, glow: true })}</div>`),
    cell('mug ×16', `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--s3)">${SUSPECTS.map((_, i) => `<span style="position:relative">${mug(i, { name: NAMES[i % NAMES.length], out: i === 5 })}${i === 0 ? circled() : ''}</span>`).join('')}</div>`, 'paper pad'),
    cell('face ×16', `<div style="display:grid;grid-template-columns:repeat(6,1fr);gap:var(--s3)">${SUSPECTS.map((_, i) => face(i, { out: i === 5 })).join('')}</div>`),
    cell('gazette', gazette(edition({ key: 'dead', at: 0, ...sample }, 1))),
    cell('gazette (birthday)', gazette(edition({ key: 'dead', at: 0, name: 'Steph', bday: true }, 2))),
    cell('cabin (7)', cabin(people(7))),
    cell('cabin (14)', cabin(people(14))),
    cell('pinboard (5)', `<div style="height:calc(var(--u) * 110)">${pinboard(people(5))}</div>`, 'cork pad'),
    cell('pinboard (12)', `<div style="height:calc(var(--u) * 120)">${pinboard(people(12))}</div>`, 'cork pad'),
    cell('small props', `<div style="display:flex;flex-direction:column;gap:var(--s4);align-items:flex-start">${kraft('Who did it?')}${stamp('Case closed', { sm: true })}<div style="position:relative;height:calc(var(--u) * 14);width:100%;overflow:hidden">${crimeTape('top:calc(var(--u) * 4);transform:rotate(-3deg)')}</div><div style="position:relative;height:calc(var(--u) * 12);width:100%">${pin('left:10%')}${clip('left:30%')}${tapeStrip('left:50%')}</div></div>`),
    cell('controls', `<div style="display:flex;flex-direction:column;gap:var(--s3)"><button class="btn red">Open the case</button><button class="btn paper">See who was who</button><button class="btn manila">Hand out the files</button><button class="link">how does this work?</button><div class="tabs"><button class="tab" aria-selected="true">Tonight</button><button class="tab">Suspects</button><button class="tab">Scenes</button></div><div class="paper" style="padding:var(--s4)"><button class="btn">Book me in</button><label class="field" style="margin-top:var(--s4)"><span class="field-label">Name of suspect</span><input value="Ava"></label><button class="chipbtn" style="margin-top:var(--s3)">2 min</button> <button class="chipbtn on">3 min</button></div></div>`),
  ].join('');
  const scenes = $('#scenes', root);
  const ctx = { players: people(7), round: 1 };
  for (const key of Object.keys(SCENES)) {
    const fig = h(`<figure class="g-cell"><div class="g-phone"><div class="frame"><div class="view"><div class="stage"></div></div></div></div><figcaption class="kicker">${key}</figcaption></figure>`);
    scenes.append(fig);
    renderStage($('.stage', fig), { key, at: 1000, ...(key === 'dead' || key === 'out' ? sample : {}) }, { ...ctx, players: key === 'town' || key === 'mafia' ? people(7) : people(7).map((p) => ({ ...p, role: null })) });
  }
  document.body.classList.remove('lights-out');
}
