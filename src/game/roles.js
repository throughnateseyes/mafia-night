import { PLAYER_LIMITS, ROLES, SCALING } from '../config/game.js';

/**
 * How many of each role a game of `count` players gets.
 * @returns {{mafia:number, doctor:number, detective:number, villager:number}}
 */
export function roleCounts(count) {
  const row = SCALING.find((r) => count >= r.min && count <= r.max);
  if (!row) {
    throw new RangeError(`No role scaling for ${count} players (supported ${PLAYER_LIMITS.min}-${PLAYER_LIMITS.max})`);
  }
  const { mafia, doctor, detective } = row;
  const villager = count - mafia - doctor - detective;
  if (villager < 0) throw new RangeError(`Scaling row for ${count} players assigns more roles than players`);
  return { mafia, doctor, detective, villager };
}

/** Flat list of role ids, in config order, e.g. ['mafia','mafia','doctor',...]. */
export function roleList(count) {
  const counts = roleCounts(count);
  return Object.keys(ROLES).flatMap((id) => Array(counts[id] ?? 0).fill(id));
}

/** Unbiased random integer in [0, max) from the platform CSPRNG. */
export function randomInt(max) {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  do crypto.getRandomValues(buf);
  while (buf[0] >= limit);
  return buf[0] % max;
}

/** Fisher–Yates shuffle, returns a new array. */
export function shuffle(items, rand = randomInt) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
