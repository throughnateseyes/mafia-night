/*
 * Hash router. GitHub Pages has no SPA fallback, so routes live after the #
 * and a refresh or a scanned QR link always lands on index.html.
 */
const routes = new Map();
let root;

export function route(path, render) {
  routes.set(path, render);
}

export function navigate(path) {
  if (location.hash === `#${path}`) render();
  else location.hash = path;
}

function render() {
  const path = location.hash.replace(/^#/, '') || '/';
  const [, first = '', ...rest] = path.split('/');
  const render = routes.get(`/${first}`) ?? routes.get('/');
  window.scrollTo(0, 0);
  render(root, rest.join('/'));
}

export function start(el) {
  root = el;
  window.addEventListener('hashchange', render);
  render();
}
