import { Skeleton } from '../entities/Skeleton.js';

export class SkeletonManager {
  constructor() {
    this.skeletons = [];
    this._spawnCooldown = 0;
  }

  update(dt, enemies, map) {
    this._spawnCooldown = Math.max(0, this._spawnCooldown - dt);

    for (let i = this.skeletons.length - 1; i >= 0; i--) {
      const sk = this.skeletons[i];
      if (!sk.alive) {
        this.skeletons.splice(i, 1);
        continue;
      }
      sk.update(dt, enemies);
    }
  }

  trySpawn(tower, enemy, map, waveScale) {
    if (this._spawnCooldown > 0) return null;
    const bonus = tower._factionBonus;
    if (!bonus || !bonus.spawnChance) return null;
    if (Math.random() >= bonus.spawnChance) return null;

    const path = map.getPathPixels();
    if (!path || path.length < 3) return null;

    const sk = new Skeleton();
    sk.init(path, waveScale || 1);
    sk.x = tower.x;
    sk.y = tower.y;
    this.skeletons.push(sk);
    this._spawnCooldown = 0.5;
    return sk;
  }

  getAlive() {
    return this.skeletons.filter(s => s.alive);
  }

  clear() {
    this.skeletons = [];
    this._spawnCooldown = 0;
  }
}
