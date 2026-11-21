/*
 * Hash router. GitHub Pages has no SPA fallback, so routes live after the #,
 * and the room secrets in QR links never reach any server (fragments aren't sent).
 * A screen may return a cleanup function; it runs before the next screen renders.
 */
const routes = new Map();
let root;
let cleanup = null;

export function route(path, render) {
  routes.set(path, render);
}

export function navigate(path, { replace = false } = {}) {
  const hash = `#${path}`;
  if (location.hash === hash) return render();
  if (replace) {
    history.replaceState(null, '', hash);
    render();
  } else location.hash = path;
}

async function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  const [, first = '', ...rest] = path.split('/');
  const screen = routes.get(`/${first}`) ?? routes.get('/');
  try {
    await cleanup?.();
  } catch {
    /* a screen failing to clean up must not block the next one */
  }
  cleanup = null;
  document.body.className = '';
  window.scrollTo(0, 0);
  root.replaceChildren();
  cleanup = (await screen(root, rest.join('/'))) ?? null;
}

export function start(el) {
  root = el;
  window.addEventListener('hashchange', render);
  render();
}
