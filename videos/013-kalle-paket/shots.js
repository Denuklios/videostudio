// Fassung 2: Kulissen, Posen, Shots, Ereignisse (wird von main.js eingebunden)
export const DUR = 30.4;
export const VO = { k1: 0.25, k2: 4.05, r1: 7.85, k3: 9.1, n1: 13.6, n2: 16.2, n3: 18.5, r2: 23.4, cta: 26.0 };
export const SUB_END = 25.6;

export const EV = [
  { t: 0.0, type: 'music', cue: 'lauer' }, { t: 3.25, type: 'ding' }, { t: 4.0, type: 'stab' },
  { t: 6.2, type: 'pop' }, { t: 7.9, type: 'blip' }, { t: 10.85, type: 'click' }, { t: 10.95, type: 'portal' },
  { t: 11.4, type: 'swirl' }, { t: 11.8, type: 'music', cue: 'gun' }, { t: 12.2, type: 'lid' }, { t: 13.6, type: 'stab' },
  { t: 14.3, type: 'swirl' }, { t: 14.6, type: 'shopbell' }, { t: 16.2, type: 'stab' },
  { t: 16.7, type: 'swirl' }, { t: 17.0, type: 'thump' }, { t: 18.5, type: 'stab' },
  { t: 19.0, type: 'swirl' }, { t: 19.6, type: 'thump' }, { t: 20.2, type: 'music', cue: 'stop' },
  { t: 21.6, type: 'flap' }, { t: 21.95, type: 'slap' }, { t: 25.0, type: 'kazoo' }, { t: 25.6, type: 'music', cue: 'end' },
];
