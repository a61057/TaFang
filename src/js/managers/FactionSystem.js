import { TOWER_TYPES } from '../config/towerData.js';
import { FACTION_BREAKPOINTS, FACTIONS } from '../config/constants.js';

export class FactionSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activeBonuses = {};
  }

  update(towers) {
    const counts = {};
    for (const t of towers) {
      const type = TOWER_TYPES[t.typeId];
      if (!type || !type.faction) continue;
      const f = type.faction;
      counts[f] = (counts[f] || 0) + 1;
    }

    const newBonuses = {};
    for (const [faction, count] of Object.entries(counts)) {
      for (const bp of FACTION_BREAKPOINTS) {
        if (count >= bp) {
          if (!newBonuses[faction]) newBonuses[faction] = [];
          newBonuses[faction].push(bp);
        }
      }
    }

    const prevKey = JSON.stringify(this.activeBonuses);
    const newKey = JSON.stringify(newBonuses);
    if (prevKey !== newKey) {
      this.activeBonuses = newBonuses;
      if (this.gameEngine) {
        this.gameEngine.emit('faction-change', newBonuses);
      }
    }
  }

  getBonuses() {
    return this.activeBonuses;
  }

  getBonusForTower(typeId) {
    const type = TOWER_TYPES[typeId];
    if (!type || !type.faction) return {};
    const faction = type.faction;
    const thresholds = this.activeBonuses[faction];
    if (!thresholds) return {};
    const maxBp = Math.max(...thresholds);
    switch (faction) {
      case 'human':
        return { fireRateMult: 1 + maxBp * 0.05 };
      case 'elf':
        return { rangeMult: 1 + maxBp * 0.033, entangleChance: maxBp * 0.05 };
      case 'machine':
        return { splashChance: maxBp * 0.05 };
      case 'undead':
        return { spawnChance: maxBp * 0.055 };
      default:
        return {};
    }
  }

  getBonusDescription() {
    const lines = [];
    for (const [faction, thresholds] of Object.entries(this.activeBonuses)) {
      const maxBp = Math.max(...thresholds);
      let desc = '';
      switch (faction) {
        case 'human': desc = `Human ${maxBp}/9: +${maxBp * 5}% attack speed`; break;
        case 'elf': desc = `Elf ${maxBp}/9: +${(maxBp * 3.3).toFixed(0)}% range, ${(maxBp * 5).toFixed(0)}% entangle`; break;
        case 'machine': desc = `Machine ${maxBp}/9: ${(maxBp * 5).toFixed(0)}% splash`; break;
        case 'undead': desc = `Undead ${maxBp}/9: ${(maxBp * 5.5).toFixed(0)}% spawn`; break;
      }
      lines.push(desc);
    }
    return lines;
  }
}
