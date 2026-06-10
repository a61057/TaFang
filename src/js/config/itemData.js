export const ITEM_TYPES = {
  DAMAGE_BOOST: {
    id: 'damage_boost',
    type: 'buff',
    icon: 'sword',
    rarity: 'common',
    stackable: true,
    maxStack: 10,
    duration: 30,
    effects: { damageMult: 1.5 }
  },
  SPEED_BOOST: {
    id: 'speed_boost',
    type: 'buff',
    icon: 'lightning',
    rarity: 'common',
    stackable: true,
    maxStack: 10,
    duration: 30,
    effects: { fireRateMult: 1.5 }
  },
  RANGE_BOOST: {
    id: 'range_boost',
    type: 'buff',
    icon: 'target',
    rarity: 'common',
    stackable: true,
    maxStack: 10,
    duration: 30,
    effects: { rangeMult: 1.5 }
  },
  POWER_SURGE: {
    id: 'power_surge',
    type: 'buff',
    icon: 'gem',
    rarity: 'rare',
    stackable: true,
    maxStack: 5,
    duration: 20,
    effects: { damageMult: 2.0, fireRateMult: 1.5 }
  },
  REPAIR_KIT: {
    id: 'repair_kit',
    type: 'repair',
    icon: 'heart',
    rarity: 'common',
    stackable: true,
    maxStack: 5,
    effects: { healPct: 100 }
  },
  NUKE: {
    id: 'nuke',
    type: 'nuke',
    icon: 'bomb',
    rarity: 'epic',
    stackable: false,
    maxStack: 1,
    effects: { damage: 500 }
  },
  FREEZE: {
    id: 'freeze',
    type: 'freeze',
    icon: 'snow',
    rarity: 'rare',
    stackable: true,
    maxStack: 3,
    duration: 5
  },
  GOLD_COIN: {
    id: 'gold_coin',
    type: 'sell',
    icon: 'coin',
    rarity: 'common',
    stackable: true,
    maxStack: 99,
    value: 50
  },
  GOLD_BAR: {
    id: 'gold_bar',
    type: 'sell',
    icon: 'diamond',
    rarity: 'rare',
    stackable: true,
    maxStack: 20,
    value: 200
  },
  OVERCLOCK: {
    id: 'overclock',
    type: 'buff',
    icon: 'fire',
    rarity: 'epic',
    stackable: true,
    maxStack: 3,
    duration: 15,
    effects: { damageMult: 2.5, fireRateMult: 2.0 }
  },

  // 传说品质道具
  PHOENIX_FEATHER: {
    id: 'phoenix_feather',
    type: 'phoenix',
    icon: 'heart',
    rarity: 'legendary',
    stackable: true,
    maxStack: 3,
    effects: {}
  },
  VOID_CORE: {
    id: 'void_core',
    type: 'buff',
    icon: 'gem',
    rarity: 'legendary',
    stackable: true,
    maxStack: 3,
    duration: 60,
    effects: { voidDamagePct: 0.05 }
  },
  TIME_SANDGLASS: {
    id: 'time_sandglass',
    type: 'freeze',
    icon: 'snow',
    rarity: 'legendary',
    stackable: false,
    maxStack: 1,
    duration: 10,
    slowAmount: 0.5
  }
};

export const ITEM_RARITY_COLORS = {
  common: '#aab',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ff8800'
};
