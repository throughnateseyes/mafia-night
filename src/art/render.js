/*
 * Scene renderer: art data → SVG string.
 *
 * Node types an artist can use (all optional fields shown with defaults):
 *
 *   { paper: 'M..Z', fill: 'bone', rough: 1, at: 0, anim: 'pop' }
 *       cut-paper fill with a scissor-cut edge
 *   { blob: 'M..Z', fill: 'terracotta', at: 0, anim: 'grow' }
 *       paper with a mottled, printed grain (the terracotta dot behind a hand)
 *   { ink: 'M.. M..', w: 5, color: 'ink', at: 0, dur: auto, wobble: 1, taper: 0.6 }
 *       brush strokes, drawn on one after another; each "M" starts a new stroke
 *   { group: [...nodes], loop: 'float', origin: 'cx cy', at: 0, anim: 'rise' }
 *       loops: float sway bob flicker blink wave pulse spin drift shake breathe
 *   { text: 'SAM' | slot: 'name', x, y, size: 40, align: 'middle', w: 4.5, color, at, dur }
 *       hand-lettered text in the brush alphabet; `slot` is filled at render time
 *
 * Entrance anims: pop rise drop fade grow slide-l slide-r unfold
 * `at` is seconds from the scene start.
 */
import { brush, hashString, paper, sample, splitSubpaths } from './ink.js';
import { color } from './palette.js';
import { layoutText } from './alphabet.js';

let instance = 0;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const BOIL = 3; // frames of line boil

/**
 * @param {object} art  scene data ({ id, viewBox, tile, layers })
 * @param {object} opts
 * @param {boolean} opts.animate  entrance + draw-on animations (false for static renders)
 * @param {boolean} opts.boil     hand-animated line boil
 * @param {object}  opts.slots    values for { slot } text nodes
 * @param {number}  opts.speed    multiplies all timings (0.5 = twice as fast)
 * @param {number}  opts.delay    seconds added to every `at`
 */
export function renderArt(art, opts = {}) {
  const { animate = true, boil = animate, slots = {}, speed = 1, delay = 0, className = '', label = art.title ?? '' } = opts;
  const id = `a${(instance++).toString(36)}`;
  const base = hashString(art.id ?? 'art');
  const defs = [];
  let nodeIndex = 0;
  const T = (s) => `${((s ?? 0) * speed + delay).toFixed(2)}s`;

  const anim = (node, extra = '') => {
    if (!animate || !node.anim) return extra ? ` style="${extra}"` : '';
    return ` style="--at:${T(node.at)};${extra}"`;
  };
  const animClass = (node) => (animate && node.anim ? ` a-${node.anim}` : '');

  function boiled(make, variants = boil ? BOIL : 1) {
    if (variants === 1) return make(0);
    return `<g class="boil">${Array.from({ length: variants }, (_, i) => make(i).replace('<path', `<path class="b${i}"`)).join('')}</g>`;
  }

  function renderPaper(node, textured) {
    const seed = base + nodeIndex * 97;
    const fill = esc(color(node.fill ?? (textured ? 'terracotta' : 'bone')));
    const filter = textured ? ` filter="url(#${id}-grain)"` : '';
    const opacity = node.opacity != null ? ` opacity="${node.opacity}"` : '';
    const body = boiled((v) => `<path d="${paper(node.paper ?? node.blob, { seed: seed + v, rough: node.rough ?? 1 })}" fill="${fill}"${filter}${opacity}/>`);
    return `<g class="n${animClass(node)}"${anim(node, originStyle(node))}>${body}</g>`;
  }

  function renderInk(node, { strokeColor, w, at, dur, scale = 1 } = {}) {
    const seed = base + nodeIndex * 131;
    const subs = splitSubpaths(node.ink);
    const width = (w ?? node.w ?? 5) / scale;
    const fill = esc(color(strokeColor ?? node.color ?? 'ink'));
    const lens = subs.map((s) => sample(s, Math.max(3, width * 0.9)).len);
    const total = lens.reduce((a, b) => a + b, 0);
    const start = at ?? node.at ?? 0;
    const duration = dur ?? node.dur ?? Math.min(1.6, Math.max(0.3, (total * scale) / 420));
    let t = start;
    const parts = subs.map((sub, i) => {
      const subDur = (duration * lens[i]) / total;
      const strokeOpts = { w: width, wobble: (node.wobble ?? 1) / scale, taper: node.taper ?? 0.6 };
      const shape = boiled((v) => `<path d="${brush(sub, { ...strokeOpts, seed: seed + i * 7 + v })}" fill="${fill}"/>`);
      let out = shape;
      if (animate) {
        const mid = `${id}-m${nodeIndex}-${i}`;
        defs.push(
          `<mask id="${mid}" maskUnits="userSpaceOnUse"><path d="${sub}" pathLength="1" class="draw" fill="none" stroke="#fff" stroke-width="${(width * 2.4 + 6 / scale).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" style="--at:${T(t)};--dur:${(subDur * speed).toFixed(2)}s"/></mask>`,
        );
        out = `<g mask="url(#${mid})">${shape}</g>`;
      }
      t += subDur;
      return out;
    });
    return `<g class="n">${parts.join('')}</g>`;
  }

  function renderText(node) {
    const str = node.slot ? slots[node.slot] ?? '' : node.text;
    if (!str) return '';
    const size = node.size ?? 40;
    const s = size / 100;
    const glyphs = layoutText(String(str), { align: node.align ?? 'middle', maxWidth: node.maxWidth ? node.maxWidth / s : undefined });
    const fit = glyphs.fit ?? 1;
    const sc = s * fit;
    const per = node.dur ? node.dur / Math.max(1, glyphs.items.length) : 0.14;
    const parts = glyphs.items.map((g, i) => {
      nodeIndex++;
      const inner = renderInk({ ink: g.d, wobble: node.wobble ?? 1.2, taper: 0.5 }, {
        strokeColor: node.color,
        w: node.w ?? 4.5,
        scale: sc,
        at: (node.at ?? 0) + i * per,
        dur: per * 1.4,
      });
      return `<g transform="translate(${g.x.toFixed(1)} 0)">${inner}</g>`;
    });
    return `<g class="n lettering" transform="translate(${node.x ?? 0} ${node.y ?? 0}) scale(${sc.toFixed(4)})">${parts.join('')}</g>`;
  }

  function originStyle(node) {
    if (!node.origin) return '';
    const [x, y] = node.origin.split(/[ ,]+/).map(Number);
    return `transform-box:view-box;transform-origin:${x}px ${y}px;`;
  }

  function renderNode(node) {
    nodeIndex++;
    if (node.hidden) return '';
    if (node.paper) return renderPaper(node, false);
    if (node.blob) return renderPaper(node, true);
    if (node.ink) {
      const inner = renderInk(node);
      return node.anim ? `<g class="n${animClass(node)}"${anim(node, originStyle(node))}>${inner}</g>` : inner;
    }
    if (node.text || node.slot) return renderText(node);
    if (node.group) {
      const loop = animate && node.loop ? ` loop-${node.loop}` : '';
      const tr = node.transform ? ` transform="${esc(node.transform)}"` : '';
      const inner = node.group.map(renderNode).join('');
      // entrance anim and loop live on separate wrappers so their transforms don't fight
      const looped = loop
        ? `<g class="n${loop}" style="${originStyle(node)}--loop-at:${T(node.loopAt ?? 0)}">${inner}</g>`
        : inner;
      return `<g class="n${animClass(node)}"${anim(node, originStyle(node))}${tr}>${looped}</g>`;
    }
    return '';
  }

  const body = (art.layers ?? []).map(renderNode).join('');
  const [, , vw, vh] = art.viewBox.split(/[ ,]+/).map(Number);
  const tile = art.tile ? `<rect width="${vw}" height="${vh}" fill="${esc(color(art.tile))}"/>` : '';
  defs.unshift(
    `<filter id="${id}-grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="${base % 97}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 1.32" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter>`,
  );
  const a11y = label ? `role="img" aria-label="${esc(label)}"` : 'aria-hidden="true"';
  return `<svg xmlns="http://www.w3.org/2000/svg" class="art ${className}" viewBox="${art.viewBox}" ${a11y} preserveAspectRatio="${art.fit ?? 'xMidYMid meet'}"><defs>${defs.join('')}</defs>${tile}${body}</svg>`;
}
