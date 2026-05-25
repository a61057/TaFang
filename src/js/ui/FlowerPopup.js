import { FLOWER_VARIETIES } from '../managers/FlowerManager.js';
import { t } from '../config/locale.js';

export class FlowerPopup {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this.currentFlower = null;
    this.visible = false;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'flowerPopup';
    this.element.className = 'popup-panel';
    this.element.addEventListener('click', (e) => e.stopPropagation());
    this.element.innerHTML = `
      <div class="panel-header" id="flowerName"></div>
      <div class="flower-info" id="flowerInfo"></div>
      <div class="flower-actions">
        <button class="action-btn sell-btn" id="btnFlowerSell">${t('flower.harvest')}</button>
      </div>
    `;
    document.body.appendChild(this.element);

    this.element.querySelector('#btnFlowerSell').addEventListener('click', () => {
      if (this.currentFlower) {
        this.engine.flowerManager.sell(this.currentFlower.col, this.currentFlower.row);
        this.hide();
      }
    });

    this.hide();
  }

  show(col, row) {
    const flower = this.engine.flowerManager.getFlowerAt(col, row);
    if (!flower) return;
    this.currentFlower = flower;
    this.visible = true;

    const v = FLOWER_VARIETIES.find(vv => vv.id === flower.varietyId) || FLOWER_VARIETIES[0];
    const mature = this.engine.flowerManager.isMature(col, row);
    const remaining = this.engine.flowerManager.getRemainingWaves(col, row);

    const pos = this.engine.map.getWorldPos(col, row);
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    let left = pos.x * scaleX + rect.left + 30;
    let top = pos.y * scaleY + rect.top - 80;

    if (left + 200 > window.innerWidth - 10) left = pos.x * scaleX + rect.left - 220;
    if (top < 10) top = 10;

    this.element.style.left = left + 'px';
    this.element.style.top = top + 'px';
    this.element.style.display = 'block';

    const name = t('flower.' + v.id + '.name');
    this.element.querySelector('#flowerName').textContent = `🌸 ${name}`;

    const infoHtml = `
      <div class="stat-row"><span>${t('workbench.total')}</span><span>💰${v.cost}</span></div>
      <div class="stat-row"><span>${t('flower.count')}</span><span>1</span></div>
      ${mature
        ? `<div class="stat-row" style="color:#ffd700;"><span>💰 ${t('flower.sell')}</span><span>+${v.sellPrice}g</span></div>`
        : `<div class="stat-row" style="color:#889;"><span>⏳ ${t('flower.matureIn')}</span><span>${remaining} ${t('flower.waves')}</span></div>`
      }
    `;
    this.element.querySelector('#flowerInfo').innerHTML = infoHtml;

    const sellBtn = this.element.querySelector('#btnFlowerSell');
    if (mature) {
      sellBtn.textContent = `${t('flower.harvest')} (💰${v.sellPrice})`;
      sellBtn.disabled = false;
      sellBtn.style.display = 'block';
    } else {
      sellBtn.style.display = 'none';
    }

    this.element.classList.add('visible');
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    this.element.classList.remove('visible');
    this.currentFlower = null;
  }
}
