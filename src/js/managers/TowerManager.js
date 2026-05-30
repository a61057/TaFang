import { Tower } from '../entities/Tower.js';
import { Bullet } from '../entities/Bullet.js';
import { ObjectPool } from '../engine/ObjectPool.js';
import { TOWER_TYPES } from '../config/towerData.js';

export class TowerManager {
  constructor(map) {
    this.map = map;
    this.towers = [];
    this.bulletPool = new ObjectPool(
      () => new Bullet(),
      (b) => b.reset(),
      100
    );
  }

  canBuild(col, row, typeId) {
    if (!this.map.isBuildable(col, row)) return false;
    if (this.getTowerAt(col, row)) return false;
    const type = TOWER_TYPES[typeId];
    if (!type) return false;
    return true;
  }

  buildTower(col, row, typeId) {
    if (!this.canBuild(col, row, typeId)) return null;
    const tower = new Tower();
    tower.init(col, row, typeId);
    this.towers.push(tower);
    return tower;
  }

  removeTower(tower) {
    const idx = this.towers.indexOf(tower);
    if (idx !== -1) {
      const sellValue = tower.getSellValue();
      this.towers.splice(idx, 1);
      return sellValue;
    }
    return 0;
  }

  getTowerAt(col, row) {
    return this.towers.find(t => t.col === col && t.row === row) || null;
  }

  update(dt, enemies, rangeMult = 1, fireRateMult = 1, damageMult = 1) {
    const bullets = this.bulletPool.getActive();

    // 计算瞭望塔的射程加成
    for (const tower of this.towers) {
      tower._rangeBuff = 0;
      if (!tower.alive) continue;
    }
    for (const obs of this.towers) {
      if (!obs.alive) continue;
      if (obs.typeId !== 'OBSERVATION') continue;
      const buffRange = obs.stats ? obs.stats.buffRange || 0 : 0;
      const rangeBonus = obs.stats ? obs.stats.rangeBonus || 0 : 0;
      if (buffRange <= 0) continue;
      for (const tower of this.towers) {
        if (tower === obs) continue;
        if (!tower.alive) continue;
        const dx = tower.x - obs.x;
        const dy = tower.y - obs.y;
        if (Math.sqrt(dx * dx + dy * dy) <= buffRange) {
          tower._rangeBuff = (tower._rangeBuff || 0) + rangeBonus;
        }
      }
    }

    for (const tower of this.towers) {
      if (!tower.alive) continue;
      if (tower.stunned) continue;
      tower._rangeMult = rangeMult;
      tower._fireRateMult = fireRateMult;
      tower._enemies = enemies;
      tower.update(dt);

      if (tower.typeId === 'OBSERVATION') continue;

      if (tower.canFire()) {
        const adjRange = ((tower.stats ? tower.stats.range : 150) + (tower._rangeBuff || 0)) * rangeMult;
        const target = tower.findTarget(enemies, adjRange);
        if (target) {
          tower.target = target;
          const fireData = tower.fire();
          if (fireData) {
            if (damageMult !== 1) {
              fireData.damage = Math.max(1, Math.round(fireData.damage * damageMult));
            }
            const bullet = this.bulletPool.get();
            bullet.init(fireData.tower, target, tower.x, tower.y, fireData);
          }
        }
      }
    }

    // Remove destroyed towers
    for (let i = this.towers.length - 1; i >= 0; i--) {
      if (!this.towers[i].alive) {
        this.towers.splice(i, 1);
      }
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      if (!b.alive) continue;
      b.update(dt);
      if (!b.alive) {
        this.bulletPool.release(b);
      }
    }
  }

  getTowersInRange(x, y, radius) {
    const result = [];
    for (const tower of this.towers) {
      if (!tower.alive) continue;
      const dx = tower.x - x;
      const dy = tower.y - y;
      if (Math.sqrt(dx * dx + dy * dy) <= radius) {
        result.push(tower);
      }
    }
    return result;
  }

  render(ctx, offsetX, offsetY, showRange = false) {
    for (const tower of this.towers) {
      tower.render(ctx, offsetX, offsetY, showRange);
    }
  }

  renderBullets(ctx, offsetX, offsetY) {
    const bullets = this.bulletPool.getActive();
    for (const b of bullets) {
      if (b.alive) b.render(ctx, offsetX, offsetY);
    }
  }

  applyFactionBonuses(factionSystem) {
    for (const tower of this.towers) {
      const bonus = factionSystem.getBonusForTower(tower.typeId);
      tower._factionBonus = bonus;
    }
  }

  getTowers() {
    return this.towers;
  }

  clear() {
    this.towers = [];
    this.bulletPool.releaseAll();
  }

  toJSON() {
    return this.towers.map(t => t.toJSON());
  }

  fromJSON(data) {
    this.clear();
    for (const tData of data) {
      const tower = Tower.fromJSON(tData);
      this.towers.push(tower);
    }
  }
}
