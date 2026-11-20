/*
 * Every game rule and every word a player reads about a role lives here.
 * Change the table or the copy in this one file; the screens follow.
 */

/** Who this edition is for. Shows on the title stamp. */
export const EVENT = {
  honoree: 'Steph',
  occasion: 'Birthday Cabin Trip',
  caseNo: '11·20',
};

/** Players, not counting the narrator (the host narrates and does not play). */
export const PLAYER_LIMITS = { min: 5, max: 14, default: 9 };

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

export const TEAMS = {
  mafia: {
    name: 'The Mafia',
    short: 'Mafia',
    win: 'Equal the town, and the town is yours.',
  },
  town: {
    name: 'The Town',
    short: 'Town',
    win: 'Catch every last member of the Mafia.',
  },
};

/**
 * Display order is the order here. `color` names a token family in tokens.css
 * (--color-<color>, --color-<color>-ink).
 */
export const ROLES = {
  mafia: {
    name: 'Mafia',
    team: 'mafia',
    color: 'mafia',
    tagline: 'Each night, pick someone to take out.',
    night: 'When the narrator calls the Mafia, open your eyes and find your crew. Silently agree on one player to kill by pointing. Then close your eyes.',
    day: 'Blend in. Accuse, defend, act shocked. Vote like an innocent person would.',
    tip: "Don't all leap to defend each other. Nothing looks guiltier.",
  },
  doctor: {
    name: 'Doctor',
    team: 'town',
    color: 'doctor',
    tagline: 'Each night, save one person.',
    night: 'When called, point at one player to protect. If the Mafia picked them, they live. You can save yourself, but never the same person two nights running.',
    day: 'Help the town find the Mafia, but keep your job quiet.',
    tip: 'If the Mafia figure out who you are, you are next.',
  },
  detective: {
    name: 'Detective',
    team: 'town',
    color: 'detective',
    tagline: 'Each night, check one suspect.',
    night: 'When called, point at one player. The narrator gives a silent thumbs up if they are Mafia, thumbs down if not.',
    day: 'Steer the vote without blowing your cover. Timing is everything.',
    tip: 'Reveal yourself too early and the Mafia will make sure you never check again.',
  },
  villager: {
    name: 'Villager',
    team: 'town',
    color: 'town',
    tagline: 'No night moves. Read the room, then vote.',
    night: 'Keep your eyes closed and sleep tight. Hopefully.',
    day: 'Argue, question, notice who goes quiet. Then vote someone out.',
    tip: 'Watch who the Mafia never seem to target.',
  },
};

/** The loop every round follows. */
export const ROUND = ['Night', 'Morning', 'Vote'];
