import { describe, expect, it } from 'vitest';
import { PLAYER_LIMITS, SCALING } from '../config/game.js';
import { roleCounts, roleList, shuffle } from './roles.js';

describe('role scaling', () => {
  it('matches the spec table', () => {
    expect(roleCounts(5)).toEqual({ mafia: 1, doctor: 1, detective: 1, villager: 2 });
    expect(roleCounts(7)).toEqual({ mafia: 2, doctor: 1, detective: 1, villager: 3 });
    expect(roleCounts(9)).toEqual({ mafia: 3, doctor: 1, detective: 1, villager: 4 });
    expect(roleCounts(14)).toEqual({ mafia: 4, doctor: 1, detective: 1, villager: 8 });
  });

  it('covers every count with one role per player and no head start for the Mafia', () => {
    for (let n = PLAYER_LIMITS.min; n <= PLAYER_LIMITS.max; n++) {
      expect(roleList(n)).toHaveLength(n);
      expect(SCALING.filter((r) => n >= r.min && n <= r.max)).toHaveLength(1);
      const c = roleCounts(n);
      expect(c.mafia).toBeLessThan(n - c.mafia);
    }
  });

  it('rejects counts outside the table', () => {
    expect(() => roleCounts(4)).toThrow(RangeError);
    expect(() => roleCounts(15)).toThrow(RangeError);
  });

  it('shuffle keeps every item and varies the order', () => {
    const items = roleList(10);
    expect(shuffle(items).sort()).toEqual([...items].sort());
    const firsts = new Set(Array.from({ length: 60 }, () => shuffle(roleList(9))[0]));
    expect(firsts.size).toBeGreaterThan(1);
  });
});
