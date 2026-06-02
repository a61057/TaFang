export const HERO_TEMPLATES = {
  scout: {
    id: 'scout', nameKey: 'hero.scout',
    baseHp: 300, baseAttack: 20, baseRange: 150, baseAttackSpeed: 1.2, baseSpeed: 90,
    color: '#5a8a3c', turretColor: '#4a7a2c', cost: 0,
    descKey: 'hero.scoutDesc'
  },
  heavy: {
    id: 'heavy', nameKey: 'hero.heavy',
    baseHp: 520, baseAttack: 16, baseRange: 120, baseAttackSpeed: 1.4, baseSpeed: 70,
    color: '#5a6a8a', turretColor: '#4a5a7a', cost: 200,
    descKey: 'hero.heavyDesc'
  },
  assault: {
    id: 'assault', nameKey: 'hero.assault',
    baseHp: 250, baseAttack: 36, baseRange: 130, baseAttackSpeed: 0.9, baseSpeed: 100,
    color: '#8a5a3a', turretColor: '#7a4a2a', cost: 250,
    descKey: 'hero.assaultDesc'
  },
  sniper: {
    id: 'sniper', nameKey: 'hero.sniper',
    baseHp: 200, baseAttack: 24, baseRange: 280, baseAttackSpeed: 1.6, baseSpeed: 80,
    color: '#4a7a6a', turretColor: '#3a6a5a', cost: 300,
    descKey: 'hero.sniperDesc'
  },
  medic: {
    id: 'medic', nameKey: 'hero.medic',
    baseHp: 280, baseAttack: 12, baseRange: 140, baseAttackSpeed: 1.0, baseSpeed: 85,
    color: '#dde', turretColor: '#ccc', cost: 200,
    descKey: 'hero.medicDesc'
  },
  flame: {
    id: 'flame', nameKey: 'hero.flame',
    baseHp: 320, baseAttack: 30, baseRange: 100, baseAttackSpeed: 1.1, baseSpeed: 75,
    color: '#d84', turretColor: '#c73', cost: 280,
    descKey: 'hero.flameDesc'
  },
  ninja: {
    id: 'ninja', nameKey: 'hero.ninja',
    baseHp: 200, baseAttack: 40, baseRange: 60, baseAttackSpeed: 0.7, baseSpeed: 130,
    color: '#869', turretColor: '#758', cost: 300,
    descKey: 'hero.ninjaDesc'
  },
  engineer: {
    id: 'engineer', nameKey: 'hero.engineer',
    baseHp: 260, baseAttack: 10, baseRange: 160, baseAttackSpeed: 1.3, baseSpeed: 90,
    color: '#fd0', turretColor: '#ec0', cost: 220,
    descKey: 'hero.engineerDesc'
  },
  void: {
    id: 'void', nameKey: 'hero.void',
    baseHp: 240, baseAttack: 28, baseRange: 200, baseAttackSpeed: 1.2, baseSpeed: 95,
    color: '#a6f', turretColor: '#95e', cost: 350,
    descKey: 'hero.voidDesc'
  }
};

export const WEAPONS = {
  reinforced_barrel: {
    id: 'reinforced_barrel', nameKey: 'weapon.reinforced_barrel',
    stat: 'attack', bonus: 10, cost: 120,
    descKey: 'weapon.reinforced_barrelDesc'
  },
  scope: {
    id: 'scope', nameKey: 'weapon.scope',
    stat: 'range', bonus: 35, cost: 150,
    descKey: 'weapon.scopeDesc'
  },
  armor_plate: {
    id: 'armor_plate', nameKey: 'weapon.armor_plate',
    stat: 'maxHp', bonus: 120, cost: 160,
    descKey: 'weapon.armor_plateDesc'
  },
  booster: {
    id: 'booster', nameKey: 'weapon.booster',
    stat: 'speed', bonus: 25, cost: 100,
    descKey: 'weapon.boosterDesc'
  },
  energy_core: {
    id: 'energy_core', nameKey: 'weapon.energy_core',
    stat: 'attackSpeed', bonus: -0.25, cost: 200,
    descKey: 'weapon.energy_coreDesc'
  },
  prism_lens: {
    id: 'prism_lens', nameKey: 'weapon.prism_lens',
    stat: 'range', bonus: 60, cost: 250,
    descKey: 'weapon.prism_lensDesc'
  },
  life_steal: {
    id: 'life_steal', nameKey: 'weapon.life_steal',
    stat: 'attack', bonus: 6, cost: 150,
    descKey: 'weapon.life_stealDesc'
  },
  grenade: {
    id: 'grenade', nameKey: 'weapon.grenade',
    stat: 'range', bonus: 25, cost: 180,
    descKey: 'weapon.grenadeDesc'
  }
};

export const MAX_EQUIPPED = 3;
