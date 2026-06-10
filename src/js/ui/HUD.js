import { t, th } from '../config/locale.js';
import { HERO_REVIVE_COST } from '../config/constants.js';
import { FLOWER_VARIETIES } from '../managers/FlowerManager.js';
import { iconHTML, iconElem } from './IconProvider.js';

export class HUD {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this._prevState = {};
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
          <div class="hud-subtitle" id="weatherDisplay">${iconHTML('sun')} ${t('weather.clear')}</div>
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
            <span class="hud-label">${iconHTML('cherry')}</span>
            <span class="hud-value" id="flowerCount">0</span>
          </div>
        </div>
      </div>
      <div class="hud-bottom">
        <div class="hud-controls">
          <button class="hud-btn" id="btnStartWave" title="${t('hud.nextWave')}">${t('hud.nextWave')}</button>
          <button class="hud-btn" id="btnToggleSpeed" title="${t('ui.cycleSpeed')}">${iconHTML('ffwd')} ${t('settings.speed1x')}</button>
          <button class="hud-btn" id="btnPause" title="${t('hud.pause')}">${t('hud.pause')}</button>
           <button class="hud-btn" id="btnSave" title="${t('hud.save')}">${t('hud.save')}</button>
          <button class="hud-btn" id="btnLoad" title="${t('hud.load')}">${t('hud.load')}</button>
           <button class="hud-btn" id="btnHeroPanel" title="${t('hero.panel')}">${t('hero.panel')}</button>
           <button class="hud-btn" id="btnInventory" title="${t('inventory.title')} (I)">${iconHTML('box')} ${t('inventory.title')}</button>
           <button class="hud-btn" id="btnTalents" title="${t('talent.title')} (T)">${iconHTML('star')} ${t('talent.title')}</button>
           <button class="hud-btn" id="btnSettings" title="${t('hud.settings')}">${t('hud.settings')}</button>
          <button class="hud-btn" id="btnFlowerMode" title="${t('flower.plantCost')}">${iconHTML('flower')} ${t('flower.plant')}</button>
          <button class="hud-btn" id="btnReviveHero" title="${t('hud.reviveHero')}" style="display:none;">${t('hud.reviveHero')}</button>
        </div>
        <div class="hud-prep-info" id="prepInfo">
          <span>${t('hud.nextWaveIn')} <strong id="prepTimer">15</strong>${t('hud.seconds')}</span>
        </div>
        <div class="hud-event-info" id="eventDisplay" style="display:none;"></div>
        <div class="hud-skill-bar" id="skillBar">
          <div class="skill-slot" id="skillSlot0">
            <span class="skill-key">Q</span>
            <span class="skill-name" id="skillName0"></span>
            <div class="skill-cooldown-overlay" id="skillCD0"></div>
          </div>
          <div class="skill-slot" id="skillSlot1">
            <span class="skill-key">E</span>
            <span class="skill-name" id="skillName1"></span>
            <div class="skill-cooldown-overlay" id="skillCD1"></div>
          </div>
        </div>
        <div class="hud-combo-info" id="comboDisplay" style="display:none;"></div>
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
    this.comboDisplay = this.element.querySelector('#comboDisplay');
    this.skillBar = this.element.querySelector('#skillBar');
    this.skillName0 = this.element.querySelector('#skillName0');
    this.skillName1 = this.element.querySelector('#skillName1');
    this.skillCD0 = this.element.querySelector('#skillCD0');
    this.skillCD1 = this.element.querySelector('#skillCD1');
    this.skillSlot0 = this.element.querySelector('#skillSlot0');
    this.skillSlot1 = this.element.querySelector('#skillSlot1');
    this.reviveBtn = this.element.querySelector('#btnReviveHero');
    this.flowerBtn = this.element.querySelector('#btnFlowerMode');
    this.pauseBtn = this.element.querySelector('#btnPause');

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

    this.element.querySelector('#btnInventory').addEventListener('click', () => {
      this.engine.ui.inventoryPanel.toggle();
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
    btn.innerHTML = `${iconHTML('ffwd')} ${speeds[this.engine.gameSpeedIndex] || t('settings.speed1x')}`;
  }

  update() {
    const state = this.engine.getState();
    const prev = this._prevState;
    const changed = {};

    if (state.gameMode !== prev.gameMode || state.totalWaves !== prev.totalWaves) changed.mode = true;
    if (state.currentWave !== prev.currentWave) changed.wave = true;
    if (state.enemyCount !== prev.enemyCount) changed.enemyCount = true;
    if (state.gold !== prev.gold) changed.gold = true;
    if (state.lives !== prev.lives) changed.lives = true;
    if (state.flowerCount !== prev.flowerCount) changed.flowerCount = true;
    if (state.fps !== prev.fps) changed.fps = true;
    if (state.isPaused !== prev.isPaused) changed.pauseBtn = true;
    if (state.isPrepping !== prev.isPrepping || state.prepTimeLeft !== prev.prepTimeLeft) changed.prepInfo = true;
    if (state.waveInProgress !== prev.waveInProgress) changed.startBtn = true;
    if (this.engine.hero && (this.engine.hero.level !== prev._heroLevel || this.engine.hero.hp !== prev._heroHp || this.engine.hero.alive !== prev._heroAlive)) changed.heroDisplay = true;
    if (this.engine.weatherSystem && this.engine.weatherSystem.currentWeather.id !== prev._weatherId) changed.weather = true;
    if (this.engine.eventSystem && this.engine.eventSystem.activeEvent !== prev._eventId) changed.event = true;

    const isEndless = state.gameMode === 'endless' || state.totalWaves === Infinity;
    const isTutorial = state.gameMode === 'tutorial';

    if (changed.mode) {
      if (isEndless) {
        if (!this.modeDisplay) {
          this.modeDisplay = document.createElement('span');
          this.modeDisplay.className = 'hud-mode-label';
          this.modeDisplay.textContent = t('hud.modeEndless');
          this.element.querySelector('.hud-center').appendChild(this.modeDisplay);
        }
      } else if (isTutorial) {
        if (!this.modeDisplay) {
          this.modeDisplay = document.createElement('span');
          this.modeDisplay.className = 'hud-mode-label tutorial-label';
          this.modeDisplay.textContent = t('hud.modeTutorial');
          this.element.querySelector('.hud-center').appendChild(this.modeDisplay);
          ['btnSave','btnLoad','btnHeroPanel','btnInventory','btnSettings','btnFlowerMode','btnReviveHero'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
          });
        }
      } else {
        this._removeModeDisplay();
      }
    }

    if (changed.wave || changed.mode) {
      this.waveDisplay.textContent = isEndless ? `${state.currentWave}` : `${state.currentWave} / ${state.totalWaves}`;
    }
    if (changed.enemyCount) this.enemyCount.textContent = state.enemyCount;
    if (changed.gold) this.goldDisplay.textContent = state.gold;
    if (changed.lives) this.livesDisplay.textContent = state.lives;
    if (changed.flowerCount) {
      const totalFlowers = state.flowerCount || 0;
      const matureFlowers = this.engine.flowerManager.getMatureCount();
      this.flowerCount.innerHTML = matureFlowers > 0 ? `${iconHTML('coin')}${matureFlowers}/${totalFlowers}` : `${totalFlowers}`;
    }
    this._updateFlowerBtn();
    if (changed.fps) this.fpsDisplay.textContent = t('hud.fps', state.fps);

    if (changed.heroDisplay && this.engine.hero) {
      const h = this.engine.hero;
      const typeName = h._template ? t(h._template.nameKey) : '';
      const deployedStr = this.engine.heroes ? `[${this.engine.heroes.filter(hh => hh.alive).length}/${this.engine.heroManager.maxHeroSlots}]` : '';
      this.heroDisplay.innerHTML = `${typeName} ${t('hero.level', h.level)} ${deployedStr} ${h.alive ? th('hero.alive') : th('hero.dead')}`;
      this.reviveBtn.style.display = (!h.alive && this.engine.gold >= HERO_REVIVE_COST) ? 'inline-block' : 'none';
    }

    if (changed.pauseBtn) this.pauseBtn.textContent = state.isPaused ? t('hud.paused') : t('hud.pause');

    if (changed.weather && this.engine.weatherSystem) {
      const w = this.engine.weatherSystem;
      const wId = w.currentWeather.id;
      const icons = { clear: 'sun', rainy: 'rain', storm: 'storm', blizzard: 'snow', fog: 'fog' };
      const night = w.isNight() ? iconHTML('moon') : '';
      this.weatherDisplay.innerHTML = `${night}${iconHTML(icons[wId] || 'sun')} ${t('weather.' + wId)}`;
    }

    const comboKills = this.engine._comboKills || 0;
    const comboActive = this.engine._comboStreakActive;
    if (comboActive && comboKills >= 3) {
      this.comboDisplay.style.display = 'flex';
      this.comboDisplay.innerHTML = `${iconHTML('skull')} ${comboKills}`;
    } else {
      this.comboDisplay.style.display = 'none';
    }

    if (changed.event) {
      if (this.engine.eventSystem && this.engine.eventSystem.activeEvent) {
        const evt = this.engine.eventSystem.activeEvent;
        const icons = { positive: 'check', negative: 'skull', neutral: 'box' };
        const dur = this.engine.eventSystem.activeDuration;
        this.eventDisplay.style.display = 'flex';
        this.eventDisplay.innerHTML = `${iconHTML(icons[evt.type] || 'pin')} ${t('event.' + evt.id)}${dur > 0 ? ` (${dur} ${t('event.waves')})` : ''}`;
      } else if (this.eventDisplay) {
        this.eventDisplay.style.display = 'none';
      }
    }

    if (changed.prepInfo) {
      if (state.isPrepping) {
        this.prepInfo.style.display = 'flex';
        this.prepTimer.textContent = Math.ceil(state.prepTimeLeft);
      } else {
        this.prepInfo.style.display = 'none';
      }
    }

    if (changed.startBtn) {
      const startBtn = this.element.querySelector('#btnStartWave');
      startBtn.disabled = state.waveInProgress || state.isPrepping;
      startBtn.textContent = state.waveInProgress ? t('hud.inProgress') : t('hud.nextWave');
    }

    this._updateSkillBar();

    this._prevState = {
      gameMode: state.gameMode, totalWaves: state.totalWaves,
      currentWave: state.currentWave, enemyCount: state.enemyCount,
      gold: state.gold, lives: state.lives,
      flowerCount: state.flowerCount, fps: state.fps,
      isPaused: state.isPaused, isPrepping: state.isPrepping,
      prepTimeLeft: state.prepTimeLeft, waveInProgress: state.waveInProgress,
      _heroLevel: this.engine.hero?.level,
      _heroHp: this.engine.hero?.hp,
      _heroAlive: this.engine.hero?.alive,
      _weatherId: this.engine.weatherSystem?.currentWeather?.id,
      _eventId: this.engine.eventSystem?.activeEvent,
    };
  }

  _updateSkillBar() {
    const hero = this.engine.hero;
    if (!hero || !hero.alive) {
      this.skillBar.style.display = 'none';
      return;
    }
    this.skillBar.style.display = 'flex';
    const sm = this.engine.skillManager;
    for (let slot = 0; slot < 2; slot++) {
      const def = sm.getSkillDef(hero._template.id, slot);
      const cdEl = slot === 0 ? this.skillCD0 : this.skillCD1;
      const nameEl = slot === 0 ? this.skillName0 : this.skillName1;
      const slotEl = slot === 0 ? this.skillSlot0 : this.skillSlot1;
      if (!def) { slotEl.style.display = 'none'; continue; }
      slotEl.style.display = 'flex';
      nameEl.textContent = t(def.nameKey);
      const cd = sm.getCooldownRemaining(hero._template.id + '_' + hero.heroIndex, def.id);
      if (cd > 0) {
        const pct = cd / def.cooldown;
        cdEl.style.height = `${pct * 100}%`;
        cdEl.textContent = cd > 1 ? Math.ceil(cd) + 's' : cd.toFixed(1) + 's';
        slotEl.classList.add('on-cooldown');
      } else {
        cdEl.style.height = '0';
        cdEl.textContent = '';
        slotEl.classList.remove('on-cooldown');
      }
    }
  }

  _removeModeDisplay() {
    if (this.modeDisplay) {
      this.modeDisplay.remove();
      this.modeDisplay = null;
    }
  }

  _updateFlowerBtn() {
    if (!this.engine.flowerManager) return;
    const v = this.engine.flowerManager.selectedVariety;
    const name = t('flower.' + v.id + '.name');
    if (this.engine.flowerMode) {
      this.flowerBtn.innerHTML = `${iconHTML('flower')} ${name} (${v.cost}g)`;
      this.flowerBtn.title = t('flower.clickCycle');
      this.flowerBtn.style.background = 'rgba(255, 200, 100, 0.25)';
      this.flowerBtn.style.borderColor = '#ffdd44';
    } else {
      this.flowerBtn.innerHTML = `${iconHTML('flower')} ${t('flower.plant')}`;
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
