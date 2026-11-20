import { describe, expect, it } from 'vitest';
import { PLAYER_LIMITS, ROLES, SCALING } from '../config/game.js';
import { clampCount, deal, roleCounts, roleList, shuffle } from './roles.js';

describe('role scaling', () => {
  it('matches the spec table', () => {
    expect(roleCounts(5)).toEqual({ mafia: 1, doctor: 1, detective: 1, villager: 2 });
    expect(roleCounts(7)).toEqual({ mafia: 2, doctor: 1, detective: 1, villager: 3 });
    expect(roleCounts(9)).toEqual({ mafia: 3, doctor: 1, detective: 1, villager: 4 });
    expect(roleCounts(14)).toEqual({ mafia: 4, doctor: 1, detective: 1, villager: 8 });
  });

  it('covers every count from min to max with one role per player', () => {
    for (let n = PLAYER_LIMITS.min; n <= PLAYER_LIMITS.max; n++) {
      expect(roleList(n)).toHaveLength(n);
      expect(SCALING.filter((r) => n >= r.min && n <= r.max)).toHaveLength(1);
    }
  });

  it('never starts with the Mafia already winning', () => {
    for (let n = PLAYER_LIMITS.min; n <= PLAYER_LIMITS.max; n++) {
      const c = roleCounts(n);
      expect(c.mafia).toBeLessThan(n - c.mafia);
    }
  });

  it('rejects counts outside the table', () => {
    expect(() => roleCounts(4)).toThrow(RangeError);
    expect(() => roleCounts(15)).toThrow(RangeError);
  });

  it('clamps input', () => {
    expect(clampCount(2)).toBe(PLAYER_LIMITS.min);
    expect(clampCount(99)).toBe(PLAYER_LIMITS.max);
    expect(clampCount('8')).toBe(8);
    expect(clampCount('abc')).toBe(PLAYER_LIMITS.default);
  });
});

describe('dealing', () => {
  it('shuffle keeps every item', () => {
    const items = roleList(10);
    expect(shuffle(items).sort()).toEqual([...items].sort());
  });

  it('deals one living player per seat, every role known', () => {
    const players = deal(9);
    expect(players.map((p) => p.seat)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(players.every((p) => p.alive && p.role in ROLES)).toBe(true);
  });

  it('spreads roles across seats (not always the same order)', () => {
    const firstSeats = new Set(Array.from({ length: 50 }, () => deal(9)[0].role));
    expect(firstSeats.size).toBeGreaterThan(1);
  });
});
