/*
 * The art palette. Mirrors tokens.css; scenes name colors by key.
 * Pulled from the reference boards: ink, bone-white cut paper, sand, stone,
 * terracotta, clay, sage, periwinkle, sky; plus night, blood, candle for the murder.
 */
export const PALETTE = {
  ink: '#191714',
  bone: '#FAF6EE',
  sand: '#EADFC6',
  stone: '#E4E1DA',
  terracotta: '#D9714E',
  clay: '#D3A07C',
  sage: '#788F62',
  periwinkle: '#8B88E3',
  sky: '#87A9F2',
  night: '#15151C',
  dusk: '#2A2A3A',
  blood: '#B8321F',
  candle: '#F0BE4A',
};

export const color = (key) => PALETTE[key] ?? key;
