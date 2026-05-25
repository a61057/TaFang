import { t } from '../config/locale.js';
import { TOWER_TYPES, TOWER_KEYS, getTowerStats } from '../config/towerData.js';
import { PARTS, PART_KEYS, getPartCost, getPartStats } from '../config/partShop.js';

export class WorkbenchPanel {
  constructor(engine) {
    this.engine = engine;
    this.element = null;
    this.selectedBase = null;
    this.parts = {};
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'workbenchPanel';
    this.element.className = 'overlay-screen';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="workbench-content">
        <div class="workbench-header">
          <span class="workbench-title">🔧 ${t('workbench.title')}</span>
          <button class="workbench-close">&times;</button>
        </div>
        <div class="workbench-body">
          <div class="workbench-left">
            <div class="workbench-section-title">${t('workbench.selectBase')}</div>
            <div class="workbench-base-list" id="workbenchBaseList"></div>
          </div>
          <div class="workbench-center">
            <div class="workbench-section-title">${t('workbench.installParts')}</div>
            <div class="workbench-parts" id="workbenchParts">
              <div class="workbench-empty">${t('workbench.selectBaseFirst')}</div>
            </div>
          </div>
          <div class="workbench-right">
            <div class="workbench-section-title">${t('workbench.stats')}</div>
            <div class="workbench-stats" id="workbenchStats">
              <div class="workbench-empty">${t('workbench.selectBaseFirst')}</div>
            </div>
            <div class="workbench-total" id="workbenchTotal" style="display:none;">
              <div class="workbench-total-cost"></div>
              <button class="workbench-build-btn" id="workbenchBuildBtn">${t('workbench.build')}</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.element);

    this.baseList = this.element.querySelector('#workbenchBaseList');
    this.partsContainer = this.element.querySelector('#workbenchParts');
    this.statsContainer = this.element.querySelector('#workbenchStats');
    this.totalDiv = this.element.querySelector('#workbenchTotal');
    this.totalCostSpan = this.element.querySelector('.workbench-total-cost');
    this.buildBtn = this.element.querySelector('#workbenchBuildBtn');

    this.element.querySelector('.workbench-close').addEventListener('click', () => this.hide());
    this.buildBtn.addEventListener('click', () => this._buildAssembled());
  }

  show() {
    this.element.style.display = 'flex';
    this._renderBases();
    if (this.selectedBase) {
      this._renderParts();
      this._renderStats();
    }
  }

  hide() {
    this.element.style.display = 'none';
  }

  _renderBases() {
    this.baseList.innerHTML = '';
    for (const key of TOWER_KEYS) {
      const type = TOWER_TYPES[key];
      if (!this.engine.isTowerUnlocked(key)) continue;
      const div = document.createElement('div');
      div.className = `workbench-base-item${this.selectedBase === key ? ' active' : ''}`;
      div.innerHTML = `
        <span class="workbench-base-icon" style="color:${type.color}">⬡</span>
        <span class="workbench-base-name">${t('tower.' + type.id + '.name')}</span>
        <span class="workbench-base-cost">${type.levels[0].cost}g</span>
      `;
      div.addEventListener('click', () => {
        this.selectedBase = key;
        this.parts = {};
        this._renderBases();
        this._renderParts();
        this._renderStats();
      });
      this.baseList.appendChild(div);
    }
  }

  _renderParts() {
    if (!this.selectedBase) {
      this.partsContainer.innerHTML = `<div class="workbench-empty">${t('workbench.selectBaseFirst')}</div>`;
      return;
    }
    this.partsContainer.innerHTML = '';
    for (const partId of PART_KEYS) {
      const level = this.parts[partId] || 0;
      const part = PARTS[partId];
      const nextLevel = level + 1;
      const maxed = level >= part.levels.length;
      const div = document.createElement('div');
      div.className = 'workbench-part-item';

      let levelStars = '';
      for (let i = 0; i < part.levels.length; i++) {
        levelStars += i < level ? '★' : '☆';
      }
      const cost = maxed ? null : getPartCost(partId, nextLevel);
      const canAfford = cost !== null && this.engine.gold >= cost;
      div.innerHTML = `
        <div class="workbench-part-info">
          <span class="workbench-part-name">${t('part.' + partId + '.name')}</span>
          <span class="workbench-part-levels">${levelStars}</span>
        </div>
        <div class="workbench-part-desc">${t('part.' + partId + '.desc')}</div>
        <div class="workbench-part-action">
          ${maxed ? `<span class="workbench-part-maxed">${t('workbench.maxed')}</span>`
            : `<button class="workbench-part-btn${!canAfford ? ' disabled' : ''}" data-part="${partId}">
                ${t('workbench.install')} ${cost}g
              </button>`}
        </div>
      `;
      const btn = div.querySelector('.workbench-part-btn');
      if (btn && canAfford) {
        btn.addEventListener('click', () => {
          this.engine.gold -= cost;
          this.parts[partId] = nextLevel;
          this._renderParts();
          this._renderStats();
        });
      }
      this.partsContainer.appendChild(div);
    }
  }

  _renderStats() {
    if (!this.selectedBase) {
      this.statsContainer.innerHTML = `<div class="workbench-empty">${t('workbench.selectBaseFirst')}</div>`;
      this.totalDiv.style.display = 'none';
      return;
    }
    const base = getTowerStats(this.selectedBase, 0);
    const modified = this._computeStats(base);
    const baseCost = TOWER_TYPES[this.selectedBase].levels[0].cost;
    const partCost = this._partTotalCost();

    this.statsContainer.innerHTML = `
      <div class="workbench-stat-row">
        <span>${t('tower.damage')}</span>
        <span class="stat-val">${base.damage}</span>
        <span class="stat-arrow">→</span>
        <span class="stat-val stat-new">${modified.damage}</span>
        ${modified._damageBonus > 0 ? `<span class="stat-bonus">+${modified._damageBonus}</span>` : ''}
      </div>
      <div class="workbench-stat-row">
        <span>${t('tower.range')}</span>
        <span class="stat-val">${base.range}</span>
        <span class="stat-arrow">→</span>
        <span class="stat-val stat-new">${modified.range}</span>
        ${modified._rangeBonus > 0 ? `<span class="stat-bonus">+${modified._rangeBonus}</span>` : ''}
      </div>
      <div class="workbench-stat-row">
        <span>${t('tower.fireRate')}</span>
        <span class="stat-val">${base.fireRate.toFixed(2)}s</span>
        <span class="stat-arrow">→</span>
        <span class="stat-val stat-new">${modified.fireRate.toFixed(2)}s</span>
        ${modified._fireRateMult < 1 ? `<span class="stat-bonus">x${modified._fireRateMult}</span>` : ''}
      </div>
      <div class="workbench-stat-row">
        <span>${t('tower.splash')}</span>
        <span class="stat-val">${base.splash || 0}</span>
        <span class="stat-arrow">→</span>
        <span class="stat-val stat-new">${modified.splash || 0}</span>
        ${modified._splashBonus > 0 ? `<span class="stat-bonus">+${modified._splashBonus}</span>` : ''}
      </div>
    `;

    const total = baseCost + partCost;
    this.totalCostSpan.textContent = `${t('workbench.total')}: ${total}g`;
    this.buildBtn.disabled = this.engine.gold < total;
    this.totalDiv.style.display = 'block';
  }

  _computeStats(base) {
    let dmg = base.damage;
    let rng = base.range;
    let fr = base.fireRate;
    let spl = base.splash || 0;
    let dmgBonus = 0, rngBonus = 0, splBonus = 0;
    let frMult = 1;

    for (const partId of PART_KEYS) {
      const lvl = this.parts[partId] || 0;
      if (lvl === 0) continue;
      const stats = getPartStats(partId, lvl);
      if (!stats) continue;
      if (stats.damage) { dmg += stats.damage; dmgBonus += stats.damage; }
      if (stats.range) { rng += stats.range; rngBonus += stats.range; }
      if (stats.fireRateMult) { fr *= stats.fireRateMult; frMult *= stats.fireRateMult; }
      if (stats.splash) { spl += stats.splash; splBonus += stats.splash; }
    }

    return {
      damage: dmg, range: rng, fireRate: fr, splash: spl,
      _damageBonus: dmgBonus, _rangeBonus: rngBonus, _splashBonus: splBonus, _fireRateMult: frMult
    };
  }

  _partTotalCost() {
    let total = 0;
    for (const partId of PART_KEYS) {
      const lvl = this.parts[partId] || 0;
      for (let i = 1; i <= lvl; i++) {
        total += getPartCost(partId, i);
      }
    }
    return total;
  }

  _buildAssembled() {
    if (!this.selectedBase) return;
    const baseCost = TOWER_TYPES[this.selectedBase].levels[0].cost;
    const partCost = this._partTotalCost();
    const total = baseCost + partCost;
    if (this.engine.gold < total) return;
    this.engine.gold -= total;
    const tower = this.engine.towerManager.buildTower(this.engine.selectedTile.col, this.engine.selectedTile.row, this.selectedBase);
    if (!tower) {
      this.engine.gold += total;
      return;
    }
    tower.parts = { ...this.parts };
    tower.stats = { ...this._computeStats(getTowerStats(this.selectedBase, 0)), bulletColor: tower.stats.bulletColor, bulletSpeed: tower.stats.bulletSpeed, bulletSize: tower.stats.bulletSize, arc: tower.stats.arc, effect: tower.stats.effect, color: tower.stats.color, name: tower.stats.name };
    this.engine.stats.towersBuilt++;
    this.engine.audio.playBuild();
    this.engine.particles.emit(tower.x, tower.y, 15, { color: '#ffdd44', speed: 100, size: 3, life: 600 });
    this.hide();
    this.engine.ui.buildMenu.hide();
    this.engine.selectedTower = null;
    this.engine.selectedTile = null;
  }
}
