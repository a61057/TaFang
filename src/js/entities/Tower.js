import { TILE_SIZE, MAX_TOWER_LEVEL } from '../config/constants.js';
import { TOWER_TYPES, getTowerStats } from '../config/towerData.js';

export class Tower {
  constructor() {
    this.col = 0;
    this.row = 0;
    this.x = 0;
    this.y = 0;
    this.typeId = null;
    this.level = 0;
    this.stats = null;
    this.cooldown = 0;
    this.target = null;
    this.angle = 0;
    this.alive = true;
    this.totalKills = 0;
    this.totalDamage = 0;
    this.buildFlash = 0;
    this.maxHp = 300;
    this.hp = 300;
  }

  init(col, row, typeId) {
    this.col = col;
    this.row = row;
    this.x = col * TILE_SIZE + TILE_SIZE / 2;
    this.y = row * TILE_SIZE + TILE_SIZE / 2;
    this.typeId = typeId;
    this.level = 0;
    this.stats = getTowerStats(typeId, 0);
    this.cooldown = 0;
    this.target = null;
    this.angle = 0;
    this.alive = true;
    this.totalKills = 0;
    this.totalDamage = 0;
    this.buildFlash = 1;
    this.maxHp = 300 + this.level * 300;
    this.hp = this.maxHp;
    this._rangeMult = 1;
    this._fireRateMult = 1;
    this._factionBonus = {};
    this.stunned = false;
    return this;
  }

  reset() {
    this.alive = false;
    this.target = null;
  }

  canUpgrade() {
    return this.level < MAX_TOWER_LEVEL - 1;
  }

  getUpgradeCost() {
    if (!this.canUpgrade()) return -1;
    const nextStats = getTowerStats(this.typeId, this.level + 1);
    return nextStats ? nextStats.cost : -1;
  }

  upgrade() {
    if (!this.canUpgrade()) return false;
    this.level++;
    this.stats = getTowerStats(this.typeId, this.level);
    this.maxHp = 300 + this.level * 300;
    this.hp = this.maxHp;
    this.cooldown = 0;
    this.buildFlash = 1;
    return true;
  }

  takeDamage(amount) {
    if (!this.alive) return 0;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
    return amount;
  }

  getSellValue() {
    let totalCost = 0;
    const type = TOWER_TYPES[this.typeId];
    if (!type) return 0;
    for (let i = 0; i <= this.level; i++) {
      totalCost += type.levels[i].cost;
    }
    return Math.floor(totalCost * 0.7);
  }

  findTarget(enemies, customRange) {
    if (!this.stats) return null;
    const range = customRange || this.stats.range * (this._rangeMult || 1);
    let best = null;
    let bestProgress = -1;
    let bestHp = Infinity;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= range) {
        // Prioritize by progress (closest to end)
        if (enemy.pathProgress > bestProgress || 
            (Math.abs(enemy.pathProgress - bestProgress) < 0.001 && enemy.hp < bestHp)) {
          bestProgress = enemy.pathProgress;
          bestHp = enemy.hp;
          best = enemy;
        }
      }
    }
    return best;
  }

  update(dt) {
    if (!this.alive) return;
    const rateMult = (this._fireRateMult || 1) * ((this._factionBonus && this._factionBonus.fireRateMult) || 1);
    this.cooldown = Math.max(0, this.cooldown - dt * rateMult);
    this.buildFlash = Math.max(0, this.buildFlash - dt * 2);

    if (this.target) {
      if (!this.target.alive) {
        this.target = null;
        return;
      }
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      this.angle = Math.atan2(dy, dx);
    }
  }

  canFire() {
    return this.cooldown <= 0 && this.alive;
  }

  fire() {
    if (!this.stats) return null;
    this.cooldown = this.stats.fireRate;
    return {
      tower: this,
      damage: this.stats.damage,
      splash: this.stats.splash || 0,
      chainCount: this.stats.chainCount || 0,
      chainRange: this.stats.chainRange || 0,
      effect: this.stats.effect || null,
      slowAmount: this.stats.slowAmount || 0,
      slowDuration: this.stats.slowDuration || 0,
      burnDamage: this.stats.burnDamage || 5,
      burnDuration: this.stats.burnDuration || 3000
    };
  }

  render(ctx, offsetX = 0, offsetY = 0, showRange = false) {
    if (!this.alive) return;
    const x = this.x + offsetX;
    const y = this.y + offsetY;
    const type = TOWER_TYPES[this.typeId];
    if (!type) return;

    const flashAlpha = 1;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + 2, y + 2, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Range circle
    if (showRange && this.stats) {
      ctx.beginPath();
      ctx.arc(x, y, this.stats.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.save();

    const c = type.color;
    const lvl = this.level;
    const lvlScale = 1 + lvl * 0.08;
    ctx.globalAlpha = flashAlpha;

    switch (this.typeId) {
      case 'CANNON': {
        const bw = 22 * lvlScale, bh = 14 * lvlScale;
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(x - bw, y - 4, bw * 2, bh);
        ctx.fillStyle = '#5a5a6a';
        ctx.fillRect(x - bw + 2, y - 6, bw * 2 - 4, bh - 2);
        for (let i = -2; i <= 2; i++) {
          ctx.fillStyle = c;
          ctx.fillRect(x + i * 6 - 2, y - 10, 4, 6);
        }
        ctx.save();
        ctx.translate(x, y - 4);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#333';
        ctx.fillRect(-2, -3, 24, 6);
        ctx.fillStyle = '#555';
        ctx.fillRect(-2, -2, 20, 4);
        ctx.fillStyle = '#222';
        ctx.fillRect(18, -4, 5, 8);
        ctx.restore();
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(x, y - 4, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'MACHINE': {
        ctx.fillStyle = '#6a6a3a';
        ctx.fillRect(x - 16, y - 2, 32, 12);
        ctx.fillStyle = '#8a8a4a';
        ctx.fillRect(x - 14, y - 4, 28, 10);
        ctx.save();
        ctx.translate(x, y - 4);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#444';
        ctx.fillRect(-2, -8, 4, 6);
        ctx.fillRect(-2, 2, 4, 6);
        ctx.fillStyle = '#666';
        ctx.fillRect(0, -10, 16, 3);
        ctx.fillRect(0, 7, 16, 3);
        ctx.fillStyle = '#222';
        ctx.fillRect(14, -11, 4, 5);
        ctx.fillRect(14, 6, 4, 5);
        ctx.restore();
        ctx.fillStyle = '#5a5a2a';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(x - 14 + i * 8, y + 6, 4, 3);
        }
        break;
      }
      case 'MORTAR': {
        ctx.fillStyle = '#6a4a3a';
        ctx.beginPath();
        ctx.arc(x, y + 4, 16 * lvlScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#8a6a4a';
        ctx.beginPath();
        ctx.arc(x, y + 2, 14 * lvlScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.translate(x, y - 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#555';
        ctx.fillRect(-4, -12, 8, 14);
        ctx.fillStyle = '#666';
        ctx.fillRect(-3, -14, 6, 4);
        ctx.fillStyle = '#333';
        ctx.fillRect(-5, -16, 10, 4);
        ctx.restore();
        ctx.fillStyle = '#555';
        ctx.beginPath();
        ctx.arc(x + 8, y + 8, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 10, y + 6, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'SLOW': {
        const h = 20 * lvlScale;
        ctx.fillStyle = '#4488aa';
        ctx.beginPath();
        ctx.moveTo(x, y - h);
        ctx.lineTo(x - 14, y + 6);
        ctx.lineTo(x + 14, y + 6);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#66bbdd';
        ctx.beginPath();
        ctx.moveTo(x, y - h + 4);
        ctx.lineTo(x - 10, y + 4);
        ctx.lineTo(x + 10, y + 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(150,230,255,0.3)';
        ctx.beginPath();
        ctx.moveTo(x, y - h + 8);
        ctx.lineTo(x - 6, y + 2);
        ctx.lineTo(x + 6, y + 2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ccffff';
        ctx.lineWidth = 1.5;
        const sf = 4;
        for (let a = 0; a < 6; a++) {
          const ang = a * Math.PI / 3;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(ang) * sf, y - h + Math.sin(ang) * sf);
          ctx.lineTo(x + Math.cos(ang) * sf * 2.5, y - h + Math.sin(ang) * sf * 2.5);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(150,220,255,0.15)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + 4, 18, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case 'ELECTRIC': {
        ctx.fillStyle = '#444466';
        ctx.fillRect(x - 5, y - 24 * lvlScale, 10, 28 * lvlScale);
        ctx.fillStyle = '#6666aa';
        ctx.fillRect(x - 3, y - 22 * lvlScale, 6, 24 * lvlScale);
        ctx.strokeStyle = '#cc8844';
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const cy = y - 18 * lvlScale + i * 8;
          ctx.beginPath();
          ctx.ellipse(x, cy, 8, 3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.fillStyle = '#9944dd';
        ctx.shadowColor = '#9944dd';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y - 26 * lvlScale, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(170,68,255,0.4)';
        ctx.lineWidth = 1.5;
        const t = Date.now() / 200;
        for (let a = 0; a < 3; a++) {
          const ang = this.angle + a * 2.1;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(ang) * 5, y - 26 * lvlScale + Math.sin(ang) * 5);
          const ex = x + Math.cos(ang) * (10 + Math.sin(t + a) * 4);
          const ey = y - 26 * lvlScale + Math.sin(ang) * (10 + Math.cos(t + a) * 4);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#3a3a5a';
        ctx.fillRect(x - 12, y + 4, 24, 6);
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(x - 10, y + 2, 20, 4);
        break;
      }
      case 'SNIPER': {
        // Tripod base
        ctx.fillStyle = '#3a3a4a';
        ctx.fillRect(x - 16, y + 2, 32, 4);
        ctx.fillStyle = '#4a4a5a';
        ctx.fillRect(x - 14, y, 28, 4);
        // Long barrel
        ctx.save();
        ctx.translate(x, y - 4);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(-3, -3, 44, 6);
        ctx.fillStyle = '#4a4a6a';
        ctx.fillRect(-2, -2, 40, 4);
        ctx.fillStyle = '#1a1a2a';
        ctx.fillRect(38, -4, 5, 8);
        // Scope
        ctx.fillStyle = '#556';
        ctx.fillRect(12, -6, 10, 12);
        ctx.fillStyle = '#aaccff';
        ctx.globalAlpha = 0.6;
        ctx.fillRect(14, -4, 6, 8);
        ctx.globalAlpha = flashAlpha;
        ctx.restore();
        // Bipod legs
        ctx.strokeStyle = '#3a3a4a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 4, y + 2);
        ctx.lineTo(x - 12, y + 14);
        ctx.moveTo(x + 4, y + 2);
        ctx.lineTo(x + 12, y + 14);
        ctx.stroke();
        break;
      }
      case 'FLAMETHROWER': {
        // Fuel tank
        ctx.fillStyle = '#5a3a2a';
        ctx.beginPath();
        ctx.arc(x - 8, y + 4, 10 * lvlScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#7a4a3a';
        ctx.beginPath();
        ctx.arc(x - 8, y + 2, 8 * lvlScale, 0, Math.PI * 2);
        ctx.fill();
        // Nozzle
        ctx.save();
        ctx.translate(x, y - 2);
        ctx.rotate(this.angle);
        ctx.fillStyle = '#444';
        ctx.fillRect(0, -4, 24, 8);
        ctx.fillStyle = '#666';
        ctx.fillRect(20, -5, 6, 10);
        ctx.fillStyle = '#222';
        ctx.fillRect(24, -6, 4, 12);
        // Pilot flame
        if (this.target) {
          ctx.fillStyle = '#ff6600';
          ctx.shadowColor = '#ff6600';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(30, 0, 3 + Math.sin(Date.now() / 80) * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.restore();
        // Pipe
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 8, y - 4);
        ctx.quadraticCurveTo(x - 6, y - 10, x, y - 8);
        ctx.stroke();
        break;
      }
      case 'ARC': {
        // Base
        ctx.fillStyle = '#2a4a44';
        ctx.fillRect(x - 5, y - 20 * lvlScale, 10, 24 * lvlScale);
        ctx.fillStyle = '#3a6a5a';
        ctx.fillRect(x - 3, y - 18 * lvlScale, 6, 20 * lvlScale);
        // Coils
        ctx.strokeStyle = '#44aa88';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
          const cy = y - 14 * lvlScale + i * 10;
          ctx.beginPath();
          ctx.ellipse(x, cy, 10, 3, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        // Arc emitter
        ctx.fillStyle = '#44ffcc';
        ctx.shadowColor = '#44ffcc';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(x, y - 22 * lvlScale, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Pulsing rings
        const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
        ctx.strokeStyle = `rgba(68,255,204,${pulse * 0.3})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y - 22 * lvlScale, 10 + pulse * 4, 0, Math.PI * 2);
        ctx.stroke();
        // Base plate
        ctx.fillStyle = '#2a4a44';
        ctx.fillRect(x - 14, y + 4, 28, 5);
        ctx.fillStyle = '#3a5a54';
        ctx.fillRect(x - 12, y + 2, 24, 4);
        break;
      }
    }

    ctx.globalAlpha = 1;

    // HP bar (only show if damaged)
    if (this.hp < this.maxHp) {
      const hpPct = Math.max(0, this.hp / this.maxHp);
      const barW = 28;
      const barH = 3;
      const bx = x - barW / 2;
      const by = y + 18;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
      ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
      ctx.fillRect(bx, by, barW * hpPct, barH);
    }

    // Level stars
    if (this.level > 0) {
      for (let i = 0; i <= this.level; i++) {
        ctx.fillStyle = '#ffdd44';
        ctx.shadowColor = '#ffdd44';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        const sx = x - 8 + i * 8;
        const sy = y + 14;
        ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  toJSON() {
    return {
      col: this.col,
      row: this.row,
      typeId: this.typeId,
      level: this.level,
      totalKills: this.totalKills,
      totalDamage: this.totalDamage,
      hp: this.hp
    };
  }

  static fromJSON(data) {
    const tower = new Tower();
    tower.col = data.col;
    tower.row = data.row;
    tower.x = data.col * TILE_SIZE + TILE_SIZE / 2;
    tower.y = data.row * TILE_SIZE + TILE_SIZE / 2;
    tower.typeId = data.typeId;
    tower.level = data.level;
    tower.stats = getTowerStats(data.typeId, data.level);
    tower.cooldown = 0;
    tower.target = null;
    tower.angle = 0;
    tower.alive = true;
    tower.totalKills = data.totalKills || 0;
    tower.totalDamage = data.totalDamage || 0;
    tower.buildFlash = 0;
    tower.maxHp = 300 + tower.level * 300;
    tower.hp = data.hp !== undefined ? data.hp : tower.maxHp;
    if (tower.hp <= 0) tower.alive = false;
    return tower;
  }
}
