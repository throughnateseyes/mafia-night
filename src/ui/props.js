/*
 * Props: the physical things on the detective's desk, as HTML strings.
 * Styles live in src/styles/props.css. Screens compose these; they never hand-roll a
 * folder, a photo or a stamp. Everything user-typed must be passed through esc() by the caller
 * unless a helper says it escapes for you.
 */
import { esc } from './kit.js';

/* ---------- assets (photographed in Runway, bundled by Vite) ---------- */

const urls = (glob) => Object.fromEntries(Object.entries(glob).map(([p, url]) => [p.split('/').pop().replace(/\.\w+$/, ''), url]));
const MUG = urls(import.meta.glob('../assets/mug/*.jpg', { eager: true, query: '?url', import: 'default' }));
const PHOTO = urls(import.meta.glob('../assets/photo/*.jpg', { eager: true, query: '?url', import: 'default' }));
const PROP = urls(import.meta.glob('../assets/prop/*.png', { eager: true, query: '?url', import: 'default' }));
const TEX = urls(import.meta.glob('../assets/tex/*.jpg', { eager: true, query: '?url', import: 'default' }));

/** The suspects players choose from, in picker order. A player's `avatar` is an index into this. */
export const SUSPECTS = ['raccoon', 'bear', 'moose', 'owl', 'fox', 'beaver', 'skunk', 'deer', 'wolf', 'rabbit', 'porcupine', 'squirrel', 'raven', 'opossum', 'goose', 'bullfrog'].filter((id) => MUG[id] || true);
export const SUSPECT_NAMES = { raccoon: 'Raccoon', bear: 'Bear', moose: 'Moose', owl: 'Owl', fox: 'Fox', beaver: 'Beaver', skunk: 'Skunk', deer: 'Deer', wolf: 'Wolf', rabbit: 'Rabbit', porcupine: 'Porcupine', squirrel: 'Squirrel', raven: 'Raven', opossum: 'Opossum', goose: 'Goose', bullfrog: 'Bullfrog' };
const BLANK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="#8a8378"/></svg>');
const suspectId = (avatar) => SUSPECTS[((Number(avatar) || 0) % SUSPECTS.length + SUSPECTS.length) % SUSPECTS.length];
export const mugSrc = (avatar) => MUG[suspectId(avatar)] ?? BLANK;
export const photoSrc = (id) => PHOTO[id] ?? BLANK;
export const hasPhoto = (id) => Boolean(PHOTO[id]);

/** Where each suspect's face sits in their booking photo (for round crops). Defaults suit most. */
const FACE = { moose: { fy: '30%', zoom: 1.5 }, owl: { fy: '26%' }, goose: { fy: '20%' }, raven: { fy: '24%' } };

/* ---------- one-time desk setup: textures, grain, SVG filters ---------- */

const svgUrl = (s) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

export function installDesk() {
  const root = document.documentElement.style;
  root.setProperty('--grain', svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .3  0 0 0 0 .24  0 0 0 0 .18  0 0 0 .6 0'/></filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`));
  root.setProperty('--worn', svgUrl(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='120'><filter id='w'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.6'/></filter><rect width='100%' height='100%' filter='url(#w)'/></svg>`));
  for (const [id, url] of Object.entries(TEX)) root.setProperty(`--tex-${id}`, `url("${url}")`);
  if (!document.getElementById('desk-filters')) {
    document.body.insertAdjacentHTML(
      'afterbegin',
      `<svg id="desk-filters" width="0" height="0" style="position:absolute" aria-hidden="true">
        <filter id="torn" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="3" seed="11"/><feDisplacementMap in="SourceGraphic" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter>
        <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter>
      </svg>`,
    );
  }
}

/* ---------- small props ---------- */

const rotStyle = (rot) => (rot ? `transform:rotate(${rot}deg);` : '');
const ROT = [-5, 3, -2, 6, 2, -6, 4, -3, 5, -4, 1, -1.5];
/** A stable small tilt for the nth thing in a list, so nothing sits perfectly square. */
export const tilt = (i, amount = 1) => ROT[((i % ROT.length) + ROT.length) % ROT.length] * amount;

export const clip = (style = '') => (PROP.paperclip ? `<img class="clip" src="${PROP.paperclip}" alt="" style="${style}">` : `<span class="clip css" style="${style}"></span>`);
export const tapeStrip = (style = '') => (PROP.tape ? `<img class="tapestrip" src="${PROP.tape}" alt="" style="${style}">` : `<span class="tapestrip css" style="${style}"></span>`);
export const pin = (style = '') => (PROP.pin ? `<img class="pin" src="${PROP.pin}" alt="" style="${style}">` : `<span class="pin css" style="${style}"></span>`);

/** Rubber stamp. opts: sm, ink (black instead of red), thud (slams down), rot, at (delay). Escapes text. */
export const stamp = (text, { sm = false, ink = false, thud = false, rot = -7, at = '' } = {}) =>
  `<span class="stamp ${sm ? 'sm' : ''} ${ink ? 'ink' : ''} ${thud ? 'thud' : ''}" style="--r:${rot}deg;${at ? `--at:${at};` : ''}">${esc(text)}</span>`;

/** Round "case no. 26" stamp. */
export const roundStamp = (line1, line2) => `<span class="rstamp">${esc(line1)}<br>${esc(line2)}</span>`;

/** Torn kraft label. Escapes text. */
export const kraft = (text, { rot = -1.5, cls = '' } = {}) => `<span class="kraft ${cls}" style="${rotStyle(rot)}">${esc(text)}</span>`;

const TAPE_TEXT = Array(8).fill('crime scene · do not cross').join(' · ');
/** A strip of crime tape across its positioned parent. `style` places it (bottom/top + rotate). */
export const crimeTape = (style = '') => `<span class="ctape" style="${style}" aria-hidden="true">${TAPE_TEXT}</span>`;

/** A blacked-out word, `w` desk units wide. */
export const redact = (w = 12) => `<span class="redact" style="width:calc(var(--u) * ${w})"></span>`;

/** A red pen circle around the positioned parent. */
export const circled = () => `<svg class="circled" viewBox="0 0 100 100" aria-hidden="true"><path pathLength="300" d="M50 6 C 82 4, 97 30, 94 54 C 91 82, 66 97, 44 94 C 16 90, 3 68, 7 44 C 10 20, 30 5, 58 9"/></svg>`;

/** Typewriter text with slightly uneven letters (for titles). Escapes text. */
export const jitter = (text) =>
  [...String(text)]
    .map((ch, i) => (ch === ' ' ? ' ' : `<span class="jit" style="transform:translateY(calc(var(--u) * ${(((i * 37) % 7) - 3) * 0.14})) rotate(${(((i * 53) % 5) - 2) * 0.9}deg);opacity:${0.7 + ((i * 29) % 4) * 0.1}">${esc(ch)}</span>`))
    .join('');

/* ---------- paper goods ---------- */

/** Manila folder. `tab` is the label on the tab (escaped). `inner` is trusted HTML. */
export const folder = (inner, { tab = '', rot = -1, cls = '', style = '' } = {}) =>
  `<div class="folder ${cls}" style="${rotStyle(rot)}${style}">${tab ? `<span class="folder-tab">${esc(tab)}</span>` : ''}${inner}</div>`;

/** The title card: "A weekend in / Pioneer" typed on a ruled index card with the case stamp. */
export const titleCard = ({ small = ['Steph’s birthday', 'weekend in'], big = 'Pioneer', caseNo = 26, rot = 1.4 } = {}) =>
  `<div class="icard" style="${rotStyle(rot)}"><p class="icard-small">${[small].flat().map(jitter).join('<br>')}</p><p class="icard-big">${jitter(big)}</p>
    <svg class="icard-rule" viewBox="0 0 200 20" preserveAspectRatio="none" aria-hidden="true"><path d="M3 12 C 40 5, 90 16, 130 9 S 180 8, 197 11" fill="none" stroke="#B3261E" stroke-width="3" stroke-linecap="round"/></svg>
    <span style="position:absolute;right:calc(var(--u) * 4);top:calc(var(--u) * 3)">${roundStamp('case', `no. ${caseNo}`)}</span></div>`;

/** A photo print. `id` is a file in src/assets/photo (or pass opts.src, a URL). opts: cap (escaped), rot, glow, colour (skip the b&w wash), extra (trusted HTML, e.g. clip()). */
export const polaroid = (id, { cap = '', rot = 0, glow = false, colour = false, extra = '', style = '', alt = '', src = '' } = {}) =>
  `<span class="pol ${cap ? '' : 'no-cap'} ${glow ? 'glow' : ''}" style="${rotStyle(rot)}${style}">${extra}<img class="pol-img" src="${src || photoSrc(id)}" alt="${esc(alt)}" style="${colour ? '' : 'filter:contrast(1.05) brightness(1.15) sepia(.18)'}" loading="lazy">${cap ? `<span class="pol-cap">${esc(cap)}</span>` : ''}</span>`;

/* ---------- suspects ---------- */

/** Booking photo with the name typed under it. opts: out (crossed off), rot, extra (trusted HTML). Escapes name. */
export const mug = (avatar, { name = '', out = false, rot = 0, extra = '', style = '' } = {}) =>
  `<span class="mug ${out ? 'out' : ''} ${name === null ? 'no-name' : ''}" style="${rotStyle(rot)}${style}">${extra}<img class="mug-img" src="${mugSrc(avatar)}" alt="" loading="lazy">${name !== null ? `<span class="mug-name">${esc(name)}</span>` : ''}${
    out ? '<svg class="mug-x" viewBox="0 0 100 100" aria-hidden="true"><path d="M12 14 L88 86 M86 12 L14 88" stroke="#B3261E" stroke-width="5" stroke-linecap="round" fill="none"/></svg>' : ''
  }</span>`;

/** Round face cut from a booking photo. */
export const face = (avatar, { out = false, rot = 0, style = '' } = {}) => {
  const f = FACE[suspectId(avatar)] ?? {};
  return `<span class="face ${out ? 'out' : ''}" style="${rotStyle(rot)}${f.fy ? `--fy:${f.fy};` : ''}${f.zoom ? `--zoom:${f.zoom};` : ''}${style}"><img src="${mugSrc(avatar)}" alt="" loading="lazy"></span>`;
};

/* ---------- the cabin, from above ---------- */

const FLAME = `<svg viewBox="0 0 40 46" aria-hidden="true"><path class="fl" d="M20 4 C 27 13, 33 20, 31 29 C 30 36, 25 40, 20 40 C 14 40, 9 36, 9 29 C 8 22, 15 17, 20 4Z" fill="#E4572E"/><path class="fl b" d="M20 14 C 24 20, 28 25, 27 31 C 26 36, 23 39, 20 39 C 16 39, 13 36, 13 31 C 13 26, 17 22, 20 14Z" fill="#F59E2D"/><path class="fl c" d="M20 24 C 22 28, 24 30, 23 34 C 23 37, 21 38, 20 38 C 18 38, 17 37, 17 34 C 16 31, 19 28, 20 24Z" fill="#FFE08A"/></svg>`;
const EMBERS = [[-3, 2.6, 0], [4, 3.4, 1.1], [-1, 2.9, 1.9], [6, 3.8, 0.5], [-5, 3.1, 2.4]].map(([x, t, d]) => `<span class="ember" style="--x:calc(var(--u) * ${x});--t:${t}s;--d:${d}s"></span>`).join('');

/** Seat position (percent) for player i of n, in one ring up to 8 and two rings beyond. */
function seat(i, n) {
  const outer = n > 8 ? Math.ceil(n * 0.6) : n;
  const inRing = i < outer;
  const count = inRing ? outer : n - outer;
  const k = inRing ? i : i - outer;
  const a = (k / count) * Math.PI * 2 - Math.PI / 2 + (inRing ? 0 : Math.PI / count) + (k % 2 ? 0.07 : -0.05);
  const r = inRing ? (n > 8 ? 33 : 30) : 19;
  return { a, x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * (r - 1) };
}

/**
 * The cabin floor plan with every player by the fire.
 * players: [{ id, name, avatar, alive, honoree }]. opts.enter: Set of ids that should walk in from the door.
 * Each token carries data-id so callers can diff. Escapes names.
 */
export function cabin(players, { enter = new Set() } = {}) {
  const n = players.length;
  const toks = players
    .map((p, i) => {
      const { a, x, y } = seat(i, n);
      const v = (list) => list[i % list.length];
      return `<span class="tok ${n > 8 ? 'small' : ''} ${p.alive === false ? 'out' : ''} ${enter.has(p.id) ? 'enter' : ''}" data-id="${esc(p.id)}" style="--l:${x.toFixed(1)}%;--t:${y.toFixed(1)}%;--sx:${(Math.cos(a) * 26).toFixed(0)}%;--sy:${(Math.sin(a) * 26).toFixed(0)}%;--ix:${v([3, -4, 2, -3, 4, -2, 3])}%;--iy:${v([-3, 2, 4, -2, -3, 3, -4])}%;--ir:${v([4, -5, 3, -4, 5, -3, 4])}deg;--dur:${v([5.2, 6.4, 4.6, 7, 5.8, 6.1, 4.9])}s;--d:${(-i * 0.9).toFixed(1)}s"><span class="tok-shadow"></span>${face(p.avatar, { rot: tilt(i) })}${p.honoree ? '<span class="tok-cake" title="Birthday">🎂</span>' : ''}<span class="tok-name">${esc(p.name)}</span></span>`;
    })
    .join('');
  return `<div class="cabin"><img class="cabin-map" src="${photoSrc('cabin-map')}" alt="The cabin from above, lit by the fire"><span class="cabin-glow"></span><span class="cabin-fire">${FLAME}</span>${EMBERS}${toks}</div>`;
}

/* ---------- pinboard ---------- */

/** Layout slots (percent) for n mugshots pinned on a board, zig-zagging down. */
function boardSlots(n) {
  const cols = n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);
  const w = cols === 2 ? 38 : cols === 3 ? 28 : 21.5;
  return Array.from({ length: n }, (_, i) => {
    const r = Math.floor(i / cols);
    const inRow = Math.min(cols, n - r * cols);
    const c = i % cols;
    const span = 100 - w;
    const step = span / (cols - 1);
    const x = (span - (inRow - 1) * step) / 2 + c * step;
    const y = rows === 1 ? 8 : (r / rows) * 88; // leave room at the bottom for the tape
    return { x: x + (r % 2 ? 2 : -2), y: y + (c % 2 ? 3 : 0), w };
  });
}

/**
 * Suspects pinned to the cork board with red string between them.
 * players: [{ id, name, avatar, alive }]. Wrap in an element with a fixed aspect ratio / height.
 */
export function pinboard(players) {
  const slots = boardSlots(players.length);
  const pts = slots.map((s) => [s.x + s.w / 2, s.y + 2]);
  const order = pts.map((_, i) => i).sort((a, b) => ((a * 7 + 3) % pts.length) - ((b * 7 + 3) % pts.length));
  const d = order.map((i, k) => `${k ? 'L' : 'M'}${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`).join(' ');
  return `<div class="board" style="width:100%;height:100%">
    <svg class="board-string" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${d}"/></svg>
    ${players.map((p, i) => `<div class="board-item drop" data-id="${esc(p.id)}" style="left:${slots[i].x.toFixed(1)}%;top:${slots[i].y.toFixed(1)}%;width:${slots[i].w}%;--i:${i};--r0:${tilt(i + 3)}deg">${mug(p.avatar, { name: p.name, out: p.alive === false, rot: tilt(i), extra: pin('top:calc(var(--u) * -1.6);left:44%') })}</div>`).join('')}
  </div>`;
}

/* ---------- newspaper ---------- */

/**
 * A torn clipping from The Pioneer Gazette.
 * edition: { headline, body, photo (id in assets/photo), tag, weather }. Escapes all text.
 */
export const gazette = ({ headline, body, photo, tag = 'Saturday morning', weather = 'Cloudy, chance of betrayal' }, { spin = false, rot = -1.2 } = {}) =>
  `<article class="news torn ${spin ? 'spin' : ''}" style="--r:${rot}deg"><p class="news-mast">The Pioneer Gazette</p><p class="news-date"><span>${esc(tag)}</span><span>${esc(weather)}</span></p>
    <h3 class="news-hl ${headline.length > 30 ? 'long' : ''}">${esc(headline)}</h3>${photo ? `<img class="news-ph" src="${photoSrc(photo)}" alt="">` : ''}<p class="news-body">${esc(body)}</p></article>`;
