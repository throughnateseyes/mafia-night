/*
 * The brush. Pure JS (runs in the browser and in Node for the render script).
 *
 * An artist writes a centerline (any SVG path). We sample it, wobble it with
 * smooth seeded noise, vary the pressure along its length, and hand it to
 * perfect-freehand, which returns the outline of a tapered ink stroke.
 * Paper shapes get the same treatment on their edges so nothing is machine-perfect.
 */
import { getStroke } from 'perfect-freehand';
import { svgPathProperties } from 'svg-path-properties';

/* ---------- seeded randomness ---------- */

export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth 1D value noise in [-1, 1]. */
function noise1d(seed) {
  const rand = prng(seed);
  const lattice = Array.from({ length: 64 }, () => rand() * 2 - 1);
  return (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    const a = lattice[((i % 64) + 64) % 64];
    const b = lattice[(((i + 1) % 64) + 64) % 64];
    return a + (b - a) * u;
  };
}

export function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/* ---------- path sampling ---------- */

/** Split "M.. M.." into subpaths. Subpaths must start with an absolute M. */
export function splitSubpaths(d) {
  return d
    .trim()
    .split(/(?=M)/)
    .map((s) => s.trim())
    .filter(Boolean);
}

const sampleCache = new Map();

/** Points along a single subpath, roughly `step` apart. */
export function sample(d, step = 3.5) {
  const key = `${step}|${d}`;
  if (sampleCache.has(key)) return sampleCache.get(key);
  const props = new svgPathProperties(d);
  const len = props.getTotalLength();
  const n = Math.max(2, Math.ceil(len / step));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const p = props.getPointAtLength((len * i) / n);
    pts.push([p.x, p.y]);
  }
  const out = { pts, len };
  sampleCache.set(key, out);
  return out;
}

/* ---------- outline → path ---------- */

const avg = (a, b) => (a + b) / 2;
const r1 = (v) => Math.round(v * 10) / 10;

export function outlineToPath(points, closed = true) {
  const len = points.length;
  if (len < 4) return '';
  // each sampled point is a control point; segments end at the midpoints between points.
  // (Chaining T instead reflects the previous control point, which makes edges saw-tooth.)
  const mid = (i) => {
    const a = points[i % len];
    const b = points[(i + 1) % len];
    return `${r1(avg(a[0], b[0]))} ${r1(avg(a[1], b[1]))}`;
  };
  let d = closed ? `M${mid(0)}` : `M${r1(points[0][0])} ${r1(points[0][1])}`;
  const last = closed ? len : len - 1;
  for (let i = 1; i <= last; i++) {
    const p = points[i % len];
    d += `Q${r1(p[0])} ${r1(p[1])} ${mid(i)}`;
  }
  return closed ? `${d}Z` : d;
}

/* ---------- brush stroke ---------- */

/**
 * One tapered brush stroke along a single subpath.
 * @param {string} d       centerline (single subpath)
 * @param {object} o
 * @param {number} o.w     nominal width in viewBox units
 * @param {number} o.seed  variant seed (boil frames use seed, seed+1, seed+2)
 * @param {number} o.wobble  how far the line drifts off the centerline
 * @param {number} o.taper   0..1, how much the ends thin out
 */
export function brush(d, { w = 5, seed = 1, wobble = 1, taper = 0.6, pressure = 0.35 } = {}) {
  const { pts, len } = sample(d, Math.max(3, w * 0.9));
  const nx = noise1d(seed * 7 + 1);
  const ny = noise1d(seed * 13 + 5);
  const np = noise1d(seed * 31 + 9);
  const freq = 1 / 38; // one wobble every ~38 units
  const closed = Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) < 0.5;
  const input = pts.map(([x, y], i) => {
    const t = (i / (pts.length - 1)) * len * freq;
    return [x + nx(t) * wobble, y + ny(t) * wobble, 0.55 + np(t * 0.55) * pressure];
  });
  if (closed) {
    // overlap the start a little so closed loops don't show a seam
    input.push(...input.slice(1, 4));
  }
  const taperLen = closed ? 0 : Math.min(len * 0.35, w * 6) * taper;
  const outline = getStroke(input, {
    size: w,
    thinning: 0.5,
    smoothing: 0.85,
    streamline: 0.45,
    simulatePressure: false,
    start: { taper: taperLen, cap: true },
    end: { taper: taperLen * 1.3, cap: true },
    last: true,
  });
  return outlineToPath(outline);
}

/* ---------- cut paper ---------- */

/** A filled shape whose edge is slightly irregular, like it was cut with scissors. */
export function paper(d, { seed = 1, rough = 1 } = {}) {
  return splitSubpaths(d)
    .map((sub) => {
      const { pts, len } = sample(sub, 3);
      const n = noise1d(seed * 17 + 3);
      // offset each point along its normal
      const out = pts.map(([x, y], i) => {
        const p0 = pts[Math.max(0, i - 1)];
        const p1 = pts[Math.min(pts.length - 1, i + 1)];
        const dx = p1[0] - p0[0];
        const dy = p1[1] - p0[1];
        const m = Math.hypot(dx, dy) || 1;
        const off = n((i / pts.length) * (len / 22)) * rough;
        return [x + (-dy / m) * off, y + (dx / m) * off];
      });
      return outlineToPath(out);
    })
    .join('');
}
