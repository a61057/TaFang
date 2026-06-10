import { Enemy } from '../entities/Enemy.js';
import { ObjectPool } from '../engine/ObjectPool.js';
import { TERRAIN } from '../config/constants.js';

export class EnemyManager {
  constructor(map, waveManager) {
    this.map = map;
    this.waveManager = waveManager;
    this.towerManager = null;
    this._pool = new ObjectPool(
      () => new Enemy(),
      (e) => e.reset(),
      100
    );
  }

  spawnEnemy(stats, hpMult = 1, speedMult = 1) {
    const startPos = this.map.getPathPixel(0);
    if (!startPos) return;
    const enemy = this._pool.get();
    enemy.init(stats.type, stats, startPos.x, startPos.y, this.map.getPathLength());
    if (hpMult !== 1) {
      enemy.maxHp = Math.floor(enemy.maxHp * hpMult);
      enemy.hp = enemy.maxHp;
    }
    if (speedMult !== 1) {
      enemy.baseSpeed = enemy.baseSpeed * speedMult;
      enemy.speed = enemy.speed * speedMult;
    }
    if (this.waveManager) {
      enemy._waveManager = this.waveManager;
    }
    return enemy;
  }

  getAlive() {
    return this._pool.getActive().filter(e => e.alive);
  }

  update(dt) {
    const enemies = this._pool.getActive();
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (!e.alive) continue;

      // Check terrain effects
      const tile = this.map.getTileAtPixel(e.x, e.y);
      if (tile && !e.isFlying) {
        if (tile.terrain === TERRAIN.SWAMP) {
          e.speed = e.baseSpeed * 0.5;
        } else {
          e.speed = e.baseSpeed;
        }
      } else {
        e.speed = e.baseSpeed;
      }

      e.update(dt, this.map, this.towerManager);

      if (e.reachedEnd) {
        if (!e._bomberDone) {
          e._leaked = true;
        }
        e._killed = false;
        this._pool.release(e);
      } else if (!e.alive && !e.reachedEnd) {
        e._killed = true;
        e._leaked = false;
        this.handleDeath(e);
        this._pool.release(e);
      }
    }
  }

  getActiveCount() {
    return this._pool.getActive().filter(e => e.alive).length;
  }

  clear() {
    this._pool.releaseAll();
  }

  getActive() {
    return this._pool.getActive();
  }

  spawnEnemyAt(stats, x, y) {
    const enemy = this._pool.get();
    enemy.init(stats.type || 'normal', stats, x, y, this.map.getPathLength());
    // Set path to nearest point on path
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < this.map.getPathLength(); i++) {
      const p = this.map.getPathPixel(i);
      if (p) {
        const dx = p.x - x;
        const dy = p.y - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
    }
    enemy.pathIndex = bestIdx;
    const nxt = this.map.getPathPixel(Math.min(bestIdx + 1, this.map.getPathLength() - 1));
    if (nxt) {
      enemy.targetX = nxt.x;
      enemy.targetY = nxt.y;
    }
    enemy.progress = 0;
    return enemy;
  }

  handleDeath(enemy) {
    // Splitter: spawn minions on death
    if (enemy.type === 'splitter' && enemy.splitCount > 0) {
      for (let i = 0; i < enemy.splitCount; i++) {
        const offX = (Math.random() - 0.5) * 20;
        const offY = (Math.random() - 0.5) * 20;
        const splitStats = { type: 'swarm', name: 'Split', color: '#cb7ddb', maxHp: 20, speed: 70, armor: 0, bounty: 3, size: 5, isFlying: false, isBoss: false };
        this.spawnEnemyAt(splitStats, enemy.x + offX, enemy.y + offY);
      }
    }
  }
}
