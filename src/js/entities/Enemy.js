import { TILE_SIZE } from '../config/constants.js';

const STATUS_EFFECTS = {
  SLOW: { color: '#66ccff', label: 'Slow' },
  BURN: { color: '#ff6644', label: 'Burn' },
  STUN: { color: '#ffff00', label: 'Stun' },
  POISON: { color: '#44ff44', label: 'Poison' }
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
    this.spawnFlash = 1;

    // Bomber init
    if (this.type === 'bomber') {
      this.bombsDropped = 0;
      this.bombTimer = 2.5 + Math.random() * 1;
      this.bombInterval = 2.5 + Math.random() * 0.5;
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
      if (effect.type === 'burn') {
        this.takeDamage(effect.amount * dt, false);
      }
      if (effect.type === 'poison') {
        this.takeDamage(effect.amount * dt, false);
      }
    }

    const currentSpeed = this.speed * speedMultiplier;

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

  takeDamage(damage, physical = true) {
    let effectiveDamage = damage;
    if (physical) {
      effectiveDamage = Math.max(1, damage - this.armor);
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
      // Plane body
      const s = this.size;
      ctx.globalAlpha = 0.85;
      ctx.shadowColor = '#ff8800';
      ctx.shadowBlur = 12;
      // Fuselage
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(x, y, s * 0.9, s * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
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
      // Tail
      ctx.fillStyle = '#cc4400';
      ctx.beginPath();
      ctx.moveTo(x, y - s * 0.5);
      ctx.lineTo(x + s * 0.1, y - s * 0.8);
      ctx.lineTo(x - s * 0.1, y - s * 0.8);
      ctx.closePath();
      ctx.fill();
      // Bomb bay indicator
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
      // Outer fiery ring
      ctx.beginPath();
      ctx.arc(x, y, this.size + 6, 0, Math.PI * 2);
      ctx.strokeStyle = '#ff8800';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Main body
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, Math.PI * 2);
      ctx.fill();
      // Inner crown
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

    // Status effect indicators
    for (const effect of this.statusEffects) {
      const ec = effect.type === 'slow' ? '#66ccff' :
                 effect.type === 'burn' ? '#ff6644' :
                 effect.type === 'stun' ? '#ffff00' :
                 effect.type === 'poison' ? '#44ff44' : '#fff';
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
