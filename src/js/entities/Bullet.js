export class Bullet {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.speed = 500;
    this.damage = 0;
    this.splash = 0;
    this.color = '#fff';
    this.size = 3;
    this.alive = true;
    this.tower = null;
    this.target = null;
    this.effect = null;
    this.slowAmount = 0;
    this.slowDuration = 0;
    this.burnDamage = 5;
    this.burnDuration = 3000;
    this.chainCount = 0;
    this.chainRange = 0;
    this.arc = false;
    this.arcHeight = 0;
    this.arcProgress = 0;
    this.startX = 0;
    this.startY = 0;
    this.hitEnemies = [];
    this.trail = [];
  }

  init(tower, target, x, y, stats) {
    this.x = x;
    this.y = y;
    this.startX = x;
    this.startY = y;
    this.tower = tower;
    this.target = target;
    this.targetX = target.x;
    this.targetY = target.y;
    this.speed = stats.bulletSpeed || 500;
    this.damage = stats.damage || 0;
    this.splash = stats.splash || 0;
    this.color = stats.bulletColor || '#fff';
    this.size = stats.bulletSize || 3;
    this.alive = true;
    this.effect = stats.effect || null;
    this.slowAmount = stats.slowAmount || 0;
    this.slowDuration = stats.slowDuration || 0;
    this.burnDamage = stats.burnDamage || 5;
    this.burnDuration = stats.burnDuration || 3000;
    this.chainCount = stats.chainCount || 0;
    this.chainRange = stats.chainRange || 0;
    this.arc = stats.arc || false;
    this.arcHeight = 50;
    this.arcProgress = 0;
    this.hitEnemies = [];
    this.trail = [];
    return this;
  }

  reset() {
    this.alive = false;
    this.tower = null;
    this.target = null;
    this.hitEnemies = [];
    this.trail = [];
  }

  update(dt) {
    if (!this.alive) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Update trail
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();

    if (dist < 10) {
      this.hit();
      return;
    }

    const moveAmount = this.speed * dt;
    if (moveAmount >= dist) {
      this.x = this.targetX;
      this.y = this.targetY;
      this.hit();
    } else {
      this.x += (dx / dist) * moveAmount;
      this.y += (dy / dist) * moveAmount;
    }

    if (this.arc) {
      this.arcProgress = Math.min(1, this.arcProgress + dt * 2);
    }
  }

  hit() {
    this.alive = false;

    // Find actual enemy at target position
    let hitEnemy = this.target;
    if (hitEnemy && hitEnemy.alive) {
      this._applyDamage(hitEnemy);
    }

    // Splash damage
    if (this.splash > 0) {
      const enemies = this.tower && this.tower._enemies ? this.tower._enemies : [];
      for (const enemy of enemies) {
        if (enemy === hitEnemy || !enemy.alive) continue;
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        if (Math.sqrt(dx * dx + dy * dy) <= this.splash) {
          this._applyDamage(enemy);
        }
      }
    }

    // Chain lightning
    if (this.chainCount > 0 && hitEnemy && hitEnemy.alive) {
      this._doChain(hitEnemy);
    }
  }

  _applyDamage(enemy) {
    const dmg = enemy.takeDamage(this.damage, true);
    if (this.tower) {
      this.tower.totalDamage += dmg;
      if (!enemy.alive) {
        this.tower.totalKills++;
      }
    }

    if (this.effect === 'slow' && enemy.alive) {
      enemy.addStatusEffect('slow', this.slowAmount || 0.5, this.slowDuration || 2000);
    }
    if (this.effect === 'burn' && enemy.alive) {
      enemy.addStatusEffect('burn', this.burnDamage || 5, this.burnDuration || 3000);
    }
  }

  _doChain(enemy, depth = 0) {
    if (depth >= this.chainCount) return;
    this.hitEnemies.push(enemy);
    const enemies = this.tower && this.tower._enemies ? this.tower._enemies : [];
    let best = null;
    let bestDist = Infinity;
    for (const e of enemies) {
      if (this.hitEnemies.includes(e) || !e.alive) continue;
      const dx = e.x - enemy.x;
      const dy = e.y - enemy.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= this.chainRange && d < bestDist) {
        bestDist = d;
        best = e;
      }
    }
    if (best) {
      const dmg = best.takeDamage(this.damage * 0.7, true);
      if (this.tower) this.tower.totalDamage += dmg;
      this._doChain(best, depth + 1);
    }
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    if (!this.alive) return;
    const x = this.x + offsetX;
    const y = this.y + offsetY;

    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const alpha = (i / this.trail.length) * 0.5;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.trail[i].x + offsetX, this.trail[i].y + offsetY, this.size * (i / this.trail.length), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Bullet
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fill();

    // Glow
    ctx.shadowBlur = 15;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, this.size * 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
