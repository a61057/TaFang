import { ObjectPool } from './ObjectPool.js';

class Particle {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
    this.maxLife = 0;
    this.size = 0;
    this.color = '#ffffff';
    this.alpha = 1;
    this.dead = true;
  }
}

export class ParticleSystem {
  constructor() {
    this._pool = new ObjectPool(
      () => new Particle(),
      (p) => { p.dead = true; p.life = 0; p.alpha = 0; },
      200
    );
  }

  emit(x, y, count, config) {
    const { speed = 100, size = 3, color = '#ff0', life = 500, spread = Math.PI * 2 } = config || {};
    for (let i = 0; i < count; i++) {
      const p = this._pool.get();
      const angle = Math.random() * spread;
      const spd = speed * (0.5 + Math.random());
      p.x = x;
      p.y = y;
      p.vx = Math.cos(angle) * spd;
      p.vy = Math.sin(angle) * spd;
      p.life = life * (0.5 + Math.random() * 0.5);
      p.maxLife = p.life;
      p.size = size * (0.5 + Math.random());
      p.color = color;
      p.alpha = 1;
      p.dead = false;
    }
  }

  update(dt) {
    const active = this._pool.getActive();
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      if (p.dead) continue;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 1000;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        p.dead = true;
        this._pool.release(p);
      }
    }
  }

  render(ctx) {
    const active = this._pool.getActive();
    for (const p of active) {
      if (p.dead) continue;
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this._pool.releaseAll();
  }
}
