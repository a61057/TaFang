export const ENEMY_TYPES = {};

function defineEnemy(id, data) {
  ENEMY_TYPES[id] = data;
  ENEMY_TYPES[id.toUpperCase()] = data;
}

defineEnemy('normal', {
  id: 'normal', name: 'Normal', color: '#e74c3c',
  baseHp: 80, baseSpeed: 60, armor: 0, bounty: 10,
  size: 12, isFlying: false, isBoss: false
});
defineEnemy('fast', {
  id: 'fast', name: 'Fast', color: '#f39c12',
  baseHp: 50, baseSpeed: 100, armor: 0, bounty: 12,
  size: 10, isFlying: false, isBoss: false
});
defineEnemy('heavy', {
  id: 'heavy', name: 'Heavy', color: '#8e44ad',
  baseHp: 180, baseSpeed: 40, armor: 3, bounty: 20,
  size: 16, isFlying: false, isBoss: false
});
defineEnemy('flying', {
  id: 'flying', name: 'Flying', color: '#2ecc71',
  baseHp: 60, baseSpeed: 80, armor: 0, bounty: 15,
  size: 11, isFlying: true, isBoss: false
});
defineEnemy('boss', {
  id: 'boss', name: 'BOSS', color: '#c0392b',
  baseHp: 1200, baseSpeed: 30, armor: 6, bounty: 150,
  size: 24, isFlying: false, isBoss: true
});
defineEnemy('megaboss', {
  id: 'megaboss', name: 'MEGA BOSS', color: '#ff4400',
  baseHp: 5000, baseSpeed: 20, armor: 12, bounty: 500,
  size: 36, isFlying: false, isBoss: true
});
defineEnemy('bomber', {
  id: 'bomber', name: 'Bomber', color: '#ff6600',
  baseHp: 300, baseSpeed: 45, armor: 2, bounty: 100,
  size: 16, isFlying: true, isBoss: false
});

export function getEnemyStats(typeId, waveNumber) {
  const type = ENEMY_TYPES[typeId];
  if (!type) return null;
  let difficulty = 1 + (waveNumber - 1) * 0.1;
  // 30波后逐渐提升难度
  if (waveNumber >= 30) {
    const extraWaves = waveNumber - 29;
    difficulty *= (1 + extraWaves * 0.04);
  }
  return {
    ...type,
    maxHp: Math.floor(type.baseHp * difficulty),
    speed: type.baseSpeed * (1 + (waveNumber - 1) * 0.02) * (waveNumber >= 30 ? (1 + (waveNumber - 29) * 0.02) : 1),
    armor: type.armor + Math.floor((waveNumber - 1) / 10) + (waveNumber >= 30 ? Math.floor((waveNumber - 29) / 8) : 0),
    bounty: Math.floor(type.bounty * (1 + (waveNumber - 1) * 0.05))
  };
}
