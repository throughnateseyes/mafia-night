import { describe, expect, it } from 'vitest';
import { checkWinner, newGame, privateView, publicView, reduce } from './engine.js';

const names = ['Steph', 'Jordan', 'Mo', 'Priya', 'Alex', 'Sam', 'Lee', 'Kai', 'Rae'];

function lobby(n = 9) {
  let s = newGame('room1');
  names.slice(0, n).forEach((name, i) => {
    s = reduce(s, { type: 'join', id: `p${i}`, name, avatar: i, pub: `k${i}` });
  });
  return s;
}

const byRole = (s, role) => s.players.filter((p) => p.role === role);
const run = (s, ...cmds) => cmds.reduce((acc, c) => reduce(acc, c), s);

describe('lobby', () => {
  it('joins players and updates on rejoin without duplicating', () => {
    let s = lobby(5);
    s = reduce(s, { type: 'join', id: 'p0', name: 'Steph B', avatar: 3, pub: 'new' });
    expect(s.players).toHaveLength(5);
    expect(s.players[0]).toMatchObject({ name: 'Steph B', avatar: 3, pub: 'new' });
  });

  it('refuses to deal with too few players', () => {
    const s = reduce(lobby(4), { type: 'deal' });
    expect(s.error).toMatch(/at least 5/);
    expect(s.phase).toBe('lobby');
  });

  it('refuses new players once the game starts, but lets known ones reconnect', () => {
    let s = reduce(lobby(5), { type: 'deal' });
    expect(reduce(s, { type: 'join', id: 'zz', name: 'Late' }).error).toMatch(/already started/);
    s = reduce(s, { type: 'join', id: 'p1', name: 'Jordan', pub: 'rotated' });
    expect(s.error).toBeUndefined();
    expect(s.players[1].pub).toBe('rotated');
  });
});

describe('dealing', () => {
  it('deals the right mix for 9 players', () => {
    const s = reduce(lobby(9), { type: 'deal' });
    expect(byRole(s, 'mafia')).toHaveLength(3);
    expect(byRole(s, 'doctor')).toHaveLength(1);
    expect(byRole(s, 'detective')).toHaveLength(1);
    expect(byRole(s, 'villager')).toHaveLength(4);
    expect(s.phase).toBe('dealt');
    expect(s.deal).toBe(1);
  });

  it('hides roles in the public view and tells the Mafia who their crew is', () => {
    const s = reduce(lobby(9), { type: 'deal' });
    expect(publicView(s).players.every((p) => p.role === null)).toBe(true);
    const [m1, m2, m3] = byRole(s, 'mafia');
    expect(privateView(s, m1.id).crew.sort()).toEqual([m2.name, m3.name].sort());
    expect(privateView(s, byRole(s, 'doctor')[0].id).crew).toEqual([]);
  });

  it('lets the narrator mark one birthday person, whatever name they typed', () => {
    let s = lobby(5);
    expect(publicView(s).players.some((p) => p.honoree)).toBe(false);
    s = reduce(s, { type: 'birthday', id: s.players[2].id });
    expect(publicView(s).players.map((p) => p.honoree)).toEqual([false, false, true, false, false]);
    s = reduce(s, { type: 'birthday', id: s.players[0].id });
    expect(publicView(s).players.map((p) => p.honoree)).toEqual([true, false, false, false, false]);
    s = reduce(s, { type: 'birthday', id: s.players[0].id });
    expect(publicView(s).players.some((p) => p.honoree)).toBe(false);
  });

  it('flags the morning scene when the birthday person is the victim', () => {
    let s = reduce(lobby(9), { type: 'birthday', id: 'p3' });
    s = reduce(s, { type: 'deal' });
    const victim = s.players.find((p) => p.bday);
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: victim.id }, { type: 'dawn' });
    expect(s.scene).toMatchObject({ key: 'dead', name: victim.name, bday: true, avatar: victim.avatar });
  });
});

describe('a night', () => {
  it('kills the target when the doctor misses', () => {
    let s = reduce(lobby(9), { type: 'deal' });
    const victim = byRole(s, 'villager')[0];
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: victim.id }, { type: 'pick', kind: 'save', id: byRole(s, 'doctor')[0].id }, { type: 'dawn' });
    expect(s.players.find((p) => p.id === victim.id).alive).toBe(false);
    expect(s.scene).toMatchObject({ key: 'dead', name: victim.name, role: 'villager' });
    expect(publicView(s).players.find((p) => p.id === victim.id).role).toBe('villager');
  });

  it('nobody dies when the doctor saves the target', () => {
    let s = reduce(lobby(9), { type: 'deal' });
    const victim = byRole(s, 'villager')[0];
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: victim.id }, { type: 'pick', kind: 'save', id: victim.id }, { type: 'dawn' });
    expect(s.players.every((p) => p.alive)).toBe(true);
    expect(s.scene.key).toBe('clear');
  });

  it('the doctor cannot save the same person two nights in a row', () => {
    let s = reduce(lobby(9), { type: 'deal' });
    const x = byRole(s, 'villager')[1];
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'save', id: x.id }, { type: 'dawn' }, { type: 'vote' }, { type: 'eliminate', id: null }, { type: 'night' });
    expect(reduce(s, { type: 'pick', kind: 'save', id: x.id }).error).toMatch(/last night/);
  });

  it('cannot pick a dead player', () => {
    let s = reduce(lobby(9), { type: 'deal' });
    const v = byRole(s, 'villager')[0];
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: v.id }, { type: 'dawn' }, { type: 'vote' }, { type: 'eliminate', id: null }, { type: 'night' });
    expect(reduce(s, { type: 'pick', kind: 'target', id: v.id }).error).toMatch(/still alive/);
  });
});

describe('winning', () => {
  it('town wins when the last Mafia is voted out', () => {
    let s = reduce(lobby(5), { type: 'deal' });
    const mafia = byRole(s, 'mafia')[0];
    s = run(s, { type: 'night' }, { type: 'dawn' }, { type: 'vote' }, { type: 'eliminate', id: mafia.id });
    expect(s.winner).toBe('town');
    s = reduce(s, { type: 'finish' });
    expect(s.phase).toBe('end');
    expect(s.scene.key).toBe('town');
    expect(publicView(s).players.every((p) => p.role)).toBe(true);
  });

  it('mafia wins on reaching parity', () => {
    let s = reduce(lobby(5), { type: 'deal' }); // 1 mafia, 4 town
    const town = s.players.filter((p) => p.role !== 'mafia');
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: town[0].id }, { type: 'dawn' });
    expect(s.winner).toBeNull();
    s = run(s, { type: 'vote' }, { type: 'eliminate', id: town[1].id });
    expect(s.winner).toBeNull(); // 1 mafia vs 2 town
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: town[2].id }, { type: 'dawn' });
    expect(checkWinner(s)).toBe('mafia');
    expect(reduce(s, { type: 'finish' }).scene.key).toBe('mafia');
  });

  it('play again keeps the people and reshuffles', () => {
    let s = reduce(lobby(9), { type: 'deal' });
    s = run(s, { type: 'night' }, { type: 'pick', kind: 'target', id: s.players[0].id }, { type: 'dawn' });
    s = reduce(s, { type: 'again' });
    expect(s.phase).toBe('dealt');
    expect(s.deal).toBe(2);
    expect(s.players).toHaveLength(9);
    expect(s.players.every((p) => p.alive && p.role)).toBe(true);
  });
});
