// Evolution branch helper
function evo(name, stats) {
  return { name, stats };
}

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
      { cost: 120, damage: 150, fireRate: 1.6, range: 180, splash: 40 }
    ],
    bulletColor: '#333333',
    bulletSpeed: 500,
    bulletSize: 5,
    evolutions: [
      evo('Howitzer', { cost: 250, damage: 250, fireRate: 1.8, range: 190, splash: 80 }),
      evo('Railgun', { cost: 300, damage: 400, fireRate: 2.5, range: 220, splash: 0 })
    ]
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
    bulletSize: 3,
    evolutions: [
      evo('Gatling', { cost: 200, damage: 18, fireRate: 0.06, range: 145, splash: 0 }),
      evo('Heavy MG', { cost: 250, damage: 45, fireRate: 0.18, range: 155, splash: 0 })
    ]
  },
  MORTAR: {
    id: 'mortar',
    name: 'Mortar',
    description: 'Area splash damage, medium fire rate',
    color: '#cc6633',
    faction: 'human',
    levels: [
      { cost: 120, damage: 35, fireRate: 1.5, range: 200, splash: 60 },
      { cost: 100, damage: 60, fireRate: 1.3, range: 210, splash: 75 },
      { cost: 150, damage: 110, fireRate: 1.2, range: 220, splash: 90 }
    ],
    bulletColor: '#ff8844',
    bulletSpeed: 300,
    bulletSize: 6,
    arc: true,
    evolutions: [
      evo('Cluster Bomb', { cost: 300, damage: 80, fireRate: 1.3, range: 230, splash: 130 }),
      evo('Incendiary', { cost: 280, damage: 140, fireRate: 1.5, range: 240, splash: 70, burnDamage: 60, burnDuration: 5000 })
    ]
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
    effect: 'slow',
    evolutions: [
      evo('Blizzard', { cost: 200, damage: 15, fireRate: 0.7, range: 170, splash: 60, slowAmount: 0.8, slowDuration: 3500 }),
      evo('Permafrost', { cost: 220, damage: 8, fireRate: 0.5, range: 160, splash: 0, slowAmount: 0.6, slowDuration: 2000, freezeChance: 0.3, freezeDuration: 2000 })
    ]
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
    effect: 'chain',
    evolutions: [
      evo('Lightning Storm', { cost: 300, damage: 100, fireRate: 1.0, range: 170, splash: 0, chainCount: 6, chainRange: 110 }),
      evo('EMP', { cost: 280, damage: 60, fireRate: 0.8, range: 180, splash: 70, stunDuration: 1500 })
    ]
  },
  SNIPER: {
    id: 'sniper',
    name: 'Sniper Tower',
    description: 'Extreme range, single target',
    color: '#6688aa',
    faction: 'human',
    unlockCost: 300,
    levels: [
      { cost: 150, damage: 130, fireRate: 2.8, range: 260, splash: 0 },
      { cost: 120, damage: 220, fireRate: 2.3, range: 280, splash: 0 },
      { cost: 180, damage: 400, fireRate: 1.8, range: 320, splash: 0 }
    ],
    bulletColor: '#88aacc',
    bulletSpeed: 1000,
    bulletSize: 4,
    evolutions: [
      evo('Anti-Material', { cost: 400, damage: 800, fireRate: 2.5, range: 380, splash: 0 }),
      evo('Auto-Sniper', { cost: 350, damage: 300, fireRate: 1.2, range: 340, splash: 0 })
    ]
  },
  FLAMETHROWER: {
    id: 'flamethrower',
    name: 'Flamethrower',
    description: 'Area burn damage',
    color: '#ff6633',
    faction: 'undead',
    unlockCost: 250,
    levels: [
      { cost: 100, damage: 15, fireRate: 0.4, range: 110, splash: 45, burnDamage: 15, burnDuration: 3000 },
      { cost: 90, damage: 25, fireRate: 0.35, range: 120, splash: 55, burnDamage: 25, burnDuration: 3500 },
      { cost: 130, damage: 40, fireRate: 0.3, range: 130, splash: 65, burnDamage: 45, burnDuration: 4000 }
    ],
    bulletColor: '#ff6633',
    bulletSpeed: 400,
    bulletSize: 6,
    effect: 'burn',
    evolutions: [
      evo('Inferno', { cost: 300, damage: 60, fireRate: 0.35, range: 140, splash: 80, burnDamage: 100, burnDuration: 6000 }),
      evo('Napalm', { cost: 280, damage: 30, fireRate: 0.4, range: 150, splash: 50, burnDamage: 30, burnDuration: 3000, groundFire: true, groundFireDuration: 4000 })
    ]
  },
  OBSERVATION: {
    id: 'observation',
    name: 'Observation Tower',
    description: 'Increases range of nearby towers',
    color: '#88aacc',
    faction: 'elf',
    levels: [
      { cost: 250, damage: 0, fireRate: 999, range: 0, buffRange: 160, rangeBonus: 35 },
      { cost: 200, damage: 0, fireRate: 999, range: 0, buffRange: 190, rangeBonus: 55 },
      { cost: 300, damage: 0, fireRate: 999, range: 0, buffRange: 230, rangeBonus: 80 }
    ],
    isBuffTower: true,
    evolutions: [
      evo('Radar Array', { cost: 500, damage: 0, fireRate: 999, range: 0, buffRange: 320, rangeBonus: 100 }),
      evo('Command Center', { cost: 450, damage: 0, fireRate: 999, range: 0, buffRange: 260, rangeBonus: 60, damageBonus: 0.15 })
    ]
  },
  ARC: {
    id: 'arc',
    name: 'Arc Tower',
    description: 'Chain lightning, hits multiple enemies',
    color: '#44ffcc',
    faction: 'machine',
    unlockCost: 300,
    levels: [
      { cost: 120, damage: 20, fireRate: 1.5, range: 150, splash: 0, chainCount: 5, chainRange: 80 },
      { cost: 100, damage: 35, fireRate: 1.3, range: 160, splash: 0, chainCount: 6, chainRange: 90 },
      { cost: 150, damage: 55, fireRate: 1.1, range: 170, splash: 0, chainCount: 8, chainRange: 110 }
    ],
    bulletColor: '#44ffcc',
    bulletSpeed: 9999,
    bulletSize: 2,
    evolutions: [
      evo('Tesla Coil', { cost: 350, damage: 100, fireRate: 1.2, range: 180, splash: 0, chainCount: 5, chainRange: 120 }),
      evo('Chain Lightning', { cost: 300, damage: 50, fireRate: 1.0, range: 175, splash: 0, chainCount: 12, chainRange: 100 })
    ]
  },
  INSECTICIDE: {
    id: 'insecticide',
    name: 'Pesticide Sprayer',
    description: 'Sprays toxic insecticide, area poison damage',
    color: '#44aa44',
    faction: 'undead',
    unlockCost: 500,
    levels: [
      { cost: 200, damage: 35, fireRate: 0.8, range: 140, splash: 50, poisonDamage: 30, poisonDuration: 4000 },
      { cost: 300, damage: 60, fireRate: 0.7, range: 150, splash: 60, poisonDamage: 50, poisonDuration: 4500 },
      { cost: 400, damage: 100, fireRate: 0.6, range: 160, splash: 70, poisonDamage: 80, poisonDuration: 5000 }
    ],
    bulletColor: '#66ff66',
    bulletSpeed: 400,
    bulletSize: 8,
    effect: 'poison',
    evolutions: [
      evo('Viral Spray', { cost: 500, damage: 80, fireRate: 0.7, range: 170, splash: 60, poisonDamage: 120, poisonDuration: 6000, spreadChance: 0.3 }),
      evo('Acid Rain', { cost: 450, damage: 120, fireRate: 0.8, range: 180, splash: 80, poisonDamage: 20, poisonDuration: 3000, armorReduction: 3 })
    ]
  },

  // ===== 8 新炮塔 =====
  LASER: {
    id: 'laser',
    name: 'Laser Tower',
    description: 'Continuous beam, armor piercing',
    color: '#ff3366',
    faction: 'machine',
    unlockCost: 350,
    levels: [
      { cost: 150, damage: 30, fireRate: 0.3, range: 160, splash: 0 },
      { cost: 130, damage: 55, fireRate: 0.25, range: 170, splash: 0 },
      { cost: 180, damage: 90, fireRate: 0.2, range: 180, splash: 0 }
    ],
    bulletColor: '#ff3366',
    bulletSpeed: 9999,
    bulletSize: 2,
    effect: 'laser',
    evolutions: [
      evo('Beam Cannon', { cost: 350, damage: 160, fireRate: 0.3, range: 210, splash: 0, armorPierce: 5 }),
      evo('Pulse Laser', { cost: 300, damage: 60, fireRate: 0.1, range: 190, splash: 0, chainCount: 3, chainRange: 60 })
    ]
  },
  SHOCKWAVE: {
    id: 'shockwave',
    name: 'Shockwave Tower',
    description: 'Pushes enemies back, AOE stun',
    color: '#ffaa00',
    faction: 'human',
    unlockCost: 400,
    levels: [
      { cost: 180, damage: 20, fireRate: 2.0, range: 130, splash: 60, knockback: 40 },
      { cost: 160, damage: 35, fireRate: 1.7, range: 140, splash: 75, knockback: 55 },
      { cost: 220, damage: 55, fireRate: 1.5, range: 150, splash: 90, knockback: 70 }
    ],
    bulletColor: '#ffcc44',
    bulletSpeed: 400,
    bulletSize: 8,
    effect: 'knockback',
    evolutions: [
      evo('Seismic Hammer', { cost: 400, damage: 100, fireRate: 2.0, range: 160, splash: 120, knockback: 100 }),
      evo('Sonic Disruptor', { cost: 380, damage: 40, fireRate: 1.2, range: 170, splash: 100, stunDuration: 2000 })
    ]
  },
  TESLA: {
    id: 'tesla',
    name: 'Tesla Coil',
    description: 'Massive chain lightning damage',
    color: '#8844ff',
    faction: 'machine',
    unlockCost: 500,
    levels: [
      { cost: 200, damage: 40, fireRate: 1.5, range: 150, splash: 0, chainCount: 3, chainRange: 100 },
      { cost: 180, damage: 70, fireRate: 1.3, range: 160, splash: 0, chainCount: 4, chainRange: 110 },
      { cost: 250, damage: 120, fireRate: 1.1, range: 170, splash: 0, chainCount: 5, chainRange: 120 }
    ],
    bulletColor: '#aa66ff',
    bulletSpeed: 9999,
    bulletSize: 4,
    effect: 'chain',
    evolutions: [
      evo('Thor\'s Hammer', { cost: 500, damage: 200, fireRate: 1.3, range: 190, splash: 0, chainCount: 6, chainRange: 130 }),
      evo('Arc Reactor', { cost: 450, damage: 80, fireRate: 0.7, range: 180, splash: 0, chainCount: 8, chainRange: 100 })
    ]
  },
  SUPPORT: {
    id: 'support',
    name: 'Support Tower',
    description: 'Heals and buffs nearby towers',
    color: '#44dd88',
    faction: 'elf',
    unlockCost: 350,
    levels: [
      { cost: 160, damage: 0, fireRate: 999, range: 0, healRange: 180, healAmount: 5, buffDamage: 1.1 },
      { cost: 140, damage: 0, fireRate: 999, range: 0, healRange: 200, healAmount: 8, buffDamage: 1.15 },
      { cost: 200, damage: 0, fireRate: 999, range: 0, healRange: 220, healAmount: 12, buffDamage: 1.2 }
    ],
    isBuffTower: true,
    evolutions: [
      evo('Great Healer', { cost: 400, damage: 0, fireRate: 999, range: 0, healRange: 260, healAmount: 20, buffDamage: 1.3 }),
      evo('War Drum', { cost: 350, damage: 0, fireRate: 999, range: 0, buffRange: 240, buffDamage: 1.4, buffFireRate: 1.2 })
    ]
  },
  NUKE: {
    id: 'nuke',
    name: 'Nuke Tower',
    description: 'Massive AOE damage, slow fire rate',
    color: '#ff2200',
    faction: 'human',
    unlockCost: 600,
    levels: [
      { cost: 300, damage: 200, fireRate: 4.0, range: 200, splash: 120 },
      { cost: 280, damage: 350, fireRate: 3.5, range: 210, splash: 150 },
      { cost: 400, damage: 600, fireRate: 3.0, range: 220, splash: 180 }
    ],
    bulletColor: '#ff4400',
    bulletSpeed: 350,
    bulletSize: 10,
    arc: true,
    evolutions: [
      evo('Hydrogen Bomb', { cost: 600, damage: 1200, fireRate: 4.5, range: 250, splash: 220 }),
      evo('Dirty Bomb', { cost: 500, damage: 400, fireRate: 3.0, range: 230, splash: 150, poisonDamage: 200, poisonDuration: 8000 })
    ]
  },
  PHANTOM: {
    id: 'phantom',
    name: 'Phantom Tower',
    description: 'Attacks from stealth, ignores armor',
    color: '#8866aa',
    faction: 'undead',
    unlockCost: 450,
    levels: [
      { cost: 180, damage: 40, fireRate: 1.8, range: 170, splash: 0, armorPierce: 3 },
      { cost: 160, damage: 70, fireRate: 1.5, range: 180, splash: 0, armorPierce: 5 },
      { cost: 220, damage: 120, fireRate: 1.3, range: 190, splash: 0, armorPierce: 8 }
    ],
    bulletColor: '#aa88dd',
    bulletSpeed: 700,
    bulletSize: 4,
    effect: 'armorPierce',
    evolutions: [
      evo('Spectral Reaper', { cost: 400, damage: 250, fireRate: 1.8, range: 210, splash: 0, armorPierce: 15 }),
      evo('Ghost Swarm', { cost: 350, damage: 60, fireRate: 0.6, range: 180, splash: 0, splitCount: 3 })
    ]
  },
  PLASMA: {
    id: 'plasma',
    name: 'Plasma Cannon',
    description: 'Charged shot, high damage over time',
    color: '#44ddff',
    faction: 'machine',
    unlockCost: 550,
    levels: [
      { cost: 220, damage: 60, fireRate: 2.0, range: 170, splash: 0, chargeTime: 1.0 },
      { cost: 200, damage: 110, fireRate: 1.8, range: 180, splash: 0, chargeTime: 0.8 },
      { cost: 300, damage: 190, fireRate: 1.5, range: 190, splash: 0, chargeTime: 0.6 }
    ],
    bulletColor: '#88eeff',
    bulletSpeed: 600,
    bulletSize: 6,
    effect: 'plasma',
    evolutions: [
      evo('Fusion Cannon', { cost: 500, damage: 400, fireRate: 2.2, range: 220, splash: 50, chargeTime: 0.5 }),
      evo('Ion Beam', { cost: 450, damage: 150, fireRate: 0.5, range: 200, splash: 0, chainCount: 4, chainRange: 80 })
    ]
  },
  NECROMANCER: {
    id: 'necromancer',
    name: 'Necromancer Tower',
    description: 'Raises dead enemies as skeletons',
    color: '#664488',
    faction: 'undead',
    unlockCost: 500,
    levels: [
      { cost: 200, damage: 20, fireRate: 1.2, range: 150, splash: 0, spawnChance: 0.3, spawnLevel: 1 },
      { cost: 180, damage: 35, fireRate: 1.0, range: 160, splash: 0, spawnChance: 0.4, spawnLevel: 2 },
      { cost: 250, damage: 60, fireRate: 0.9, range: 170, splash: 0, spawnChance: 0.5, spawnLevel: 3 }
    ],
    bulletColor: '#aa88cc',
    bulletSpeed: 500,
    bulletSize: 5,
    effect: 'spawn',
    evolutions: [
      evo('Lich King', { cost: 500, damage: 120, fireRate: 1.0, range: 190, splash: 0, spawnChance: 0.6, spawnLevel: 5 }),
      evo('Bone Lord', { cost: 450, damage: 40, fireRate: 0.5, range: 180, splash: 0, spawnChance: 0.8, spawnLevel: 3, spawnCount: 2 })
    ]
  }
};

export function getTowerCost(typeId, level) {
  const type = TOWER_TYPES[typeId];
  if (!type || level >= type.levels.length) return -1;
  return type.levels[level].cost;
}

export function getTowerStats(typeId, level, branch) {
  const type = TOWER_TYPES[typeId];
  if (!type) return null;
  if (level < 3) {
    if (level >= type.levels.length) return null;
    return { ...type.levels[level], bulletColor: type.bulletColor, bulletSpeed: type.bulletSpeed, bulletSize: type.bulletSize, arc: type.arc, effect: type.effect, chainCount: type.levels[level].chainCount, chainRange: type.levels[level].chainRange, color: type.color, name: type.name };
  }
  if (!type.evolutions || branch === undefined || !type.evolutions[branch]) return null;
  return { ...type.evolutions[branch].stats, bulletColor: type.bulletColor, bulletSpeed: type.bulletSpeed, bulletSize: type.bulletSize, arc: type.arc, effect: type.effect, color: type.color, name: type.evolutions[branch].name };
}

export const TOWER_KEYS = Object.keys(TOWER_TYPES);
