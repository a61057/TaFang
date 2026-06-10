import { ENEMY_TYPES, getEnemyStats } from '../config/enemyData.js';
import { PREP_TIME, WAVE_BASE_REWARD, PER_WAVE_REWARD, BOSS_INTERVAL } from '../config/constants.js';

const BOSS_TALENT_WAVES = {
  10: ['frostAura'],
  15: ['flameAura'],
  20: ['fortify'],
  25: ['frostAura', 'flameAura'],
  30: ['flameAura', 'fortify'],
  35: ['summonMinions'],
  40: ['summonMinions', 'flameAura'],
  45: ['summonMinions', 'rage'],
  50: ['summonMinions', 'rage', 'fortify']
};

function getBossTalentsForWave(wave) {
  const keys = Object.keys(BOSS_TALENT_WAVES).map(Number).sort((a, b) => b - a);
  for (const w of keys) {
    if (wave >= w) return BOSS_TALENT_WAVES[w];
  }
  return [];
}

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
    if (wave >= 30) {
      baseCount = Math.floor(baseCount * (1.1 + (wave - 29) * 0.02));
    }

    // Boss wave — apply talents
    const bossInterval = this.gameEngine?.challengeModifiers?.bossInterval || BOSS_INTERVAL;
    if (wave % bossInterval === 0) {
      const talents = getBossTalentsForWave(wave);
      if (wave === 45) {
        enemies.push({ type: 'megaboss', count: 1, talents });
        enemies.push({ type: 'boss', count: 2, talents: ['fortify'] });
      } else if (wave >= 40) {
        enemies.push({ type: 'boss', count: 2, talents });
      } else {
        enemies.push({ type: 'boss', count: 1, talents });
      }
    }

    // New enemies start appearing from wave 8+
    if (wave >= 8) {
      enemies.push({ type: 'swarm', count: Math.floor(baseCount * (wave >= 20 ? 0.25 : 0.15)) });
    }
    if (wave >= 10) {
      enemies.push({ type: 'shielded', count: Math.floor(baseCount * 0.12) });
    }
    if (wave >= 12) {
      enemies.push({ type: 'regenerator', count: Math.floor(baseCount * 0.1) });
    }
    if (wave >= 15) {
      enemies.push({ type: 'stealth', count: Math.floor(baseCount * 0.1) });
    }
    if (wave >= 18) {
      enemies.push({ type: 'leech', count: Math.floor(baseCount * 0.08) });
    }
    if (wave >= 20) {
      enemies.push({ type: 'splitter', count: Math.floor(baseCount * 0.08) });
    }
    if (wave >= 25) {
      enemies.push({ type: 'void', count: Math.floor(baseCount * 0.08) });
    }
    if (wave >= 28) {
      enemies.push({ type: 'crystal', count: Math.floor(baseCount * 0.08) });
    }

    // Bomber from wave 35
    if (wave >= 35) {
      const bomberCount = wave === 45 ? 2 : 1 + Math.floor((wave - 35) / 6);
      enemies.push({ type: 'bomber', count: bomberCount });
      if (wave % bossInterval !== 0) {
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
        this.spawnQueue.push({ type: entry.type, talents: entry.talents || null });
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
          const entry = this.spawnQueue.shift();
          const typeId = entry.type;
          const stats = getEnemyStats(typeId, this.currentWave);
          if (stats) {
            if (entry.talents) {
              stats.bossTalents = entry.talents;
            }
            // Challenge modifiers
            const mods = this.gameEngine ? this.gameEngine.challengeModifiers : {};
            if (mods.bonusArmor) stats.armor += mods.bonusArmor;
            if (mods.swarmMult) {
              stats.maxHp = Math.floor(stats.maxHp * (1 / mods.swarmMult));
              stats.size = Math.floor(stats.size * (mods.swarmSizeMult || 0.6));
              stats.bounty = Math.floor(stats.bounty / mods.swarmMult);
            }
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

  isMiniGameWave() {
    return !this.isInfinite && this.currentWave % 5 === 0;
  }

  endWave() {
    this.waveInProgress = false;
    this.isActive = false;

    if (this.isMiniGameWave()) {
      this.prepTimer = 0;
      if (this.gameEngine) {
        this.gameEngine.onWaveComplete(this.currentWave, 0, this.perfectWave);
      }
      return;
    }

    this.prepTimer = this.currentWave >= 30 ? Math.max(5, PREP_TIME - (this.currentWave - 30) * 0.5) : PREP_TIME;

    const reward = WAVE_BASE_REWARD + this.currentWave * PER_WAVE_REWARD + (this.perfectWave ? 50 : 0);
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
