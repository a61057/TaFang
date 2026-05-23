import { t } from '../config/locale.js';

const GAME_TYPES = ['whack', 'catch', 'memory', 'shoot'];

export class MiniGameManager {
  constructor() {
    this.overlay = null;
    this.active = false;
    this.engine = null;
    this.onComplete = null;
    this.score = 0;
    this.savedState = null;
    this._timer = null;
    this._animFrame = null;
    this._animId = null;
  }

  start(engine, onComplete) {
    this.engine = engine;
    this.onComplete = onComplete;
    this._saveState();
    this._createOverlay();
    const type = GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)];
    this[`_start${type.charAt(0).toUpperCase() + type.slice(1)}`]();
  }

  _saveState() {
    const e = this.engine;
    this.savedState = {
      gold: e.gold,
      lives: e.lives,
      hero: {
        level: e.hero.level, xp: e.hero.xp,
        hp: e.hero.hp, maxHp: e.hero.maxHp,
        alive: e.hero.alive, x: e.hero.x, y: e.hero.y,
        speed: e.hero.speed
      },
      towers: e.towerManager.toJSON(),
      heroManager: e.heroManager.toJSON(),
      wave: {
        currentWave: e.waveManager.currentWave,
        prepTimer: e.waveManager.prepTimer
      },
      stats: { ...e.stats }
    };
    e.paused = true;
  }

  _restoreState() {
    const e = this.engine;
    const s = this.savedState;
    if (!s) return;
    e.gold = s.gold;
    e.lives = s.lives;
    if (s.hero) {
      e.hero.level = s.hero.level;
      e.hero.xp = s.hero.xp;
      e.hero.hp = s.hero.hp;
      e.hero.maxHp = s.hero.maxHp;
      e.hero.alive = s.hero.alive;
      e.hero.x = s.hero.x;
      e.hero.y = s.hero.y;
      e.hero.speed = s.hero.speed;
    }
    e.towerManager.clear();
    e.towerManager.fromJSON(s.towers || []);
    if (s.heroManager) {
      e.heroManager.fromJSON(s.heroManager);
    }
    e.paused = false;
    this.savedState = null;
  }

  _createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'miniGameOverlay';
    this.overlay.className = 'overlay-screen';
    this.overlay.style.zIndex = '850';
    document.body.appendChild(this.overlay);
  }

  _clearOverlay() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    if (this._animFrame) { cancelAnimationFrame(this._animFrame); this._animFrame = null; }
    if (this._animId) { clearInterval(this._animId); this._animId = null; }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this._gameItems) {
      this._gameItems = null;
    }
  }

  _end(score) {
    this.score = score;
    const goldReward = Math.max(10, Math.floor(score));
    this._clearOverlay();
    this._restoreState();
    if (this.engine) {
      this.engine.addGold(goldReward);
    }
    if (this.onComplete) this.onComplete(score, goldReward);
    this.active = false;
    this._showResult(score, goldReward);
    this.engine = null;
    this.onComplete = null;
  }

  _showResult(score, gold) {
    const el = document.createElement('div');
    el.className = 'notification mini-game-result';
    el.style.cssText = 'background:rgba(22,33,62,0.97);border-color:rgba(255,215,0,0.4);font-size:15px;padding:14px 28px;top:50%;transform:translate(-50%,-50%);animation:notifyIn 0.3s ease;pointer-events:none;';
    el.innerHTML = `${t('miniGame.complete')} +${gold} ${t('hud.gold')}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  // ============== WHACK-A-MOLE ==============
  _startWhack() {
    this.active = true;
    const cols = 4, rows = 3;
    let score = 0, timeLeft = 12;
    const grid = [];
    let activeMole = null;

    const html = `
      <div class="mg-container">
        <div class="mg-header">
          <span class="mg-title">${t('miniGame.whack')}</span>
          <span class="mg-score">${t('miniGame.score')}: <strong id="mgScore">0</strong></span>
          <span class="mg-timer">${t('miniGame.time')}: <strong id="mgTimer">${timeLeft}</strong>s</span>
        </div>
        <div class="mg-grid mg-whack-grid" style="grid-template-columns:repeat(${cols},80px)">
          ${Array.from({length: cols * rows}, (_, i) => `
            <div class="mg-hole" data-idx="${i}">
              <div class="mg-hole-bg"></div>
              <div class="mg-mole" id="mole${i}" style="display:none">👾</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.overlay.innerHTML = html;

    for (let i = 0; i < cols * rows; i++) {
      const hole = this.overlay.querySelector(`.mg-hole[data-idx="${i}"]`);
      holeEls.push(hole);
      grid.push(false);
      hole.addEventListener('click', () => {
        if (activeMole === i) {
          score += 10;
          document.getElementById('mgScore').textContent = score;
          grid[i] = false;
          const moleEl = document.getElementById(`mole${i}`);
          moleEl.style.display = 'none';
          moleEl.textContent = '💥';
          setTimeout(() => { moleEl.textContent = '👾'; }, 200);
          activeMole = null;
        }
      });
    }

    const spawnMole = () => {
      if (!this.active) return;
      if (activeMole !== null) {
        const prev = activeMole;
        grid[prev] = false;
        document.getElementById(`mole${prev}`).style.display = 'none';
        activeMole = null;
      }
      const available = [];
      for (let i = 0; i < grid.length; i++) {
        if (!grid[i]) available.push(i);
      }
      if (available.length === 0) return;
      const idx = available[Math.floor(Math.random() * available.length)];
      grid[idx] = true;
      activeMole = idx;
      document.getElementById(`mole${idx}`).style.display = 'flex';
    };

    spawnMole();
    this._timer = setInterval(spawnMole, 1000);

    this._animId = setInterval(() => {
      timeLeft--;
      document.getElementById('mgTimer').textContent = timeLeft;
      if (timeLeft <= 0) {
        this._end(score);
      }
    }, 1000);
  }

  // ============== CATCH ITEMS ==============
  _startCatch() {
    this.active = true;
    let score = 0, timeLeft = 12;
    let catcherX = 50;
    this._gameItems = [];
    const width = 420, height = 380;
    const catcherW = 70, catcherH = 16;

    const html = `
      <div class="mg-container">
        <div class="mg-header">
          <span class="mg-title">${t('miniGame.catch')}</span>
          <span class="mg-score">${t('miniGame.score')}: <strong id="mgScore">0</strong></span>
          <span class="mg-timer">${t('miniGame.time')}: <strong id="mgTimer">${timeLeft}</strong>s</span>
        </div>
        <div class="mg-catch-area" id="catchArea" style="width:${width}px;height:${height}px;position:relative;overflow:hidden;margin:0 auto;">
          <div id="catcher" style="position:absolute;bottom:8px;left:${catcherX}px;width:${catcherW}px;height:${catcherH}px;background:linear-gradient(90deg,#4a90d9,#66aaff);border-radius:4px;transition:left 0.05s;"></div>
        </div>
      </div>
    `;
    this.overlay.innerHTML = html;

    const area = document.getElementById('catchArea');
    area.addEventListener('mousemove', (e) => {
      const rect = area.getBoundingClientRect();
      const scaleX = width / rect.width;
      const mx = (e.clientX - rect.left) * scaleX;
      catcherX = Math.max(0, Math.min(width - catcherW, mx - catcherW / 2));
      document.getElementById('catcher').style.left = catcherX + 'px';
    });

    const itemTypes = [
      { emoji: '🪙', points: 5, color: '#ffd700', speed: 1.2 },
      { emoji: '💎', points: 20, color: '#66ccff', speed: 1.5 },
      { emoji: '💣', points: -10, color: '#ff4444', speed: 0.8 },
      { emoji: '⭐', points: 15, color: '#ffdd44', speed: 1.0 }
    ];

    const spawnItem = () => {
      if (!this.active) return;
      const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
      const item = {
        x: Math.random() * (width - 20),
        y: -20,
        w: 24, h: 24,
        type: type,
        el: document.createElement('div')
      };
      item.el.textContent = type.emoji;
      item.el.style.cssText = `position:absolute;left:${item.x}px;top:${item.y}px;font-size:22px;transition:none;pointer-events:none;z-index:10;`;
      area.appendChild(item.el);
      this._gameItems.push(item);
    };

    this._timer = setInterval(spawnItem, 600);

    const gameLoop = () => {
      if (!this.active) { this._animFrame = null; return; }
      const dt = 0.032;
      const catcherRect = { x: catcherX, y: height - 8 - catcherH, w: catcherW, h: catcherH };
      for (let i = this._gameItems.length - 1; i >= 0; i--) {
        const item = this._gameItems[i];
        item.y += item.type.speed * 120 * dt;
        item.el.style.top = item.y + 'px';
        if (item.y > height) {
          item.el.remove();
          this._gameItems.splice(i, 1);
          continue;
        }
        const ix = item.x, iy = item.y, iw = item.w, ih = item.h;
        if (ix < catcherRect.x + catcherRect.w && ix + iw > catcherRect.x &&
            iy + ih > catcherRect.y && iy < catcherRect.y + catcherRect.h) {
          score += item.type.points;
          document.getElementById('mgScore').textContent = score;
          item.el.remove();
          this._gameItems.splice(i, 1);
        }
      }
      this._animFrame = requestAnimationFrame(gameLoop);
    };
    this._animFrame = requestAnimationFrame(gameLoop);

    this._animId = setInterval(() => {
      timeLeft--;
      document.getElementById('mgTimer').textContent = timeLeft;
      if (timeLeft <= 0) {
        this._end(score);
      }
    }, 1000);
  }

  // ============== MEMORY MATCH ==============
  _startMemory() {
    this.active = true;
    const gridSize = 4;
    let score = 0, flips = 0;
    let firstCard = null, secondCard = null, lockBoard = false;
    const emojis = ['🗼', '⚔️', '🛡️', '👾', '🚀', '💎', '🔥', '⭐'];
    let cards = [...emojis, ...emojis];
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    let matched = 0;
    const totalPairs = emojis.length;

    const html = `
      <div class="mg-container">
        <div class="mg-header">
          <span class="mg-title">${t('miniGame.memory')}</span>
          <span class="mg-score">${t('miniGame.flips')}: <strong id="mgFlips">0</strong></span>
          <span class="mg-pairs">${t('miniGame.matched')}: <strong id="mgMatched">0</strong>/${totalPairs}</span>
        </div>
        <div class="mg-grid mg-memory-grid" style="grid-template-columns:repeat(${gridSize},76px)">
          ${cards.map((_, i) => `
            <div class="mg-card" data-idx="${i}">
              <div class="mg-card-inner">
                <div class="mg-card-front">?</div>
                <div class="mg-card-back">${_}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    this.overlay.innerHTML = html;

    const cardEls = this.overlay.querySelectorAll('.mg-card');
    cardEls.forEach(el => {
      el.addEventListener('click', () => {
        if (lockBoard || el.classList.contains('mg-flipped') || el.classList.contains('mg-matched')) return;
        el.classList.add('mg-flipped');
        flips++;
        document.getElementById('mgFlips').textContent = flips;

        if (!firstCard) {
          firstCard = el;
        } else {
          secondCard = el;
          lockBoard = true;
          const idx1 = parseInt(firstCard.dataset.idx);
          const idx2 = parseInt(secondCard.dataset.idx);
          if (cards[idx1] === cards[idx2]) {
            firstCard.classList.add('mg-matched');
            secondCard.classList.add('mg-matched');
            matched++;
            score += 20;
            document.getElementById('mgMatched').textContent = matched;
            firstCard = secondCard = null;
            lockBoard = false;
            if (matched >= totalPairs) {
              score = Math.max(20, 160 - flips * 2);
              setTimeout(() => this._end(score), 600);
            }
          } else {
            score = Math.max(0, score - 2);
            setTimeout(() => {
              firstCard.classList.remove('mg-flipped');
              secondCard.classList.remove('mg-flipped');
              firstCard = secondCard = null;
              lockBoard = false;
            }, 800);
          }
        }
      });
    });
  }

  // ============== TARGET SHOOT ==============
  _startShoot() {
    this.active = true;
    let score = 0, timeLeft = 10;
    const width = 420, height = 380;

    const html = `
      <div class="mg-container">
        <div class="mg-header">
          <span class="mg-title">${t('miniGame.shoot')}</span>
          <span class="mg-score">${t('miniGame.score')}: <strong id="mgScore">0</strong></span>
          <span class="mg-timer">${t('miniGame.time')}: <strong id="mgTimer">${timeLeft}</strong>s</span>
        </div>
        <div class="mg-shoot-area" id="shootArea" style="width:${width}px;height:${height}px;position:relative;overflow:hidden;margin:0 auto;cursor:crosshair;"></div>
      </div>
    `;
    this.overlay.innerHTML = html;
    const area = document.getElementById('shootArea');

    const createTarget = () => {
      if (!this.active) return;
      const isBonus = Math.random() < 0.2;
      const size = isBonus ? 28 : 36;
      const target = document.createElement('div');
      target.style.cssText = `
        position:absolute;
        left:${Math.random() * (width - size - 20) + 10}px;
        top:${Math.random() * (height - size - 20) + 10}px;
        width:${size}px;height:${size}px;
        border-radius:50%;
        background:radial-gradient(circle at 35% 35%, ${isBonus ? '#ffd700' : '#ff4444'}, ${isBonus ? '#cc8800' : '#cc2222'});
        border:3px solid ${isBonus ? '#fff5cc' : '#ff8888'};
        box-shadow:0 0 12px ${isBonus ? 'rgba(255,215,0,0.6)' : 'rgba(255,50,50,0.5)'};
        cursor:crosshair;
        transition:transform 0.1s;
        z-index:5;
        animation:mgTargetPop 0.2s ease;
      `;
      target.addEventListener('click', (e) => {
        e.stopPropagation();
        const points = isBonus ? 30 : 10;
        score += points;
        document.getElementById('mgScore').textContent = score;
        target.style.transform = 'scale(0)';
        target.style.opacity = '0';
        setTimeout(() => target.remove(), 150);
      });
      area.appendChild(target);
      setTimeout(() => {
        if (target.parentNode) target.remove();
      }, isBonus ? 800 : 1200);
    };

    this._timer = setInterval(createTarget, 550);

    this._animId = setInterval(() => {
      timeLeft--;
      document.getElementById('mgTimer').textContent = timeLeft;
      if (timeLeft <= 0) {
        this._end(score);
      }
    }, 1000);
  }
}
