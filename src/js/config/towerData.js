export const TOWER_TYPES = {
  CANNON: {
    id: 'cannon',
    name: 'Cannon',
    description: 'High damage, slow fire rate',
    color: '#555555',
    faction: 'human',
    levels: [
      { cost: 100, damage: 50, fireRate: 2.0, range: 150, splash: 0 },
      { cost: 80, damage: 90, fireRate: 1.8, range: 160, splash: 0 },
      { cost: 120, damage: 150, fireRate: 1.6, range: 180, splash: 30 }
    ],
    bulletColor: '#333333',
    bulletSpeed: 500,
    bulletSize: 5
  },
  MACHINE: {
    id: 'machine',
    name: 'Machine Gun',
    description: 'Low damage, very fast fire rate',
    color: '#ccaa00',
    faction: 'machine',
    levels: [
      { cost: 80, damage: 8, fireRate: 0.15, range: 120, splash: 0 },
      { cost: 70, damage: 14, fireRate: 0.12, range: 130, splash: 0 },
      { cost: 100, damage: 22, fireRate: 0.10, range: 140, splash: 0 }
    ],
    bulletColor: '#ffdd44',
    bulletSpeed: 700,
    bulletSize: 3
  },
  MORTAR: {
    id: 'mortar',
    name: 'Mortar',
    description: 'Area splash damage, medium fire rate',
    color: '#cc6633',
    faction: 'human',
    levels: [
      { cost: 120, damage: 30, fireRate: 1.5, range: 200, splash: 60 },
      { cost: 100, damage: 55, fireRate: 1.3, range: 210, splash: 70 },
      { cost: 150, damage: 90, fireRate: 1.2, range: 220, splash: 85 }
    ],
    bulletColor: '#ff8844',
    bulletSpeed: 300,
    bulletSize: 6,
    arc: true
  },
  SLOW: {
    id: 'slow',
    name: 'Frost Tower',
    description: 'Slows enemies, low damage',
    color: '#66ccff',
    faction: 'elf',
    levels: [
      { cost: 70, damage: 5, fireRate: 0.8, range: 130, splash: 0, slowAmount: 0.5, slowDuration: 2000 },
      { cost: 60, damage: 8, fireRate: 0.7, range: 140, splash: 0, slowAmount: 0.6, slowDuration: 2500 },
      { cost: 90, damage: 12, fireRate: 0.6, range: 150, splash: 0, slowAmount: 0.7, slowDuration: 3000 }
    ],
    bulletColor: '#88ddff',
    bulletSpeed: 600,
    bulletSize: 4,
    effect: 'slow'
  },
  ELECTRIC: {
    id: 'electric',
    name: 'Tesla Tower',
    description: 'Chain lightning, hits multiple enemies',
    color: '#aa44ff',
    faction: 'machine',
    levels: [
      { cost: 130, damage: 25, fireRate: 1.2, range: 140, splash: 0, chainCount: 2, chainRange: 80 },
      { cost: 110, damage: 45, fireRate: 1.0, range: 150, splash: 0, chainCount: 3, chainRange: 90 },
      { cost: 160, damage: 75, fireRate: 0.9, range: 160, splash: 0, chainCount: 4, chainRange: 100 }
    ],
    bulletColor: '#cc66ff',
    bulletSpeed: 9999,
    bulletSize: 3,
    effect: 'chain'
  },
  SNIPER: {
    id: 'sniper',
    name: 'Sniper Tower',
    description: 'Extreme range, massive single-target damage',
    color: '#334455',
    faction: 'human',
    unlockCost: 500,
    levels: [
      { cost: 150, damage: 120, fireRate: 3.0, range: 250, splash: 0 },
      { cost: 120, damage: 200, fireRate: 2.5, range: 270, splash: 0 },
      { cost: 180, damage: 320, fireRate: 2.0, range: 300, splash: 0 }
    ],
    bulletColor: '#88aacc',
    bulletSpeed: 1000,
    bulletSize: 4
  },
  FLAMETHROWER: {
    id: 'flamethrower',
    name: 'Flamethrower',
    description: 'Short range, burns enemies in an area',
    color: '#cc3300',
    faction: 'undead',
    unlockCost: 400,
    levels: [
      { cost: 100, damage: 12, fireRate: 0.4, range: 100, splash: 40, burnDamage: 8, burnDuration: 3000 },
      { cost: 90, damage: 20, fireRate: 0.35, range: 110, splash: 50, burnDamage: 12, burnDuration: 3500 },
      { cost: 130, damage: 32, fireRate: 0.3, range: 120, splash: 60, burnDamage: 18, burnDuration: 4000 }
    ],
    bulletColor: '#ff6633',
    bulletSpeed: 400,
    bulletSize: 6,
    effect: 'burn'
  },
  ARC: {
    id: 'arc',
    name: 'Arc Tower',
    description: 'Chains to many enemies with arcing lightning',
    color: '#00ccaa',
    faction: 'machine',
    unlockCost: 450,
    levels: [
      { cost: 120, damage: 15, fireRate: 1.5, range: 150, splash: 0, chainCount: 4, chainRange: 70 },
      { cost: 100, damage: 25, fireRate: 1.3, range: 160, splash: 0, chainCount: 5, chainRange: 80 },
      { cost: 150, damage: 40, fireRate: 1.1, range: 170, splash: 0, chainCount: 6, chainRange: 90 }
    ],
    bulletColor: '#44ffcc',
    bulletSpeed: 9999,
    bulletSize: 2
  }
};

export function getTowerCost(typeId, level) {
  const type = TOWER_TYPES[typeId];
  if (!type || level >= type.levels.length) return -1;
  return type.levels[level].cost;
}

export function getTowerStats(typeId, level) {
  const type = TOWER_TYPES[typeId];
  if (!type || level >= type.levels.length) return null;
  return { ...type.levels[level], bulletColor: type.bulletColor, bulletSpeed: type.bulletSpeed, bulletSize: type.bulletSize, arc: type.arc, effect: type.effect, chainCount: type.levels[level].chainCount, chainRange: type.levels[level].chainRange, color: type.color, name: type.name };
}

export const TOWER_KEYS = Object.keys(TOWER_TYPES);
