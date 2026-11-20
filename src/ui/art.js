/*
 * Hand-drawn art, as inline SVG.
 *
 * The look: loose ink lines (currentColor) run through the #wobble filter so
 * nothing is perfectly straight, over a soft blob of spot color that sits a
 * little off-register, like a print where the color plate slipped.
 */

/* Spot-color blobs: irregular, never circles. */
const BLOBS = [
  'M30 38 C 42 18, 86 16, 99 40 C 111 62, 101 99, 70 105 C 40 110, 17 91, 21 66 C 23 53, 25 45, 30 38 Z',
  'M24 52 C 26 30, 52 18, 78 24 C 102 30, 108 58, 100 80 C 92 102, 60 110, 40 100 C 22 92, 22 70, 24 52 Z',
  'M36 26 C 58 14, 94 24, 102 50 C 110 76, 92 104, 64 106 C 36 108, 16 88, 18 62 C 19 44, 24 33, 36 26 Z',
];

const ROLE_LINES = {
  // Fedora pulled low, face lost in shadow, sharp collar.
  mafia: `
    <path d="M17 67 C 30 59, 46 62, 60 61 C 76 60, 92 57, 104 64 C 98 72, 80 75, 60 75 C 40 75, 24 74, 17 67 Z"/>
    <path d="M34 63 C 33 48, 36 34, 46 30 C 52 28, 56 34, 60 33 C 65 32, 69 27, 75 30 C 84 35, 87 49, 86 62"/>
    <path d="M60 35 C 59 42, 61 47, 60 53"/>
    <path d="M35 55 C 50 58, 70 58, 86 54"/>
    <path d="M35 60.5 C 50 63.5, 70 63.5, 86 59.5"/>
    <path d="M43 76 C 44 89, 52 97, 60 98 C 68 97, 76 89, 77 76"/>
    <path d="M48 80 L52 79 M57 81 L61 80 M66 80 L70 79" stroke-width="1.6"/>
    <path d="M54 90 C 57 91.5, 63 91.5, 66 90" stroke-width="1.8"/>
    <path d="M30 118 C 36 109, 43 104, 47 103 L60 115 L73 103 C 77 104, 84 109, 90 118"/>
    <path d="M60 115 L56 120 M60 115 L64 120" stroke-width="1.8"/>`,

  // A country doctor's bag, clasped, with a stitched cross.
  doctor: `
    <path d="M22 57 C 22 51, 26 48, 32 48 L 88 48 C 94 48, 98 51, 98 57 L 100 96 C 100 102, 96 105, 90 105 L 30 105 C 24 105, 20 102, 20 96 Z"/>
    <path d="M22 61 C 45 64, 75 64, 98 61"/>
    <path d="M45 48 C 45 34, 50 29, 60 29 C 70 29, 75 34, 75 48"/>
    <path d="M52 48 C 52 39, 55 36, 60 36 C 65 36, 68 39, 68 48" stroke-width="1.8"/>
    <path d="M55 70 L65 70 L65 77 L72 77 L72 86 L65 86 L65 93 L55 93 L55 86 L48 86 L48 77 L55 77 Z"/>
    <path d="M26 99 L94 99" stroke-width="1.6" stroke-dasharray="3 4"/>
    <path d="M57 62 L57 66 M63 62 L63 66" stroke-width="2.8"/>`,

  // Magnifying glass over a fingerprint.
  detective: `
    <path d="M50 21 C 70 20, 84 35, 83 53 C 82 71, 68 84, 50 84 C 32 84, 18 70, 18 52 C 18 35, 31 22, 50 21 Z"/>
    <path d="M71 78 L93 102 C 96 105, 101 102, 100 98 L78 72" stroke-width="2.6"/>
    <path d="M33 54 C 34 42, 41 34, 51 34 C 62 34, 70 42, 70 53 C 70 60, 68 64, 66 68" stroke-width="1.7"/>
    <path d="M38 61 C 36 48, 42 40, 51 40 C 60 40, 65 47, 64 56" stroke-width="1.7"/>
    <path d="M43 65 C 41 54, 45 46, 51 46 C 57 46, 59 51, 59 57 C 59 63, 56 66, 56 71" stroke-width="1.7"/>
    <path d="M48 67 C 47 59, 48 52, 51 52 C 54 52, 54 56, 54 61" stroke-width="1.7"/>
    <path d="M29 40 C 32 34, 37 30, 42 29" stroke-width="2"/>`,

  // An oil lantern: what every villager carries to the outhouse at 2am.
  villager: `
    <path d="M44 31 C 44 15, 76 15, 76 31"/>
    <path d="M41 31 L79 31 L74 39 L46 39 Z"/>
    <path d="M46 39 C 39 52, 39 81, 46 93 L74 93 C 81 81, 81 52, 74 39"/>
    <path d="M53 39 L51 93 M67 39 L69 93" stroke-width="1.7"/>
    <path d="M60 55 C 53 63, 54 74, 60 79 C 66 74, 67 63, 60 55 Z" class="flame"/>
    <path d="M39 93 L81 93 L83 104 L37 104 Z"/>
    <path d="M28 58 L22 55 M27 72 L20 73 M92 58 L98 55 M93 72 L100 73" stroke-width="1.8"/>`,
};

/**
 * A role illustration. `tone` picks which color family the blob uses:
 * 'paper' (deep -ink colors, for ivory cards) or 'night' (bright, for dark).
 */
export function roleArt(roleId, { size = 64, color, blob = true, label = '' } = {}) {
  const lines = ROLE_LINES[roleId];
  const idx = Object.keys(ROLE_LINES).indexOf(roleId);
  const fill = color ?? `var(--color-${roleId === 'villager' ? 'town' : roleId})`;
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `
  <svg class="role-art" viewBox="0 0 120 120" width="${size}" height="${size}" ${a11y}>
    ${blob ? `<path d="${BLOBS[idx % BLOBS.length]}" fill="${fill}" opacity="0.55" transform="translate(5 4)" class="wobble"/>` : ''}
    <g class="ink wobble">${lines}</g>
  </svg>`;
}

/** A pine with ragged, hand-cut tiers. */
function pine(x, base, h, w) {
  const tiers = 4;
  let d = `M${x} ${base - h}`;
  for (let i = 1; i <= tiers; i++) {
    const y = base - h + (h * 0.92 * i) / tiers;
    const half = (w / 2) * (i / tiers);
    const jitter = (i % 2 ? 1.5 : -1.2);
    d += ` L${(x + half).toFixed(1)} ${(y + jitter).toFixed(1)} L${(x + half * 0.45).toFixed(1)} ${(y - 2).toFixed(1)}`;
  }
  d += ` L${x + 2} ${base - h * 0.08} L${x + 2} ${base}`;
  d += ` M${x - 2} ${base} L${x - 2} ${base - h * 0.08}`;
  for (let i = tiers; i >= 1; i--) {
    const y = base - h + (h * 0.92 * i) / tiers;
    const half = (w / 2) * (i / tiers);
    const jitter = (i % 2 ? -1 : 1.4);
    d += ` L${(x - half * 0.45).toFixed(1)} ${(y - 2).toFixed(1)} L${(x - half).toFixed(1)} ${(y + jitter).toFixed(1)}`;
  }
  return `<path d="${d} L${x} ${base - h}"/>`;
}

/** String lights sagging along a line, each bulb a candle-colored dot. */
function stringLights(x1, y1, x2, y2, sag, n) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = x1 + (x2 - x1) * t;
    const y = y1 + (y2 - y1) * t + Math.sin(Math.PI * t) * sag;
    pts.push([x, y]);
  }
  const wire = `M${pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L')}`;
  const bulbs = pts
    .slice(1, -1)
    .map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${(y + 3).toFixed(1)}" r="2.3" class="bulb" style="animation-delay:${(i * 0.37) % 2}s"/>`)
    .join('');
  return `<path d="${wire}" class="ink" stroke-width="1.2" opacity="0.7"/>${bulbs}`;
}

/** Title illustration: the cabin, the pines, the moon, and one figure in the window. */
export function cabinScene() {
  return `
  <svg class="cabin-scene" viewBox="0 0 360 210" role="img" aria-label="A cabin in the pines at night. Someone in a fedora stands in the lit window.">
    <g class="stars" fill="currentColor">
      <path d="M40 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z"/>
      <path d="M118 18 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z"/>
      <path d="M232 26 l1 3 3 1 -3 1 -1 3 -1 -3 -3 -1 3 -1z"/>
      <path d="M186 50 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1z"/>
      <path d="M82 62 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1z"/>
      <path d="M338 92 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1z"/>
    </g>

    <!-- moon with a bite out of it -->
    <path d="M296 22 C 280 24, 272 40, 278 54 C 284 67, 300 72, 312 66 C 300 64, 290 54, 290 42 C 290 32, 294 26, 296 22 Z" fill="var(--color-candle)" opacity="0.9" class="wobble"/>

    <g class="ink wobble">
      <!-- pines -->
      ${pine(34, 178, 92, 50)}
      ${pine(72, 180, 120, 62)}
      ${pine(104, 178, 70, 40)}
      ${pine(262, 178, 84, 46)}
      ${pine(300, 180, 126, 64)}
      ${pine(336, 178, 78, 42)}

      <!-- cabin -->
      <path d="M134 124 L134 176 L230 176 L230 124"/>
      <path d="M122 128 L182 84 L242 128"/>
      <path d="M128 124 L182 90 L236 124" stroke-width="1.4"/>
      <path d="M206 102 L206 82 L219 82 L219 112"/>
      <path d="M134 134 L230 134 M134 144 L164 144 M200 144 L230 144 M134 154 L148 154 M170 154 L192 154 M134 164 L148 164 M170 164 L230 164" stroke-width="1.3" opacity="0.6"/>
      <path d="M148 176 L148 142 C 148 138, 151 136, 155 136 L163 136 C 167 136, 170 138, 170 142 L170 176"/>
      <circle cx="165" cy="158" r="1.4" fill="currentColor"/>
      <!-- smoke -->
      <path d="M212 76 C 205 68, 219 62, 212 54 C 205 46, 217 40, 213 32" stroke-width="1.6" opacity="0.6" class="smoke"/>
      <!-- steps -->
      <path d="M144 176 L144 181 L174 181 L174 176 M140 181 L140 186 L178 186 L178 181" stroke-width="1.6"/>
      <!-- ground -->
      <path d="M0 180 C 60 175, 120 184, 180 186 C 240 188, 300 176, 360 179" stroke-width="1.8"/>
      <path d="M20 192 C 70 189, 110 196, 150 194 M210 196 C 260 193, 300 198, 345 192" stroke-width="1.2" opacity="0.5"/>
    </g>

    <!-- the lit window and who is in it -->
    <rect x="186" y="140" width="32" height="24" rx="2" fill="var(--color-candle)" class="window-glow"/>
    <g fill="var(--color-bg)">
      <path d="M195 164 C 195 158, 198 155, 202 155 C 206 155, 209 158, 209 164 Z"/>
      <circle cx="202" cy="151.5" r="3.6"/>
      <path d="M195.5 149.5 C 197 149, 207 149, 208.5 149.5 L 207 148 C 206 145, 205 144, 202 144 C 199 144, 198 145, 197 148 Z"/>
    </g>
    <g class="ink wobble">
      <rect x="186" y="140" width="32" height="24" rx="2"/>
      <path d="M202 140 L202 146 M186 152 L194 152 M210 152 L218 152" stroke-width="1.6"/>
    </g>

    <!-- birthday string lights along the eave -->
    ${stringLights(124, 128, 182, 86, 6, 7)}
    ${stringLights(182, 86, 240, 128, 6, 7)}
  </svg>`;
}

/** Tiny figure for the lineup. Colored by team; the host's eyes only. */
export function suspect(roleId) {
  return `
  <svg class="suspect" data-role="${roleId}" viewBox="0 0 24 40" aria-hidden="true">
    <path class="suspect-body" d="M4 39 C 4 28, 7 23, 12 23 C 17 23, 20 28, 20 39 Z"/>
    <circle class="suspect-body" cx="12" cy="16" r="5"/>
    <path class="suspect-hat" d="M3.5 12.5 C 6 11.5, 18 11.5, 20.5 12.5 L 18 10.5 C 17 6, 15.5 5, 12 5 C 8.5 5, 7 6, 6 10.5 Z"/>
  </svg>`;
}

export const icons = {
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ink wobble" d="M5 12.5 C 9 11.6, 15 12.4, 19 11.8" stroke-width="2.6"/></svg>',
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ink wobble" d="M5 12.5 C 9 11.6, 15 12.4, 19 11.8 M12.3 5 C 11.6 9, 12.4 15, 11.8 19" stroke-width="2.6"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="ink wobble" d="M6 6.5 C 10 10, 14 14, 18 17.5 M17.5 6 C 14 10, 10 14, 6.5 18" stroke-width="2.4"/></svg>',
  cards: '<svg viewBox="0 0 32 32" aria-hidden="true" width="26" height="26"><g class="ink wobble" stroke-width="2"><path d="M7 8 L19 5 L24 25 L12 28 Z"/><path d="M13 7 L25 7 L25 27" opacity="0.7"/></g></svg>',
};
