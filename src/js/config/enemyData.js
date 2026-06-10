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
  size: 24, isFlying: false, isBoss: true,
  bossTalents: []
});
defineEnemy('megaboss', {
  id: 'megaboss', name: 'MEGA BOSS', color: '#ff4400',
  baseHp: 4000, baseSpeed: 22, armor: 10, bounty: 600,
  size: 36, isFlying: false, isBoss: true,
  bossTalents: ['flameAura', 'rage']
});
defineEnemy('bomber', {
  id: 'bomber', name: 'Bomber', color: '#ff6600',
  baseHp: 300, baseSpeed: 45, armor: 2, bounty: 100,
  size: 16, isFlying: true, isBoss: false
});

// === NEW ENEMIES ===
defineEnemy('regenerator', {
  id: 'regenerator', name: 'Regenerator', color: '#2ecc71',
  baseHp: 140, baseSpeed: 55, armor: 1, bounty: 18,
  size: 14, isFlying: false, isBoss: false,
  healRate: 8
});
defineEnemy('shielded', {
  id: 'shielded', name: 'Shielded', color: '#7f8c8d',
  baseHp: 100, baseSpeed: 50, armor: 0, bounty: 22,
  size: 15, isFlying: false, isBoss: false,
  shieldHp: 100, shieldRecharge: 5, shieldCooldown: 8
});
defineEnemy('splitter', {
  id: 'splitter', name: 'Splitter', color: '#9b59b6',
  baseHp: 160, baseSpeed: 50, armor: 1, bounty: 24,
  size: 16, isFlying: false, isBoss: false,
  splitCount: 2
});
defineEnemy('stealth', {
  id: 'stealth', name: 'Stealth', color: '#bdc3c7',
  baseHp: 60, baseSpeed: 75, armor: 0, bounty: 16,
  size: 10, isFlying: false, isBoss: false,
  revealRange: 200
});
defineEnemy('leech', {
  id: 'leech', name: 'Leech', color: '#8b0000',
  baseHp: 120, baseSpeed: 60, armor: 0, bounty: 30,
  size: 13, isFlying: false, isBoss: false,
  goldSteal: 5
});
defineEnemy('swarm', {
  id: 'swarm', name: 'Swarm', color: '#e67e22',
  baseHp: 30, baseSpeed: 110, armor: 0, bounty: 6,
  size: 7, isFlying: false, isBoss: false
});
defineEnemy('void', {
  id: 'void', name: 'Void Walker', color: '#8e44ad',
  baseHp: 100, baseSpeed: 65, armor: 1, bounty: 25,
  size: 14, isFlying: false, isBoss: false,
  teleportInterval: 5, teleportRange: 80
});
defineEnemy('crystal', {
  id: 'crystal', name: 'Crystal', color: '#00bcd4',
  baseHp: 130, baseSpeed: 45, armor: 3, bounty: 20,
  size: 14, isFlying: false, isBoss: false,
  reflectPct: 0.15
});

export function getEnemyStats(typeId, waveNumber) {
  const type = ENEMY_TYPES[typeId];
  if (!type) return null;
  let difficulty = 1 + (waveNumber - 1) * 0.09;
  // 30波后额外加速
  if (waveNumber >= 30) {
    const extraWaves = waveNumber - 29;
    difficulty *= (1 + extraWaves * 0.03);
  }
  return {
    ...type,
    maxHp: Math.floor(type.baseHp * difficulty),
    speed: type.baseSpeed * (1 + (waveNumber - 1) * 0.018) * (waveNumber >= 30 ? (1 + (waveNumber - 29) * 0.015) : 1),
    armor: type.armor + Math.floor((waveNumber - 1) / 10) + (waveNumber >= 30 ? Math.floor((waveNumber - 29) / 10) : 0),
    bounty: Math.floor(type.bounty * (1 + (waveNumber - 1) * 0.06))
  };
}
