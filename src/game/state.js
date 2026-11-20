import { deal } from './roles.js';

const GAME_KEY = 'mafia-night:game';
const PREFS_KEY = 'mafia-night:prefs';

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** SHA-256 of the PIN, so the raw PIN never sits in storage. */
export async function hashPin(pin) {
  const bytes = new TextEncoder().encode(`mafia-night:${pin}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Random id shared by every link in one game; also salts link obfuscation. */
function newSeed() {
  const buf = new Uint8Array(6);
  crypto.getRandomValues(buf);
  return [...buf].map((b) => b.toString(36).padStart(2, '0')).join('').slice(0, 8);
}

export async function createGame({ count, pin }) {
  const game = {
    version: 1,
    seed: newSeed(),
    createdAt: Date.now(),
    pinHash: await hashPin(pin),
    count,
    players: deal(count),
    phase: 'deal',
    round: 0,
    dealt: 0,
    log: [],
  };
  write(GAME_KEY, game);
  return game;
}

export const loadGame = () => read(GAME_KEY);
export const saveGame = (game) => write(GAME_KEY, game);
export const clearGame = () => localStorage.removeItem(GAME_KEY);

/** Remembered between games so "play again" is one tap. */
export const loadPrefs = () => read(PREFS_KEY) ?? {};
export const savePrefs = (prefs) => write(PREFS_KEY, { ...loadPrefs(), ...prefs });
