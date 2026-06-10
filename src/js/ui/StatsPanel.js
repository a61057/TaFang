import { t } from '../config/locale.js';
import { iconHTML } from './IconProvider.js';

export class StatsPanel {
  constructor(engine) {
    this.engine = engine;
    this.element = null;
    this._visible = false;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'statsPanel';
    this.element.className = 'stats-panel';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="stats-header">
        <span class="stats-title">${t('stats.title')}</span>
        <button class="stats-close" id="statsCloseBtn">×</button>
      </div>
      <div class="stats-body" id="statsBody"></div>
    `;
    document.body.appendChild(this.element);

    this._body = this.element.querySelector('#statsBody');
    this.element.querySelector('#statsCloseBtn').addEventListener('click', () => this.hide());
  }

  show() {
    this._visible = true;
    this._render();
    this.element.style.display = 'flex';
  }

  hide() {
    this._visible = false;
    this.element.style.display = 'none';
  }

  toggle() {
    if (this._visible) this.hide();
    else this.show();
  }

  _render() {
    const e = this.engine;
    const stats = e.stats;
    const towers = e.towerManager.getTowers();
    const activeSynergies = e._activeSynergies || [];
    const totalDmg = towers.reduce((sum, t) => sum + (t.totalDamage || 0), 0);

    const comboInfo = e._comboStreakActive
      ? `<div class="stats-row">
          <span>${t('stats.combo')}</span>
          <span class="stats-val combo-active">${stats.comboKills || 0}🔥</span>
         </div>`
      : '';

    const synergyLines = activeSynergies.length > 0
      ? activeSynergies.map(s => `
         <div class="stats-row stats-synergy">
           <span>${iconHTML('link')} ${t(s.nameKey)}</span>
           <span class="stats-val">${t('stats.active')}</span>
         </div>`).join('')
      : `<div class="stats-row stats-synergy">
          <span>${t('stats.noSynergies')}</span>
          <span class="stats-val stats-dim">—</span>
         </div>`;

    const topTowers = [...towers]
      .sort((a, b) => b.totalKills - a.totalKills)
      .slice(0, 5)
      .map((tw, i) => {
        const typeName = tw.typeId;
        return `<div class="stats-row stats-tower-row">
          <span>${i + 1}. ${typeName} Lv${tw.level + 1}</span>
          <span class="stats-val">${tw.totalKills} ${t('stats.kills')}</span>
        </div>`;
      }).join('') || `<div class="stats-row"><span class="stats-dim">${t('stats.noTowers')}</span></div>`;

    this._body.innerHTML = `
      <div class="stats-section">
        <div class="stats-section-title">${t('stats.combat')}</div>
        ${comboInfo}
        <div class="stats-row">
          <span>${t('stats.totalKills')}</span>
          <span class="stats-val">${stats.totalKills}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.totalDamage')}</span>
          <span class="stats-val">${totalDmg}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.bossesKilled')}</span>
          <span class="stats-val">${stats.bossesKilled}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.maxCombo')}</span>
          <span class="stats-val">${stats.maxCombo || 0}</span>
        </div>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">${t('stats.economy')}</div>
        <div class="stats-row">
          <span>${t('stats.gold')}</span>
          <span class="stats-val">${e.gold}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.goldEarned')}</span>
          <span class="stats-val">${stats.totalGoldEarned}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.towersBuilt')}</span>
          <span class="stats-val">${stats.towersBuilt}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.wavesCompleted')}</span>
          <span class="stats-val">${stats.wavesCompleted}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.perfectWaves')}</span>
          <span class="stats-val">${stats.perfectWaves}</span>
        </div>
      </div>
      <div class="stats-section">
        <div class="stats-section-title">${t('stats.towers')}</div>
        <div class="stats-row">
          <span>${t('stats.towerCount')}</span>
          <span class="stats-val">${towers.length}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.flowers')}</span>
          <span class="stats-val">${e.flowerManager.getCount()}</span>
        </div>
        ${topTowers}
      </div>
      <div class="stats-section">
        <div class="stats-section-title">${t('stats.synergies')}</div>
        ${synergyLines}
      </div>
      <div class="stats-section">
        <div class="stats-section-title">${t('stats.game')}</div>
        <div class="stats-row">
          <span>${t('stats.gameTime')}</span>
          <span class="stats-val">${_fmtTime(stats.gameTime)}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.mode')}</span>
          <span class="stats-val">${e.gameMode}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.wave')}</span>
          <span class="stats-val">${e.waveManager.currentWave}</span>
        </div>
        <div class="stats-row">
          <span>${t('stats.lives')}</span>
          <span class="stats-val">${e.lives}</span>
        </div>
      </div>
    `;
  }
}

function _fmtTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
