import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/instrument-sans/wght.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/art.css';
import './styles/ui.css';
import './styles/screens.css';

import { route, start } from './router.js';
import { renderHome } from './screens/home.js';
import { renderTable } from './screens/table.js';
import { renderPlayer } from './screens/player.js';
import { renderNarrator } from './screens/narrator.js';
import { renderTV } from './screens/display.js';
import { renderGallery } from './screens/gallery.js';

route('/', renderHome);
route('/t', renderTable);
route('/j', renderPlayer);
route('/n', renderNarrator);
route('/tv', renderTV);
route('/gallery', renderGallery);

start(document.getElementById('app'));
