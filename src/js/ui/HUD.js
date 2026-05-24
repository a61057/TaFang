import { t } from '../config/locale.js';
import { HERO_REVIVE_COST } from '../config/constants.js';
import { FLOWER_VARIETIES } from '../managers/FlowerManager.js';

export class HUD {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'hud';
    this.element.innerHTML = `
      <div class="hud-top">
        <div class="hud-left">
          <div class="hud-item wave-info">
            <span class="hud-label">${t('hud.wave')}</span>
            <span class="hud-value" id="waveDisplay">0 / 50</span>
          </div>
          <div class="hud-item enemy-count">
            <span class="hud-label">${t('hud.enemies')}</span>
            <span class="hud-value" id="enemyCount">0</span>
          </div>
          <div class="hud-item hero-info">
            <span class="hud-label">${t('hud.hero')}</span>
            <span class="hud-value" id="heroDisplay">${t('hero.level', 1)}</span>
          </div>
        </div>
        <div class="hud-center">
          <div class="hud-title">${t('hud.title')}</div>
          <div class="hud-subtitle" id="weatherDisplay">☀️ ${t('weather.clear')}</div>
        </div>
        <div class="hud-right">
          <div class="hud-item gold-info">
            <span class="hud-label">${t('hud.gold')}</span>
            <span class="hud-value gold-value" id="goldDisplay">200</span>
          </div>
          <div class="hud-item lives-info">
            <span class="hud-label">${t('hud.lives')}</span>
            <span class="hud-value" id="livesDisplay">20</span>
          </div>
          <div class="hud-item flower-info">
            <span class="hud-label">🌸</span>
            <span class="hud-value" id="flowerCount">0</span>
          </div>
        </div>
      </div>
      <div class="hud-bottom">
        <div class="hud-controls">
          <button class="hud-btn" id="btnStartWave" title="${t('hud.nextWave')}">${t('hud.nextWave')}</button>
          <button class="hud-btn" id="btnToggleSpeed" title="${t('ui.cycleSpeed')}">⏩ ${t('settings.speed1x')}</button>
          <button class="hud-btn" id="btnPause" title="${t('hud.pause')}">${t('hud.pause')}</button>
           <button class="hud-btn" id="btnSave" title="${t('hud.save')}">${t('hud.save')}</button>
          <button class="hud-btn" id="btnLoad" title="${t('hud.load')}">${t('hud.load')}</button>
          <button class="hud-btn" id="btnHeroPanel" title="${t('hero.panel')}">${t('hero.panel')}</button>
          <button class="hud-btn" id="btnSettings" title="${t('hud.settings')}">${t('hud.settings')}</button>
          <button class="hud-btn" id="btnFlowerMode" title="${t('flower.plantCost')}">🌻 ${t('flower.plant')}</button>
          <button class="hud-btn" id="btnReviveHero" title="${t('hud.reviveHero')}" style="display:none;">${t('hud.reviveHero')}</button>
        </div>
        <div class="hud-prep-info" id="prepInfo">
          <span>${t('hud.nextWaveIn')} <strong id="prepTimer">15</strong>${t('hud.seconds')}</span>
        </div>
        <div class="hud-event-info" id="eventDisplay" style="display:none;"></div>
      </div>
      <div class="hud-debug" id="fpsDisplay" style="display:none;">${t('hud.fps', 0)}</div>
    `;
    document.body.appendChild(this.element);

    this.modeDisplay = null;
    this.waveDisplay = this.element.querySelector('#waveDisplay');
    this.enemyCount = this.element.querySelector('#enemyCount');
    this.goldDisplay = this.element.querySelector('#goldDisplay');
    this.livesDisplay = this.element.querySelector('#livesDisplay');
    this.prepTimer = this.element.querySelector('#prepTimer');
    this.prepInfo = this.element.querySelector('#prepInfo');
    this.fpsDisplay = this.element.querySelector('#fpsDisplay');
    this.heroDisplay = this.element.querySelector('#heroDisplay');
    this.flowerCount = this.element.querySelector('#flowerCount');
    this.weatherDisplay = this.element.querySelector('#weatherDisplay');
    this.eventDisplay = this.element.querySelector('#eventDisplay');
    this.reviveBtn = this.element.querySelector('#btnReviveHero');
    this.flowerBtn = this.element.querySelector('#btnFlowerMode');

    this.flowerBtn.addEventListener('click', () => {
      if (this.engine.flowerMode) {
        this.engine.flowerManager.cycleVariety();
      } else {
        this.engine.flowerMode = true;
      }
      this._updateFlowerBtn();
    });

    this.element.querySelector('#btnStartWave').addEventListener('click', () => {
      this.engine.startNextWave();
    });

    this.element.querySelector('#btnToggleSpeed').addEventListener('click', () => {
      this.engine.cycleSpeed();
      this.updateSpeedDisplay();
    });

    this.element.querySelector('#btnPause').addEventListener('click', () => {
      this.engine.togglePause();
    });

    this.element.querySelector('#btnSave').addEventListener('click', () => {
      this.engine.showSaveDialog();
    });

    this.element.querySelector('#btnLoad').addEventListener('click', () => {
      this.engine.showLoadDialog();
    });

    this.element.querySelector('#btnHeroPanel').addEventListener('click', () => {
      this.engine.showHeroPanel();
    });

    this.element.querySelector('#btnSettings').addEventListener('click', () => {
      if (window.electronAPI) window.electronAPI.openSettings();
    });

    this.element.querySelector('#btnReviveHero').addEventListener('click', () => {
      if (this.engine.hero && !this.engine.hero.alive && this.engine.gold >= HERO_REVIVE_COST) {
        const cost = this.engine.hero.revive();
        this.engine.gold -= cost;
        this.reviveBtn.style.display = 'none';
      }
    });
  }

  updateSpeedDisplay() {
    const btn = this.element.querySelector('#btnToggleSpeed');
    const speeds = [t('settings.speed1x'), t('settings.speed2x'), t('settings.speed4x')];
    btn.textContent = `⏩ ${speeds[this.engine.gameSpeedIndex] || t('settings.speed1x')}`;
  }

  update() {
    const state = this.engine.getState();
    if (state.gameMode === 'endless' || state.totalWaves === Infinity) {
      this.waveDisplay.textContent = `${state.currentWave}`;
      if (!this.modeDisplay) {
        this.modeDisplay = document.createElement('span');
        this.modeDisplay.className = 'hud-mode-label';
        this.modeDisplay.textContent = t('hud.modeEndless');
        this.element.querySelector('.hud-center').appendChild(this.modeDisplay);
      }
    } else {
      this.waveDisplay.textContent = `${state.currentWave} / ${state.totalWaves}`;
      if (this.modeDisplay) {
        this.modeDisplay.remove();
        this.modeDisplay = null;
      }
    }
    this.enemyCount.textContent = state.enemyCount;
    this.goldDisplay.textContent = state.gold;
    this.livesDisplay.textContent = state.lives;
    this.flowerCount.textContent = state.flowerCount || 0;
    this._updateFlowerBtn();
    this.fpsDisplay.textContent = t('hud.fps', state.fps);

    if (this.engine.hero) {
      const h = this.engine.hero;
      const typeName = h._template ? t(h._template.nameKey) : '';
      const deployedStr = this.engine.heroes ? `[${this.engine.heroes.filter(hh => hh.alive).length}/${this.engine.heroManager.maxHeroSlots}]` : '';
      this.heroDisplay.textContent = `${typeName} ${t('hero.level', h.level)} ${deployedStr} ${h.alive ? t('hero.alive') : t('hero.dead')}`;
      this.reviveBtn.style.display = (!h.alive && this.engine.gold >= HERO_REVIVE_COST) ? 'inline-block' : 'none';
    }

    if (this.engine.weatherSystem) {
      const w = this.engine.weatherSystem;
      const wId = w.currentWeather.id;
      const icons = { clear: '☀️', rainy: '🌧️', storm: '⛈️', blizzard: '❄️', fog: '🌫️' };
      const night = w.isNight() ? '🌙' : '';
      this.weatherDisplay.textContent = `${night}${icons[wId] || '☀️'} ${t('weather.' + wId)}`;
    }

    if (this.engine.eventSystem && this.engine.eventSystem.activeEvent) {
      const evt = this.engine.eventSystem.activeEvent;
      const icons = { positive: '✅', negative: '⚠️', neutral: '📦' };
      const dur = this.engine.eventSystem.activeDuration;
      this.eventDisplay.style.display = 'flex';
      this.eventDisplay.innerHTML = `${icons[evt.type] || '📌'} ${t('event.' + evt.id)}${dur > 0 ? ` (${dur} ${t('event.waves')})` : ''}`;
    } else if (this.eventDisplay) {
      this.eventDisplay.style.display = 'none';
    }

    if (state.isPrepping) {
      this.prepInfo.style.display = 'flex';
      this.prepTimer.textContent = Math.ceil(state.prepTimeLeft);
    } else {
      this.prepInfo.style.display = 'none';
    }

    const startBtn = this.element.querySelector('#btnStartWave');
    startBtn.disabled = state.waveInProgress || state.isPrepping;
    startBtn.textContent = state.waveInProgress ? t('hud.inProgress') : t('hud.nextWave');
  }

  _updateFlowerBtn() {
    if (!this.engine.flowerManager) return;
    const v = this.engine.flowerManager.selectedVariety;
    const name = t('flower.' + v.id + '.name');
    if (this.engine.flowerMode) {
      this.flowerBtn.textContent = `🌻 ${name} (${v.cost}g)`;
      this.flowerBtn.title = t('flower.clickCycle');
      this.flowerBtn.style.background = 'rgba(255, 200, 100, 0.25)';
      this.flowerBtn.style.borderColor = '#ffdd44';
    } else {
      this.flowerBtn.textContent = `🌻 ${t('flower.plant')}`;
      this.flowerBtn.title = t('flower.plantCost');
      this.flowerBtn.style.background = '';
      this.flowerBtn.style.borderColor = '';
    }
  }

  toggleFps(show) {
    this.fpsDisplay.style.display = show ? 'block' : 'none';
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
