export const SYNERGIES = [
  {
    id: 'electro_field',
    nameKey: 'synergy.electro_field',
    descKey: 'synergy.electro_field.desc',
    pair: ['ELECTRIC', 'ARC'],
    maxDistance: 1,
    effect: 'damageMult',
    value: 1.2
  },
  {
    id: 'frostfire',
    nameKey: 'synergy.frostfire',
    descKey: 'synergy.frostfire.desc',
    pair: ['SLOW', 'FLAMETHROWER'],
    maxDistance: 1,
    effect: 'burnDamageMult',
    value: 1.5
  },
  {
    id: 'spotter',
    nameKey: 'synergy.spotter',
    descKey: 'synergy.spotter.desc',
    pair: ['OBSERVATION', 'SNIPER'],
    maxDistance: 2,
    effect: 'rangeMult',
    value: 1.2
  },
  {
    id: 'artillery',
    nameKey: 'synergy.artillery',
    descKey: 'synergy.artillery.desc',
    pair: ['CANNON', 'MORTAR'],
    maxDistance: 1,
    effect: 'splashMult',
    value: 1.15
  },
  {
    id: 'rapid_fire',
    nameKey: 'synergy.rapid_fire',
    descKey: 'synergy.rapid_fire.desc',
    pair: ['MACHINE', 'MACHINE'],
    maxDistance: 1,
    effect: 'fireRateMult',
    value: 0.85
  },
  {
    id: 'toxic_cloud',
    nameKey: 'synergy.toxic_cloud',
    descKey: 'synergy.toxic_cloud.desc',
    pair: ['INSECTICIDE', 'FLAMETHROWER'],
    maxDistance: 1,
    effect: 'poisonDamageMult',
    value: 1.4
  },
  {
    id: 'overcharge',
    nameKey: 'synergy.overcharge',
    descKey: 'synergy.overcharge.desc',
    pair: ['ELECTRIC', 'MACHINE'],
    maxDistance: 1,
    effect: 'chainCountBonus',
    value: 1
  }
];

export const COMBO_THRESHOLDS = [
  { kills: 5,  labelKey: 'combo.nice',   gold: 10,  buff: null },
  { kills: 10, labelKey: 'combo.great',  gold: 25,  buff: null },
  { kills: 20, labelKey: 'combo.amazing', gold: 50,  buff: { fireRateMult: 1.2, duration: 5 } },
  { kills: 50, labelKey: 'combo.legendary', gold: 100, buff: 'item' }
];

export function checkAdjacent(towerA, towerB) {
  return Math.abs(towerA.col - towerB.col) <= 1 && Math.abs(towerA.row - towerB.row) <= 1;
}

export function checkDistance(towerA, towerB, maxDist) {
  const dc = Math.abs(towerA.col - towerB.col);
  const dr = Math.abs(towerA.row - towerB.row);
  return dc <= maxDist && dr <= maxDist;
}
