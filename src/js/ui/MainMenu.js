import { t, getLanguage } from '../config/locale.js';
import { TOWER_KEYS } from '../config/towerData.js';
import { SPEAKER_NAMES } from '../config/storyData.js';
import { getPortraitDataUrl } from './CharacterPortraits.js';
import { drawTowerPreview } from './TowerRenderer.js';

const TOWER_PLACEMENTS = [
  { side: 'left', pos: '12%' }, { side: 'left', pos: '28%' }, { side: 'left', pos: '44%' },
  { side: 'left', pos: '60%' }, { side: 'left', pos: '76%' },
  { side: 'right', pos: '12%' }, { side: 'right', pos: '28%' }, { side: 'right', pos: '44%' },
  { side: 'right', pos: '60%' }, { side: 'right', pos: '76%' },
];

const TOWER_NAMES = {
  CANNON: 'Cannon', MACHINE: 'Machine', MORTAR: 'Mortar', SLOW: 'Slow',
  ELECTRIC: 'Electric', SNIPER: 'Sniper', FLAMETHROWER: 'Flame',
  OBSERVATION: 'Scope', ARC: 'Arc', INSECTICIDE: 'Bug'
};

export class MainMenu {
  constructor(onCampaign, onEndless, onTutorial, onLoadGame, onSettings, onAchievements, onChallenge, onTalents) {
    this.onCampaign = onCampaign;
    this.onEndless = onEndless;
    this.onTutorial = onTutorial;
    this.onLoadGame = onLoadGame;
    this.onSettings = onSettings;
    this.onAchievements = onAchievements;
    this.onChallenge = onChallenge;
    this.onTalents = onTalents;
    this.element = null;
    this._towerCanvases = [];
    this._towerWrappers = [];
    this._animId = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'mainMenu';
    this.element.className = 'overlay-screen main-menu';

    let towerHTML = '';
    for (let i = 0; i < TOWER_KEYS.length; i++) {
      const key = TOWER_KEYS[i];
      const p = TOWER_PLACEMENTS[i];
      towerHTML += `<div class="menu-tower-wrapper" style="position:fixed;${p.side}:16px;top:${p.pos};display:none">
        <canvas class="menu-tower-preview" data-type="${key}" width="56" height="56"></canvas>
        <span class="menu-tower-label">${TOWER_NAMES[key] || key}</span>
      </div>`;
    }

    const lang = getLanguage();
    const STORY_CHARACTERS = ['commander','soldier','scout','scientist','refugee','spy'];
    let charHTML = '';
    for (const id of STORY_CHARACTERS) {
      const url = getPortraitDataUrl(id);
      const name = (SPEAKER_NAMES[id] || {})[lang] || (SPEAKER_NAMES[id] || {}).en || id;
      charHTML += `<div class="menu-char-item" data-char="${id}">
        <div class="menu-char-icon" style="background-image:url(${url})"></div>
        <span class="menu-char-label">${name}</span>
      </div>`;
    }

    this.element.innerHTML = towerHTML + `
      <div class="menu-content">
        <div class="menu-title">${t('menu.title')}</div>
        <div class="menu-subtitle">${t('menu.subtitle')}</div>
        <div class="menu-characters">
          <div class="menu-char-label-all">${t('menu.characters')}</div>
          <div class="menu-char-row">${charHTML}</div>
        </div>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="menuCampaign">
            <span class="menu-btn-label">${t('menu.campaign')}</span>
            <span class="menu-btn-desc">${t('menu.campaignDesc')}</span>
          </button>
          <button class="menu-btn" id="menuTutorial">
            <span class="menu-btn-label">${t('menu.tutorial')}</span>
            <span class="menu-btn-desc">${t('menu.tutorialDesc')}</span>
          </button>
          <button class="menu-btn" id="menuEndless">
            <span class="menu-btn-label">${t('menu.endless')}</span>
            <span class="menu-btn-desc">${t('menu.endlessDesc')}</span>
          </button>
          <button class="menu-btn" id="menuLoadGame">${t('menu.loadGame')}</button>
          <button class="menu-btn" id="menuChallenge">${t('menu.challenge')}</button>
          <button class="menu-btn" id="menuTalents">${t('menu.talents')}</button>
          <button class="menu-btn" id="menuSettings">${t('menu.settings')}</button>
          <button class="menu-btn" id="menuAchievements">${t('menu.achievements')}</button>
        </div>
        <div class="menu-footer">${t('menu.footer')}</div>
      </div>
    `;
    document.body.appendChild(this.element);

    this._towerWrappers = [...this.element.querySelectorAll('.menu-tower-wrapper')];
    this._towerCanvases = [...this.element.querySelectorAll('.menu-tower-preview')];

    this.element.querySelector('#menuCampaign').addEventListener('click', () => {
      this.hide();
      this.onCampaign();
    });

    this.element.querySelector('#menuTutorial').addEventListener('click', () => {
      this.hide();
      this.onTutorial();
    });

    this.element.querySelector('#menuEndless').addEventListener('click', () => {
      this.hide();
      this.onEndless();
    });

    this.element.querySelector('#menuLoadGame').addEventListener('click', () => {
      this.onLoadGame();
    });

    this.element.querySelector('#menuChallenge')?.addEventListener('click', () => {
      this.hide();
      if (this.onChallenge) this.onChallenge();
    });

    this.element.querySelector('#menuTalents')?.addEventListener('click', () => {
      if (this.onTalents) this.onTalents();
    });

    this.element.querySelector('#menuSettings').addEventListener('click', () => {
      this.onSettings();
    });

    this.element.querySelector('#menuAchievements').addEventListener('click', () => {
      this.onAchievements();
    });
  }

  _animate() {
    const time = Date.now() / 1000;
    for (let i = 0; i < this._towerCanvases.length; i++) {
      const canvas = this._towerCanvases[i];
      const ctx = canvas.getContext('2d');
      const bob = Math.sin(time * 2 + i * 0.9) * 4;
      drawTowerPreview(ctx, canvas.dataset.type, canvas.width, canvas.height, bob);
    }
    this._animId = requestAnimationFrame(() => this._animate());
  }

  show() {
    this.element.style.display = 'flex';
    for (const w of this._towerWrappers) w.style.display = '';
    if (!this._animId) this._animate();
  }

  hide() {
    this.element.style.display = 'none';
    for (const w of this._towerWrappers) w.style.display = 'none';
    if (this._animId) {
      cancelAnimationFrame(this._animId);
      this._animId = null;
    }
  }
}
