const TALENT_TREE = {
  economy: {
    name: 'Economy',
    icon: '💰',
    talents: [
      { id: 'gold_start', name: 'Rich Start', desc: '+50 starting gold', maxLevel: 3, cost: [1, 2, 3], effect: { startingGold: [20, 35, 50] } },
      { id: 'gold_per_wave', name: 'Interest', desc: '+10% wave gold bonus', maxLevel: 3, cost: [1, 2, 3], effect: { waveGoldMult: [1.1, 1.2, 1.3] } },
      { id: 'sell_refund', name: 'Recycling', desc: '+5% sell refund', maxLevel: 3, cost: [1, 2, 3], effect: { sellRefundBonus: [0.05, 0.1, 0.15] } },
      { id: 'kill_bounty', name: 'Bounty Hunter', desc: '+15% kill bounty', maxLevel: 3, cost: [2, 3, 4], effect: { bountyMult: [1.15, 1.3, 1.5] } },
      { id: 'discount', name: 'Discount', desc: '-5% tower cost', maxLevel: 2, cost: [3, 5], effect: { costDiscount: [0.05, 0.1] } },
    ]
  },
  defense: {
    name: 'Defense',
    icon: '🛡️',
    talents: [
      { id: 'bonus_lives', name: 'Tough', desc: '+2 max lives', maxLevel: 3, cost: [1, 2, 3], effect: { bonusLives: [2, 4, 6] } },
      { id: 'armor_all', name: 'Reinforced', desc: 'All towers +1 armor', maxLevel: 3, cost: [1, 2, 3], effect: { towerArmorBonus: [1, 2, 3] } },
      { id: 'heal_waves', name: 'Repairs', desc: 'Towers heal 10% HP per wave', maxLevel: 2, cost: [2, 3], effect: { towerHealPct: [0.1, 0.2] } },
      { id: 'leak_protect', name: 'Leak Shield', desc: 'First leak each wave costs no life', maxLevel: 1, cost: [4], effect: { leakProtect: [1] } },
    ]
  },
  combat: {
    name: 'Combat',
    icon: '⚔️',
    talents: [
      { id: 'bonus_damage', name: 'Sharpshooter', desc: '+8% tower damage', maxLevel: 3, cost: [1, 2, 3], effect: { damageMult: [1.08, 1.16, 1.25] } },
      { id: 'attack_speed', name: 'Overclock', desc: '+6% attack speed', maxLevel: 3, cost: [1, 2, 3], effect: { speedMult: [0.94, 0.88, 0.82] } },
      { id: 'range_up', name: 'Scout', desc: '+10% tower range', maxLevel: 3, cost: [2, 3, 4], effect: { rangeMult: [1.1, 1.2, 1.3] } },
      { id: 'crit_chance', name: 'Critical', desc: '+5% crit chance (2x damage)', maxLevel: 2, cost: [3, 5], effect: { critChance: [0.05, 0.1], critMult: [2, 2.5] } },
    ]
  },
  heroes: {
    name: 'Heroes',
    icon: '🧙',
    talents: [
      { id: 'hero_xp', name: 'Mentor', desc: '+20% hero XP gain', maxLevel: 3, cost: [1, 2, 3], effect: { xpMult: [1.2, 1.4, 1.6] } },
      { id: 'hero_cooldown', name: 'Haste', desc: '-10% hero skill cooldown', maxLevel: 3, cost: [2, 3, 4], effect: { cdReduction: [0.1, 0.2, 0.3] } },
      { id: 'hero_damage', name: 'Empower', desc: '+15% hero attack', maxLevel: 2, cost: [3, 5], effect: { heroDmgMult: [1.15, 1.3] } },
    ]
  },
  magic: {
    name: 'Magic',
    icon: '🔮',
    talents: [
      { id: 'splash_up', name: 'Explosive', desc: '+15% splash radius', maxLevel: 3, cost: [1, 2, 3], effect: { splashMult: [1.15, 1.3, 1.5] } },
      { id: 'slow_effect', name: 'Chill', desc: '+20% slow effect', maxLevel: 3, cost: [1, 2, 3], effect: { slowBonus: [0.2, 0.4, 0.6] } },
      { id: 'burn_duration', name: 'Inferno', desc: '+30% burn duration', maxLevel: 2, cost: [2, 4], effect: { burnDurationMult: [1.3, 1.6] } },
      { id: 'chain_extra', name: 'Chain Lightning', desc: '+1 chain target', maxLevel: 2, cost: [3, 5], effect: { chainBonus: [1, 2] } },
    ]
  }
};

const TALENT_POINTS_PER_LEVEL = 1;
const MAX_TALENT_LEVEL = 20;

export function getTalentPointAtLevel(level) {
  return TALENT_POINTS_PER_LEVEL;
}

export function getMaxTalentPoints() {
  return MAX_TALENT_LEVEL * TALENT_POINTS_PER_LEVEL;
}

export function getTree() {
  return TALENT_TREE;
}

export function getTotalSpent(progress) {
  let spent = 0;
  for (const branch of Object.values(TALENT_TREE)) {
    for (const talent of branch.talents) {
      spent += progress[talent.id] || 0;
    }
  }
  return spent;
}

export function getTalent(id) {
  for (const branch of Object.values(TALENT_TREE)) {
    for (const talent of branch.talents) {
      if (talent.id === id) return talent;
    }
  }
  return null;
}

export function getTalentCost(talent, currentLevel) {
  if (currentLevel >= talent.maxLevel) return -1;
  return talent.cost[currentLevel] || 999;
}

export function getTalentEffect(talent, level) {
  if (!level || level <= 0) return null;
  const eff = {};
  for (const [key, vals] of Object.entries(talent.effect)) {
    eff[key] = vals[level - 1];
  }
  return eff;
}

export function computeAllEffects(progress) {
  const effects = {};
  for (const branch of Object.values(TALENT_TREE)) {
    for (const talent of branch.talents) {
      const level = progress[talent.id] || 0;
      if (level > 0) {
        const eff = getTalentEffect(talent, level);
        Object.assign(effects, eff);
      }
    }
  }
  return effects;
}

const STORAGE_KEY = 'td_talents';

export function saveTalentProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) { /* ignore */ }
}

export function loadTalentProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function resetTalentProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) { /* ignore */ }
}
