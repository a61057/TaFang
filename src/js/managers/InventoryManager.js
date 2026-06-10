import { ITEM_TYPES } from '../config/itemData.js';

export class InventoryManager {
  constructor() {
    this._items = {};
    this._maxSlots = 20;
  }

  has(itemId) {
    return this._items[itemId] && this._items[itemId] > 0;
  }

  count(itemId) {
    return this._items[itemId] || 0;
  }

  add(itemId, amount = 1) {
    const def = ITEM_TYPES[itemId];
    if (!def) return false;

    const max = def.maxStack || 1;
    const current = this._items[itemId] || 0;
    this._items[itemId] = Math.min(current + amount, max);
    return true;
  }

  remove(itemId, amount = 1) {
    if (!this.has(itemId)) return false;
    this._items[itemId] -= amount;
    if (this._items[itemId] <= 0) delete this._items[itemId];
    return true;
  }

  getAll() {
    const result = [];
    for (const id of Object.keys(this._items)) {
      if (this._items[id] > 0) {
        result.push({ id, count: this._items[id], def: ITEM_TYPES[id] });
      }
    }
    return result;
  }

  getSlotCount() {
    return Object.keys(this._items).filter(k => this._items[k] > 0).length;
  }

  use(itemId, engine, targetTower) {
    const def = ITEM_TYPES[itemId];
    if (!def || !this.has(itemId)) return false;

    switch (def.type) {
      case 'buff':
        if (!targetTower) return false;
        this._applyBuff(targetTower, def);
        this.remove(itemId);
        return true;

      case 'repair':
        if (!targetTower) return false;
        if (targetTower.hp !== undefined) {
          targetTower.hp = targetTower.maxHp;
        }
        this.remove(itemId);
        return true;

      case 'nuke':
        if (!engine) return false;
        engine.enemyManager.getAll().forEach(e => {
          if (e.alive) {
            const dmg = def.effects.damage;
            engine.towerManager.damageEnemy(e, dmg, engine.hero);
          }
        });
        this.remove(itemId);
        return true;

      case 'freeze':
        if (!engine) return false;
        engine.enemyManager.getAll().forEach(e => {
          if (e.alive) {
            if (def.slowAmount) {
              e.addStatusEffect('slow', def.slowAmount, (def.duration || 5) * 1000);
            } else {
              e.freezeTime = (e.freezeTime || 0) + (def.duration || 5);
            }
          }
        });
        this.remove(itemId);
        return true;

      case 'phoenix':
        if (!targetTower) return false;
        targetTower._phoenixActive = true;
        this.remove(itemId);
        return true;

      case 'sell':
        if (engine) {
          engine.addGold(def.value || 0);
        }
        this.remove(itemId);
        return true;

      default:
        return false;
    }
  }

  _applyBuff(tower, def) {
    if (!tower.buffs) tower.buffs = [];
    const existing = tower.buffs.find(b => b.id === def.id);
    if (existing) {
      existing.remaining = def.duration;
      return;
    }
    tower.buffs.push({
      id: def.id,
      remaining: def.duration,
      effects: def.effects
    });
  }

  toJSON() {
    return { items: { ...this._items } };
  }

  fromJSON(data) {
    if (!data || !data.items) return;
    this._items = { ...data.items };
  }
}
