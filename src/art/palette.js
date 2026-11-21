/*
 * The art palette. Mirrors tokens.css; art names colors by key.
 * A cabin weekend: cream paper, pine, ember from the fire, lake blue, night sky,
 * one candle yellow for the birthday, and berry red used very sparingly.
 */
export const PALETTE = {
  cream: '#F4EFE6',
  paper: '#FBF8F3',
  birch: '#E6DED0',
  smoke: '#BDB5A8',
  ink: '#1F1E1C',
  pine: '#2E4A3B',
  moss: '#7F9672',
  lake: '#9CB7C7',
  ember: '#DE6F3E',
  clay: '#D7A27F',
  candle: '#F1C24F',
  berry: '#B03A2E',
  night: '#121820',
  dusk: '#1F2833',

  // older names, kept so earlier drawings still render
  bone: '#FBF8F3',
  sand: '#F4EFE6',
  stone: '#E6DED0',
  terracotta: '#DE6F3E',
  sage: '#7F9672',
  periwinkle: '#9CB7C7',
  sky: '#9CB7C7',
  blood: '#B03A2E',
};

export const color = (key) => PALETTE[key] ?? key;
