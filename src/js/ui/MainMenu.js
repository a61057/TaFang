import { t } from '../config/locale.js';

export class MainMenu {
  constructor(onCampaign, onEndless, onLoadGame, onSettings, onAchievements) {
    this.onCampaign = onCampaign;
    this.onEndless = onEndless;
    this.onLoadGame = onLoadGame;
    this.onSettings = onSettings;
    this.onAchievements = onAchievements;
    this.element = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'mainMenu';
    this.element.className = 'overlay-screen main-menu';
    this.element.innerHTML = `
      <div class="menu-content">
        <div class="menu-title">${t('menu.title')}</div>
        <div class="menu-subtitle">${t('menu.subtitle')}</div>
        <div class="menu-buttons">
          <button class="menu-btn primary" id="menuCampaign">
            <span class="menu-btn-label">${t('menu.campaign')}</span>
            <span class="menu-btn-desc">${t('menu.campaignDesc')}</span>
          </button>
          <button class="menu-btn" id="menuEndless">
            <span class="menu-btn-label">${t('menu.endless')}</span>
            <span class="menu-btn-desc">${t('menu.endlessDesc')}</span>
          </button>
          <button class="menu-btn" id="menuLoadGame">${t('menu.loadGame')}</button>
          <button class="menu-btn" id="menuSettings">${t('menu.settings')}</button>
          <button class="menu-btn" id="menuAchievements">${t('menu.achievements')}</button>
        </div>
        <div class="menu-footer">${t('menu.footer')}</div>
      </div>
    `;
    document.body.appendChild(this.element);

    this.element.querySelector('#menuCampaign').addEventListener('click', () => {
      this.hide();
      this.onCampaign();
    });

    this.element.querySelector('#menuEndless').addEventListener('click', () => {
      this.hide();
      this.onEndless();
    });

    this.element.querySelector('#menuLoadGame').addEventListener('click', () => {
      this.onLoadGame();
    });

    this.element.querySelector('#menuSettings').addEventListener('click', () => {
      this.onSettings();
    });

    this.element.querySelector('#menuAchievements').addEventListener('click', () => {
      this.onAchievements();
    });
  }

  show() {
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
