import { GameMap } from '../map/GameMap.js';
import { EnemyManager } from '../managers/EnemyManager.js';
import { TowerManager } from '../managers/TowerManager.js';
import { WaveManager } from '../managers/WaveManager.js';
import { UIManager } from '../ui/UIManager.js';
import { AudioManager } from '../audio/AudioManager.js';
import { SaveSystem } from '../save/SaveSystem.js';
import { ParticleSystem } from './ParticleSystem.js';
import { EventEmitter } from './EventEmitter.js';
import { Hero } from '../entities/Hero.js';
import { HeroManager } from '../managers/HeroManager.js';
import { FactionSystem } from '../managers/FactionSystem.js';
import { EventSystem } from '../managers/EventSystem.js';
import { StoryManager } from '../managers/StoryManager.js';
import { WeatherSystem } from '../managers/WeatherSystem.js';
import { FlowerManager, FLOWER_VARIETIES } from '../managers/FlowerManager.js';
import { HeroPanel } from '../ui/HeroPanel.js';
import { TOWER_TYPES } from '../config/towerData.js';
import { HERO_TEMPLATES, WEAPONS } from '../config/heroData.js';
import { ACHIEVEMENTS } from '../config/achievements.js';
import { COLS, ROWS, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, STARTING_GOLD, STARTING_LIVES, GAME_SPEEDS, TERRAIN, HERO_REVIVE_COST, WEATHER_TYPES, PREP_TIME } from '../config/constants.js';
import { MiniGameManager } from '../ui/MiniGameManager.js';
import { t, setLanguage, getLanguage } from '../config/locale.js';

export class GameEngine extends EventEmitter {
  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = GRID_WIDTH;
    this.canvas.height = GRID_HEIGHT;

    this.map = new GameMap();
    this.enemyManager = new EnemyManager(this.map, this);
    this.towerManager = new TowerManager(this.map);
    this.enemyManager.towerManager = this.towerManager;
    this.waveManager = new WaveManager(this.enemyManager, this);
    this.audio = new AudioManager();
    this.saveSystem = new SaveSystem();
    this.particles = new ParticleSystem();
    this.ui = null;

    this.gold = STARTING_GOLD;
    this.lives = STARTING_LIVES;
    this.gameSpeedIndex = 0;
    this.gameSpeed = 1;
    this.paused = false;
    this.gameOver = false;
    this.running = false;
    this.gameMode = 'campaign';
    this.unlockedTowers = new Set(['CANNON', 'MACHINE', 'MORTAR', 'SLOW', 'ELECTRIC']);
    this.victoryShown = false;

    this.lastFrameTime = 0;
    this.fps = 0;
    this.frameCount = 0;
    this.fpsTimer = 0;

    this.selectedTile = null;
    this.selectedTower = null;

    this.offsetX = 0;
    this.offsetY = 0;

    this.showDebug = false;
    this.testMode = false;
    this._keyComboA = false;
    this._keyComboB = false;
    this._testModeCooldown = 0;
    this._hoveredTile = null;
    this._hoveredBuildType = null;

    // Statistics
    this.stats = {
      totalKills: 0,
      towersBuilt: 0,
      maxLevelTowers: 0,
      totalGoldEarned: STARTING_GOLD,
      wavesCompleted: 0,
      perfectWaves: 0,
      bossesKilled: 0,
      endlessWaves: 0,
      totalDamageDealt: 0,
      gameTime: 0
    };

    this.achievements = this._loadAchievements();
    this.newAchievements = [];

    this._heroCollisionCooldown = 0;
    this.hero = new Hero();
    this.heroes = [];
    this.hero.init(this.map, HERO_TEMPLATES.scout);
    this.heroes.push(this.hero);
    this.heroManager = new HeroManager(this);
    this.heroManager.saveHeroState(this.hero);
    this.heroManager.applyHeroState(this.hero);
    this.factionSystem = new FactionSystem(this);
    this.eventSystem = new EventSystem(this);
    this.storyManager = new StoryManager(this);
    this.weatherSystem = new WeatherSystem(this);
    this.flowerManager = new FlowerManager(this);

    this._initInput();
    this._initShortcuts();

    this.miniGameManager = new MiniGameManager();
    this._miniGameActive = false;

    this.ui = new UIManager(this);
    this.heroPanel = new HeroPanel(this);
    this.audio.init();
    this._loadSettings();
    this._loadLanguage();
  }

  async _loadSettings() {
    const result = await this.saveSystem.getSettings();
    if (result.success && result.data) {
      const s = result.data;
      if (s.showFps && this.ui) this.ui.toggleFps(true);
      if (s.masterVolume !== undefined) this.audio.setMasterVolume(s.masterVolume);
      if (s.sfxVolume !== undefined) this.audio.setSfxVolume(s.sfxVolume);
      if (s.musicEnabled !== undefined) this.audio.musicEnabled = s.musicEnabled;
      if (s.sfxEnabled !== undefined) this.audio.sfxEnabled = s.sfxEnabled;
    }
  }

  _loadLanguage() {
    try {
      const data = localStorage.getItem('td_settings');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}
  }

  _loadAchievements() {
    try {
      const data = localStorage.getItem('td_achievements');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  _saveAchievements() {
    try {
      localStorage.setItem('td_achievements', JSON.stringify(this.achievements));
    } catch {}
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this._gameLoop(this.lastFrameTime);
  }

  startGame(mode) {
    this.gameMode = mode;
    this.victoryShown = false;
    if (mode === 'endless') {
      this.waveManager.totalWaves = Infinity;
      this.waveManager.isInfinite = true;
    } else {
      this.waveManager.totalWaves = 50;
      this.waveManager.isInfinite = false;
    }
    this.start();
  }

  _gameLoop(timestamp) {
    if (!this.running) return;

    const rawDt = (timestamp - this.lastFrameTime) / 1000;
    this.lastFrameTime = timestamp;
    const dt = Math.min(rawDt, 0.05) * this.gameSpeed;

    // FPS calculation
    this.frameCount++;
    this.fpsTimer += rawDt;
    if (this.fpsTimer >= 1) {
      this.fps = Math.round(this.frameCount / this.fpsTimer);
      this.frameCount = 0;
      this.fpsTimer = 0;
    }

    if (!this.paused && !this.gameOver) {
      this.stats.gameTime += dt;
      this._update(dt);
    }

    this._render();
    this.ui.update();

    requestAnimationFrame((t) => this._gameLoop(t));
  }

  _update(dt) {
    this._testModeCooldown = Math.max(0, this._testModeCooldown - dt);
    if (this._keyComboA && this._keyComboB && this._testModeCooldown <= 0) {
      this._toggleTestMode();
      this._testModeCooldown = 1;
    }
    if (this._cursorMoveCooldown > 0) this._cursorMoveCooldown = Math.max(0, this._cursorMoveCooldown - dt);

    // 设置事件/天气对敌人的修正
    this.waveManager._hpMult = this.eventSystem.getEnemyHpMultiplier();
    this.waveManager._speedMult = this.eventSystem.getEnemySpeedMultiplier() * this.weatherSystem.getEnemySpeedMultiplier();

    this.waveManager.update(dt);

    // 触发随机事件
    if (this.waveManager.waveInProgress) {
      this.eventSystem.onWaveStart(this.waveManager.currentWave);
    }

    // 检查敌人到达终点或已死亡（在 release 前检查）
    const enemiesBeforeUpdate = [...this.enemyManager.getActive()];
    this.enemyManager.update(dt);

    const aliveEnemies = this.enemyManager.getAlive();

    // 天气系统更新
    this.weatherSystem.update(dt, this.towerManager.getTowers(), aliveEnemies);

    // 塔攻击 - 传入 faction 和环境修正
    const rangeMult = this.weatherSystem.getTowerRangeMultiplier();
    const fireRateMult = this.weatherSystem.getTowerFireRateMultiplier();
    this.towerManager.update(dt, aliveEnemies, rangeMult, fireRateMult);

    // 英雄更新（含天气修正）
    const heroAtkMult = this.weatherSystem.getHeroAttackMultiplier();
    let kbDx = 0, kbDy = 0;
    if (this._keys.left) kbDx = -1;
    if (this._keys.right) kbDx = 1;
    if (this._keys.up) kbDy = -1;
    if (this._keys.down) kbDy = 1;

    for (const hero of this.heroes) {
      if (!hero.alive) continue;
      hero._atkMult = heroAtkMult;
      const isPlayer = hero === this.hero;
      const result = hero.update(dt, aliveEnemies, this.map, isPlayer ? kbDx : 0, isPlayer ? kbDy : 0);
      if (isPlayer) {
        if (result && result.hit) {
          this.particles.emit(hero.x, hero.y, 5, {
            color: '#ffd700', speed: 60, size: 3, life: 300
          });
        }
      } else {
        hero._moveTarget = { x: this.hero.x, y: this.hero.y };
      }
    }

    // 阵营系统
    this.factionSystem.update(this.towerManager.getTowers());

    this.particles.update(dt);
    this.flowerManager.update(dt);

    // 英雄碰撞检测（撞人 & 受伤）
    this._heroCollisionCooldown = Math.max(0, this._heroCollisionCooldown - dt);
    if (this._heroCollisionCooldown <= 0) {
      for (const hero of this.heroes) {
        if (!hero.alive) continue;
        const hx = hero.x, hy = hero.y;
        const hw = hero._bodyW / 2, hh = hero._bodyH / 2;
        for (const enemy of aliveEnemies) {
          if (!enemy.alive || enemy.isFlying) continue;
          const dx = Math.abs(enemy.x - hx);
          const dy = Math.abs(enemy.y - hy);
          if (dx < hw + enemy.size && dy < hh + enemy.size) {
            hero.takeDamage(Math.max(1, Math.floor(enemy.bounty * 0.4)));
            const ramDmg = Math.floor(hero.attack * 0.5);
            enemy.takeDamage(ramDmg, true);
            if (!enemy.alive) enemy._killed = true;
            this.particles.emit(enemy.x, enemy.y, 8, {
              color: '#ff4444', speed: 80, size: 3, life: 300
            });
            this._heroCollisionCooldown = 0.5;
            break;
          }
        }
      }
    }

    // 轰炸机炸弹特效
    for (const enemy of enemiesBeforeUpdate) {
      if (enemy._bombTargetX !== undefined) {
        this.particles.emit(enemy._bombTargetX, enemy._bombTargetY, 15, {
          color: '#ff4400', speed: 100, size: 4, life: 500
        });
        this.particles.emit(enemy._bombTargetX, enemy._bombTargetY, 10, {
          color: '#ffcc00', speed: 80, size: 3, life: 400
        });
        this.particles.emit(enemy._bombTargetX, enemy._bombTargetY, 5, {
          color: '#ffffff', speed: 60, size: 2, life: 300
        });
        enemy._bombTargetX = undefined;
        enemy._bombTargetY = undefined;
      }
    }

    // 检查敌人状态
    let killedThisFrame = 0;
    for (const enemy of enemiesBeforeUpdate) {
      if (enemy._leaked) {
        enemy._leaked = false;
        this.lives -= Math.max(1, enemy._isBoss ? 5 : 1);
        this.waveManager.perfectWave = false;
        this.audio.playLoseLife();
        if (this.lives <= 0) {
          this.lives = 0;
          this._gameOver();
        }
      }

      if (enemy._killed) {
        enemy._killed = false;
        this.stats.totalKills++;
        killedThisFrame++;
        const bountyMult = this.eventSystem.getGoldMultiplier();
        const reward = Math.floor(enemy.bounty * bountyMult);
        this.stats.totalGoldEarned += reward;
        this.gold += reward;
        this.audio.playEnemyDeath();
        if (enemy._isBoss) this.stats.bossesKilled++;

        // 英雄获得经验 - 击杀者+15，其他英雄+10
        for (const h of this.heroes) {
          if (!h.alive) continue;
          if (h.currentTarget === enemy) {
            h.addXp(15);
          } else {
            h.addXp(10);
          }
        }

        if (enemy.type === 'megaboss') {
          this.stats.bossesKilled++;
          // Mega boss explosion
          const explosionRadius = 150;
          const explosionDamage = 200;
          const aliveEnemies = this.enemyManager.getAlive();
          for (const other of aliveEnemies) {
            if (other === enemy || !other.alive) continue;
            const dx = other.x - enemy.x;
            const dy = other.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= explosionRadius) {
              const falloff = Math.max(0.3, 1 - dist / explosionRadius);
              other.takeDamage(Math.floor(explosionDamage * falloff), true);
            }
          }
          // Big visual explosion
          const explosionColors = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff'];
          for (const c of explosionColors) {
            this.particles.emit(enemy.x, enemy.y, 20, {
              color: c, speed: 120, size: 5, life: 600
            });
          }
          this.particles.emit(enemy.x, enemy.y, 30, {
            color: '#ff4400', speed: 200, size: 8, life: 800
          });
        } else {
          this.particles.emit(enemy.x, enemy.y, 10, {
            color: enemy.color,
            speed: 80,
            size: 3,
            life: 400
          });
        }
      }
    }
    if (killedThisFrame > 0) this._checkAchievements();
  }

  _render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    // Draw map
    this.map.render(ctx, this.offsetX, this.offsetY, this.showDebug);

    // Draw flowers
    this.flowerManager.render(ctx, this.offsetX, this.offsetY);

    // Draw hover preview
    if (this._hoveredTile && this._hoveredBuildType && !this.selectedTower) {
      const { col, row } = this._hoveredTile;
      const canBuild = this.towerManager.canBuild(col, row, this._hoveredBuildType);
      const tx = col * TILE_SIZE + this.offsetX;
      const ty = row * TILE_SIZE + this.offsetY;
      ctx.fillStyle = canBuild ? 'rgba(100, 255, 100, 0.25)' : 'rgba(255, 100, 100, 0.25)';
      ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
    }

    // Draw flower mode hover
    if (this.flowerMode && this._hoveredTile && !this.selectedTower) {
      const { col, row } = this._hoveredTile;
      if (this.map.getTerrain(col, row) === TERRAIN.GRASS && !this.flowerManager.getFlowerAt(col, row)) {
        const v = this.flowerManager.selectedVariety;
        const canAfford = this.gold >= v.cost;
        const tx = col * TILE_SIZE + this.offsetX;
        const ty = row * TILE_SIZE + this.offsetY;
        ctx.fillStyle = canAfford ? 'rgba(100, 255, 100, 0.2)' : 'rgba(255, 100, 100, 0.2)';
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.strokeStyle = canAfford ? '#44ff44' : '#ff4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(tx, ty, TILE_SIZE, TILE_SIZE);
        ctx.setLineDash([]);
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        const name = t('flower.' + v.id + '.name');
        ctx.fillText(canAfford ? `🌻 ${name} ${v.cost}g` : t('flower.notEnoughGold'), tx + TILE_SIZE / 2, ty - 4);
      }
    }

    // Draw keyboard cursor
    if (this._cursorActive && this._cursorCol >= 0) {
      const cx = this._cursorCol * TILE_SIZE + this.offsetX;
      const cy = this._cursorRow * TILE_SIZE + this.offsetY;
      ctx.strokeStyle = 'rgba(100,200,255,0.8)';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx + 1, cy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      ctx.strokeStyle = 'rgba(100,200,255,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(cx + 3, cy + 3, TILE_SIZE - 6, TILE_SIZE - 6);
      ctx.setLineDash([]);
    }

    // Draw towers
    this.towerManager.render(ctx, this.offsetX, this.offsetY, this.showDebug);

    // Draw enemies
    const enemies = this.enemyManager.getAlive();
    for (const enemy of enemies) {
      if (enemy.alive) enemy.render(ctx, this.offsetX, this.offsetY);
    }

    // Draw heroes
    for (const hero of this.heroes) {
      if (hero.alive) hero.render(ctx, this.offsetX, this.offsetY);
    }

    // Draw bullets
    this.towerManager.renderBullets(ctx, this.offsetX, this.offsetY);

    // Draw particles
    this.particles.render(ctx);

    // Weather overlay
    this.weatherSystem.renderOverlay(ctx);

    if (this.showDebug) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(5, 5, 220, 130);
      ctx.fillStyle = '#0f0';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      let y = 20;
      ctx.fillText(`${t('debug.fps', this.fps)}`, 10, y); y += 15;
      ctx.fillText(`${t('debug.enemies', this.enemyManager.getActiveCount())}`, 10, y); y += 15;
      ctx.fillText(`${t('debug.bullets', this.towerManager.bulletPool.activeCount)}`, 10, y); y += 15;
      ctx.fillText(`${t('debug.particles', this.particles._pool.activeCount)}`, 10, y); y += 15;
      ctx.fillText(`${t('debug.towers', this.towerManager.getTowers().length)}`, 10, y); y += 15;
      const aliveCount = this.heroes.filter(h => h.alive).length;
      ctx.fillText(`${t('debug.hero', this.hero.level, this.hero.alive ? t('hero.alive') : t('hero.dead'))} (${aliveCount}/${this.heroes.length})`, 10, y); y += 15;
      ctx.fillText(t('debug.weather', `${this.weatherSystem.currentWeather.id} ${this.weatherSystem.isNight() ? t('debug.night') : t('debug.day')}`), 10, y); y += 15;
      ctx.fillText(t('debug.event', this.eventSystem.activeEvent ? this.eventSystem.activeEvent.id : t('debug.none')), 10, y); y += 15;
    }
  }

  _initInput() {
    this.canvas.addEventListener('click', (e) => this._handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this._handleMouseMove(e));
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this._handleRightClick(e);
    });

    this._keys = { up: false, down: false, left: false, right: false };
    this._cursorCol = -1;
    this._cursorRow = -1;
    this._cursorActive = false;
    this._cursorMoveCooldown = 0;
    this.flowerMode = false;

    document.addEventListener('keydown', (e) => {
      if (this._miniGameActive) return;
      if (e.key === 'Escape') {
        this.ui.buildMenu.hide();
        this.ui.towerInfo.hide();
        this.selectedTower = null;
        this.selectedTile = null;
        this._cursorActive = false;
        if (this.flowerMode) {
          this.flowerMode = false;
          const btn = document.querySelector('#btnFlowerMode');
          if (btn) { btn.style.background = ''; btn.style.borderColor = ''; }
        }
      }
      if ((e.key === 'p' || e.key === 'P') && !this._miniGameActive) this.togglePause();
      if (e.key === 'Enter') {
        e.preventDefault();
        this.startNextWave();
      }
      if (e.key === ' ') {
        e.preventDefault();
        const didInteract = this._cursorActive && this._cursorCol >= 0 && this._interactAtCursor();
        if (!didInteract) {
          this.startNextWave();
        }
      }
      if (e.key === 'F3') {
        this.showDebug = !this.showDebug;
      }

      // D → 切换建造类型（在 WASD 赋值前判断）
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
        this._cycleBuildType();
      }

      // L 切换语言
      if ((e.key === 'l' || e.key === 'L') && !e.ctrlKey && !e.metaKey) {
        this._toggleLanguage();
      }

      // A+B 测试模式
      if (e.key === 'a' || e.key === 'A') this._keyComboA = true;
      if (e.key === 'b' || e.key === 'B') this._keyComboB = true;

      // 测试模式下调节关卡
      if (this.testMode) {
        if (e.key === ']' || e.key === '}') {
          this._skipToWave(this.waveManager.currentWave + 5);
          e.preventDefault();
        }
        if (e.key === '[' || e.key === '{') {
          this._skipToWave(Math.max(1, this.waveManager.currentWave - 5));
          e.preventDefault();
        }
        if (e.key === 'ArrowRight' && e.shiftKey) {
          this._skipToWave(this.waveManager.currentWave + 1);
          e.preventDefault();
        }
        if (e.key === 'ArrowLeft' && e.shiftKey) {
          this._skipToWave(Math.max(1, this.waveManager.currentWave - 1));
          e.preventDefault();
        }
      }

      // WASD → 坦克移动
      switch (e.key) {
        case 'w': case 'W': this._keys.up = true; e.preventDefault(); break;
        case 's': case 'S': this._keys.down = true; e.preventDefault(); break;
        case 'a': case 'A': this._keys.left = true; e.preventDefault(); break;
        case 'd': case 'D': this._keys.right = true; e.preventDefault(); break;
      }

      // 方向键 → 网格光标
      if (this._cursorMoveCooldown <= 0) {
        let dr = 0, dc = 0;
        switch (e.key) {
          case 'ArrowUp':    dr = -1; break;
          case 'ArrowDown':  dr = 1; break;
          case 'ArrowLeft':  dc = -1; break;
          case 'ArrowRight': dc = 1; break;
        }
        if (dr !== 0 || dc !== 0) {
          e.preventDefault();
          if (!this._cursorActive) {
            this._cursorActive = true;
            this._cursorCol = Math.floor(COLS / 2);
            this._cursorRow = Math.floor(ROWS / 2);
          }
          const newCol = Math.max(0, Math.min(COLS - 1, this._cursorCol + dc));
          const newRow = Math.max(0, Math.min(ROWS - 1, this._cursorRow + dr));
          if (newCol !== this._cursorCol || newRow !== this._cursorRow) {
            this._cursorCol = newCol;
            this._cursorRow = newRow;
            this._cursorMoveCooldown = 0.12;
          }
        }
      }
    });

    document.addEventListener('keyup', (e) => {
      if (e.key === 'a' || e.key === 'A') this._keyComboA = false;
      if (e.key === 'b' || e.key === 'B') this._keyComboB = false;
      switch (e.key) {
        case 'w': case 'W': this._keys.up = false; break;
        case 's': case 'S': this._keys.down = false; break;
        case 'a': case 'A': this._keys.left = false; break;
        case 'd': case 'D': this._keys.right = false; break;
      }
    });
  }

  _initShortcuts() {
    if (window.electronAPI) {
      window.electronAPI.onShortcut((action) => {
        if (this._miniGameActive) return;
        switch (action) {
          case 'toggle-pause': this.togglePause(); break;
          case 'quick-save': this.saveGame(0); break;
          case 'quick-load': this.loadGame(0); break;
          case 'reset-game': this.resetGame(); break;
        }
      });
    }
  }

  _handleClick(e) {
    if (this._miniGameActive || this.gameOver) return;
    this.audio.ensureResumed();

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX - this.offsetX;
    const my = (e.clientY - rect.top) * scaleY - this.offsetY;

    const tile = this.map.getTileAtPixel(mx, my);
    if (!tile) return;

    const { col, row } = tile;

    // 鼠标点击同步光标位置
    this._cursorCol = col;
    this._cursorRow = row;
    this._cursorActive = true;

    // Check if clicking on existing tower
    const existingTower = this.towerManager.getTowerAt(col, row);
    if (existingTower) {
      this.ui.buildMenu.hide();
      this.selectedTower = existingTower;
      this.selectedTile = { col, row };
      this.ui.towerInfo.show(existingTower);
      return;
    }

    // Check if clicking on grass tile for flower planting
    if (this.flowerMode && this.map.getTerrain(col, row) === TERRAIN.GRASS) {
      const existingFlower = this.flowerManager.getFlowerAt(col, row);
      if (!existingFlower) {
        const v = this.flowerManager.selectedVariety;
        if (this.gold >= v.cost) {
          this.flowerManager.plant(col, row, v.id);
          this.audio.playBuild();
        }
        return;
      }
    }

    // Check if clicking on buildable tile
    if (this.map.isBuildable(col, row)) {
      this.ui.towerInfo.hide();
      this.selectedTower = null;
      this.selectedTile = { col, row };
      this.ui.buildMenu.show(col, row);
      return;
    }

    // Clicking elsewhere
    this.ui.buildMenu.hide();
    this.ui.towerInfo.hide();
    this.selectedTower = null;
    this.selectedTile = null;
  }

  _handleRightClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX - this.offsetX;
    const my = (e.clientY - rect.top) * scaleY - this.offsetY;
    if (this.hero.alive) this.hero.moveTo(mx, my);
  }

  _handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX - this.offsetX;
    const my = (e.clientY - rect.top) * scaleY - this.offsetY;

    // Hovered tile
    this._hoveredTile = this.map.getTileAtPixel(mx, my);

    // Hovered tower
    const tower = this.towerManager.getTowers().find(t => {
      const dx = mx - t.x;
      const dy = my - t.y;
      return Math.sqrt(dx * dx + dy * dy) < TILE_SIZE * 0.5;
    });

    if (tower && !this.ui.buildMenu.visible && !this.ui.towerInfo.visible) {
      this.ui.showTowerTooltip(tower, e.clientX, e.clientY);
    } else {
      // Check hovered enemy
      const enemies = this.enemyManager.getAlive();
      const enemy = enemies.find(en => {
        const dx = mx - en.x;
        const dy = my - en.y;
        return Math.sqrt(dx * dx + dy * dy) < en.size + 5;
      });
      if (enemy) {
        this.ui.showEnemyTooltip(enemy, e.clientX, e.clientY);
      } else {
        this.ui.hideTooltip();
      }
    }
  }

  _cycleBuildType() {
    const keys = Object.keys(TOWER_TYPES);
    const currentIdx = this._hoveredBuildType ? keys.indexOf(this._hoveredBuildType) : -1;
    const nextIdx = (currentIdx + 1) % keys.length;
    this._hoveredBuildType = keys[nextIdx];
  }

  _interactAtCursor() {
    const col = this._cursorCol, row = this._cursorRow;
    const existingTower = this.towerManager.getTowerAt(col, row);
    if (existingTower) {
      this.ui.buildMenu.hide();
      this.selectedTower = existingTower;
      this.selectedTile = { col, row };
      this.ui.towerInfo.show(existingTower);
      return true;
    }

    if (this.map.isBuildable(col, row)) {
      this.ui.towerInfo.hide();
      this.selectedTower = null;
      this.selectedTile = { col, row };
      this.ui.buildMenu.show(col, row);
      return true;
    }
    return false;
  }

  isTowerUnlocked(typeId) {
    return this.unlockedTowers.has(typeId);
  }

  unlockTower(typeId) {
    if (this.unlockedTowers.has(typeId)) return false;
    const type = TOWER_TYPES[typeId];
    if (!type || !type.unlockCost) return false;
    if (this.gold < type.unlockCost) return false;
    this.gold -= type.unlockCost;
    this.unlockedTowers.add(typeId);
    this.audio.playBuild();
    if (this.ui) this.ui.buildMenu.refresh();
    return true;
  }

  startNextWave() {
    if (this._miniGameActive || this.waveManager.isActive || this.waveManager.waveInProgress) return;
    this.audio.playWaveStart();
    this.waveManager.startNextWave();
    this.storyManager.onWaveStart(this.waveManager.currentWave);
  }

  _toggleLanguage() {
    const current = getLanguage();
    const next = current === 'en' ? 'zh' : 'en';
    setLanguage(next);
    try {
      const saved = JSON.parse(localStorage.getItem('td_settings') || '{}');
      saved.language = next;
      localStorage.setItem('td_settings', JSON.stringify(saved));
    } catch {}
    console.log('[Language]', next === 'en' ? 'English' : '中文');
    if (this.ui) this.ui.refreshLanguage();
  }

  _toggleTestMode() {
    this.testMode = !this.testMode;
    if (this.testMode) {
      this.gold = 99999;
      this.lives = 999;
    }
    console.log('[Test Mode]', this.testMode ? 'ON (无限金币/生命, 用 [] 跳关)' : 'OFF');
    this.emit('test-mode', this.testMode);
  }

  _skipToWave(wave) {
    if (!this.testMode) return;
    this.waveManager.skipToWave(wave);
    this.particles.clear();
    console.log(`[Test Mode] 跳转到第 ${wave} 关`);
  }

  togglePause() {
    this.paused = !this.paused;
  }

  cycleSpeed() {
    this.gameSpeedIndex = (this.gameSpeedIndex + 1) % GAME_SPEEDS.length;
    this.gameSpeed = GAME_SPEEDS[this.gameSpeedIndex];
    if (this.ui) this.ui.hud.updateSpeedDisplay();
  }

  buildTower(col, row, typeId) {
    if (!this.isTowerUnlocked(typeId)) return false;
    const cost = TOWER_TYPES[typeId].levels[0].cost;
    if (this.gold < cost) return false;

    const tower = this.towerManager.buildTower(col, row, typeId);
    if (!tower) return false;

    this.gold -= cost;
    this.stats.towersBuilt++;
    this._checkAchievements();
    this.audio.playBuild();
    this.particles.emit(tower.x, tower.y, 15, {
      color: '#ffdd44',
      speed: 100,
      size: 3,
      life: 600
    });
    return true;
  }

  upgradeTower(tower) {
    if (!tower.canUpgrade()) return false;
    const cost = tower.getUpgradeCost();
    if (this.gold < cost) return false;

    this.gold -= cost;
    tower.upgrade();
    this.audio.playUpgrade();
    this.particles.emit(tower.x, tower.y, 12, {
      color: '#66ff66',
      speed: 80,
      size: 3,
      life: 500
    });

    if (tower.level >= 2) {
      this.stats.maxLevelTowers++;
      this._checkAchievements();
    }

    if (this.ui.towerInfo.visible && this.ui.towerInfo.currentTower === tower) {
      this.ui.towerInfo.show(tower);
    }
    return true;
  }

  sellTower(tower) {
    const value = this.towerManager.removeTower(tower);
    this.gold += value;
    this.audio.playSell();
    this.ui.towerInfo.hide();
    return value;
  }

  addGold(amount) {
    this.gold += amount;
    this.stats.totalGoldEarned += amount;
  }

  showHeroPanel() {
    this.heroPanel.show();
  }

  switchHero(typeId) {
    const tmpl = HERO_TEMPLATES[typeId];
    if (!tmpl) return;
    this.heroManager.saveHeroState(this.hero);
    if (!this.heroManager.ownedHeroes.includes(typeId)) return;
    const oldX = this.hero.x, oldY = this.hero.y;
    const oldAngle = this.hero.angle;
    this.heroManager.setHeroType(typeId);
    this.hero.applyTemplate(tmpl);
    this.hero.x = oldX;
    this.hero.y = oldY;
    this.hero.angle = oldAngle;
    this.heroManager.applyHeroState(this.hero);
    this.particles.emit(this.hero.x, this.hero.y, 20, {
      color: '#66ccff', speed: 100, size: 4, life: 500
    });
  }

  recruitHero(typeId) {
    const tmpl = HERO_TEMPLATES[typeId];
    if (!tmpl) return;
    if (this.heroManager.ownedHeroes.includes(typeId)) return;
    if (this.gold < tmpl.cost) return;
    this.gold -= tmpl.cost;
    this.heroManager.ownedHeroes.push(typeId);
    this.heroManager.heroLevels[typeId] = { level: 1, xp: 0 };
    this.particles.emit(this.hero.x, this.hero.y, 30, {
      color: '#ffd700', speed: 120, size: 5, life: 700
    });
  }

  deployHero(typeId) {
    const tmpl = HERO_TEMPLATES[typeId];
    if (!tmpl) return;
    if (!this.heroManager.ownedHeroes.includes(typeId)) return;
    if (!this.heroManager.addDeployed(typeId)) return;
    const hero = new Hero();
    hero.init(this.map, tmpl);
    hero.x = this.hero.x + (this.heroes.length * 40);
    hero.y = this.hero.y + 30;
    this.heroManager.applyHeroStateById(hero, typeId);
    hero.alive = true;
    this.heroes.push(hero);
    this.particles.emit(hero.x, hero.y, 20, {
      color: '#66ff66', speed: 100, size: 4, life: 500
    });
  }

  undeployHero(typeId) {
    if (!this.heroManager.removeDeployed(typeId)) return;
    const idx = this.heroes.findIndex(h => {
      const tpl = h._template || {};
      return tpl.id === typeId && h !== this.hero;
    });
    if (idx > 0) {
      this.heroManager.saveHeroState(this.heroes[idx]);
      this.heroes.splice(idx, 1);
    }
    this.particles.emit(this.hero.x, this.hero.y, 15, {
      color: '#ff6666', speed: 80, size: 3, life: 400
    });
  }

  buyWeapon(weaponId) {
    const wpn = WEAPONS[weaponId];
    if (!wpn) return;
    if (this.heroManager.weaponInventory.includes(weaponId)) return;
    if (this.gold < wpn.cost) return;
    this.gold -= wpn.cost;
    this.heroManager.weaponInventory.push(weaponId);
  }

  _recalcAllHeroes() {
    for (const h of this.heroes) {
      h.equippedWeapons = [...this.heroManager.equippedWeapons];
      h.recalc();
    }
  }

  equipWeapon(weaponId) {
    if (!this.heroManager.weaponInventory.includes(weaponId)) return;
    if (this.heroManager.equippedWeapons.includes(weaponId)) return;
    if (this.heroManager.equippedWeapons.length >= 3) return;
    this.heroManager.equippedWeapons.push(weaponId);
    this.heroManager.saveHeroState(this.hero);
    this._recalcAllHeroes();
  }

  unequipWeapon(weaponId) {
    const idx = this.heroManager.equippedWeapons.indexOf(weaponId);
    if (idx === -1) return;
    this.heroManager.equippedWeapons.splice(idx, 1);
    this.heroManager.saveHeroState(this.hero);
    this._recalcAllHeroes();
  }

  onWaveComplete(wave, reward, perfect) {
    this.stats.wavesCompleted++;
    if (perfect) this.stats.perfectWaves++;
    if (this.waveManager.isInfinite) this.stats.endlessWaves++;

    this.weatherSystem.onWaveEnd(wave);
    this.eventSystem.onWaveEnd();

    this._checkAchievements();

    // 关卡模式通关检测
    if (this.gameMode === 'campaign' && wave >= 50 && !this.victoryShown) {
      this.victoryShown = true;
      this.gameOver = true;
      this.audio.playGameOver();
      this.ui.gameOver.show('victory');
      this._autoSave();
      this.emit('wave-complete', { wave, reward, perfect });
      return;
    }

    // 小游戏关卡 — 每5波触发
    if (this.gameMode === 'campaign' && wave % 5 === 0 && wave < 50) {
      this._miniGameActive = true;
      this.audio.playWaveStart();
      this.miniGameManager.start(this, (score, goldReward) => {
        this._miniGameActive = false;
        this.waveManager.prepTimer = wave >= 30 ? Math.max(5, PREP_TIME - (wave - 30) * 0.5) : PREP_TIME;
        this.waveManager.isActive = false;
        this.waveManager.waveInProgress = false;
      });
      this.emit('wave-complete', { wave, reward, perfect });
      return;
    }

    this.emit('wave-complete', { wave, reward, perfect });
    this._autoSave();
  }

  _gameOver() {
    this.gameOver = true;
    this.audio.playGameOver();
    const reason = this.gameMode === 'campaign' ? 'defeat' : 'defeat';
    this.ui.gameOver.show(reason);
    if (window.electronAPI) {
      window.electronAPI.showNotification(t('notify.gameOver'), t('notify.gameOverDetail', this.waveManager.currentWave, this.stats.totalKills));
    }
  }

  resetGame() {
    this.gold = STARTING_GOLD;
    this.lives = STARTING_LIVES;
    this.gameOver = false;
    this.victoryShown = false;
    this.paused = false;
    this.gameSpeedIndex = 0;
    this.gameSpeed = 1;

    this.map = new GameMap();
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particles.clear();
    this.waveManager = new WaveManager(this.enemyManager, this);

    this.hero = new Hero();
    this.heroes = [this.hero];
    this.hero.init(this.map);
    this.factionSystem = new FactionSystem(this);
    this.eventSystem = new EventSystem(this);
    this.storyManager = new StoryManager(this);
    this.weatherSystem = new WeatherSystem(this);
    this.flowerManager = new FlowerManager(this);

    this.stats = {
      totalKills: 0,
      towersBuilt: 0,
      maxLevelTowers: 0,
      totalGoldEarned: STARTING_GOLD,
      wavesCompleted: 0,
      perfectWaves: 0,
      bossesKilled: 0,
      endlessWaves: 0,
      totalDamageDealt: 0,
      gameTime: 0
    };

    this.selectedTower = null;
    this.selectedTile = null;
    this.gameMode = 'campaign';
    this.victoryShown = false;
    this.ui.buildMenu.hide();
    this.ui.towerInfo.hide();
    this.ui.gameOver.hide();
  }

  getState() {
    return {
      gold: this.gold,
      lives: this.lives,
      gameMode: this.gameMode,
      currentWave: this.waveManager.currentWave,
      totalWaves: this.waveManager.totalWaves,
      enemyCount: this.enemyManager.getActiveCount(),
      isPrepping: this.waveManager.isPrepping(),
      prepTimeLeft: this.waveManager.getPrepTimeLeft(),
      waveInProgress: this.waveManager.waveInProgress,
      fps: this.fps,
      totalKills: this.stats.totalKills,
      towersBuilt: this.stats.towersBuilt,
      goldEarned: this.stats.totalGoldEarned,
      isPaused: this.paused,
      isGameOver: this.gameOver,
      flowerCount: this.flowerManager.getCount()
    };
  }

  _checkAchievements() {
    if (this.stats.gameTime < 1) return;
    for (const ach of ACHIEVEMENTS) {
      if (!this.achievements[ach.id] && ach.check(this.stats)) {
        this.achievements[ach.id] = Date.now();
        this.newAchievements.push(ach);
        this.audio.playAchievement();
        this.emit('achievement', ach);
        if (window.electronAPI) {
          const aNameKey = `achievement.${ach.id}.name`;
          const aDescKey = `achievement.${ach.id}.desc`;
          window.electronAPI.showNotification(t('notify.achievement', t(aNameKey)), t(aDescKey));
        }
      }
    }
    if (this.newAchievements.length > 0) {
      this._saveAchievements();
    }
  }

  async saveGame(slot) {
    const state = this._serialize();
    const result = await this.saveSystem.save(slot, state);
    if (result.success) {
      this.emit('save-complete', slot);
    }
    return result;
  }

  async loadGame(slot) {
    const result = await this.saveSystem.load(slot);
    if (result.success && result.data) {
      this._deserialize(result.data.state);
      if (!this.running) this.start();
      this.emit('load-complete', slot);
    }
    return result;
  }

  async _autoSave() {
    await this.saveSystem.save(0, this._serialize());
  }

  _serialize() {
    return {
      gold: this.gold,
      lives: this.lives,
      map: this.map.toJSON(),
      towers: this.towerManager.toJSON(),
      wave: this.waveManager.toJSON(),
      stats: { ...this.stats },
      gameSpeedIndex: this.gameSpeedIndex,
      gameMode: this.gameMode,
      hero: {
        level: this.hero.level, xp: this.hero.xp,
        hp: this.hero.hp, maxHp: this.hero.maxHp,
        alive: this.hero.alive, x: this.hero.x, y: this.hero.y,
        speed: this.hero.speed,
        moveTarget: this.hero._moveTarget
      },
      additionalHeroes: this.heroes.filter(h => h !== this.hero).map(h => ({
        typeId: h._template ? h._template.id : 'scout',
        level: h.level, xp: h.xp,
        hp: h.hp, maxHp: h.maxHp,
        alive: h.alive, x: h.x, y: h.y,
      })),
      event: {
        activeEvent: this.eventSystem.activeEvent,
        activeDuration: this.eventSystem.activeDuration,
        waveCounter: this.eventSystem.waveCounter
      },
      story: this.storyManager.toJSON(),
      weather: {
        currentWeatherId: this.weatherSystem.currentWeather.id,
        dayNight: this.weatherSystem.dayNight,
        weatherWaveCounter: this.weatherSystem.weatherWaveCounter,
        dayNightWaveCounter: this.weatherSystem.dayNightWaveCounter
      },
      heroManager: this.heroManager.toJSON(),
      unlockedTowers: Array.from(this.unlockedTowers),
      flowers: this.flowerManager.toJSON()
    };
  }

  _deserialize(state) {
    this.gold = state.gold || STARTING_GOLD;
    this.lives = state.lives || STARTING_LIVES;
    this.gameOver = false;
    this.paused = false;
    this.gameSpeedIndex = state.gameSpeedIndex || 0;
    this.gameSpeed = GAME_SPEEDS[this.gameSpeedIndex] || 1;

    this.map = GameMap.fromJSON(state.map);
    this.enemyManager.clear();
    this.towerManager.clear();
    this.particles.clear();
    this.towerManager = new TowerManager(this.map);
    this.enemyManager.towerManager = this.towerManager;
    this.towerManager.fromJSON(state.towers || []);
    this.waveManager = new WaveManager(this.enemyManager, this);
    this.waveManager.fromJSON(state.wave || {});
    this.gameMode = state.gameMode || 'campaign';
    this.unlockedTowers = new Set(state.unlockedTowers || ['CANNON', 'MACHINE', 'MORTAR', 'SLOW', 'ELECTRIC']);
    this.victoryShown = false;

    if (state.heroManager) {
      this.heroManager.fromJSON(state.heroManager);
    }
    const tmpl = HERO_TEMPLATES[this.heroManager.currentHeroType] || HERO_TEMPLATES.scout;
    this.hero = new Hero();
    this.heroes = [this.hero];
    this.hero.init(this.map, tmpl);
    this.heroManager.applyHeroState(this.hero);
    if (state.hero) {
      this.hero.x = state.hero.x || this.hero.x;
      this.hero.y = state.hero.y || this.hero.y;
      this.hero.hp = state.hero.hp || this.hero.maxHp;
      this.hero.alive = state.hero.alive !== false;
      this.hero.angle = state.hero.angle || 0;
    }
    if (state.additionalHeroes) {
      for (const hData of state.additionalHeroes) {
        const hTmpl = HERO_TEMPLATES[hData.typeId] || HERO_TEMPLATES.scout;
        const h = new Hero();
        h.init(this.map, hTmpl);
        this.heroManager.applyHeroStateById(h, hData.typeId);
        h.x = hData.x || this.hero.x;
        h.y = hData.y || this.hero.y;
        h.hp = hData.hp || h.maxHp;
        h.alive = hData.alive !== false;
        this.heroes.push(h);
      }
    }
    this.factionSystem = new FactionSystem(this);
    this.eventSystem = new EventSystem(this);
    this.storyManager = new StoryManager(this);
    this.weatherSystem = new WeatherSystem(this);
    this.flowerManager = new FlowerManager(this);

    if (state.flowers) {
      this.flowerManager.fromJSON(state.flowers);
    }

    if (state.story) {
      this.storyManager.fromJSON(state.story);
    }

    if (state.event) {
      if (state.event.activeEvent) {
        this.eventSystem.activeEvent = state.event.activeEvent;
        this.eventSystem.activeDuration = state.event.activeDuration || 0;
        this.eventSystem.waveCounter = state.event.waveCounter || 0;
      }
    }

    if (state.weather) {
      const W = WEATHER_TYPES;
      const weatherMap = { clear: W.CLEAR, rainy: W.RAINY, storm: W.STORM, blizzard: W.BLIZZARD, fog: W.FOG };
      this.weatherSystem.currentWeather = { ...(weatherMap[state.weather.currentWeatherId] || W.CLEAR) };
      this.weatherSystem.dayNight = state.weather.dayNight || 0;
      this.weatherSystem.weatherWaveCounter = state.weather.weatherWaveCounter || 0;
      this.weatherSystem.dayNightWaveCounter = state.weather.dayNightWaveCounter || 0;
    }

    this.stats = state.stats || this.stats;

    this.selectedTower = null;
    this.selectedTile = null;
    this.ui.buildMenu.hide();
    this.ui.towerInfo.hide();
    this.ui.gameOver.hide();

    if (this.ui) this.ui.hud.updateSpeedDisplay();
  }

  continueToEndless() {
    this.gameMode = 'endless';
    this.gameOver = false;
    this.victoryShown = false;
    this.waveManager.totalWaves = Infinity;
    this.waveManager.isInfinite = true;
    this.ui.gameOver.hide();
  }

  showSaveDialog() {
    this.ui.showSaveLoad('save');
  }

  showLoadDialog() {
    this.ui.showSaveLoad('load');
  }
}
