import { TILE_SIZE, HERO_XP_PER_LEVEL, HERO_MAX_LEVEL } from '../config/constants.js';
import { HERO_TEMPLATES, WEAPONS } from '../config/heroData.js';

export class Hero {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.level = 1;
    this.xp = 0;
    this.maxHp = 300;
    this.hp = 300;
    this.baseAttack = 20;
    this.attack = 20;
    this.range = 150;
    this.attackSpeed = 1.2;
    this.speed = 90;
    this.cooldown = 0;
    this.alive = true;
    this._moveTarget = null;
    this.size = 18;
    this.color = '#5a8a3c';
    this.turretColor = '#4a7a2c';
    this.currentTarget = null;
    this.vx = 0;
    this.vy = 0;
    this.angle = 0;
    this._atkMult = 1;
    this._detectRange = 250;
    this._bodyW = 30;
    this._bodyH = 20;
    this._trackW = 4;
    this._template = HERO_TEMPLATES.scout;
    this.equippedWeapons = [];
  }

  init(map, template) {
    if (template) this._template = template;
    const start = map.getPathPixel(0);
    this.x = start.x - TILE_SIZE;
    this.y = start.y;
    this.applyTemplate(this._template);
  }

  applyTemplate(t) {
    this._template = t;
    this.maxHp = t.baseHp;
    this.hp = t.baseHp;
    this.baseAttack = t.baseAttack;
    this.attack = t.baseAttack;
    this.range = t.baseRange;
    this.attackSpeed = t.baseAttackSpeed;
    this.speed = t.baseSpeed;
    this.color = t.color;
    this.turretColor = t.turretColor;
    this.level = 1;
    this.xp = 0;
    this.angle = 0;
    this._moveTarget = null;
    this.currentTarget = null;
  }

  recalc() {
    const t = this._template;
    if (!t) return;
    const lvl = this.level;
    this.maxHp = Math.floor(t.baseHp * (1 + (lvl - 1) * 0.12));
    if (this.hp > this.maxHp || lvl > 1) this.hp = this.maxHp;
    this.baseAttack = Math.floor(t.baseAttack * (1 + (lvl - 1) * 0.1));
    this.range = t.baseRange + lvl * 3;
    this.attackSpeed = Math.max(0.3, t.baseAttackSpeed - lvl * 0.04);
    this.speed = t.baseSpeed;

    this.attack = this.baseAttack;
    for (const wid of this.equippedWeapons) {
      const wpn = WEAPONS[wid];
      if (!wpn) continue;
      if (wpn.stat === 'attack') this.attack += wpn.bonus;
      if (wpn.stat === 'maxHp') { this.maxHp += wpn.bonus; this.hp += wpn.bonus; }
      if (wpn.stat === 'range') this.range += wpn.bonus;
      if (wpn.stat === 'attackSpeed') this.attackSpeed = Math.max(0.3, this.attackSpeed + wpn.bonus);
      if (wpn.stat === 'speed') this.speed += wpn.bonus;
    }
  }

  resetState() {
    this.hp = this.maxHp;
    this.alive = true;
    this.currentTarget = null;
    this.cooldown = 0;
    this._moveTarget = null;
  }

  moveTo(x, y) {
    this._moveTarget = { x, y };
  }

  addXp(amount) {
    if (this.level >= HERO_MAX_LEVEL) return;
    this.xp += amount;
    const needed = HERO_XP_PER_LEVEL * this.level;
    if (this.xp >= needed) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.xp = 0;
    this.recalc();
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      this._moveTarget = null;
    }
  }

  canRevive(gold) {
    return !this.alive && gold >= 50;
  }

  revive() {
    this.hp = Math.floor(this.maxHp * 0.5);
    this.alive = true;
    return 50;
  }

  findTarget(enemies) {
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= this._detectRange && dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    return best;
  }

  update(dt, enemies, map, kbDx = 0, kbDy = 0) {
    if (!this.alive) return;

    this.cooldown = Math.max(0, this.cooldown - dt);

    if (kbDx !== 0 || kbDy !== 0) {
      const len = Math.sqrt(kbDx * kbDx + kbDy * kbDy);
      const normDx = kbDx / len;
      const normDy = kbDy / len;
      this.angle = Math.atan2(normDy, normDx);
      this.vx = normDx * this.speed;
      this.vy = normDy * this.speed;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      const target = this.findTarget(enemies);
      this.currentTarget = target;
      if (target) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= this.range && this.cooldown <= 0) {
          const mult = this._atkMult || 1;
          target.takeDamage(Math.floor(this.attack * mult), true);
          this.cooldown = this.attackSpeed;
          return { hit: true, target: target, damage: Math.floor(this.attack * mult) };
        }
      }
      return;
    }

    const target = this.findTarget(enemies);
    this.currentTarget = target;

    let moveX = 0;
    let moveY = 0;

    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.angle = Math.atan2(dy, dx);

      if (dist > this.range * 0.8) {
        moveX = dx / dist;
        moveY = dy / dist;
      } else {
        if (this.cooldown <= 0) {
          const mult = this._atkMult || 1;
          target.takeDamage(Math.floor(this.attack * mult), true);
          this.cooldown = this.attackSpeed;
          this._moveTarget = null;
          return { hit: true, target: target, damage: Math.floor(this.attack * mult) };
        }
      }
    } else if (this._moveTarget) {
      const dx = this._moveTarget.x - this.x;
      const dy = this._moveTarget.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        this.angle = Math.atan2(dy, dx);
        moveX = dx / dist;
        moveY = dy / dist;
      } else {
        this._moveTarget = null;
      }
    }

    this.vx = moveX * this.speed;
    this.vy = moveY * this.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    if (!this.alive) return;
    const x = this.x + offsetX;
    const y = this.y + offsetY;

    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(-this._bodyW / 2 - this._trackW, -this._bodyH / 2 - 2, this._trackW, this._bodyH + 4);
    ctx.fillRect(this._bodyW / 2, -this._bodyH / 2 - 2, this._trackW, this._bodyH + 4);

    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const ty = -this._bodyH / 2 + i * (this._bodyH / 3);
      ctx.beginPath();
      ctx.moveTo(-this._bodyW / 2 - this._trackW + 1, ty);
      ctx.lineTo(-this._bodyW / 2 - 1, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(this._bodyW / 2 + 1, ty);
      ctx.lineTo(this._bodyW / 2 + this._trackW - 1, ty);
      ctx.stroke();
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(-this._bodyW / 2, -this._bodyH / 2, this._bodyW, this._bodyH);

    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-this._bodyW / 2, -this._bodyH / 2, this._bodyW, this._bodyH);

    ctx.fillStyle = this.turretColor;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.rotate(this.angle);
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, -2, 16, 4);
    ctx.fillStyle = '#555';
    ctx.fillRect(14, -3, 3, 6);
    ctx.restore();

    if (this.currentTarget && this.cooldown < 0.15) {
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 15;
      ctx.fillStyle = 'rgba(255,68,68,0.3)';
      ctx.beginPath();
      ctx.arc(0, 0, this._bodyW / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();

    const hpPct = this.hp / this.maxHp;
    const barW = 32;
    const barH = 4;
    const bx = x - barW / 2;
    const by = y - this._bodyH / 2 - 10;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(bx - 1, by - 1, barW + 2, barH + 2);
    ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : hpPct > 0.25 ? '#f39c12' : '#e74c3c';
    ctx.fillRect(bx, by, barW * hpPct, barH);

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('英雄', x, by - 2);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Lv' + this.level, x + this._bodyW / 2 + 4, by);
  }
}
