export const PARTS = {
  barrel: {
    levels: [
      { cost: 30, damage: 10 },
      { cost: 80, damage: 30 },
      { cost: 200, damage: 70 },
    ]
  },
  lens: {
    levels: [
      { cost: 30, range: 20 },
      { cost: 80, range: 50 },
      { cost: 200, range: 110 },
    ]
  },
  gear: {
    levels: [
      { cost: 40, fireRateMult: 0.85 },
      { cost: 100, fireRateMult: 0.70 },
      { cost: 250, fireRateMult: 0.55 },
    ]
  },
  ammo: {
    levels: [
      { cost: 50, splash: 15 },
      { cost: 120, splash: 35 },
      { cost: 300, splash: 65 },
    ]
  }
};

export const PART_KEYS = Object.keys(PARTS);

export function getPartCost(partId, level) {
  const part = PARTS[partId];
  if (!part || level < 1 || level > part.levels.length) return -1;
  return part.levels[level - 1].cost;
}

export function getPartStats(partId, level) {
  const part = PARTS[partId];
  if (!part || level < 1 || level > part.levels.length) return null;
  return { ...part.levels[level - 1] };
}
