export class Skeleton {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.hp = 0;
    this.maxHp = 0;
    this.damage = 0;
    this.speed = 70;
    this.alive = false;
    this.lifetime = 0;
    this.maxLifetime = 15;
    this.attackCooldown = 0;
    this.attackRate = 1;
    this.attackRange = 30;
    this.target = null;
    this.angle = 0;
    this.size = 8;
    this.path = null;
    this.pathIndex = 0;
    this.progress = 0;
  }

  init(path, waveScale) {
    this.path = path;
    this.pathIndex = Math.min(2, path.length - 1);
    this.maxLifetime = 15;
    this.lifetime = this.maxLifetime;
    this.speed = 70;
    this.attackCooldown = 0;
    this.attackRate = 1;
    this.attackRange = 30;
    this.hp = 60 * waveScale;
    this.maxHp = this.hp;
    this.damage = 8 + Math.floor(waveScale * 3);
    this.alive = true;
    this.target = null;
    this.angle = 0;
    const pos = path[this.pathIndex];
    if (pos) {
      this.x = pos.x;
      this.y = pos.y;
    }
    this.progress = 0;
    return this;
  }

  update(dt, enemies) {
    if (!this.alive) return;

    this.lifetime -= dt;
    if (this.lifetime <= 0) {
      this.alive = false;
      return;
    }

    this.attackCooldown = Math.max(0, this.attackCooldown - dt);

    if (!this.target || !this.target.alive) {
      this.target = this._findTarget(enemies);
    }

    if (this.target && this.target.alive) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      this.angle = Math.atan2(dy, dx);

      if (dist <= this.attackRange) {
        if (this.attackCooldown <= 0) {
          this.attackCooldown = this.attackRate;
          this.target.takeDamage(this.damage, true);
        }
      } else {
        this._moveAlongPath(dt);
      }
    } else {
      this._moveAlongPath(dt);
    }
  }

  _moveAlongPath(dt) {
    if (!this.path || this.pathIndex < 0) return;

    const dist = this.speed * dt;
    this.progress += dist;

    const cur = this.path[this.pathIndex];
    if (this.pathIndex <= 0) {
      this.alive = false;
      return;
    }
    const nxt = this.path[this.pathIndex - 1];
    if (!cur || !nxt) {
      this.alive = false;
      return;
    }

    const segDx = nxt.x - cur.x;
    const segDy = nxt.y - cur.y;
    const segLen = Math.sqrt(segDx * segDx + segDy * segDy);

    if (this.progress >= segLen && this.pathIndex > 0) {
      this.progress -= segLen;
      this.pathIndex--;
      this.x = cur.x;
      this.y = cur.y;
    } else {
      const t = segLen > 0 ? this.progress / segLen : 0;
      this.x = cur.x + segDx * t;
      this.y = cur.y + segDy * t;
    }
    this.angle = Math.atan2(segDy, segDx);
  }

  _findTarget(enemies) {
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (!e.alive) continue;
      const dx = e.x - this.x;
      const dy = e.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = e;
      }
    }
    return best;
  }

  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
    }
  }

  reset() {
    this.alive = false;
    this.target = null;
    this.path = null;
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    if (!this.alive) return;
    const x = this.x + offsetX;
    const y = this.y + offsetY;

    const lifetimePct = this.lifetime / this.maxLifetime;
    ctx.globalAlpha = Math.min(1, lifetimePct * 3);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.angle);

    ctx.fillStyle = '#d4c4a0';
    ctx.shadowColor = '#88ff88';
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#444';
    ctx.shadowBlur = 0;
    ctx.fillRect(-2, -this.size, 4, this.size * 2);
    ctx.fillRect(-this.size, -2, this.size * 2, 4);

    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(-3, -3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(3, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff4444';
    ctx.beginPath();
    ctx.arc(0, 2, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;

    if (this.hp < this.maxHp) {
      const barW = 16;
      const barH = 2;
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(x - barW / 2 - 1, y - this.size - 6, barW + 2, barH + 2);
      ctx.fillStyle = '#44cc44';
      ctx.fillRect(x - barW / 2, y - this.size - 5, barW * (this.hp / this.maxHp), barH);
    }
  }
}
