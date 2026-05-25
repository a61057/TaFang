import { t } from '../config/locale.js';

export class GameOverScreen {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'gameOverScreen';
    this.element.className = 'overlay-screen';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="overlay-content">
        <div class="game-over-title" id="gameOverTitle">${t('gameOver.title')}</div>
        <div class="game-over-stats" id="gameOverStats"></div>
        <div class="game-over-actions" id="gameOverActions">
          <button class="hud-btn primary" id="btnRestart">${t('gameOver.newGame')}</button>
          <button class="hud-btn" id="btnLoadSave">${t('gameOver.loadSave')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.element);

    this.element.querySelector('#btnRestart').addEventListener('click', () => {
      this.engine.resetGame();
    });

    this.element.querySelector('#btnLoadSave').addEventListener('click', () => {
      this.hide();
      this.engine.showLoadDialog();
    });
  }

  show(reason) {
    const stats = this.engine.getState();
    const titleEl = this.element.querySelector('#gameOverTitle');
    const actionsEl = this.element.querySelector('#gameOverActions');

    if (reason === 'victory') {
      titleEl.textContent = t('gameOver.victory');
      titleEl.style.color = '#ffd700';
      titleEl.style.textShadow = '0 0 30px rgba(255,215,0,0.4)';
      actionsEl.innerHTML = `
        <button class="hud-btn primary" id="btnContinueEndless">${t('gameOver.continueEndless')}</button>
        <button class="hud-btn" id="btnRestart">${t('gameOver.newGame')}</button>
        <button class="hud-btn" id="btnLoadSave">${t('gameOver.loadSave')}</button>
      `;
      actionsEl.querySelector('#btnContinueEndless').addEventListener('click', () => {
        this.engine.continueToEndless();
      });
      actionsEl.querySelector('#btnRestart').addEventListener('click', () => {
        this.engine.resetGame();
      });
      actionsEl.querySelector('#btnLoadSave').addEventListener('click', () => {
        this.hide();
        this.engine.showLoadDialog();
      });
    } else {
      titleEl.textContent = t('gameOver.defeat');
      titleEl.style.color = '#e74c3c';
      titleEl.style.textShadow = '0 0 30px rgba(231,76,60,0.4)';
      actionsEl.innerHTML = `
        <div style="margin-bottom:12px;font-size:13px;color:#aab;">输入 "爸爸" 复活</div>
        <div style="display:flex;gap:8px;justify-content:center;">
          <input type="text" id="dadInput" style="padding:8px 12px;border-radius:4px;border:1px solid rgba(255,255,255,0.2);background:rgba(0,0,0,0.4);color:#fff;font-size:16px;width:160px;text-align:center;outline:none;" placeholder="输入" maxlength="2">
          <button class="hud-btn primary" id="btnDadSubmit">确认</button>
        </div>
        <div id="dadError" style="color:#e74c3c;font-size:12px;margin-top:8px;display:none;">不对，再想想</div>
      `;
      const input = actionsEl.querySelector('#dadInput');
      const submit = actionsEl.querySelector('#btnDadSubmit');
      const error = actionsEl.querySelector('#dadError');
      const check = () => {
        if (input.value === '爸爸') {
          this.hide();
          this.engine.lives = 20;
          this.engine.gameOver = false;
        } else {
          error.style.display = 'block';
        }
      };
      submit.addEventListener('click', check);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') check();
      });
      setTimeout(() => input.focus(), 100);
    }

    this.element.querySelector('#gameOverStats').innerHTML = `
      <div class="stat-line">${t('gameOver.waveReached', stats.currentWave)}</div>
      <div class="stat-line">${t('gameOver.enemiesKilled', stats.totalKills)}</div>
      <div class="stat-line">${t('gameOver.towersBuilt', stats.towersBuilt)}</div>
      <div class="stat-line">${t('gameOver.goldEarned', stats.goldEarned)}</div>
    `;
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
