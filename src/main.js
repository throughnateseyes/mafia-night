import '@fontsource-variable/fraunces/full';
import '@fontsource-variable/fraunces/full-italic';
import '@fontsource-variable/inter';
import '@fontsource/big-shoulders-display/latin-700';
import '@fontsource/caveat/latin-500';

import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/setup.css';

import { route, start } from './router.js';
import { renderSetup } from './screens/setup.js';
import { renderDeal } from './screens/deal.js';

route('/', renderSetup);
route('/setup', renderSetup);
route('/deal', renderDeal);

start(document.getElementById('app'));
