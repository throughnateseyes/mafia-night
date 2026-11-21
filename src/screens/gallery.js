/* Every piece of art, animated, for reviewing the illustrations: #/gallery */
import { ART, AVATARS, ICONS, artHTML } from '../art/index.js';
import { renderArt } from '../art/render.js';
import { $, $$, esc } from '../ui/kit.js';

export function renderGallery(root) {
  const all = Object.values(ART);
  root.innerHTML = `
  <main class="view gallery">
    <h1>Art</h1>
    <p class="soft">Tap any piece to replay it. ${all.length} pieces, ${AVATARS.length} badges, ${Object.keys(ICONS).length} icons.</p>
    <div class="g-grid">${all.map((a) => `<figure class="g-item" data-id="${esc(a.id)}"><div class="g-art">${artHTML(a, { slots: { name: 'STEPH' } })}</div><figcaption class="small">${esc(a.id)}</figcaption></figure>`).join('')}</div>
    <h2>Doodles</h2>
    <div class="g-row">${AVATARS.map((a) => `<span class="g-av">${renderArt(a)}</span>`).join('')}</div>
    <h2>Icons</h2>
    <div class="g-row">${Object.entries(ICONS).map(([k, a]) => `<span class="g-ic" title="${esc(k)}">${renderArt(a)}<span class="small">${esc(k)}</span></span>`).join('')}</div>
  </main>`;
  $$('.g-item', root).forEach((f) =>
    f.addEventListener('click', () => {
      $('.g-art', f).innerHTML = artHTML(ART[f.dataset.id], { slots: { name: 'STEPH' } });
    }),
  );
}
