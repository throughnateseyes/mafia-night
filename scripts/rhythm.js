/*
 * Spacing audit, run in the page (scripts/e2e.mjs injects it before every screenshot).
 *
 * For every block of text on screen, it finds the next block of text below it in the same
 * column and measures the gap between them in desk units. With text trimmed to its letters,
 * that gap is the one you see, and it should be one of the steps in tokens.css (2, 4, 8, 12, 16)
 * or the inset (6). Anything else, or two blocks touching, is reported.
 *
 * Returns { u, gaps: [{ a, b, px, units, ok }] }.
 */
(() => {
  const STEPS = [2, 4, 6, 8, 12, 16];
  const TEXT = 'h1, h2, h3, p, dt, dd, legend, .trim';
  const SKIP = '.icard, .news, .ctape, .stamp, .timer, .toast, .sr-only, [inert], .cabin, .board, .peek-pop, .file-cover';
  const scope = document.querySelector('dialog[open]') ?? document;
  const probeHost = scope.querySelector('.guide-page, .sheet-card, .view') ?? document.body;
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:calc(var(--u) * 100);height:0';
  probeHost.append(probe);
  const u = probe.getBoundingClientRect().width / 100;
  probe.remove();

  const name = (el) => {
    const c = [...el.classList].filter((x) => !/^(slide|drop|on-paper|typed)$/.test(x)).slice(0, 2).join('.');
    return `${el.tagName.toLowerCase()}${c ? '.' + c : ''} “${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 24)}”`;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return null;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || Number(cs.opacity) === 0) return null;
    if (r.bottom < 0 || r.top > innerHeight) return null;
    return r;
  };
  // text is only compared with text on the same piece of paper (or the same bare desk); a toolbar is its own strip
  const SURFACE = '.guide-bar, .peekscreen-bar, .role-head, .stage-prop, .folder, .guide-file, .peek-card, .intake, .sheet-card, .narr-paper, .join-card, .dock, .pol, .mug, .verdict, .home-folder';
  // measure the layout, not the tilt: a sheet turned a degree makes every box on it look taller.
  // (!important outranks running animations, and nothing paints while this is on)
  const flat = document.createElement('style');
  flat.textContent = '* { transform: none !important; rotate: none !important; translate: none !important; scale: none !important; }';
  document.head.append(flat);
  const blocks = [...scope.querySelectorAll(TEXT)]
    .filter((el) => !el.closest(SKIP) && !el.querySelector(TEXT))
    .map((el) => ({ el, r: visible(el), on: el.closest(SURFACE) }))
    .filter((b) => b.r);
  flat.remove();

  const gaps = [];
  for (const a of blocks) {
    // the nearest block below, overlapping it sideways, with nothing else in between
    let best = null;
    for (const b of blocks) {
      if (b === a || b.on !== a.on || b.el.contains(a.el) || a.el.contains(b.el)) continue;
      if (b.r.top < a.r.bottom - 2) continue;
      const overlap = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
      if (overlap < Math.min(a.r.width, b.r.width) * 0.3) continue;
      if (!best || b.r.top < best.r.top) best = b;
    }
    if (!best) continue;
    const px = best.r.top - a.r.bottom;
    if (px > u * 20) continue; // far apart: separated by a prop, not a text gap
    const units = px / u;
    const near = STEPS.reduce((m, s) => (Math.abs(s - units) < Math.abs(m - units) ? s : m), STEPS[0]);
    gaps.push({ a: name(a.el), b: name(best.el), px: Math.round(px * 10) / 10, units: Math.round(units * 10) / 10, ok: Math.abs(near - units) <= 0.75 });
  }
  return { u: Math.round(u * 100) / 100, gaps };
})()
