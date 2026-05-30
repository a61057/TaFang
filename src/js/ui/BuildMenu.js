import { TOWER_TYPES, TOWER_KEYS } from '../config/towerData.js';
import { t } from '../config/locale.js';

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

  refresh() {
    if (this.visible) {
      this.show(this.col, this.row);
    }
  }

  show(col, row) {
    this.col = col;
    this.row = row;
    this.visible = true;

    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const menuWidth = this.element.offsetWidth || 200;
    const left = Math.max(5, rect.left - menuWidth - 5);
    const top = 50;

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
    this.element.style.maxHeight = (window.innerHeight - top - 10) + 'px';
    this.element.style.display = 'block';

    this.optionsContainer.innerHTML = '';
    // Workbench assemble button
    const assembleBtn = document.createElement('button');
    assembleBtn.className = 'build-btn assemble-btn';
    assembleBtn.innerHTML = `
      <span class="tower-name">🔧 ${t('workbench.assemble')}</span>
      <span class="tower-desc">${t('workbench.assembleDesc')}</span>
    `;
    assembleBtn.addEventListener('click', () => {
      this.engine.showWorkbench();
    });
    this.optionsContainer.appendChild(assembleBtn);
    const divider = document.createElement('div');
    divider.className = 'build-divider';
    this.optionsContainer.appendChild(divider);

    for (const key of TOWER_KEYS) {
      const type = TOWER_TYPES[key];
      const unlocked = this.engine.isTowerUnlocked(key);
      const cost = type.levels[0].cost;
      const localeKey = key.toLowerCase();

      if (!unlocked) {
        const uc = type.unlockCost;
        if (!uc) continue;
        const canUnlock = this.engine.gold >= uc;
        const btn = document.createElement('button');
        btn.className = `build-btn ${!canUnlock ? 'disabled' : ''}`;
        btn.innerHTML = `
          <span class="tower-name">❓ ${t(`tower.${localeKey}.name`)}</span>
          <span class="tower-cost">${t('buildMenu.unlock', uc)}</span>
          <span class="tower-desc">${t(`tower.${localeKey}.desc`)}</span>
        `;
        if (canUnlock) {
          btn.addEventListener('click', () => {
            this.engine.unlockTower(key);
            this.refresh();
          });
        }
        this.optionsContainer.appendChild(btn);
        continue;
      }

      const canAfford = this.engine.gold >= cost;
      const canBuild = this.engine.towerManager.canBuild(col, row, key);

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
