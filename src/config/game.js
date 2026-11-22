/*
 * Every game rule and every word a player or the narrator reads lives here.
 * Change the table or the copy in this one file; the screens follow.
 */

/** Who this edition is for. */
export const EVENT = {
  /** The trip: "Steph’s birthday weekend in Pioneer". titleSmall is the typed lines above the town on the title card. */
  honoree: 'Steph',
  titleSmall: ['Steph’s birthday', 'weekend in'],
  town: 'Pioneer',
  /** It's a 26th birthday, so everything is case no. 26. */
  age: 26,
  caseNo: 26,
  /** How the birthday person is described once the narrator marks them (any typed name works). */
  birthdayNoun: 'birthday girl',
  birthdayPossessive: 'her',
  narrator: 'Nate',
};

/** What the narrator says out loud to explain the game. Lives one tab away on the narrator phone. */
export const BRIEFING = {
  intro: 'Say this before the first night',
  lines: [
    'A few of you are the Mafia. Everyone else is trying to catch them.',
    'Your phone has your secret role. Hold to peek. Show no one.',
    'Each night, all eyes closed. I wake the Mafia, the Medic and the Ranger, one at a time.',
    'Each morning we learn who didn’t make it. Then you argue, and on three, everyone points. Most fingers is out.',
    'Campers win when every Mafia is out. Mafia win when they’re half the room.',
  ],
  rule: 'dead? no talking, no hints.',
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

/** Show a dead player’s role to everyone when they die. Off: roles stay secret until the game ends. The narrator can switch it mid-game (Suspects tab). */
export const REVEAL_ROLE_ON_DEATH = false;

export const TEAMS = {
  mafia: { name: 'The Mafia', short: 'Mafia', win: 'Outnumber the campers. Then the cabin is yours.' },
  town: { name: 'The Campers', short: 'Campers', win: 'Find and vote out every member of the Mafia.' },
};

/** Display order is the order here. `art` is the role portrait id in src/art/roles. */
export const ROLES = {
  mafia: {
    name: 'Mafia',
    team: 'mafia',
    photo: 'role-mafia',
    line: 'You’re hiding among the campers. Each night, you and your crew pick someone to take out.',
    night: 'When the narrator says "Mafia, open your eyes," find your crew. Silently agree on one person by pointing at them. Then close your eyes.',
    day: 'Blend in. Accuse, defend, act shocked. Vote like an innocent person would.',
    tip: "Don't all rush to defend each other. Nothing looks guiltier.",
  },
  doctor: {
    name: 'Medic',
    team: 'town',
    photo: 'role-doctor',
    line: 'You keep the first-aid kit. Each night, pick one camper to save.',
    night: 'When called, point at one person to protect. If the Mafia chose them, they live. You can save yourself, but never the same person two nights in a row.',
    day: 'Help the campers find the Mafia, but keep your job to yourself.',
    tip: 'If the Mafia figure out who you are, you are next.',
  },
  detective: {
    name: 'Ranger',
    team: 'town',
    photo: 'role-detective',
    line: 'You know these woods. Each night, shine your flashlight on one suspect.',
    night: 'When called, point at one person. The narrator gives you a silent thumbs up if they are Mafia, thumbs down if not.',
    day: 'Steer the vote without blowing your cover. Timing is everything.',
    tip: 'Reveal yourself too early and the Mafia will make sure you never check again.',
  },
  villager: {
    name: 'Camper',
    team: 'town',
    photo: 'role-villager',
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
  { id: 'sleep', photo: 'cabin-dusk', say: 'Everyone, close your eyes. Night falls on the cabin.' },
  { id: 'mafia', photo: 'role-mafia', role: 'mafia', pick: 'target', say: 'Mafia, open your eyes. Silently choose who to take out tonight.', ask: 'Who did the Mafia choose?' },
  { id: 'doctor', photo: 'role-doctor', role: 'doctor', pick: 'save', say: 'Mafia, close your eyes. Medic, open your eyes. Who will you save tonight?', ask: 'Who did the Medic save?' },
  { id: 'detective', photo: 'role-detective', role: 'detective', pick: 'check', say: 'Medic, close your eyes. Ranger, open your eyes. Point at someone you suspect.', ask: 'Who did the Ranger point at?' },
  { id: 'dawn', photo: 'morning-clear', say: 'Ranger, close your eyes. … Everyone, wake up.' },
];

/**
 * Scenes the narrator can put on every screen. `kind` picks the composition in src/ui/stage.js:
 * cabin (floor plan), files, photo, gazette (morning paper), board (pinboard), verdict, closed.
 * {name}, {role}, {round} and {n} are filled in from the game.
 */
export const SCENES = {
  lobby: { kind: 'cabin', kicker: 'Exhibit B · the cabin', caption: '{n} suspects, so far', captionOne: 'One suspect, so far', sub: 'Everyone’s still alive. Waiting for the files to be handed out.' },
  dealt: { kind: 'files', kicker: 'For your eyes only', caption: 'The files are out', sub: 'Hold the button at the bottom to open yours. Tell no one.' },
  night: { kind: 'photo', photo: 'cabin-dusk', colour: true, dark: true, kicker: 'Night {round}', caption: 'The cabin goes quiet.', note: 'everyone, close your eyes', cap: 'night {round}' },
  dead: { kind: 'gazette', kicker: 'This morning’s paper', caption: '{name} didn’t wake up', sub: 'They were the {role}.', subHidden: 'Who did this?', note: 'so who’s lying?' },
  clear: { kind: 'gazette', kicker: 'This morning’s paper', caption: 'Everyone woke up', sub: 'Nobody died last night. Suspicious.', note: 'somebody got lucky.' },
  talk: { kind: 'photo', photo: 'talk', kicker: 'By the fire', caption: 'Talk it out', sub: 'Who’s lying? Make your case.', cap: 'exhibit C' },
  vote: { kind: 'board', kicker: 'The suspects', caption: 'Who did it?', sub: 'On three, point at who you think is Mafia.' },
  out: { kind: 'verdict', kicker: 'The cabin has spoken', caption: '{name} is out', sub: 'They were the {role}.', subHidden: 'We may never know what they were.' },
  hung: { kind: 'photo', photo: 'hung', kicker: 'The vote', caption: 'No one is out', sub: 'The cabin couldn’t decide.', cap: 'no verdict' },
  town: { kind: 'closed', photo: 'town-wins', colour: true, kicker: 'Case no. 26', caption: 'The campers got them', sub: 'Every member of the Mafia is caught.', stamp: 'Case closed', cap: 'happy 26th!' },
  mafia: { kind: 'closed', photo: 'mafia-wins', dark: true, kicker: 'Case no. 26', caption: 'The Mafia got away with it', sub: 'The cabin is theirs now.', stamp: 'Unsolved', cap: 'last seen leaving' },
};
