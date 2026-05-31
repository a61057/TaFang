import { TOWER_TYPES, TOWER_KEYS } from '../config/towerData.js';
import { t } from '../config/locale.js';
import { iconHTML } from './IconProvider.js';

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

  _drawTowerPreview(ctx, typeId, w, h) {
    const cx = w / 2, cy = h / 2;
    ctx.clearRect(0, 0, w, h);
    switch (typeId) {
      case 'CANNON': {
        ctx.fillStyle = '#4a4a5a'; ctx.fillRect(cx - 11, cy - 3, 22, 10);
        ctx.fillStyle = '#5a5a6a'; ctx.fillRect(cx - 9, cy - 5, 18, 8);
        ctx.fillStyle = '#888';
        for (let i = -8; i <= 8; i += 8) { ctx.fillRect(cx + i - 2, cy - 9, 4, 5); }
        ctx.fillStyle = '#555'; ctx.fillRect(cx - 1, cy - 2, 14, 4);
        ctx.fillStyle = '#333'; ctx.fillRect(cx + 11, cy - 3, 4, 6);
        break;
      }
      case 'MACHINE': {
        ctx.fillStyle = '#6a6a3a'; ctx.fillRect(cx - 14, cy - 2, 28, 10);
        ctx.fillStyle = '#888'; ctx.fillRect(cx - 2, cy - 8, 3, 6); ctx.fillRect(cx + 4, cy - 8, 3, 6);
        ctx.fillStyle = '#666'; ctx.fillRect(cx, cy - 10, 12, 3); ctx.fillRect(cx, cy + 7, 12, 3);
        ctx.fillStyle = '#222'; ctx.fillRect(cx + 10, cy - 11, 3, 5); ctx.fillRect(cx + 10, cy + 6, 3, 5);
        break;
      }
      case 'MORTAR': {
        ctx.fillStyle = '#6a4a3a'; ctx.beginPath(); ctx.arc(cx, cy + 2, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#555'; ctx.fillRect(cx - 3, cy - 6, 6, 10);
        ctx.fillStyle = '#666'; ctx.fillRect(cx - 2, cy - 8, 4, 3);
        ctx.fillStyle = '#333'; ctx.fillRect(cx - 4, cy - 10, 8, 3);
        break;
      }
      case 'SLOW': {
        ctx.fillStyle = '#4488aa'; ctx.beginPath();
        ctx.moveTo(cx, cy - 11); ctx.lineTo(cx - 10, cy + 4); ctx.lineTo(cx + 10, cy + 4); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#66bbdd'; ctx.beginPath();
        ctx.moveTo(cx, cy - 7); ctx.lineTo(cx - 7, cy + 2); ctx.lineTo(cx + 7, cy + 2); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = '#ccffff'; ctx.lineWidth = 1;
        for (let a = 0; a < 6; a++) {
          const ang = a * Math.PI / 3; ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * 2, cy - 11 + Math.sin(ang) * 2);
          ctx.lineTo(cx + Math.cos(ang) * 5, cy - 11 + Math.sin(ang) * 5); ctx.stroke();
        }
        break;
      }
      case 'ELECTRIC': {
        ctx.fillStyle = '#444466'; ctx.fillRect(cx - 4, cy - 11, 8, 18);
        ctx.fillStyle = '#6666aa'; ctx.fillRect(cx - 2, cy - 9, 4, 14);
        ctx.strokeStyle = '#cc8844'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - 7 + i * 5, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = '#9944dd'; ctx.beginPath(); ctx.arc(cx, cy - 13, 3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3a3a5a'; ctx.fillRect(cx - 10, cy + 7, 20, 4);
        break;
      }
      case 'SNIPER': {
        ctx.fillStyle = '#3a3a4a'; ctx.fillRect(cx - 12, cy + 1, 24, 4);
        ctx.fillStyle = '#4a4a5a'; ctx.fillRect(cx - 10, cy - 1, 20, 4);
        ctx.fillStyle = '#555'; ctx.fillRect(cx - 1, cy - 3, 24, 4);
        ctx.fillStyle = '#666'; ctx.fillRect(cx + 2, cy - 2, 20, 2);
        ctx.fillStyle = '#1a1a2a'; ctx.fillRect(cx + 20, cy - 4, 4, 6);
        ctx.fillStyle = '#aaccff'; ctx.fillRect(cx + 8, cy - 4, 6, 8);
        ctx.strokeStyle = '#3a3a4a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx - 2, cy + 1); ctx.lineTo(cx - 6, cy + 8);
        ctx.moveTo(cx + 2, cy + 1); ctx.lineTo(cx + 6, cy + 8); ctx.stroke();
        break;
      }
      case 'FLAMETHROWER': {
        ctx.fillStyle = '#5a3a2a'; ctx.beginPath(); ctx.arc(cx - 4, cy + 2, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#444'; ctx.fillRect(cx - 1, cy - 2, 12, 5);
        ctx.fillStyle = '#666'; ctx.fillRect(cx + 9, cy - 3, 4, 7);
        ctx.fillStyle = '#222'; ctx.fillRect(cx + 11, cy - 4, 3, 9);
        ctx.fillStyle = '#ff6600'; ctx.globalAlpha = 0.7; ctx.beginPath(); ctx.arc(cx + 15, cy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case 'OBSERVATION': {
        ctx.fillStyle = '#4a5a6a'; ctx.fillRect(cx - 2, cy - 13, 4, 22);
        ctx.fillStyle = '#5a6a7a'; ctx.fillRect(cx - 6, cy + 3, 12, 4); ctx.fillRect(cx - 8, cy - 13, 16, 4);
        ctx.fillStyle = '#88aacc'; ctx.fillRect(cx - 1, cy - 15, 3, 3);
        ctx.fillStyle = '#667';
        for (let i = 0; i < 2; i++) { ctx.fillRect(cx - 7, cy - 6 + i * 6, 14, 2); }
        ctx.fillStyle = '#aaccee'; ctx.beginPath(); ctx.arc(cx, cy - 15, 2, 0, Math.PI * 2); ctx.fill();
        break;
      }
      case 'ARC': {
        ctx.fillStyle = '#2a4a44'; ctx.fillRect(cx - 4, cy - 10, 8, 18);
        ctx.fillStyle = '#3a6a5a'; ctx.fillRect(cx - 2, cy - 8, 4, 14);
        ctx.strokeStyle = '#44ffcc'; ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(cx, cy - 6 + i * 5, 6, 2, 0, 0, Math.PI * 2); ctx.stroke(); }
        ctx.fillStyle = '#44ffcc'; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(cx, cy - 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        break;
      }
      case 'INSECTICIDE': {
        ctx.fillStyle = '#2a4a2a'; ctx.fillRect(cx - 10, cy - 5, 20, 12);
        ctx.fillStyle = '#3a6a3a'; ctx.fillRect(cx - 8, cy - 7, 16, 10);
        ctx.fillStyle = '#44ff44'; ctx.fillRect(cx - 6, cy - 3, 6, 4);
        ctx.fillStyle = '#444'; ctx.fillRect(cx + 4, cy - 2, 10, 4);
        ctx.fillStyle = '#666'; ctx.fillRect(cx + 12, cy - 3, 3, 6);
        ctx.fillStyle = '#222'; ctx.fillRect(cx + 13, cy - 4, 2, 8);
        break;
      }
    }
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
      this._drawTowerPreview(previewCanvas.getContext('2d'), key, 36, 28);
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
