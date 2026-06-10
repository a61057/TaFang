import { TOWER_TYPES, getTowerStats } from '../config/towerData.js';
import { t } from '../config/locale.js';

const TOWER_TYPE_MAP = { cannon: 'cannon', machine: 'machine', mortar: 'mortar', slow: 'slow', electric: 'electric', observation: 'observation' };

export class TowerInfoPanel {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.element = null;
    this.currentTower = null;
    this.visible = false;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'towerInfo';
    this.element.className = 'popup-panel';
    this.element.innerHTML = `
      <div class="panel-header" id="towerName">${t('towerInfo.damage')}</div>
      <div class="tower-stats" id="towerStats"></div>
      <div class="tower-actions">
        <button class="action-btn upgrade-btn" id="btnUpgrade">${t('towerInfo.upgrade', 0)}</button>
        <button class="action-btn sell-btn" id="btnSell">${t('towerInfo.sell', 0)}</button>
      </div>
      <div class="evo-actions" id="evoActions" style="display:none;"></div>
    `;
    document.body.appendChild(this.element);

    this.element.querySelector('#btnUpgrade').addEventListener('click', () => {
      if (this.currentTower) this.engine.upgradeTower(this.currentTower);
    });

    this.element.querySelector('#btnSell').addEventListener('click', () => {
      if (this.currentTower) {
        this.engine.sellTower(this.currentTower);
        this.hide();
      }
    });

    this.hide();
  }

  show(tower) {
    this.currentTower = tower;
    this.visible = true;

    const pos = this.engine.map.getWorldPos(tower.col, tower.row);
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

    this._updateInfo();
    this.element.classList.add('visible');
  }

  _updateInfo() {
    if (!this.currentTower) return;
    const tower = this.currentTower;
    const type = TOWER_TYPES[tower.typeId];
    const stats = tower.stats;
    const localeKey = (TOWER_TYPE_MAP[tower.typeId] || tower.typeId).toLowerCase();
    const evoName = tower._evolutionName;

    this.element.querySelector('#towerName').textContent =
      evoName ? `${evoName} ${t('towerInfo.level', tower.level + 1)}` :
      `${t(`tower.${localeKey}.name`)} ${t('towerInfo.level', tower.level + 1)}`;

    let statsHtml = `
      <div class="stat-row"><span>${t('towerInfo.damage')}</span><span>${stats.damage}</span></div>
      <div class="stat-row"><span>${t('towerInfo.fireRate')}</span><span>${stats.fireRate.toFixed(2)}s</span></div>
      <div class="stat-row"><span>${t('towerInfo.range')}</span><span>${stats.range}px</span></div>
      <div class="stat-row"><span>${t('towerInfo.kills')}</span><span>${tower.totalKills}</span></div>
      <div class="stat-row"><span>${t('towerInfo.totalDamage')}</span><span>${tower.totalDamage}</span></div>
      ${stats.splash ? `<div class="stat-row"><span>${t('towerInfo.splash')}</span><span>${stats.splash}px</span></div>` : ''}
      ${stats.slowAmount ? `<div class="stat-row"><span>${t('towerInfo.slow')}</span><span>${Math.round(stats.slowAmount * 100)}%</span></div>` : ''}
      ${stats.chainCount ? `<div class="stat-row"><span>${t('towerInfo.chain')}</span><span>${t('towerInfo.targets', stats.chainCount)}</span></div>` : ''}
      ${stats.buffRange ? `<div class="stat-row"><span>${t('towerInfo.buffRange')}</span><span>${stats.buffRange}px</span></div>` : ''}
      ${stats.rangeBonus ? `<div class="stat-row"><span>${t('towerInfo.rangeBonus')}</span><span>+${stats.rangeBonus}px</span></div>` : ''}
      ${stats.burnDamage ? `<div class="stat-row"><span>${t('towerInfo.burnDmg')}</span><span>${stats.burnDamage}</span></div>` : ''}
      ${stats.poisonDamage ? `<div class="stat-row"><span>${t('towerInfo.poisonDmg')}</span><span>${stats.poisonDamage}</span></div>` : ''}
      ${stats.armorPierce ? `<div class="stat-row"><span>${t('towerInfo.armorPierce')}</span><span>${stats.armorPierce}</span></div>` : ''}
      ${stats.spawnChance ? `<div class="stat-row"><span>${t('towerInfo.spawnChance')}</span><span>${Math.round(stats.spawnChance * 100)}%</span></div>` : ''}
    `;
    this.element.querySelector('#towerStats').innerHTML = statsHtml;

    const upgradeBtn = this.element.querySelector('#btnUpgrade');
    const evoActions = this.element.querySelector('#evoActions');

    if (tower.canEvolve()) {
      upgradeBtn.textContent = t('towerInfo.evolve');
      upgradeBtn.disabled = true;
      upgradeBtn.style.display = 'block';
      this._showEvoChoices(tower, evoActions);
    } else if (tower.canUpgrade()) {
      const cost = tower.getUpgradeCost();
      upgradeBtn.disabled = this.engine.gold < cost;
      upgradeBtn.textContent = t('towerInfo.upgrade', cost);
      upgradeBtn.style.display = 'block';
      evoActions.style.display = 'none';
    } else {
      upgradeBtn.textContent = t('towerInfo.maxLevel');
      upgradeBtn.disabled = true;
      upgradeBtn.style.display = 'block';
      evoActions.style.display = 'none';
    }

    const sellValue = tower.getSellValue();
    this.element.querySelector('#btnSell').textContent = t('towerInfo.sell', sellValue);
  }

  _showEvoChoices(tower, container) {
    const type = TOWER_TYPES[tower.typeId];
    if (!type || !type.evolutions) { container.style.display = 'none'; return; }
    let html = '<div class="evo-title">Choose Evolution:</div>';
    type.evolutions.forEach((evo, i) => {
      const cost = evo.stats.cost;
      const canAfford = this.engine.gold >= cost;
      html += `<button class="evo-btn ${canAfford ? '' : 'disabled'}" data-branch="${i}">
        <span class="evo-name">${evo.name}</span>
        <span class="evo-cost">${cost}g</span>
      </button>`;
    });
    container.innerHTML = html;
    container.style.display = 'flex';

    container.querySelectorAll('.evo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const branch = parseInt(btn.dataset.branch);
        this.engine.evolveTower(tower, branch);
      });
    });
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
    this.element.classList.remove('visible');
    this.currentTower = null;
  }
}
