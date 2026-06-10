import { Tower } from '../entities/Tower.js';
import { Bullet } from '../entities/Bullet.js';
import { ObjectPool } from '../engine/ObjectPool.js';
import { TOWER_TYPES } from '../config/towerData.js';
import { SYNERGIES, checkDistance } from '../config/synergies.js';

export class TowerManager {
  constructor(map) {
    this.map = map;
    this.towers = [];
    this.activeSynergies = [];
    this.bulletPool = new ObjectPool(
      () => new Bullet(),
      (b) => b.reset(),
      100
    );
    this._enemyManager = null;
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

    this.activeSynergies = this._checkSynergies();

    for (const tower of this.towers) {
      if (!tower.alive) continue;
      if (tower.stunned) continue;
      if (tower._overcharged) {
        tower._overchargeTimer -= dt;
        if (tower._overchargeTimer <= 0) { tower._overcharged = false; tower._overchargeTimer = 0; }
      }
      tower._rangeMult = rangeMult;
      tower._fireRateMult = fireRateMult * ocMult;
      tower._enemies = enemies;
      tower.update(dt);

      if (tower.typeId === 'OBSERVATION') continue;

      if (tower.canFire()) {
        const adjRange = ((tower.stats ? tower.stats.range : 150) + (tower._rangeBuff || 0)) * rangeMult * (tower._buffRangeMult || 1);
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

    // 凤凰之羽: 自动复活被摧毁的炮塔
    for (const tower of this.towers) {
      if (!tower.alive && tower._phoenixActive && tower._phoenixTimer > 0) {
        tower._phoenixTimer -= dt;
        if (tower._phoenixTimer <= 0) {
          tower.hp = tower.maxHp;
          tower.alive = true;
          tower._phoenixActive = false;
          tower.buildFlash = 1;
        }
      }
    }

    // Remove destroyed towers (skip phoenix-respawning ones)
    for (let i = this.towers.length - 1; i >= 0; i--) {
      const t = this.towers[i];
      if (!t.alive && !t._phoenixActive) {
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

  _checkSynergies() {
    for (const tower of this.towers) {
      if (!tower.alive) continue;
      tower._synergies = [];
      tower._synergyDamageMult = 1;
      tower._synergyRangeMult = 1;
      tower._synergyFireRateMult = 1;
      tower._synergySplashMult = 1;
      tower._synergyBurnDamageMult = 1;
      tower._synergyPoisonDamageMult = 1;
      tower._synergyChainBonus = 0;
    }
    const active = [];
    for (const syn of SYNERGIES) {
      const [typeA, typeB] = syn.pair;
      const towersA = this.towers.filter(t => t.alive && t.typeId === typeA);
      const towersB = this.towers.filter(t => t.alive && t.typeId === typeB);
      if (towersA.length === 0 || towersB.length === 0) continue;
      let found = false;
      for (const a of towersA) {
        for (const b of towersB) {
          if (a === b) continue;
          if (checkDistance(a, b, syn.maxDistance)) {
            if (!a._synergies.includes(syn.id)) a._synergies.push(syn.id);
            if (!b._synergies.includes(syn.id)) b._synergies.push(syn.id);
            found = true;
            _applySynergyEffect(a, syn);
            _applySynergyEffect(b, syn);
          }
        }
      }
      if (found) active.push(syn);
    }
    return active;
  }

  clear() {
    this.towers = [];
    this.bulletPool.releaseAll();
  }
}

function _applySynergyEffect(tower, syn) {
  switch (syn.effect) {
    case 'damageMult':
      tower._synergyDamageMult = Math.max(tower._synergyDamageMult, syn.value);
      break;
    case 'rangeMult':
      tower._synergyRangeMult = Math.max(tower._synergyRangeMult, syn.value);
      break;
    case 'fireRateMult':
      tower._synergyFireRateMult = Math.min(tower._synergyFireRateMult, syn.value);
      break;
    case 'splashMult':
      tower._synergySplashMult = Math.max(tower._synergySplashMult, syn.value);
      break;
    case 'burnDamageMult':
      tower._synergyBurnDamageMult = Math.max(tower._synergyBurnDamageMult, syn.value);
      break;
    case 'poisonDamageMult':
      tower._synergyPoisonDamageMult = Math.max(tower._synergyPoisonDamageMult, syn.value);
      break;
    case 'chainCountBonus':
      tower._synergyChainBonus += syn.value;
      break;
  }
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
