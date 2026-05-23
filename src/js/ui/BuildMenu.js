import { TOWER_TYPES, TOWER_KEYS } from '../config/towerData.js';
import { t } from '../config/locale.js';

const TOWER_KEYS_MAP = { CANNON: 'cannon', MACHINE: 'machine', MORTAR: 'mortar', SLOW: 'slow', ELECTRIC: 'electric' };

export class BuildMenu {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this.col = -1;
    this.row = -1;
    this.visible = false;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'buildMenu';
    this.element.className = 'popup-panel';
    this.element.innerHTML = `
      <div class="panel-header">${t('buildMenu.title')}</div>
      <div class="build-options" id="buildOptions"></div>
    `;
    document.body.appendChild(this.element);
    this.optionsContainer = this.element.querySelector('#buildOptions');
    this.hide();
  }

  show(col, row) {
    this.col = col;
    this.row = row;
    this.visible = true;

    const pos = this.engine.map.getWorldPos(col, row);
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    let left = pos.x * scaleX + rect.left - 80;
    let top = pos.y * scaleY + rect.top - 100;

    if (left < 10) left = 10;
    if (top < 10) top = 10;
    if (left + 160 > window.innerWidth - 10) left = window.innerWidth - 170;

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
    this.element.style.display = 'block';

    this.optionsContainer.innerHTML = '';
    for (const key of TOWER_KEYS) {
      const type = TOWER_TYPES[key];
      const cost = type.levels[0].cost;
      const canAfford = this.engine.gold >= cost;
      const canBuild = this.engine.towerManager.canBuild(col, row, key);
      const localeKey = TOWER_KEYS_MAP[key] || key.toLowerCase();

      const btn = document.createElement('button');
      btn.className = `build-btn ${!canBuild || !canAfford ? 'disabled' : ''}`;
      btn.innerHTML = `
        <span class="tower-name">${t(`tower.${localeKey}.name`)}</span>
        <span class="tower-cost">💰 ${cost}</span>
        <span class="tower-desc">${t(`tower.${localeKey}.desc`)}</span>
      `;
      if (canBuild && canAfford) {
        btn.addEventListener('click', () => {
          this.engine.buildTower(col, row, key);
          this.hide();
        });
      }
      this.optionsContainer.appendChild(btn);
    }

    this.element.classList.add('visible');
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    this.element.classList.remove('visible');
    this.col = -1;
    this.row = -1;
  }
}
