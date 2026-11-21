/*
 * Title lockup: "MAFIA NIGHT".
 * MAFIA big and a little jostled, like it was lettered fast on a poster;
 * NIGHT smaller between two brush rules, and its I is a birthday candle
 * whose flame (the one accent) pops last and flickers.
 *
 * Letters are the brush-alphabet glyphs, placed by hand: each gets its own
 * scale, offset and tilt (applied by `place`, which just returns path data).
 */

// glyph centerlines from src/art/alphabet.js (copied: art modules stay import-free)
const G = {
  M: 'M5 101 C 6 67, 8 34, 10 1 M10 2 C 20 30, 31 58, 39 84 C 46 58, 57 30, 68 1 M68 1 C 70 34, 71 66, 73 101',
  A: 'M35 -1 C 27 30, 15 66, 4 101 M30 2 C 40 36, 50 70, 61 101 M10 73 C 24 70, 40 70, 57 71',
  F: 'M10 2 C 9 36, 11 70, 10 101 M3 2 C 18 2, 32 1, 48 -2 M3 51 C 16 50, 30 49, 43 46',
  I: 'M10 0 C 9 35, 11 70, 9 100',
  N: 'M8 101 C 8 67, 8 34, 9 2 M9 2 C 24 34, 39 66, 53 100 M53 101 C 53 66, 52 34, 54 -2',
  G: 'M57 19 C 50 5, 39 0, 31 1 C 12 3, 4 28, 4 52 C 4 80, 16 101, 33 100 C 46 99, 54 91, 57 80 M33 57 C 42 56, 50 55, 58 55 C 58 72, 58 88, 59 104',
  H: 'M9 1 C 8 35, 10 70, 9 100 M52 0 C 53 34, 51 68, 52 100 M3 52 C 20 50, 40 49, 58 45',
  T: 'M1 3 C 18 1, 38 2, 56 -1 M29 2 C 28 36, 30 70, 28 101',
};

/** Scale a glyph by s, tilt it `rot` degrees about (cx, 50), then move it to (x, y). */
function place(d, { x, y, s, rot = 0, cx = 30 }) {
  const a = (rot * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const r = (v) => Math.round(v * 10) / 10;
  return d.replace(/(-?\d+(?:\.\d+)?)[ ,]+(-?\d+(?:\.\d+)?)/g, (_, px, py) => {
    const dx = Number(px) - cx;
    const dy = Number(py) - 50;
    return `${r(x + (cx + dx * cos - dy * sin) * s)} ${r(y + (50 + dx * sin + dy * cos) * s)}`;
  });
}

/** Go over some strokes twice, nudged sideways: a letterer's heavy downstroke. */
function heavy(d, which, nudge = 2.1) {
  const subs = d.split(/(?=M)/).map((x) => x.trim());
  return subs
    .flatMap((sub, i) => (which.includes(i) ? [sub, sub.replace(/(-?\d+(?:\.\d+)?)([ ,]+-?\d+(?:\.\d+)?)/g, (_, px, rest) => `${Math.round((Number(px) + nudge) * 10) / 10}${rest}`)] : [sub]))
    .join(' ');
}

const S1 = 1.1; // MAFIA
const X1 = 53;
const Y1 = 18;
const S2 = 0.5; // NIGHT
const X2 = 116;
const Y2 = 158;

export default {
  id: 'title',
  title: 'Mafia Night',
  viewBox: '0 0 400 230',
  tile: null,
  layers: [
    // MAFIA
    { ink: place(heavy(G.M, [2]).replace(' M68 1', ' M12.2 3 C 22.2 31, 32.8 58, 40.6 81 M68 1'), { x: X1 + 0 * S1, y: Y1, s: S1, rot: -2, cx: 39 }), w: 7, taper: 0.4, at: 0.1, dur: 0.3 },
    { ink: place(heavy(G.A, [1]), { x: X1 + 76 * S1, y: Y1 + 3, s: S1, rot: 2.5, cx: 32 }), w: 7, taper: 0.4, at: 0.4, dur: 0.24 },
    { ink: place(heavy(G.F, [0]), { x: X1 + 136 * S1, y: Y1 - 2, s: S1, rot: -1.5, cx: 24 }), w: 7, taper: 0.4, at: 0.64, dur: 0.18 },
    { ink: place(heavy(G.I, [0]), { x: X1 + 183 * S1, y: Y1 + 2, s: S1, rot: 3, cx: 10 }), w: 7, taper: 0.4, at: 0.82, dur: 0.1 },
    { ink: place(heavy(G.A, [1]), { x: X1 + 204 * S1, y: Y1 - 1, s: S1, rot: -2, cx: 32 }), w: 7, taper: 0.4, at: 0.92, dur: 0.24 },

    // rules either side of NIGHT
    { ink: 'M48 185 C 64 184, 86 184, 104 182', w: 4.5, at: 1.16, dur: 0.1 },
    { ink: 'M297 183 C 314 182, 334 183, 353 181', w: 4.5, at: 1.22, dur: 0.1 },

    // NIGHT, the I is a candle
    { ink: place(G.N, { x: X2 + 0 * S2, y: Y2, s: S2, rot: -1, cx: 31 }), w: 5, at: 1.26, dur: 0.12 },
    { ink: 'M158 208 L158.5 167 L169 166 L169.5 208 Z M158.5 181 L169 174 M158.5 197 L169.5 190 M163.8 166 C 163 163, 164.5 160, 163.5 157', w: 3.5, at: 1.38, dur: 0.14 },
    { ink: place(G.G, { x: X2 + 124 * S2, y: Y2 - 1, s: S2, rot: 1, cx: 32 }), w: 5, at: 1.52, dur: 0.12 },
    { ink: place(G.H, { x: X2 + 204 * S2, y: Y2 + 1, s: S2, rot: -1, cx: 30 }), w: 5, at: 1.62, dur: 0.1 },
    { ink: place(G.T, { x: X2 + 278 * S2, y: Y2 - 1, s: S2, rot: 1.5, cx: 28 }), w: 5, at: 1.7, dur: 0.1 },

    // the flame: the only color
    {
      group: [{ paper: 'M165 136 C 158 145, 156 152, 159 156 C 161 159, 167 159, 169 155 C 171 150, 169 143, 165 136 Z', fill: 'candle', rough: 0.5 }],
      anim: 'pop',
      at: 1.86,
      loop: 'flicker',
      origin: '163.5 158',
      loopAt: 2.1,
    },
  ],
};
