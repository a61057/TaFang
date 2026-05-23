import { HUD } from './HUD.js';
import { BuildMenu } from './BuildMenu.js';
import { TowerInfoPanel } from './TowerInfoPanel.js';
import { GameOverScreen } from './GameOverScreen.js';
import { t } from '../config/locale.js';

export class UIManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.hud = new HUD(gameEngine);
    this.buildMenu = new BuildMenu(gameEngine);
    this.towerInfo = new TowerInfoPanel(gameEngine);
    this.gameOver = new GameOverScreen(gameEngine);
    this.hoveredTile = null;
    this.hoveredTower = null;
    this.hoveredEnemy = null;
    this.showFps = false;
    this.tooltip = null;
    this.saveLoadDialog = null;
    this._createTooltip();
    this._createSaveLoadDialog();
  }

  _createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'tooltip';
    this.tooltip.style.display = 'none';
    document.body.appendChild(this.tooltip);
  }

  _createSaveLoadDialog() {
    this.saveLoadDialog = document.createElement('div');
    this.saveLoadDialog.id = 'saveLoadDialog';
    this.saveLoadDialog.className = 'overlay-screen';
    this.saveLoadDialog.style.display = 'none';
    this.saveLoadDialog.innerHTML = `
      <div class="overlay-content save-load-panel">
        <div class="dialog-title">${t('ui.saveLoad')}</div>
        <div class="save-slots" id="saveSlots"></div>
        <div class="dialog-actions">
          <button class="hud-btn" id="btnCloseDialog">${t('ui.close')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.saveLoadDialog);
    this.saveLoadDialog.querySelector('#btnCloseDialog').addEventListener('click', () => this.hideSaveLoad());
  }

  showSaveLoad(mode = 'save') {
    this.saveLoadDialog.style.display = 'flex';
    const container = this.saveLoadDialog.querySelector('#saveSlots');
    container.innerHTML = '';
    const title = this.saveLoadDialog.querySelector('.dialog-title');
    title.textContent = mode === 'save' ? t('ui.saveGame') : t('ui.loadGame');

    this.engine.saveSystem.listSaves().then(result => {
      const saves = result.success ? result.saves : [];
      for (let i = 1; i <= 3; i++) {
        const saveData = saves.find(s => s.slot === i);
        const slotEl = document.createElement('div');
        slotEl.className = 'save-slot';
        slotEl.innerHTML = `
          <div class="slot-number">${t('ui.slot', i)}</div>
          <div class="slot-info">${saveData ? new Date(saveData.modified).toLocaleString() : t('ui.empty')}</div>
          ${saveData ? `<button class="slot-action" data-slot="${i}" data-action="delete">🗑</button>` : ''}
        `;
        slotEl.addEventListener('click', () => {
          if (mode === 'save') {
            this.engine.saveGame(i);
          } else {
            this.engine.loadGame(i);
          }
          this.hideSaveLoad();
        });
        container.appendChild(slotEl);

        const delBtn = slotEl.querySelector('.slot-action');
        if (delBtn) {
          delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.engine.saveSystem.deleteSave(i).then(() => this.showSaveLoad(mode));
          });
        }
      }
    });
  }

  hideSaveLoad() {
    this.saveLoadDialog.style.display = 'none';
  }

  showTowerTooltip(tower, x, y) {
    if (!tower) { this.hideTooltip(); return; }
    this.tooltip.innerHTML = `
      <div class="tt-name">${tower.constructor.name} ${t('towerInfo.level', tower.level + 1)}</div>
      <div class="tt-stat">${t('ui.ttDamage', tower.stats.damage)}</div>
      <div class="tt-stat">${t('ui.ttRange', tower.stats.range)}</div>
      <div class="tt-stat">${t('ui.ttSpeed', tower.stats.fireRate.toFixed(2))}</div>
    `;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (x + 15) + 'px';
    this.tooltip.style.top = (y + 15) + 'px';
  }

  showEnemyTooltip(enemy, x, y) {
    if (!enemy) { this.hideTooltip(); return; }
    const hpPct = Math.round((enemy.hp / enemy.maxHp) * 100);
    this.tooltip.innerHTML = `
      <div class="tt-name" style="color:${enemy.color}">${enemy.isBoss ? '👑 ' : ''}${t(`enemy.${enemy.type}.name`, enemy.type) || t('ui.enemy')}</div>
      <div class="tt-stat">${t('ui.ttHp', enemy.hp, enemy.maxHp, hpPct)}</div>
      <div class="tt-stat">${t('ui.ttSpeed', enemy.baseSpeed.toFixed(0))}</div>
      <div class="tt-stat">${t('ui.ttArmor', enemy.armor)}</div>
      <div class="tt-stat">${t('ui.ttBounty', enemy.bounty)}</div>
    `;
    this.tooltip.style.display = 'block';
    this.tooltip.style.left = (x + 15) + 'px';
    this.tooltip.style.top = (y + 15) + 'px';
  }

  hideTooltip() {
    this.tooltip.style.display = 'none';
  }

  update() {
    this.hud.update();
  }

  showEventNotification(evt) {
    const el = document.createElement('div');
    el.className = 'notification event-notification';
    const icons = { positive: '✅', negative: '⚠️', neutral: '📦' };
    el.innerHTML = `${icons[evt.type] || '📌'} ${t('event.' + evt.id)}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  showFactionNotification(bonuses) {
    const entries = Object.entries(bonuses);
    if (entries.length === 0) return;
    const lines = entries.map(([f, thresholds]) => `🏴 ${t('faction.' + f)} ${Math.max(...thresholds)}/9`).join('<br>');
    const el = document.createElement('div');
    el.className = 'notification faction-notification';
    el.innerHTML = lines;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  showWeatherNotification(weather) {
    const icons = { clear: '☀️', rainy: '🌧️', storm: '⛈️', blizzard: '❄️', fog: '🌫️' };
    const el = document.createElement('div');
    el.className = 'notification weather-notification';
    el.innerHTML = `${icons[weather.id] || '🌤️'} ${t('weather.' + weather.id)}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  toggleFps(show) {
    this.showFps = show;
    this.hud.toggleFps(show);
  }

  refreshLanguage() {
    this.buildMenu.hide();
    this.towerInfo.hide();
    this.hud.destroy();
    this.hud = new HUD(this.engine);
  }
}
