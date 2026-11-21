/*
 * Sessions: who this device is in a room, and how it talks to the others.
 *
 *   Host       the one device running the game (the reducer). Starts on the device that
 *              created the room; moves to the narrator's phone when they scan their code.
 *   Player     a phone that joined: sends hello, receives public state + its own role.
 *   Display    a screen showing the public state (the table after handoff, or a TV).
 *
 * Topics (all payloads sealed, see net/crypto.js):
 *   state   retained, room key      public view + host public key + epoch
 *   hello   room key                a player's name, doodle and public key
 *   p/<id>  retained, ECDH key      one player's role
 *   n       retained, narrator key  the full game, so a narrator phone can take over
 */
import { ecdhPair, open, randomId, randomKey, seal, sharedKey } from '../net/crypto.js';
import { joinRelay } from '../net/relay.js';
import { newGame, privateView, publicView, reduce } from './engine.js';

/* ---------- links ---------- */

export const baseUrl = () => `${location.origin}${location.pathname}`;

export function links(room) {
  const b = baseUrl();
  return {
    join: `${b}#/j/${room.roomId}.${room.rk}.${room.broker}`,
    narrator: `${b}#/n/${room.roomId}.${room.rk}.${room.nk}.${room.broker}`,
    tv: `${b}#/tv/${room.roomId}.${room.rk}.${room.broker}`,
    table: `${b}#/t/${room.roomId}`,
  };
}

export function parseRoomArg(arg = '', kind) {
  const parts = arg.split('.');
  if (kind === 'n') {
    const [roomId, rk, nk, broker] = parts;
    return roomId && rk && nk ? { roomId, rk, nk, broker: Number(broker) || 0 } : null;
  }
  const [roomId, rk, broker] = parts;
  return roomId && rk ? { roomId, rk, broker: Number(broker) || 0 } : null;
}

/* ---------- storage ---------- */

const store = {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode: the game still works, it just won't survive a refresh */
    }
  },
  del(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const HOST_KEY = (id) => `mn:host:${id}`;
const ME_KEY = (id) => `mn:me:${id}`;
const LAST_KEY = 'mn:last';

export const savedHost = (roomId) => store.get(HOST_KEY(roomId));
export const lastRoom = () => store.get(LAST_KEY);
export const rememberRoom = (info) => store.set(LAST_KEY, { ...info, at: Date.now() });
export const forgetRoom = () => store.del(LAST_KEY);

/** Create a brand-new room on this device. */
export async function createRoom(broker = 0) {
  const roomId = randomId(10);
  const saved = {
    roomId,
    rk: randomKey(),
    nk: randomKey(),
    broker,
    epoch: 0,
    hostKey: await ecdhPair(),
    origin: 'table',
    demoted: false,
    game: newGame(roomId),
    history: [],
  };
  store.set(HOST_KEY(roomId), saved);
  rememberRoom({ kind: 'table', roomId });
  return saved;
}

/* ---------- host ---------- */

export class Host {
  /**
   * @param {object} saved   persisted host record (see createRoom)
   * @param {'table'|'narrator'} where
   */
  constructor(saved, where, { relay, onChange, onDemote } = {}) {
    this.saved = saved;
    this.where = where;
    this.hid = randomId(6);
    this.relay = relay ?? joinRelay(saved.roomId, saved.broker);
    this.onChange = onChange ?? (() => {});
    this.onDemote = onDemote ?? (() => {});
    this.active = false;
    this.narratorHere = where === 'narrator';
  }

  get game() {
    return this.saved.game;
  }

  /** Learn the highest epoch out there, then take over with a higher one. */
  async start({ maxSeenEpoch = 0 } = {}) {
    const { relay, saved } = this;
    let seen = Math.max(maxSeenEpoch, saved.epoch);
    let otherHost = null;
    relay.on('state', async (text) => {
      const st = await open(saved.rk, text);
      if (!st) return;
      if (!this.active) {
        seen = Math.max(seen, st.epoch ?? 0);
        otherHost = st;
        return;
      }
      const theirs = [st.epoch ?? 0, st.hid ?? ''];
      const mine = [saved.epoch, this.hid];
      if (st.hid !== this.hid && (theirs[0] > mine[0] || (theirs[0] === mine[0] && theirs[1] > mine[1]))) this.demote();
    });
    await relay.ready();
    await new Promise((r) => setTimeout(r, 900)); // let the retained state arrive
    if (this.where === 'table' && otherHost?.host === 'narrator' && otherHost.epoch >= saved.epoch) {
      // the narrator already took over; this device is a display now
      this.demote();
      return false;
    }
    saved.epoch = seen + 1;
    this.active = true;
    relay.on('hello', (text) => this.onHello(text));
    this.publishAll();
    this.beat = setInterval(() => this.publishState(), 20000);
    return true;
  }

  demote() {
    if (this.demoted) return;
    this.demoted = true;
    this.active = false;
    clearInterval(this.beat);
    if (this.where === 'table') {
      this.saved.demoted = true;
      this.persist();
    }
    this.onDemote();
  }

  persist() {
    store.set(HOST_KEY(this.saved.roomId), this.saved);
  }

  async onHello(text) {
    // a device that handed the game over must never answer: its copy of the game is stale
    if (!this.active) return;
    const hello = await open(this.saved.rk, text);
    if (!hello?.id || !this.active) return;
    const before = this.game;
    const after = reduce(before, { type: 'join', ...hello });
    if (after.error) {
      // don't add strangers mid-game, but re-send a known player their role (they reconnected)
      const known = before.players.find((p) => p.id === hello.id);
      if (known) await this.sendPrivate(known);
      return;
    }
    const known = before.players.some((p) => p.id === hello.id);
    this.saved.game = after;
    this.persist();
    if (!known) this.onChange(this.game, { joined: hello.name });
    else this.onChange(this.game, {});
    await this.publishState();
    const p = after.players.find((x) => x.id === hello.id);
    if (p) await this.sendPrivate(p);
  }

  /** Run a narrator command. Returns the error message, if any. */
  async dispatch(cmd) {
    if (!this.active) return 'This device is not running the game.';
    if (cmd.type === 'undo') return this.undo();
    const before = this.game;
    const after = reduce(before, cmd);
    if (after.error) return after.error;
    this.saved.history = [...(this.saved.history ?? []).slice(-24), before];
    this.saved.game = after;
    this.persist();
    this.onChange(after, { cmd });
    const dealt = after.deal !== before.deal || cmd.type === 'lobby' || cmd.type === 'kick';
    await this.publishAll({ privates: dealt });
    if (cmd.type === 'kick') this.relay.pub(`p/${cmd.id}`, '', true);
    return null;
  }

  async undo() {
    const prev = this.saved.history?.pop();
    if (!prev) return 'Nothing to undo.';
    const dealt = prev.deal !== this.game.deal;
    this.saved.game = prev;
    this.persist();
    this.onChange(prev, { cmd: { type: 'undo' } });
    await this.publishAll({ privates: dealt });
    return null;
  }

  setNarratorHere(on) {
    this.narratorHere = on;
    this.publishState();
  }

  async publishState() {
    if (!this.active) return;
    const s = this.saved;
    const view = publicView(s.game, {
      epoch: s.epoch,
      hid: this.hid,
      host: this.where,
      narrator: this.narratorHere,
      hostPub: s.hostKey.pub,
      hb: Date.now(),
    });
    this.relay.pub('state', await seal(s.rk, view), true);
  }

  async sendPrivate(p) {
    if (!p.pub || !this.active) return;
    const view = privateView(this.game, p.id);
    if (!view) {
      this.relay.pub(`p/${p.id}`, '', true);
      return;
    }
    const key = await sharedKey(this.saved.hostKey.priv, p.pub);
    this.relay.pub(`p/${p.id}`, await seal(key, view), true);
  }

  async publishAll({ privates = true } = {}) {
    if (!this.active) return;
    await this.publishState();
    // the full game for a narrator phone to pick up (or resume) the host
    const handoff = { ...this.saved, history: [] };
    this.relay.pub('n', await seal(this.saved.nk, handoff), true);
    if (privates) await Promise.all(this.game.players.map((p) => this.sendPrivate(p)));
  }

  /** Wipe everything this room left on the relay. */
  async close() {
    const { relay } = this;
    for (const p of this.game.players) relay.pub(`p/${p.id}`, '', true);
    relay.pub('state', '', true);
    relay.pub('n', '', true);
    store.del(HOST_KEY(this.saved.roomId));
    forgetRoom();
    this.active = false;
    clearInterval(this.beat);
  }
}

/**
 * Narrator phone: pick up the game. Resumes a host saved on this phone, or takes over
 * from whatever device is running it (via the retained full game on topic `n`).
 */
export function narrate(room, { onChange, onDemote, onStatus } = {}) {
  const relay = joinRelay(room.roomId, room.broker);
  if (onStatus) relay.onStatus(onStatus);
  return new Promise((resolve) => {
    const local = savedHost(room.roomId);
    let done = false;
    const begin = async (saved) => {
      if (done) return;
      done = true;
      saved.origin = saved.origin ?? 'narrator';
      store.set(HOST_KEY(room.roomId), saved);
      rememberRoom({ kind: 'narrator', ...room });
      const host = new Host(saved, 'narrator', { relay, onChange, onDemote });
      await host.start();
      resolve(host);
    };
    relay.on('n', async (text) => {
      const full = await open(room.nk, text);
      if (!full?.game) return;
      // prefer a newer game from the relay over a stale local copy
      if (local && local.nk === room.nk && (local.epoch ?? 0) >= (full.epoch ?? 0) && !local.demoted) return begin(local);
      begin({ ...full, history: local?.history ?? [] });
    });
    // nothing on the relay yet but we have it locally (e.g. relay wiped retained)
    setTimeout(() => {
      if (!done && local && local.nk === room.nk) begin(local);
    }, 4000);
  });
}

/* ---------- players and displays ---------- */

/** Watch the public state of a room. */
export function watch(room, { onState, onStatus } = {}) {
  const relay = joinRelay(room.roomId, room.broker);
  if (onStatus) relay.onStatus(onStatus);
  let last = null;
  relay.on('state', async (text) => {
    const st = await open(room.rk, text);
    if (!st) return;
    if (last && (st.epoch ?? 0) < (last.epoch ?? 0)) return; // stale host
    last = st;
    onState?.(st);
  });
  return { relay, get state() { return last; } };
}

export class Player {
  constructor(room, { onState, onRole, onStatus } = {}) {
    this.room = room;
    this.me = store.get(ME_KEY(room.roomId));
    this.onRole = onRole ?? (() => {});
    this.role = null;
    this.pendingPrivate = null;
    this.watcher = watch(room, {
      onStatus,
      onState: (st) => {
        this.state = st;
        onState?.(st);
        if (this.pendingPrivate) this.readPrivate(this.pendingPrivate);
        if (this.me?.name && !st.players.some((p) => p.id === this.me.id) && st.phase === 'lobby') this.hello();
      },
    });
    // self-heal: in a dealt game but no role yet (a dropped message) → ask the host to re-send it
    this.heal = setInterval(() => {
      const st = this.state;
      if (!this.me?.name || !st || st.phase === 'lobby' || this.role) return;
      if (st.players.some((p) => p.id === this.me.id)) this.hello();
    }, 3000);
    this.relay = this.watcher.relay;
    if (this.me) this.listen();
    this.relay.onStatus((s) => s === 'online' && this.me?.name && this.hello());
  }

  get joined() {
    return Boolean(this.me?.name);
  }

  listen() {
    if (this.listening) return;
    this.listening = true;
    this.relay.on(`p/${this.me.id}`, (text) => this.readPrivate(text));
  }

  async readPrivate(text) {
    if (!text) {
      this.role = null;
      this.onRole(null);
      return;
    }
    const hostPub = this.state?.hostPub;
    if (!hostPub) {
      this.pendingPrivate = text;
      return;
    }
    const key = await sharedKey(this.me.priv, hostPub);
    const view = await open(key, text);
    if (!view) {
      this.pendingPrivate = text; // maybe host changed keys; retry on next state
      return;
    }
    this.pendingPrivate = null;
    this.role = view;
    this.onRole(view);
  }

  async join(name, avatar) {
    if (!this.me) {
      const keys = await ecdhPair();
      this.me = { id: randomId(12), pub: keys.pub, priv: keys.priv };
    }
    Object.assign(this.me, { name: name.trim().slice(0, 16), avatar });
    store.set(ME_KEY(this.room.roomId), this.me);
    rememberRoom({ kind: 'player', ...this.room });
    this.listen();
    await this.hello();
  }

  async hello() {
    if (!this.me?.name) return;
    const { id, name, avatar, pub } = this.me;
    this.relay.pub('hello', await seal(this.room.rk, { id, name, avatar, pub }));
  }

  leave() {
    store.del(ME_KEY(this.room.roomId));
    forgetRoom();
  }
}
