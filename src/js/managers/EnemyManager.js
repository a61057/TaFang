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
}
