import { TILE_SIZE } from '../config/constants.js';

const STATUS_EFFECTS = {
  SLOW: { color: '#66ccff', label: 'Slow' },
  BURN: { color: '#ff6644', label: 'Burn' },
  STUN: { color: '#ffff00', label: 'Stun' },
  POISON: { color: '#44ff44', label: 'Poison' },
  ENTANGLE: { color: '#44cc44', label: 'Entangle' }
};

export class Enemy {
  constructor() {
    this.id = -1;
    this.type = null;
    this.maxHp = 0;
    this.hp = 0;
    this.baseSpeed = 0;
    this.speed = 0;
    this.armor = 0;
    this.bounty = 0;
    this.color = '#e74c3c';
    this.size = 12;
    this.isFlying = false;
    this.isBoss = false;
    this.alive = true;
    this.reachedEnd = false;

    this.pathIndex = 0;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.progress = 0;

    this.statusEffects = [];
    this.hitFlash = 0;
    this.totalDistanceTraveled = 0;
    this.pathProgress = 0;

    this.hpBarWidth = 24;
    this.hpBarHeight = 3;

    // Bomber specific
    this.bombsDropped = 0;
    this.bombTimer = 0;
    this.bombInterval = 3;
    this._towerManager = null;

    // Hero skill effects
    this._marked = false;
    this._markedTimer = 0;
    this._confused = false;
    this._confusedTimer = 0;
  }

  init(type, stats, startX, startY, pathLength) {
    this.type = stats.type || type;
    this.name = stats.name || type;
    this.maxHp = stats.maxHp;
    this.hp = stats.maxHp;
    this.baseSpeed = stats.speed;
    this.speed = stats.speed;
    this.armor = stats.armor;
    this.bounty = stats.bounty;
    this.color = stats.color;
    this.size = stats.size;
    this.isFlying = stats.isFlying;
    this.isBoss = stats.isBoss;
    this.alive = true;
    this.reachedEnd = false;

    this.pathIndex = 0;
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.progress = 0;

    this.statusEffects = [];
    this.hitFlash = 0;
    this.totalDistanceTraveled = 0;
    this.pathProgress = 0;

    this._leaked = false;
    this._killed = false;
    this._isBoss = this.isBoss;
    this._killerTower = null;
    this.spawnFlash = 1;

    // Bomber init
    if (this.type === 'bomber') {
      this.bombsDropped = 0;
      this.bombTimer = 2.5 + Math.random() * 1;
      this.bombInterval = 2.5 + Math.random() * 0.5;
    }

    // Regenerator
    if (this.type === 'regenerator') {
      this.healRate = stats.healRate || 8;
    }

    // Shielded
    if (this.type === 'shielded') {
      this.shieldMax = stats.shieldHp || 100;
      this.shieldHp = this.shieldMax;
      this.shieldRecharge = stats.shieldRecharge || 5;
      this.shieldCooldown = stats.shieldCooldown || 8;
      this.shieldTimer = 0;
    }

    // Splitter
    if (this.type === 'splitter') {
      this.splitCount = stats.splitCount || 2;
    }

    // Stealth
    if (this.type === 'stealth') {
      this.revealRange = stats.revealRange || 200;
      this._revealed = false;
    }

    // Leech
    if (this.type === 'leech') {
      this.goldSteal = stats.goldSteal || 5;
    }

    // Void
    if (this.type === 'void') {
      this.teleportInterval = stats.teleportInterval || 5;
      this.teleportRange = stats.teleportRange || 80;
      this.teleportTimer = this.teleportInterval * (0.5 + Math.random() * 0.5);
    }

    // Crystal
    if (this.type === 'crystal') {
      this.reflectPct = stats.reflectPct || 0.15;
    }

    // Boss talents
    this.bossTalents = stats.bossTalents || [];
    this._rageActive = false;
    this._summonTimer = 0;
    if (this.bossTalents.includes('summonMinions')) {
      this._summonInterval = 4 + Math.random() * 2;
    }

    return this;
  }

  reset() {
    this.type = null;
    this.alive = false;
    this.reachedEnd = false;
    this.statusEffects = [];
    this.hitFlash = 0;
    this.bombsDropped = 0;
    this.bombTimer = 0;
    this._towerManager = null;
    this._bomberDone = false;
    this._bombTargetX = undefined;
    this._bombTargetY = undefined;
    this._revealed = false;
    this._rageActive = false;
    this._summonTimer = 0;
    this.healRate = 0;
    this.shieldHp = 0;
    this.shieldMax = 0;
    this.shieldRecharge = 0;
    this.shieldCooldown = 0;
    this.shieldTimer = 0;
    this.splitCount = 0;
    this.goldSteal = 0;
    this.teleportInterval = 0;
    this.teleportRange = 0;
    this.teleportTimer = 0;
    this.reflectPct = 0;
    this.bossTalents = [];
  }

  setTarget(x, y) {
    this.targetX = x;
    this.targetY = y;
  }

  moveToNextTile(map) {
    this.pathIndex++;
    if (this.pathIndex >= map.getPathLength() - 1) {
      this.reachedEnd = true;
      this.alive = false;
      return;
    }
    const pos = map.getPathPixel(this.pathIndex + 1);
    if (pos) {
      this.targetX = pos.x;
      this.targetY = pos.y;
      this.progress = 0;
    }
  }

  update(dt, map, towerManager) {
    if (!this.alive) return;

    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this._marked) {
      this._markedTimer -= dt;
      if (this._markedTimer <= 0) { this._marked = false; this._markedTimer = 0; }
    }
    if (this._confused) {
      this._confusedTimer -= dt;
      if (this._confusedTimer <= 0) { this._confused = false; this._confusedTimer = 0; }
    }

    // Process status effects
    let speedMultiplier = 1;
    for (let i = this.statusEffects.length - 1; i >= 0; i--) {
      const effect = this.statusEffects[i];
      effect.duration -= dt * 1000;
      if (effect.duration <= 0) {
        this.statusEffects.splice(i, 1);
        continue;
      }
      if (effect.type === 'slow') speedMultiplier *= (1 - effect.amount);
      if (effect.type === 'stun') speedMultiplier = 0;
      if (effect.type === 'entangle') speedMultiplier = 0;
      if (effect.type === 'burn') {
        this.takeDamage(effect.amount * dt, false);
      }
      if (effect.type === 'poison') {
        this.takeDamage(effect.amount * dt, false);
      }
    }

    // Special enemy behaviors
    if (this.type === 'regenerator' && this.hp > 0 && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.healRate * dt);
    }

    if (this.type === 'shielded') {
      if (this.shieldHp <= 0) {
        this.shieldTimer += dt;
        if (this.shieldTimer >= this.shieldCooldown) {
          this.shieldTimer = 0;
          this.shieldHp = this.shieldMax;
        }
      }
    }

    if (this.type === 'stealth' && towerManager) {
      if (!this._revealed) {
        const towers = towerManager.getTowers();
        for (const tower of towers) {
          const dx = tower.x - this.x;
          const dy = tower.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) <= this.revealRange) {
            this._revealed = true;
            break;
          }
        }
      }
    }

    if (this.type === 'void') {
      this.teleportTimer -= dt;
      if (this.teleportTimer <= 0 && this.pathIndex > 0) {
        this.teleportTimer = this.teleportInterval;
        const jumpTiles = Math.min(3, (map.getPathLength() - 1) - this.pathIndex);
        if (jumpTiles > 0) {
          this.pathIndex += jumpTiles;
          this.progress = 0;
          const pos = map.getPathPixel(Math.min(this.pathIndex, map.getPathLength() - 1));
          if (pos) {
            this.x = pos.x;
            this.y = pos.y;
            this.targetX = pos.x;
            this.targetY = pos.y;
          }
        }
      }
    }

    // Boss talents
    if (this.isBoss) {
      if (this.bossTalents.includes('rage') && this.hp / this.maxHp < 0.3 && !this._rageActive) {
        this._rageActive = true;
        this.speed *= 1.5;
      }
      if (this.bossTalents.includes('summonMinions') && towerManager && towerManager._enemyManager) {
        this._summonTimer -= dt;
        if (this._summonTimer <= 0) {
          this._summonTimer = this._summonInterval;
          const em = towerManager._enemyManager;
          if (em && typeof em.spawnEnemyAt === 'function') {
            const normalStats = { type: 'normal', name: 'Minion', color: '#cc5555', maxHp: 40, speed: 50, armor: 0, bounty: 5, size: 8, isFlying: false, isBoss: false };
            em.spawnEnemyAt(normalStats, this.x + (Math.random() - 0.5) * 40, this.y + (Math.random() - 0.5) * 40);
          }
        }
      }
    }

    const currentSpeed = this.speed * speedMultiplier;

    if (this._confused) {
      const angle = Date.now() / 500 + this.id * 2.1;
      this.x += Math.cos(angle) * currentSpeed * dt;
      this.y += Math.sin(angle) * currentSpeed * dt;
      return;
    }

    if (this.pathIndex >= map.getPathLength() - 1) {
      this.reachedEnd = true;
      this.alive = false;
      return;
    }

    const dist = currentSpeed * dt;
    this.progress += dist;
    this.totalDistanceTraveled += dist;

    const cur = map.getPathPixel(this.pathIndex);
    const nxt = map.getPathPixel(this.pathIndex + 1);
    if (!cur || !nxt) {
      this.reachedEnd = true;
      this.alive = false;
      return;
    }

    const segDx = nxt.x - cur.x;
    const segDy = nxt.y - cur.y;
    const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
    this.pathProgress = (this.pathIndex + Math.min(1, this.progress / segLen)) / (map.getPathLength() - 1);

    if (this.progress >= segLen) {
      this.progress -= segLen;
      this.pathIndex++;
      this.x = nxt.x;
      this.y = nxt.y;
      if (this.pathIndex < map.getPathLength() - 1) {
        const next = map.getPathPixel(this.pathIndex + 1);
        if (next) {
          this.targetX = next.x;
          this.targetY = next.y;
        }
      }
    } else {
      const t = segLen > 0 ? this.progress / segLen : 0;
      this.x = cur.x + segDx * t;
      this.y = cur.y + segDy * t;
    }

    // Bomber: drop bombs on towers
    if (this.type === 'bomber' && towerManager) {
      this.bombTimer -= dt;
      if (this.bombTimer <= 0 && this.bombsDropped < 5) {
        this.bombTimer = this.bombInterval;
        this.bombsDropped++;
        this._dropBomb(towerManager);
      }
      if (this.bombsDropped >= 5) {
        this._bomberDone = true;
        this.reachedEnd = true;
        this.alive = false;
      }
    }
  }

  _dropBomb(towerManager) {
    const towers = towerManager.getTowers();
    if (towers.length === 0) return;

    // Find nearest tower
    let nearest = null;
    let nearestDist = Infinity;
    for (const tower of towers) {
      if (!tower.alive) continue;
      const dx = tower.x - this.x;
      const dy = tower.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = tower;
      }
    }
    if (!nearest) return;

    // Bomb explosion damage to towers in radius
    const bombRadius = 70;
    const damage = 60;
    const targets = towerManager.getTowersInRange(nearest.x, nearest.y, bombRadius);
    for (const target of targets) {
      if (target.alive) {
        target.takeDamage(damage);
      }
    }

    // Store bomb target for particle effects
    this._bombTargetX = nearest.x;
    this._bombTargetY = nearest.y;
  }

  takeDamage(damage, physical = true, source = null) {
    let effectiveDamage = damage;
    if (this._marked && this._markedTimer > 0) {
      effectiveDamage = Math.floor(effectiveDamage * 1.5);
    }
    if (physical) {
      effectiveDamage = Math.max(1, effectiveDamage - this.armor);
    }

    // Shielded: absorb damage with shield first
    if (this.type === 'shielded' && this.shieldHp > 0) {
      const absorbed = Math.min(this.shieldHp, effectiveDamage);
      this.shieldHp -= absorbed;
      effectiveDamage -= absorbed;
      this.shieldTimer = 0;
    }

    // Crystal: reflect damage back
    if (this.type === 'crystal' && this.reflectPct > 0 && source && typeof source.takeDamage === 'function') {
      const reflected = Math.floor(effectiveDamage * this.reflectPct);
      if (reflected > 0) {
        source.takeDamage(reflected, false);
      }
    }

    this.hp -= effectiveDamage;
    this.hitFlash = 0.1;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return effectiveDamage;
  }

  addStatusEffect(type, amount, duration) {
    if (this.isFlying && type === 'slow') return;
    const existing = this.statusEffects.find(e => e.type === type);
    if (existing) {
      existing.duration = Math.max(existing.duration, duration);
      existing.amount = Math.max(existing.amount, amount);
    } else {
      this.statusEffects.push({ type, amount, duration });
    }
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    if (!this.alive) return;

    const x = this.x + offsetX;
    const y = this.y + offsetY;

    // Spawn flash effect
    if (this.spawnFlash > 0) {
      this.spawnFlash -= 0.03;
      ctx.globalAlpha = Math.min(1, this.spawnFlash * 3);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, this.size * (1 + (1 - this.spawnFlash) * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Body
    ctx.save();

    // Stealth: fade out when not revealed
    if (this.type === 'stealth' && !this._revealed) {
      ctx.globalAlpha = 0.2;
    }

    if (this.hitFlash > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
    } else if (this.type === 'megaboss') {
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 25;
    } else if (this.isBoss) {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 8;
    }

    if (this.type === 'bomber') {
      const s = this.size;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 12;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#cc4400';
      ctx.beginPath();
      ctx.moveTo(x - s * 0.2, y - s * 0.05);
      ctx.lineTo(x - s * 0.2, y + s * 0.05);
      ctx.lineTo(x - s * 1.2, y + s * 0.5);
      ctx.lineTo(x - s * 1.0, y);
      ctx.lineTo(x - s * 1.2, y - s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + s * 0.2, y - s * 0.05);
      ctx.lineTo(x + s * 0.2, y + s * 0.05);
      ctx.lineTo(x + s * 1.2, y + s * 0.5);
      ctx.lineTo(x + s * 1.0, y);
      ctx.lineTo(x + s * 1.2, y - s * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#cc4400';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x + s * 0.1, y - s * 0.8);
      ctx.lineTo(x - s * 0.1, y - s * 0.8);
      ctx.closePath();
      ctx.fill();
      const bombsLeft = 5 - this.bombsDropped;
      for (let i = 0; i < bombsLeft; i++) {
        ctx.fillStyle = '#ffcc00';
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(x + (i - 1) * 5, y + s * 0.25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    } else if (this.isFlying) {
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.ellipse(x, y - 5, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (this.type === 'megaboss') {
      ctx.beginPath();
      ctx.arc(x, y, this.size + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (this.isBoss) {
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffdd00';
      ctx.lineWidth = 3;
      ctx.stroke();
    } else if (this.type === 'crystal') {
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      const sides = 6;
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
        const px = x + Math.cos(a) * this.size;
        const py = y + Math.sin(a) * this.size;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (this.type === 'regenerator') {
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#2ecc71';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, this.size + 3, 0, Math.PI * 2);
      ctx.stroke();
      const hpPulse = Math.sin(Date.now() / 400) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(46,204,113,${0.2 * hpPulse})`;
      ctx.beginPath();
      ctx.arc(x, y, this.size + 6 + hpPulse * 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'splitter') {
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#9b59b6';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.arc(x, y, this.size + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.type === 'swarm') {
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, this.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (this.type === 'void') {
      const voidPulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#aa44ff';
      ctx.shadowBlur = 15 * voidPulse;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(170,68,255,0.2)';
      ctx.beginPath();
      ctx.arc(x, y, this.size + 4 + (1 - voidPulse) * 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'shielded') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      if (this.shieldHp > 0) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#3498db';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, this.size + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (this.type === 'leech') {
      ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#8b0000';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(x - 3, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 3, y - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // Draw inner dot for contrast
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(x - this.size * 0.25, y - this.size * 0.25, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Entangle visual: vine effect
    if (this.statusEffects.some(e => e.type === 'entangle')) {
      ctx.save();
      ctx.strokeStyle = '#44cc44';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#44cc44';
      ctx.shadowBlur = 6;
      const t = Date.now() / 300;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const angle = t + i * 2.1;
        const r1 = this.size * 0.6;
        const r2 = this.size * 1.2;
        ctx.moveTo(x + Math.cos(angle) * r1, y + Math.sin(angle) * r1);
        const cpx = x + Math.cos(angle + 0.5) * (r1 + r2) * 0.5;
        const cpy = y + Math.sin(angle + 0.5) * (r1 + r2) * 0.5;
        ctx.quadraticCurveTo(cpx, cpy, x + Math.cos(angle + 1) * r2, y + Math.sin(angle + 1) * r2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // Status effect indicators
    for (const effect of this.statusEffects) {
      const ec = effect.type === 'slow' ? '#66ccff' :
                 effect.type === 'burn' ? '#ff6644' :
                 effect.type === 'stun' ? '#ffff00' :
                 effect.type === 'poison' ? '#44ff44' :
                 effect.type === 'entangle' ? '#44cc44' : '#fff';
      ctx.strokeStyle = ec;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, this.size + 4, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    ctx.restore();

    // Boss name label
    if (this.isBoss && this.name) {
      ctx.save();
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      const ny = y - this.size - 18;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      const nameW = ctx.measureText(this.name).width + 8;
      ctx.fillRect(x - nameW / 2, ny - 7, nameW, 14);
      ctx.fillStyle = '#ffdd00';
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 6;
      ctx.fillText(this.name, x, ny + 4);
      ctx.restore();
    }

    // HP bar
    const hpPct = Math.max(0, this.hp / this.maxHp);
    const barW = this.hpBarWidth;
    const barH = this.hpBarHeight;
    const bx = x - barW / 2;
    const by = y - this.size - 6;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(bx, by, barW * hpPct, barH);
  }
}
