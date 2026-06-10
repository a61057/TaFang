import { TOWER_TYPES, TOWER_KEYS } from '../config/towerData.js';
import { t } from '../config/locale.js';
import { iconHTML } from './IconProvider.js';
import { drawTowerPreview } from './TowerRenderer.js';

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
      <div class="resize-handle"></div>
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

  show(col, row, clientX, clientY) {
    this.col = col;
    this.row = row;
    this.visible = true;

    // If no mouse coordinates given, calculate from tile position
    if (clientX === undefined || clientY === undefined) {
      const pos = this.engine.map.getWorldPos(col, row);
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      clientX = pos.x * scaleX + rect.left;
      clientY = pos.y * scaleY + rect.top;
    }

    this.element.style.display = 'block';
    this.optionsContainer.innerHTML = '';

    // Workbench assemble button
    const assembleBtn = document.createElement('button');
    assembleBtn.className = 'build-btn assemble-btn full-width';
    assembleBtn.innerHTML = `
      <span class="tower-name">${iconHTML('tools')} ${t('workbench.assemble')}</span>
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
          <span class="tower-name">${iconHTML('lock')} ${t(`tower.${localeKey}.name`)}</span>
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

      const previewCanvas = document.createElement('canvas');
      previewCanvas.width = 36;
      previewCanvas.height = 28;
      previewCanvas.className = 'tower-preview';
      drawTowerPreview(previewCanvas.getContext('2d'), key, 36, 28);
      btn.appendChild(previewCanvas);

      const nameSpan = document.createElement('span');
      nameSpan.className = 'tower-name';
      nameSpan.textContent = t(`tower.${localeKey}.name`);
      btn.appendChild(nameSpan);

      const costSpan = document.createElement('span');
      costSpan.className = 'tower-cost';
      costSpan.innerHTML = `${iconHTML('coin')} ${cost}`;
      btn.appendChild(costSpan);

      const descSpan = document.createElement('span');
      descSpan.className = 'tower-desc';
      descSpan.textContent = t(`tower.${localeKey}.desc`);
      btn.appendChild(descSpan);
      if (canBuild && canAfford) {
        btn.addEventListener('click', () => {
          this.engine.buildTower(col, row, key);
          this.hide();
        });
      }
      this.optionsContainer.appendChild(btn);
    }

    // Position near mouse cursor with edge-aware placement
    const menuWidth = this.element.offsetWidth || 220;
    const menuHeight = this.element.offsetHeight || 400;
    const pad = 10;

    let left = clientX + pad;
    if (left + menuWidth > window.innerWidth - pad) {
      left = clientX - menuWidth - pad;
    }
    left = Math.max(pad, Math.min(left, window.innerWidth - menuWidth - pad));

    let top = clientY;
    if (top + menuHeight > window.innerHeight - pad) {
      top = window.innerHeight - menuHeight - pad;
    }
    top = Math.max(pad, top);

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
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
