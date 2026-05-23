import { ENEMY_TYPES, getEnemyStats } from '../config/enemyData.js';
import { PREP_TIME, WAVE_BASE_REWARD, BOSS_INTERVAL } from '../config/constants.js';

export class WaveManager {
  constructor(enemyManager, gameEngine) {
    this.enemyManager = enemyManager;
    this.gameEngine = gameEngine;
    this.currentWave = 0;
    this.totalWaves = 50;
    this.isInfinite = false;
    this.isActive = false;
    this.prepTime = PREP_TIME;
    this.prepTimer = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = 1.0;
    this.enemiesSpawned = 0;
    this.enemiesThisWave = 0;
    this.waveInProgress = false;
    this.perfectWave = true;
    this._hpMult = 1;
    this._speedMult = 1;
  }

  getNextWaveEnemies() {
    const wave = this.currentWave + 1;
    const enemies = [];

    let baseCount = 5 + wave * 2;
    // 30波后增加敌人数
    if (wave >= 30) {
      baseCount = Math.floor(baseCount * (1.1 + (wave - 29) * 0.02));
    }

    // Boss 波次
    if (wave % BOSS_INTERVAL === 0) {
      if (wave === 45) {
        enemies.push({ type: 'megaboss', count: 1 });
        enemies.push({ type: 'boss', count: 1 });
      } else if (wave >= 40) {
        enemies.push({ type: 'boss', count: 2 });
      } else {
        enemies.push({ type: 'boss', count: 1 });
      }
    }

    // 35波后轰炸机 + 精英
    if (wave >= 35) {
      const bomberCount = wave === 45 ? 2 : 1 + Math.floor((wave - 35) / 6);
      enemies.push({ type: 'bomber', count: bomberCount });
      if (wave % BOSS_INTERVAL !== 0) {
        enemies.push({ type: 'heavy', count: Math.floor(baseCount * 0.15) });
        enemies.push({ type: 'flying', count: Math.floor(baseCount * 0.1) });
      }
    }

    enemies.push({ type: 'normal', count: Math.floor(baseCount * 0.5) });

    if (wave > 2) {
      enemies.push({ type: 'fast', count: Math.floor(baseCount * 0.3) });
      enemies.push({ type: 'heavy', count: Math.floor(baseCount * 0.2) });
    }
    if (wave > 4) {
      enemies.push({ type: 'flying', count: Math.floor(baseCount * 0.2) });
    }
    if (wave > 7) {
      const extraHeavy = wave >= 30 ? 0.2 : 0.15;
      enemies.push({ type: 'heavy', count: Math.floor(baseCount * extraHeavy) });
    }

    return enemies;
  }

  startNextWave() {
    if (this.isActive) return false;

    this.currentWave++;
    if (this.currentWave > this.totalWaves) {
      this.isInfinite = true;
    }

    this.isActive = true;
    this.waveInProgress = true;
    this.perfectWave = true;
    this.enemiesSpawned = 0;

    // Build spawn queue
    this.spawnQueue = [];
    const enemies = this.getNextWaveEnemies();
    this.enemiesThisWave = enemies.reduce((sum, e) => sum + e.count, 0);

    for (const entry of enemies) {
      for (let i = 0; i < entry.count; i++) {
        this.spawnQueue.push(entry.type);
      }
    }

    // Shuffle
    for (let i = this.spawnQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
    }

    this.spawnTimer = 0;
    const minInterval = this.currentWave >= 30 ? 0.15 : 0.3;
    this.spawnInterval = Math.max(minInterval, 1.0 - this.currentWave * 0.012);

    console.log(`[Wave ${this.currentWave}] Started with ${this.spawnQueue.length} enemies, interval ${this.spawnInterval}s`);
    return true;
  }

  update(dt) {
    if (this.waveInProgress) {
      // Spawn enemies
      if (this.spawnQueue.length > 0) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          const typeId = this.spawnQueue.shift();
          const stats = getEnemyStats(typeId, this.currentWave);
          if (stats) {
            const enemy = this.enemyManager.spawnEnemy(stats, this._hpMult, this._speedMult);
            this.enemiesSpawned++;
          }
          this.spawnTimer = this.spawnInterval;
        }
      }

      // Check if wave is complete
      if (this.spawnQueue.length === 0 && this.enemyManager.getActiveCount() === 0) {
        this.endWave();
      }
    } else {
      // Prep phase
      if (this.currentWave > 0) {
        this.prepTimer -= dt;
      }
    }
  }

  endWave() {
    this.waveInProgress = false;
    this.isActive = false;
    this.prepTimer = this.currentWave >= 30 ? Math.max(8, PREP_TIME - (this.currentWave - 30) * 0.4) : PREP_TIME;

    const reward = WAVE_BASE_REWARD + this.currentWave * 10 + (this.perfectWave ? 50 : 0);
    if (this.gameEngine) {
      this.gameEngine.addGold(reward);
      this.gameEngine.onWaveComplete(this.currentWave, reward, this.perfectWave);
    }
  }

  startPrep() {
    this.prepTimer = PREP_TIME;
    this.waveInProgress = false;
    this.isActive = false;
  }

  getPrepTimeLeft() {
    return Math.max(0, this.prepTimer);
  }

  isPrepping() {
    return !this.waveInProgress && this.currentWave > 0 && this.prepTimer > 0;
  }

  skipToWave(wave) {
    this.currentWave = Math.max(0, wave - 1);
    this.enemyManager.clear();
    this.isActive = false;
    this.waveInProgress = false;
    this.prepTimer = 1;
    this.spawnQueue = [];
  }

  toJSON() {
    return {
      currentWave: this.currentWave,
      totalWaves: this.totalWaves,
      isInfinite: this.isInfinite,
      isActive: this.isActive,
      prepTimer: this.prepTimer
    };
  }

  fromJSON(data) {
    this.currentWave = data.currentWave || 0;
    this.totalWaves = data.totalWaves || 50;
    this.isInfinite = data.isInfinite || false;
    this.isActive = false;
    this.waveInProgress = false;
    this.prepTimer = data.prepTimer || PREP_TIME;
    this.spawnQueue = [];
  }
}
