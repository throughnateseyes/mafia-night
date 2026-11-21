/*
 * Every game rule and every word a player or the narrator reads lives here.
 * Change the table or the copy in this one file; the screens follow.
 */

/** Who this edition is for. */
export const EVENT = {
  honoree: 'Steph',
  age: 26,
  place: 'the cabin',
  occasion: 'birthday cabin weekend',
  narrator: 'Nate',
};

/** Players, not counting the narrator (the narrator runs the game and does not play). */
export const PLAYER_LIMITS = { min: 5, max: 14 };

/**
 * Role scaling by player count (spec table). Villagers fill whatever is left.
 * Ranges are inclusive and must cover min..max with no gaps.
 */
export const SCALING = [
  { min: 5, max: 5, mafia: 1, detective: 1, doctor: 1 },
  { min: 6, max: 7, mafia: 2, detective: 1, doctor: 1 },
  { min: 8, max: 10, mafia: 3, detective: 1, doctor: 1 },
  { min: 11, max: 14, mafia: 4, detective: 1, doctor: 1 },
];

/** Show a dead player's role to everyone when they die. */
export const REVEAL_ROLE_ON_DEATH = true;

export const TEAMS = {
  mafia: { name: 'The Mafia', short: 'Mafia', win: 'Outnumber the campers. Then the cabin is yours.' },
  town: { name: 'The Campers', short: 'Campers', win: 'Find and vote out every member of the Mafia.' },
};

/** Display order is the order here. `art` is the role portrait id in src/art/roles. */
export const ROLES = {
  mafia: {
    name: 'Mafia',
    team: 'mafia',
    art: 'role-mafia',
    tile: 'night',
    line: 'You’re hiding among the campers. Each night, you and your crew pick someone to take out.',
    night: 'When the narrator says "Mafia, open your eyes," find your crew. Silently agree on one person by pointing at them. Then close your eyes.',
    day: 'Blend in. Accuse, defend, act shocked. Vote like an innocent person would.',
    tip: "Don't all rush to defend each other. Nothing looks guiltier.",
  },
  doctor: {
    name: 'Medic',
    team: 'town',
    art: 'role-doctor',
    tile: 'moss',
    line: 'You keep the first-aid kit. Each night, pick one camper to save.',
    night: 'When called, point at one person to protect. If the Mafia chose them, they live. You can save yourself, but never the same person two nights in a row.',
    day: 'Help the campers find the Mafia, but keep your job to yourself.',
    tip: 'If the Mafia figure out who you are, you are next.',
  },
  detective: {
    name: 'Ranger',
    team: 'town',
    art: 'role-detective',
    tile: 'ember',
    line: 'You know these woods. Each night, shine your flashlight on one suspect.',
    night: 'When called, point at one person. The narrator gives you a silent thumbs up if they are Mafia, thumbs down if not.',
    day: 'Steer the vote without blowing your cover. Timing is everything.',
    tip: 'Reveal yourself too early and the Mafia will make sure you never check again.',
  },
  villager: {
    name: 'Camper',
    team: 'town',
    art: 'role-villager',
    tile: 'birch',
    line: 'Just here for the s’mores. No night moves: read the room, then vote.',
    night: 'Keep your eyes closed and sleep tight. Hopefully.',
    day: 'Argue, question, notice who goes quiet. Then vote someone out.',
    tip: 'Watch who the Mafia never seem to go after.',
  },
};

/** The loop every round follows, for the how-to-play page. */
export const ROUND = [
  { id: 'night', name: 'Night', icon: 'moon', text: 'Eyes closed. The Mafia pick a victim. The Medic saves someone. The Ranger checks a suspect.' },
  { id: 'morning', name: 'Morning', icon: 'sun', text: 'Everyone wakes up. The narrator reveals who died, if anyone.' },
  { id: 'vote', name: 'Vote', icon: 'hand', text: 'Argue it out, then vote. Whoever gets the most votes is out.' },
];

/**
 * The narrator's night script. `pick` records a choice; `role` names who acts.
 * Steps for a role whose players are all dead still run (so nobody can tell), with no pick.
 */
export const NIGHT_STEPS = [
  { id: 'sleep', art: 'night-falls', say: 'Everyone, close your eyes. Night falls on the cabin.' },
  { id: 'mafia', art: 'mafia-wake', role: 'mafia', pick: 'target', say: 'Mafia, open your eyes. Silently choose who to take out tonight.', ask: 'Who did the Mafia choose?' },
  { id: 'doctor', art: 'doctor-wake', role: 'doctor', pick: 'save', say: 'Mafia, close your eyes. Medic, open your eyes. Who will you save tonight?', ask: 'Who did the Medic save?' },
  { id: 'detective', art: 'detective-wake', role: 'detective', pick: 'check', say: 'Medic, close your eyes. Ranger, open your eyes. Point at someone you suspect.', ask: 'Who did the Ranger point at?' },
  { id: 'dawn', art: 'morning-clear', say: 'Ranger, close your eyes. … Everyone, wake up.' },
];

/**
 * Scenes the narrator can put on every screen. `art` is the scene id.
 * {name} and {role} are filled in from the game.
 */
export const SCENES = {
  lobby: { art: 'lobby', caption: 'Pull up a chair', sub: 'Waiting for everyone to get to the fire.' },
  dealt: { art: 'lobby', caption: 'Roles are out', sub: 'Hold the button at the bottom to peek. Tell no one.' },
  night: { art: 'night-falls', caption: 'Night falls on the cabin', sub: 'Everyone, close your eyes.', dark: true },
  dead: { art: 'morning-dead', caption: '{name} didn’t wake up', sub: 'They were the {role}.', subHidden: 'Who did this?' },
  clear: { art: 'morning-clear', caption: 'Everyone woke up', sub: 'Nobody died last night. Suspicious.' },
  talk: { art: 'discussion', caption: 'Talk it out', sub: 'Who’s lying? Make your case by the fire.' },
  vote: { art: 'vote', caption: 'Time to vote', sub: 'On three, point at who you think is Mafia.' },
  out: { art: 'eliminated', caption: '{name} is out', sub: 'The campers have spoken. They were the {role}.', subHidden: 'The campers have spoken.' },
  hung: { art: 'no-elimination', caption: 'No one is out', sub: 'The campers couldn’t decide.' },
  town: { art: 'town-wins', caption: 'The campers win', sub: 'Every member of the Mafia is caught. Happy 26th, Steph.' },
  mafia: { art: 'mafia-wins', caption: 'The Mafia wins', sub: 'They took over the cabin.', dark: true },
};
