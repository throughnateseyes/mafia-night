#!/usr/bin/env node
/*
 * End-to-end game test: a table screen, five phones and the narrator's phone, each in its own
 * isolated headless-Chrome profile, play a full game over the real relay.
 *
 *   node scripts/e2e.mjs [baseUrl]       default http://localhost:5180/mafia-night/
 *
 * Screenshots land in .art-preview/e2e/. Exits non-zero on any failure or page error.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

const BASE = process.argv[2] ?? 'http://localhost:5180/mafia-night/';
const OUT = process.env.E2E_OUT ?? '.art-preview/e2e';
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = Number(process.env.E2E_PORT ?? 9333);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log('·', ...a);

mkdirSync(OUT, { recursive: true });
const profile = mkdtempSync(join(tmpdir(), 'mn-e2e-'));
const chrome = spawn(
  CHROME,
  [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--hide-scrollbars',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let wsUrl;
for (let i = 0; i < 60 && !wsUrl; i++) {
  try {
    wsUrl = (await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json()).webSocketDebuggerUrl;
  } catch {
    await sleep(200);
  }
}
if (!wsUrl) throw new Error('Chrome did not start');

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) {
    const { res, rej } = pending.get(d.id);
    pending.delete(d.id);
    d.error ? rej(new Error(d.error.message)) : res(d.result);
  } else listeners.forEach((f) => f(d));
});
const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = ++seq;
    const t = setTimeout(() => pending.has(id) && (pending.delete(id), rej(new Error(`${method} timed out`))), 20000);
    pending.set(id, { res: (v) => (clearTimeout(t), res(v)), rej: (e) => (clearTimeout(t), rej(e)) });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const all = [];
const relayLog = [];
const T0 = Date.now();
async function device(name, { w = 390, h = 844, mobile = true } = {}) {
  const { browserContextId } = await send('Target.createBrowserContext');
  const { targetId } = await send('Target.createTarget', { url: 'about:blank', browserContextId });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => send(m, p, sessionId);
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile });
  const errors = [];
  listeners.push((d) => {
    if (d.sessionId !== sessionId) return;
    if (d.method === 'Runtime.exceptionThrown') errors.push(d.params.exceptionDetails.exception?.description ?? d.params.exceptionDetails.text);
    if (d.method === 'Runtime.consoleAPICalled' && String(d.params.args[0]?.value).startsWith('[relay]')) relayLog.push(`${((Date.now() - T0) / 1000).toFixed(1)}s ${name} ${d.params.args[0].value}`);
    if (d.method === 'Runtime.consoleAPICalled' && d.params.type === 'error') errors.push(d.params.args.map((a) => a.value ?? a.description).join(' '));
  });
  const q = JSON.stringify;
  const dev = {
    name,
    errors,
    go: (url) => s('Page.navigate', { url }),
    async eval(expr) {
      const r = await s('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(`${name}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
      return r.result.value;
    },
    async waitFor(expr, ms = 25000) {
      const t = Date.now();
      while (Date.now() - t < ms) {
        try {
          const v = await dev.eval(expr);
          if (v) return v;
        } catch {}
        await sleep(150);
      }
      throw new Error(`${name}: timed out waiting for ${expr}`);
    },
    has: (sel) => dev.waitFor(`!!document.querySelector(${q(sel)})`),
    async click(sel) {
      await dev.waitFor(`(() => { const e = document.querySelector(${q(sel)}); return e && !e.disabled && !e.hidden; })()`);
      await dev.eval(`document.querySelector(${q(sel)}).click()`);
    },
    async clickText(sel, text) {
      await dev.waitFor(`[...document.querySelectorAll(${q(sel)})].some((e) => e.textContent.includes(${q(text)}))`);
      await dev.eval(`[...document.querySelectorAll(${q(sel)})].find((e) => e.textContent.includes(${q(text)})).click()`);
    },
    async shot(file) {
      const { data } = await s('Page.captureScreenshot', { format: 'png' });
      const buf = Buffer.from(data, 'base64');
      writeFileSync(`${OUT}/${file}.png`, buf);
      return buf;
    },
    async shotOf(sel, file) {
      const r = await dev.eval(`(() => { const b = document.querySelector(${q(sel)}).getBoundingClientRect(); return { x: b.x - 24, y: b.y - 24, width: b.width + 48, height: b.height + 48 }; })()`);
      const { data } = await s('Page.captureScreenshot', { format: 'png', clip: { ...r, scale: 1 } });
      const buf = Buffer.from(data, 'base64');
      writeFileSync(`${OUT}/${file}.png`, buf);
      return buf;
    },
    async hold(sel, during) {
      const b = await dev.eval(`(() => { const r = document.querySelector(${q(sel)}).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; })()`);
      await s('Input.dispatchMouseEvent', { type: 'mouseMoved', x: b.x, y: b.y });
      await s('Input.dispatchMouseEvent', { type: 'mousePressed', x: b.x, y: b.y, button: 'left', buttons: 1, clickCount: 1 });
      await during();
      await s('Input.dispatchMouseEvent', { type: 'mouseReleased', x: b.x, y: b.y, button: 'left', buttons: 0, clickCount: 1 });
    },
    text: (sel = 'body') => dev.eval(`document.querySelector(${q(sel)})?.innerText ?? ''`),
  };
  all.push(dev);
  return dev;
}

const checks = [];
const check = (ok, what) => {
  checks.push({ ok: !!ok, what });
  console.log(ok ? '  ✓' : '  ✗', what);
};

try {
  /* ---------- home ---------- */
  log('home');
  const homePhone = await device('home-phone', { w: 375, h: 667 });
  await homePhone.go(BASE);
  await homePhone.has('#host');
  const fps = await homePhone.eval(`new Promise((r) => { let n = 0, worst = 0, last = performance.now(); const t0 = last;
    const f = (now) => { n++; worst = Math.max(worst, now - last); last = now; if (now - t0 < 2000) requestAnimationFrame(f); else r({ fps: Math.round(n / ((now - t0) / 1000)), worst: Math.round(worst) }); };
    requestAnimationFrame(f); })`);
  log(`home frame rate while drawing: ${fps.fps} fps, worst frame ${fps.worst} ms`);
  check(fps.worst < 250, `home never freezes for long while drawing (worst frame ${fps.worst} ms)`);
  await sleep(2000);
  await homePhone.shot('00-home-small-phone');
  check(await homePhone.eval('document.documentElement.scrollHeight <= innerHeight + 1'), 'home fits a small phone without scrolling');

  const table = await device('table', { w: 1280, h: 800, mobile: false });
  await table.go(BASE);
  await table.has('#host');
  await sleep(3500);
  await table.shot('01-home-laptop');
  await table.click('#host');
  await table.waitFor(`!!document.querySelector('.join-card .qr')`, 30000);
  const room = await table.eval(`JSON.parse(localStorage.getItem('mn:host:' + location.hash.split('/')[2]))`);
  const joinLink = `${BASE}#/j/${room.roomId}.${room.rk}.${room.broker}`;
  const narrLink = `${BASE}#/n/${room.roomId}.${room.rk}.${room.nk}.${room.broker}`;
  await sleep(1800);
  await table.shot('02-table-lobby');
  const png = PNG.sync.read(await table.shotOf('.qr-frame', '02b-table-qr'));
  const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  check(decoded?.data === joinLink, `table QR scans to the join link (${decoded ? 'decoded' : 'not decoded'})`);

  /* ---------- players join ---------- */
  log('players join');
  const names = ['Steph', 'Ava', 'Ben', 'Cleo', 'Dev'];
  const phones = [];
  for (const n of names) {
    const p = await device(n);
    await p.go(joinLink);
    phones.push(p);
  }
  for (const [i, p] of phones.entries()) {
    await p.has('#name');
    await p.eval(`(() => {
      const n = document.querySelector('#name');
      n.value = ${JSON.stringify(names[i])};
      n.dispatchEvent(new Event('input', { bubbles: true }));
      const r = document.querySelectorAll('.av input')[${i * 3}];
      r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);
    if (i === 0) {
      await sleep(1500);
      await p.shot('03-join-form');
    }
    await p.eval(`document.querySelector('.join-form').requestSubmit()`);
  }
  await table.waitFor(`document.querySelectorAll('.roster-card .chip').length >= 5`, 40000);
  check(true, 'all five phones show up on the table');
  await Promise.all(phones.map((p) => p.has('.mode-lobby')));
  await sleep(2000);
  await table.shot('04-table-lobby-full');
  await phones[0].shot('05-player-lobby');

  /* ---------- narrator takes over ---------- */
  log('narrator');
  const narr = await device('narrator');
  await narr.go(narrLink);
  await narr.waitFor(`document.querySelectorAll('.narr-roster li').length >= 5`, 40000);
  await sleep(1500);
  await narr.shot('06-narrator-lobby');

  // the tour: mark the birthday girl, then look at the narrator's other tabs and the how-to sheet
  await narr.eval(`[...document.querySelectorAll('.narr-roster li')].find((li) => li.textContent.includes('Steph'))?.querySelector('.narr-cake')?.click()`);
  await sleep(1200);
  await narr.shot('06b-narrator-birthday');
  await table.shot('04b-table-lobby-birthday');
  for (const tab of ['briefing', 'suspects', 'scenes']) {
    await narr.click(`[data-tab="${tab}"]`);
    await sleep(900);
    await narr.shot(`06c-narrator-${tab}`);
  }
  await narr.click('[data-tab="tonight"]');
  await phones[1].click('#how');
  await sleep(1500);
  await phones[1].shot('05b-phone-how-to');
  await phones[1].eval(`document.querySelector('dialog[open] .sheet-x')?.click()`);
  await sleep(500);
  await table.waitFor(`!document.querySelector('#host') && !document.querySelector('.narrator-card')`, 15000).catch(() => {});
  check(!(await table.eval(`!!document.querySelector('.narrator-card')`)), 'table hands control to the narrator phone');

  await narr.click('[data-cmd="deal"]');
  await Promise.all(phones.map((p) => p.has('.mode-reveal')));
  check(true, 'every phone gets a role after one tap');
  await sleep(2200);
  await phones[0].shot('07-reveal-hidden');
  const theirRoles = {};
  for (const [i, p] of phones.entries()) {
    await p.hold('.peek-card', async () => {
      await sleep(i === 0 ? 2600 : 300);
      theirRoles[names[i]] = await p.eval(`document.querySelector('.card-front').dataset.role`);
      if (i === 0) await p.shot('08-reveal-peek');
    });
    await sleep(800);
    check(!(await p.eval(`document.querySelector('.card-front').innerHTML.trim()`)), `${names[i]}: role leaves the page on release`);
    if (i === 0) {
      await sleep(600);
      await p.shot('09-reveal-gotit');
    }
    await p.click('#gotit');
    await p.has('.mode-play');
  }
  const roles = await narr.eval(
    `Object.fromEntries([...document.querySelectorAll('.secret-list li')].map((li) => [li.children[1].textContent, li.querySelector('.chip-role').dataset.role]))`,
  );
  check(names.every((n) => roles[n] === theirRoles[n]), `phones match the narrator's list ${JSON.stringify(roles)}`);
  const counts = Object.values(roles).reduce((a, r) => ((a[r] = (a[r] ?? 0) + 1), a), {});
  check(counts.mafia === 1 && counts.doctor === 1 && counts.detective === 1 && counts.villager === 2, '5 players → 1 mafia, 1 doctor, 1 detective, 2 villagers');
  await sleep(800);
  await phones[0].shot('10-play-day0');
  await narr.shot('11-narrator-dealt');

  /* ---------- night ---------- */
  log('night');
  const who = (role) => Object.keys(roles).filter((n) => roles[n] === role);
  const mafia = who('mafia')[0];
  const victim = who('villager')[0];
  const doctor = who('doctor')[0];
  await narr.click('[data-cmd="night"]');
  await table.waitFor(`document.body.classList.contains('dark')`, 15000);
  await sleep(3200);
  await table.shot('12-table-night');
  await phones[1].shot('13-phone-night');
  await narr.shot('14-narrator-night-0');
  await narr.click('[data-step="1"]');
  await narr.clickText('.pick', victim);
  await sleep(1500);
  await narr.shot('15-narrator-mafia-pick');
  await narr.click('[data-step="2"]');
  await narr.clickText('.pick', doctor);
  await narr.click('[data-step="3"]');
  await narr.clickText('.pick', mafia);
  await narr.has('.verdict.yes');
  check(true, 'detective check on the mafia shows thumbs up');
  await sleep(1000);
  await narr.shot('16-narrator-detective');
  await narr.click('[data-step="4"]');
  await narr.click('[data-cmd="dawn"]');

  /* ---------- morning ---------- */
  log('morning');
  await table.waitFor(`document.querySelector('.stage-caption')?.textContent.includes(${JSON.stringify(victim)})`, 15000);
  check(true, `morning scene names ${victim}`);
  await sleep(3500);
  await table.shot('17-table-morning-dead');
  const victimPhone = phones[names.indexOf(victim)];
  await victimPhone.has('.dock-banner.ghost');
  check(true, `${victim}'s phone shows they're a ghost`);
  await victimPhone.shot('18-phone-ghost');
  await phones[names.indexOf(mafia)].shot('19-phone-mafia-morning');
  await narr.shot('20-narrator-morning');

  /* ---------- a refresh in the middle of the game ---------- */
  log('refresh mid-game');
  await narr.eval('location.reload()');
  await sleep(800);
  await narr.has('[data-talk="2"]');
  check(true, 'narrator phone picks the game back up after a refresh');
  const refreshed = phones[names.indexOf(doctor)];
  await refreshed.eval('location.reload()');
  await sleep(800);
  await refreshed.has('.mode-play');
  await refreshed.waitFor(`document.querySelector('.stage-caption')?.textContent.includes(${JSON.stringify(victim)})`, 20000);
  check(true, 'a player phone keeps its role and the scene after a refresh');

  await narr.click('[data-talk="2"]');
  await narr.has('.timer.big:not([hidden])');
  await sleep(2500);
  await table.shot('21-table-discussion');
  await narr.shot('22-narrator-day');

  /* ---------- rules on a phone ---------- */
  const rulesPhone = phones[names.indexOf(doctor)];
  await rulesPhone.click('#rules');
  await rulesPhone.has('dialog[open] .role-rules');
  await sleep(1500);
  await rulesPhone.shot('23-phone-role-rules');
  check(true, 'rules button opens the role sheet');
  await rulesPhone.eval(`document.querySelector('dialog[open] .sheet-x')?.click()`);

  /* ---------- vote ---------- */
  log('vote');
  await narr.click('[data-cmd="vote"]');
  await sleep(2500);
  await table.shot('24-table-vote');
  await phones[1].shot('24b-phone-vote');
  await narr.shot('24c-narrator-vote');
  await narr.clickText('.pick', mafia);
  await narr.click('dialog[open] #yes');
  await narr.has('[data-cmd="finish"]');
  check(true, 'voting out the only mafia ends the game');
  await table.waitFor(`document.querySelector('.stage-caption')?.textContent.includes(${JSON.stringify(mafia)})`, 15000);
  await sleep(3000);
  await table.shot('25-table-eliminated');
  await phones[1].shot('25b-phone-verdict');
  await narr.shot('25c-narrator-after-vote');
  await narr.click('[data-cmd="finish"]');
  await table.waitFor(`document.querySelector('.stage-caption')?.textContent.toLowerCase().includes('campers got them')`, 15000);
  await sleep(1600);
  await phones[2].shot('26b-phone-case-closed');
  await sleep(1900);
  await table.shot('26-table-town-wins');
  await phones[0].has('#whowas');
  await phones[0].shot('27-phone-end');
  await phones[0].click('#whowas');
  await sleep(1500);
  await phones[0].shot('28-phone-who-was-who');
  await narr.shot('29-narrator-end');

  /* ---------- again ---------- */
  log('play again');
  await narr.click('[data-cmd="again"]');
  await Promise.all(phones.map((p) => p.has('.mode-reveal')));
  check(true, 'play again re-deals to every phone');

  /* ---------- tv ---------- */
  const tv = await device('tv', { w: 1280, h: 720, mobile: false });
  await tv.go(`${BASE}#/tv/${room.roomId}.${room.rk}.${room.broker}`);
  await tv.has('.stage');
  await sleep(3000);
  await tv.shot('30-tv');
  check(true, 'TV link shows the live scene');
} catch (e) {
  check(false, e.message);
} finally {
  for (const d of all) for (const e of d.errors) check(false, `${d.name} page error: ${String(e).split('\n')[0]}`);
  const drops = relayLog.filter((l) => !l.endsWith('online'));
  if (drops.length) console.log('\nrelay events:\n  ' + relayLog.join('\n  '));
  const bad = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - bad.length}/${checks.length} checks passed. Screenshots: ${OUT}/`);
  ws.close();
  chrome.kill();
  await sleep(300);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  process.exit(bad.length ? 1 : 0);
}
