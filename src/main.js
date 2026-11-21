import '@fontsource/special-elite/400.css';
import '@fontsource/courier-prime/400.css';
import '@fontsource/courier-prime/700.css';
import '@fontsource/reenie-beanie/400.css';
import '@fontsource/pirata-one/400.css';
import '@fontsource/playfair-display/900.css';
import '@fontsource/im-fell-english/400.css';
import '@fontsource/im-fell-english/400-italic.css';
import '@fontsource/bevan/400.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/art.css';
import './styles/props.css';
import './styles/stage.css';
import './styles/rules.css';
import './styles/home.css';
import './styles/player.css';
import './styles/narrator.css';
import './styles/display.css';

import { installDesk } from './ui/props.js';
import { route, start } from './router.js';
import { renderHome } from './screens/home.js';
import { renderTable } from './screens/table.js';
import { renderPlayer } from './screens/player.js';
import { renderNarrator } from './screens/narrator.js';
import { renderTV } from './screens/display.js';
import { renderGallery } from './screens/gallery.js';

installDesk();

route('/', renderHome);
route('/t', renderTable);
route('/j', renderPlayer);
route('/n', renderNarrator);
route('/tv', renderTV);
route('/gallery', renderGallery);

start(document.getElementById('app'));
