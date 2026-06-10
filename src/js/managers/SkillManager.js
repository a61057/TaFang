import { HERO_SKILLS } from '../config/heroSkills.js';
import { WEAPONS } from '../config/heroData.js';
import { TILE_SIZE, COLS, ROWS } from '../config/constants.js';
import { Skeleton } from '../entities/Skeleton.js';

export class SkillManager {
  constructor(engine) {
    this.engine = engine;
    this._skillTimers = new Map();
    this._activeEffects = [];
    this._napalmZones = [];
    this._regenAuraTowers = new Set();
    this._deployedTurrets = [];
    this._voidRifts = [];
  }

  getSkillDef(heroType, slot) {
    const template = HERO_SKILLS[heroType];
    if (!template) return null;
    return template.skills[slot] || null;
  }

  getCooldownRemaining(heroId, skillId) {
    const key = `${heroId}_${skillId}`;
    return this._skillTimers.get(key) || 0;
  }

  isOnCooldown(heroId, skillId) {
    return this.getCooldownRemaining(heroId, skillId) > 0;
  }

  canUseSkill(hero, slot) {
    if (!hero || !hero.alive) return false;
    const def = this.getSkillDef(hero._template.id, slot);
    if (!def) return false;
    return !this.isOnCooldown(hero._template.id + '_' + hero.heroIndex, def.id);
  }

  useSkill(hero, slot) {
    if (!this.canUseSkill(hero, slot)) return false;
    const def = this.getSkillDef(hero._template.id, slot);
    if (!def) return false;

    const key = `${hero._template.id}_${hero.heroIndex}_${def.id}`;
    this._skillTimers.set(key, def.cooldown);

    this._executeSkill(hero, def.id);
    return true;
  }

  _executeSkill(hero, skillId) {
    switch (skillId) {
      case 'tactical_roll': this._tacticalRoll(hero); break;
      case 'flare': this._flare(hero); break;
      case 'fortify': this._fortify(hero); break;
      case 'shockwave': this._shockwave(hero); break;
      case 'adrenaline': this._adrenaline(hero); break;
      case 'frag_grenade': this._fragGrenade(hero); break;
      case 'piercing_shot': this._piercingShot(hero); break;
      case 'mark_target': this._markTarget(hero); break;
      case 'heal': this._heal(hero); break;
      case 'regen_aura': this._regenAura(hero); break;
      case 'napalm': this._napalm(hero); break;
      case 'fire_shield': this._fireShield(hero); break;
      case 'shadow_strike': this._shadowStrike(hero); break;
      case 'smoke_bomb': this._smokeBomb(hero); break;
      case 'deploy_turret': this._deployTurret(hero); break;
      case 'overcharge': this._overcharge(hero); break;
      case 'void_rift': this._voidRift(hero); break;
      case 'phase_shift': this._phaseShift(hero); break;
    }
  }

  update(dt) {
    for (const [key, val] of this._skillTimers) {
      const nv = val - dt;
      if (nv <= 0) this._skillTimers.delete(key);
      else this._skillTimers.set(key, nv);
    }

    this._updateActiveEffects(dt);
    this._updateNapalmZones(dt);
    this._updateVoidRifts(dt);
    this._updateTurrets(dt);
  }

  // ========== SKILL IMPLEMENTATIONS ==========

  _tacticalRoll(hero) {
    const angle = hero.angle;
    const dist = 120;
    hero.x += Math.cos(angle) * dist;
    hero.y += Math.sin(angle) * dist;
    this._addActiveEffect(hero, 'invuln', 0.4);
    this._spawnParticles(hero.x, hero.y, '#aaddff', 10);
  }

  _flare(hero) {
    const enemies = this.engine.enemyManager.getAlive();
    const range = 200;
    for (const e of enemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      if (Math.sqrt(dx * dx + dy * dy) <= range) {
        e.addStatusEffect('slow', 0.5, 3000);
      }
    }
    this._spawnParticles(hero.x, hero.y, '#ffff88', 20);
  }

  _fortify(hero) {
    this._addActiveEffect(hero, 'fortify', 4);
    hero._fortifyActive = true;
    this._spawnParticles(hero.x, hero.y, '#8888ff', 8);
  }

  _shockwave(hero) {
    const enemies = this.engine.enemyManager.getAlive();
    const range = 120;
    for (const e of enemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= range) {
        const dmg = 40 + hero.level * 8;
        e.takeDamage(dmg, true);
        e.addStatusEffect('stun', 1, 1500);
        this.engine.stats.totalDamageDealt += dmg;
      }
    }
    this._spawnParticles(hero.x, hero.y, '#ff8844', 25);
  }

  _adrenaline(hero) {
    this._addActiveEffect(hero, 'adrenaline', 5);
    hero._adrenalineActive = true;
    this._spawnParticles(hero.x, hero.y, '#ff4444', 12);
  }

  _fragGrenade(hero) {
    const target = hero.currentTarget || this._findClosestEnemy(hero, 300);
    if (!target) return;
    const enemies = this.engine.enemyManager.getAlive();
    const range = 80;
    for (const e of enemies) {
      const dx = e.x - target.x;
      const dy = e.y - target.y;
      if (Math.sqrt(dx * dx + dy * dy) <= range) {
        const dmg = 80 + hero.level * 10;
        e.takeDamage(dmg, true);
        this.engine.stats.totalDamageDealt += dmg;
      }
    }
    this._spawnParticles(target.x, target.y, '#ff6600', 20);
  }

  _piercingShot(hero) {
    this._addActiveEffect(hero, 'piercing', 3);
    hero._piercingActive = true;
    hero._piercedEnemies = new Set();
  }

  _markTarget(hero) {
    const target = hero.currentTarget || this._findClosestEnemy(hero, 400);
    if (!target) return;
    target._marked = true;
    target._markedTimer = 6;
    this._spawnParticles(target.x, target.y, '#ff00ff', 10);
  }

  _heal(hero) {
    let bestTower = null;
    let bestMissing = 0;
    for (const t of this.engine.towerManager.getTowers()) {
      if (!t.alive) continue;
      const missing = t.maxHp - t.hp;
      if (missing > bestMissing) {
        bestMissing = missing;
        bestTower = t;
      }
    }
    if (bestTower) {
      const healAmt = Math.floor(bestTower.maxHp * 0.3);
      bestTower.hp = Math.min(bestTower.maxHp, bestTower.hp + healAmt);
      this._spawnParticles(bestTower.x, bestTower.y, '#44ff44', 10);
    }
  }

  _regenAura(hero) {
    this._addActiveEffect(hero, 'regen_aura', 8);
    hero._regenAuraActive = true;
    this._regenAuraTowers.clear();
    for (const t of this.engine.towerManager.getTowers()) {
      if (!t.alive) continue;
      const dx = t.x - hero.x;
      const dy = t.y - hero.y;
      if (Math.sqrt(dx * dx + dy * dy) <= 250) {
        this._regenAuraTowers.add(t);
      }
    }
    this._spawnParticles(hero.x, hero.y, '#44ff88', 15);
  }

  _napalm(hero) {
    this._napalmZones.push({
      x: hero.x, y: hero.y,
      radius: 80,
      duration: 6,
      life: 6,
      damage: 25 + hero.level * 5
    });
    this._spawnParticles(hero.x, hero.y, '#ff4400', 15);
  }

  _fireShield(hero) {
    this._addActiveEffect(hero, 'fire_shield', 6);
    hero._fireShieldActive = true;
    this._spawnParticles(hero.x, hero.y, '#ff8800', 12);
  }

  _shadowStrike(hero) {
    const target = hero.currentTarget || this._findClosestEnemy(hero, 300);
    if (!target) return;
    hero.x = target.x + Math.cos(hero.angle) * 20;
    hero.y = target.y + Math.sin(hero.angle) * 20;
    const dmg = Math.floor(hero.attack * 2 * (hero._atkMult || 1));
    target.takeDamage(dmg, true);
    this.engine.stats.totalDamageDealt += dmg;
    this._spawnParticles(target.x, target.y, '#aa88ff', 15);
  }

  _smokeBomb(hero) {
    const enemies = this.engine.enemyManager.getAlive();
    const range = 120;
    for (const e of enemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      if (Math.sqrt(dx * dx + dy * dy) <= range) {
        e._confused = true;
        e._confusedTimer = 3;
      }
    }
    this._spawnParticles(hero.x, hero.y, '#888888', 20);
  }

  _deployTurret(hero) {
    const turret = new Skeleton();
    const path = this.engine.map.getPathPixels();
    if (!path || path.length < 2) return;
    const pos = path[Math.min(3, path.length - 1)];
    turret.x = hero.x + Math.cos(hero.angle) * 30;
    turret.y = hero.y + Math.sin(hero.angle) * 30;
    turret.hp = 100;
    turret.maxHp = 100;
    turret.damage = 20 + hero.level * 3;
    turret.speed = 0;
    turret.alive = true;
    turret.lifetime = 15;
    turret.maxLifetime = 15;
    turret.attackCooldown = 0;
    turret.attackRate = 0.8;
    turret.attackRange = 150;
    turret.size = 10;
    turret.color = '#ffdd00';
    turret._isTurret = true;
    turret.angle = hero.angle;
    this._deployedTurrets.push(turret);
    this._spawnParticles(turret.x, turret.y, '#ffdd00', 10);
  }

  _overcharge(hero) {
    const range = 200;
    for (const t of this.engine.towerManager.getTowers()) {
      if (!t.alive) continue;
      const dx = t.x - hero.x;
      const dy = t.y - hero.y;
      if (Math.sqrt(dx * dx + dy * dy) <= range) {
        t._overcharged = true;
        t._overchargeTimer = 6;
      }
    }
    this._addActiveEffect(hero, 'overcharge', 6);
    this._spawnParticles(hero.x, hero.y, '#ffff00', 15);
  }

  _voidRift(hero) {
    const target = hero.currentTarget || this._findClosestEnemy(hero, 300);
    const pos = target || { x: hero.x + Math.cos(hero.angle) * 100, y: hero.y + Math.sin(hero.angle) * 100 };
    this._voidRifts.push({
      x: pos.x, y: pos.y,
      radius: 80,
      duration: 5,
      life: 5,
      damagePct: 0.05
    });
    this._spawnParticles(pos.x, pos.y, '#aa44ff', 20);
  }

  _phaseShift(hero) {
    const mx = this.engine._cursorWorldX !== undefined ? this.engine._cursorWorldX : hero.x + 100;
    const my = this.engine._cursorWorldY !== undefined ? this.engine._cursorWorldY : hero.y;
    hero.x = mx;
    hero.y = my;
    this._spawnParticles(hero.x, hero.y, '#aa66ff', 15);
  }

  // ========== EFFECT UPDATES ==========

  _addActiveEffect(hero, type, duration) {
    this._activeEffects.push({
      heroId: hero._template.id,
      heroIndex: hero.heroIndex,
      type,
      remaining: duration,
      total: duration
    });
  }

  _updateActiveEffects(dt) {
    for (let i = this._activeEffects.length - 1; i >= 0; i--) {
      const fx = this._activeEffects[i];
      fx.remaining -= dt;
      if (fx.remaining <= 0) {
        this._clearEffect(fx);
        this._activeEffects.splice(i, 1);
      }
    }
  }

  _clearEffect(fx) {
    const hero = this.engine.heroes.find(h => h._template && h._template.id === fx.heroId && h.heroIndex === fx.heroIndex);
    if (!hero) return;
    if (fx.type === 'fortify') hero._fortifyActive = false;
    if (fx.type === 'adrenaline') hero._adrenalineActive = false;
    if (fx.type === 'piercing') hero._piercingActive = false;
    if (fx.type === 'regen_aura') {
      hero._regenAuraActive = false;
      this._regenAuraTowers.clear();
    }
    if (fx.type === 'invuln') { /* handled in takeDamage */ }
    if (fx.type === 'fire_shield') hero._fireShieldActive = false;
    if (fx.type === 'overcharge') {
      for (const t of this.engine.towerManager.getTowers()) {
        t._overcharged = false;
        t._overchargeTimer = 0;
      }
    }
  }

  getEffectRemaining(hero, type) {
    for (const fx of this._activeEffects) {
      if (fx.heroId === hero._template.id && fx.heroIndex === hero.heroIndex && fx.type === type) {
        return fx.remaining;
      }
    }
    return 0;
  }

  _updateNapalmZones(dt) {
    for (let i = this._napalmZones.length - 1; i >= 0; i--) {
      const z = this._napalmZones[i];
      z.life -= dt;
      if (z.life <= 0) {
        this._napalmZones.splice(i, 1);
        continue;
      }
      const enemies = this.engine.enemyManager.getAlive();
      for (const e of enemies) {
        const dx = e.x - z.x;
        const dy = e.y - z.y;
        if (Math.sqrt(dx * dx + dy * dy) <= z.radius) {
          e.addStatusEffect('burn', 1, 1000);
          e.takeDamage(z.damage * dt, true);
        }
      }
    }
  }

  _updateVoidRifts(dt) {
    for (let i = this._voidRifts.length - 1; i >= 0; i--) {
      const r = this._voidRifts[i];
      r.life -= dt;
      if (r.life <= 0) {
        this._voidRifts.splice(i, 1);
        continue;
      }
      const enemies = this.engine.enemyManager.getAlive();
      for (const e of enemies) {
        const dx = e.x - r.x;
        const dy = e.y - r.y;
        if (Math.sqrt(dx * dx + dy * dy) <= r.radius) {
          const dmg = Math.floor(e.maxHp * r.damagePct * dt);
          e.takeDamage(dmg, true);
          this.engine.stats.totalDamageDealt += dmg;
        }
      }
    }
  }

  _updateTurrets(dt) {
    for (let i = this._deployedTurrets.length - 1; i >= 0; i--) {
      const t = this._deployedTurrets[i];
      if (!t.alive) { this._deployedTurrets.splice(i, 1); continue; }
      t.lifetime -= dt;
      if (t.lifetime <= 0) { t.alive = false; this._deployedTurrets.splice(i, 1); continue; }
      t.attackCooldown = Math.max(0, t.attackCooldown - dt);
      const enemies = this.engine.enemyManager.getAlive();
      t.target = this._findClosestTarget(t, enemies, t.attackRange);
      if (t.target && t.attackCooldown <= 0) {
        t.attackCooldown = t.attackRate;
        t.target.takeDamage(t.damage, true);
        this.engine.stats.totalDamageDealt += t.damage;
        this._spawnParticles(t.target.x, t.target.y, '#ffdd00', 3);
      }
    }
  }

  // ========== UTILITY ==========

  _findClosestEnemy(hero, maxRange) {
    const enemies = this.engine.enemyManager.getAlive();
    let best = null;
    let bestDist = maxRange;
    for (const e of enemies) {
      const dx = e.x - hero.x;
      const dy = e.y - hero.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) { bestDist = dist; best = e; }
    }
    return best;
  }

  _findClosestTarget(entity, enemies, maxRange) {
    let best = null;
    let bestDist = maxRange;
    for (const e of enemies) {
      const dx = e.x - entity.x;
      const dy = e.y - entity.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) { bestDist = dist; best = e; }
    }
    return best;
  }

  _spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.engine.particles.emit(x, y, 3, {
        color, speed: 40 + Math.random() * 60, size: 2 + Math.random() * 3, life: 200 + Math.random() * 200
      });
    }
  }

  getActiveEffects() {
    return this._activeEffects;
  }

  getNapalmZones() {
    return this._napalmZones;
  }

  getVoidRifts() {
    return this._voidRifts;
  }

  getDeployedTurrets() {
    return this._deployedTurrets;
  }
}
