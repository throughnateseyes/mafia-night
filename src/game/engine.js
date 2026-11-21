/*
 * The game, as a pure reducer: reduce(state, command) → new state.
 * No network, no crypto, no DOM. The host runs it; tests run it directly.
 */
import { PLAYER_LIMITS, REVEAL_ROLE_ON_DEATH, ROLES } from '../config/game.js';
import { roleList, shuffle } from './roles.js';

export const PHASES = ['lobby', 'dealt', 'night', 'morning', 'day', 'vote', 'end'];

export function newGame(roomId) {
  return {
    roomId,
    phase: 'lobby',
    round: 0,
    deal: 0, // increments every time roles are (re)dealt
    players: [],
    night: null, // { step, target, save, check }
    lastSave: null,
    scene: { key: 'lobby', at: 0 },
    timer: null, // { ends, total } ms epoch
    winner: null,
    reveal: REVEAL_ROLE_ON_DEATH,
    log: [],
  };
}

const clone = (s) => structuredClone(s);
const alive = (s) => s.players.filter((p) => p.alive);
export const playerById = (s, id) => s.players.find((p) => p.id === id);

export function checkWinner(s) {
  if (!s.players.some((p) => p.role)) return null;
  const living = alive(s);
  const mafia = living.filter((p) => ROLES[p.role]?.team === 'mafia').length;
  const town = living.length - mafia;
  if (mafia === 0) return 'town';
  if (mafia >= town) return 'mafia';
  return null;
}

function setScene(s, key, extra = {}, now) {
  s.scene = { key, at: now, ...extra };
}

function kill(s, id, cause, now) {
  const p = playerById(s, id);
  if (!p || !p.alive) return null;
  p.alive = false;
  p.died = { round: s.round, cause, at: now };
  return p;
}

function deathScene(s, key, p, now) {
  setScene(s, key, { name: p.name, role: s.reveal ? p.role : null, victim: p.id, avatar: p.avatar, bday: Boolean(p.bday) }, now);
}

/**
 * Apply one command. Unknown or invalid commands return the state unchanged
 * (with `error` set on the returned object so the narrator UI can explain).
 */
export function reduce(state, cmd, now = Date.now()) {
  const s = clone(state);
  delete s.error;
  const fail = (error) => ({ ...state, error });

  switch (cmd.type) {
    case 'join': {
      const name = String(cmd.name ?? '').trim().slice(0, 16);
      if (!cmd.id || !name) return fail('A name is needed to join.');
      const existing = playerById(s, cmd.id);
      if (existing) {
        Object.assign(existing, { name, avatar: cmd.avatar ?? existing.avatar, pub: cmd.pub ?? existing.pub, seen: now });
        return s;
      }
      if (s.phase !== 'lobby') return fail('The game already started.');
      if (s.players.length >= PLAYER_LIMITS.max) return fail(`The table is full (${PLAYER_LIMITS.max}).`);
      s.players.push({ id: cmd.id, name, avatar: cmd.avatar ?? 0, pub: cmd.pub ?? null, role: null, alive: true, joined: now, seen: now });
      return s;
    }

    case 'kick': {
      if (s.phase !== 'lobby' && s.phase !== 'end') return fail('Players can only be removed between games.');
      s.players = s.players.filter((p) => p.id !== cmd.id);
      return s;
    }

    case 'deal': {
      if (s.phase !== 'lobby' && s.phase !== 'end') return fail('Roles are already out.');
      const n = s.players.length;
      if (n < PLAYER_LIMITS.min) return fail(`Need at least ${PLAYER_LIMITS.min} players (have ${n}).`);
      const roles = shuffle(roleList(n));
      s.players.forEach((p, i) => {
        p.role = roles[i];
        p.alive = true;
        delete p.died;
      });
      Object.assign(s, { phase: 'dealt', round: 0, deal: s.deal + 1, night: null, lastSave: null, winner: null, timer: null, log: [] });
      setScene(s, 'dealt', {}, now);
      return s;
    }

    case 'night': {
      if (!['dealt', 'morning', 'day', 'vote'].includes(s.phase)) return fail('Not the time for night.');
      if (s.winner) return fail('The game is over.');
      s.phase = 'night';
      s.round += 1;
      s.night = { step: 0, target: null, save: null, check: null };
      s.timer = null;
      setScene(s, 'night', {}, now);
      return s;
    }

    case 'step': {
      if (s.phase !== 'night') return fail('It is not night.');
      s.night.step = Math.max(0, Math.min(cmd.step, 10));
      return s;
    }

    case 'pick': {
      if (s.phase !== 'night') return fail('It is not night.');
      if (!['target', 'save', 'check'].includes(cmd.kind)) return fail('Unknown pick.');
      const p = cmd.id ? playerById(s, cmd.id) : null;
      if (cmd.id && (!p || !p.alive)) return fail('Pick someone who is still alive.');
      if (cmd.kind === 'save' && cmd.id && cmd.id === s.lastSave) return fail('The Medic saved them last night. Pick someone else.');
      s.night[cmd.kind] = cmd.id ?? null;
      return s;
    }

    case 'dawn': {
      if (s.phase !== 'night') return fail('It is not night.');
      const { target, save, check } = s.night;
      s.lastSave = save;
      const saved = target && target === save;
      const victim = target && !saved ? kill(s, target, 'mafia', now) : null;
      s.log.push({ round: s.round, target, save, check, saved: Boolean(saved), died: victim?.id ?? null });
      s.phase = 'morning';
      s.night = null;
      if (victim) deathScene(s, 'dead', victim, now);
      else setScene(s, 'clear', {}, now);
      s.winner = checkWinner(s);
      return s;
    }

    case 'talk': {
      if (!['morning', 'vote', 'day'].includes(s.phase)) return fail('Not the time for talk.');
      s.phase = 'day';
      s.timer = cmd.minutes ? { ends: now + cmd.minutes * 60000, total: cmd.minutes * 60000 } : null;
      setScene(s, 'talk', {}, now);
      return s;
    }

    case 'timer': {
      s.timer = cmd.minutes ? { ends: now + cmd.minutes * 60000, total: cmd.minutes * 60000 } : null;
      return s;
    }

    case 'vote': {
      if (!['morning', 'day'].includes(s.phase)) return fail('Not the time to vote.');
      s.phase = 'vote';
      s.timer = null;
      setScene(s, 'vote', {}, now);
      return s;
    }

    case 'eliminate': {
      if (s.phase !== 'vote') return fail('Start the vote first.');
      if (cmd.id) {
        const p = kill(s, cmd.id, 'vote', now);
        if (!p) return fail('They are already out.');
        deathScene(s, 'out', p, now);
      } else {
        setScene(s, 'hung', {}, now);
      }
      s.log.push({ round: s.round, voted: cmd.id ?? null });
      s.phase = 'morning'; // "after the vote" behaves like morning: talk, vote again, or night
      s.winner = checkWinner(s);
      return s;
    }

    case 'finish': {
      const winner = s.winner ?? checkWinner(s);
      if (!winner) return fail('Nobody has won yet.');
      s.winner = winner;
      s.phase = 'end';
      s.timer = null;
      setScene(s, winner, {}, now);
      return s;
    }

    case 'again': {
      // same people, fresh roles
      s.phase = 'lobby';
      return reduce(s, { type: 'deal' }, now);
    }

    case 'lobby': {
      Object.assign(s, { phase: 'lobby', round: 0, night: null, lastSave: null, winner: null, timer: null, log: [] });
      s.players.forEach((p) => {
        p.role = null;
        p.alive = true;
        delete p.died;
      });
      setScene(s, 'lobby', {}, now);
      return s;
    }

    case 'scene': {
      if (!cmd.key) return fail('Which scene?');
      setScene(s, cmd.key, cmd.extra ?? {}, now);
      return s;
    }

    case 'kill':
    case 'revive': {
      const p = playerById(s, cmd.id);
      if (!p) return fail('Unknown player.');
      if (cmd.type === 'kill') kill(s, p.id, 'narrator', now);
      else {
        p.alive = true;
        delete p.died;
      }
      s.winner = checkWinner(s);
      return s;
    }

    case 'reveal': {
      s.reveal = Boolean(cmd.on);
      return s;
    }

    case 'birthday': {
      // the narrator marks who the party is for (tap again to clear). Only one at a time.
      const p = playerById(s, cmd.id);
      if (!p) return fail('Unknown player.');
      const on = !p.bday;
      s.players.forEach((q) => delete q.bday);
      if (on) p.bday = true;
      return s;
    }

    default:
      return fail(`Unknown command ${cmd.type}`);
  }
}

/** What every screen may see. Roles stay hidden unless revealed by death or the end. */
export function publicView(s, extra = {}) {
  const showAll = s.phase === 'end';
  return {
    roomId: s.roomId,
    phase: s.phase,
    round: s.round,
    deal: s.deal,
    scene: s.scene,
    timer: s.timer,
    winner: s.phase === 'end' ? s.winner : null,
    players: s.players.map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      alive: p.alive,
      honoree: Boolean(p.bday),
      role: showAll || (!p.alive && s.reveal) ? p.role : null,
    })),
    ...extra,
  };
}

/** What one player's phone may see about itself. */
export function privateView(s, id) {
  const me = playerById(s, id);
  if (!me?.role) return null;
  const crew = ROLES[me.role].team === 'mafia' ? s.players.filter((p) => p.id !== id && ROLES[p.role]?.team === 'mafia').map((p) => p.name) : [];
  return { deal: s.deal, role: me.role, crew };
}
