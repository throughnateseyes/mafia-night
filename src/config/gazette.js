/*
 * The Pioneer Gazette. Every morning's paper is written from what happened overnight.
 * Add an edition by adding an entry to a list; the stage picks one deterministically
 * (from the scene's timestamp) so every phone shows the same paper.
 *
 * {name} the victim · {role} "a Camper", "the Medic"… · {age} · {noun} "birthday girl" · {poss} "her"
 */
import { EVENT, ROLES } from './game.js';

const DEATH = [
  { headline: '{name} didn’t make it to breakfast', body: '{name}, {role}, was found at sunrise outside an open tent. Nobody saw a thing, which is strange for a cabin this small. Friends remember {name} as “loud” and “a terrible liar.” The Mafia is still out there, and is probably sitting next to you. Suspects will vote after coffee.' },
  { headline: '{name} found dead. Everyone “was asleep.”', body: 'Every person in the cabin claims to have slept through it. {name}, {role}, was unavailable to confirm. Investigators describe the alibis as “identical” and “weak.” The killer is believed to be within arm’s reach of the snacks. A vote will follow.' },
  { headline: 'Cabin trip claims {name}', body: 'What began as a quiet weekend took a turn overnight. {name}, {role}, is no longer with the group, effective immediately. Witnesses report hearing “nothing,” then “a zipper.” Residents are advised to trust no one, especially whoever is being nice right now.' },
  { headline: '{name} is gone. Suspects: all of you.', body: '{name}, {role}, was taken out sometime after midnight. Investigators have narrowed the list of suspects to everyone still breathing. One camper was overheard saying “that’s so sad” without looking up from their phone. The inquiry continues at the fire pit.' },
  { headline: 'Local legend {name} gone too soon', body: 'Tributes are pouring in for {name}, {role}, described by friends as “fine, I guess” and “always the first to accuse someone.” The Mafia could not be reached for comment, mostly because nobody knows who they are. Yet.' },
  { headline: 'One sleeping bag, lightly used', body: 'For sale after last night: one sleeping bag, formerly of {name}, {role}. The previous owner will not be needing it. Police ask anyone who “heard something but assumed it was a raccoon” to come forward. Nobody has. The vote is expected to get loud.' },
];

const QUIET = [
  { headline: 'Everyone lived. Nobody trusts it.', body: 'For the first time this weekend, every suspect woke up. Sources credit a Medic who was in the right place at the right time. The Mafia declined to comment and looked annoyed about it. Breakfast went ahead as planned. Accusations resume shortly.' },
  { headline: 'Nobody died. Suspicious.', body: 'Residents woke to an unusual sight: all of each other. Either the Medic got lucky or the Mafia got sloppy. Both theories are being argued loudly over coffee. Officials remind campers that surviving the night proves nothing.' },
  { headline: 'Slow news day in Pioneer', body: 'No bodies, no screams, no missing persons. The Gazette regrets the lack of content and trusts the Mafia will do better tonight. In other news, somebody finished the good snacks and will not own up to that either.' },
];

const BIRTHDAY = [
  { headline: 'Who killed the {noun}?', body: '{name}, {age} as of this weekend, was found at dawn next to an untouched slice of cake. “It’s my birthday” did not work as a defence. Every person in this cabin is now a suspect. To whoever did this: on {poss} birthday? Really? The vote is going to be personal.' },
];

const WEATHER = ['Cloudy, chance of betrayal', 'Fog, low trust', 'Cold. Like the killer.', 'Clear skies, for now', 'Dark. Very dark.'];
const DAYS = ['Friday night', 'Saturday morning', 'Saturday, late', 'Sunday morning', 'Sunday, later', 'Monday, somehow'];

const roleWords = (role) => {
  if (!role) return 'whose role remains a mystery';
  const r = ROLES[role];
  return r.team === 'mafia' ? 'one of the Mafia' : role === 'villager' ? `a ${r.name}` : `the ${r.name}`;
};

/** The paper for a morning scene ({ key: 'dead' | 'clear', name, role, bday, at }), round ≥ 1. */
export function edition(scene, round = 1) {
  const seed = Math.abs(Math.floor((scene.at ?? 0) / 1000)) + round;
  const pick = (list) => list[seed % list.length];
  const fill = (t) =>
    t
      .replaceAll('{name}', scene.name ?? 'Someone')
      .replaceAll('{role}', roleWords(scene.role))
      .replaceAll('{age}', EVENT.age)
      .replaceAll('{noun}', EVENT.birthdayNoun)
      .replaceAll('{poss}', EVENT.birthdayPossessive);
  const tag = DAYS[Math.min(round, DAYS.length - 1)];
  if (scene.key === 'clear') return { ...pick(QUIET), photo: 'morning-clear', tag, weather: WEATHER[3] };
  if (scene.bday) {
    const e = pick(BIRTHDAY);
    return { headline: fill(e.headline), body: fill(e.body), photo: 'birthday-victim', tag: 'Birthday extra', weather: WEATHER[4] };
  }
  const e = pick(DEATH);
  return { headline: fill(e.headline), body: fill(e.body), photo: 'morning-dead', tag, weather: pick(WEATHER.slice(0, 3)) };
}
