import { t } from '../config/locale.js';
import { HERO_TEMPLATES, WEAPONS, MAX_EQUIPPED } from '../config/heroData.js';

export class HeroPanel {
  constructor(engine) {
    this.engine = engine;
    this.element = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'heroPanel';
    this.element.className = 'overlay-screen';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="hero-panel-content">
        <div class="hero-panel-header">
          <div class="hero-tabs">
            <button class="hero-tab active" data-tab="heroes">${t('hero.tabHeroes')}</button>
            <button class="hero-tab" data-tab="weapons">${t('hero.tabWeapons')}</button>
          </div>
          <button class="hero-panel-close">&times;</button>
        </div>
        <div class="hero-panel-body">
          <div class="hero-tab-content" id="heroTabContent"></div>
          <div class="hero-tab-content" id="weaponTabContent" style="display:none;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(this.element);

    const tabs = this.element.querySelectorAll('.hero-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const isHeroes = tab.dataset.tab === 'heroes';
        this.element.querySelector('#heroTabContent').style.display = isHeroes ? 'block' : 'none';
        this.element.querySelector('#weaponTabContent').style.display = isHeroes ? 'none' : 'block';
        if (isHeroes) this._renderHeroes();
        else this._renderWeapons();
      });
    });

    this.element.querySelector('.hero-panel-close').addEventListener('click', () => this.hide());
  }

  show() {
    this.element.style.display = 'flex';
    this._renderHeroes();
  }

  hide() {
    this.element.style.display = 'none';
  }

  _renderHeroes() {
    const container = this.element.querySelector('#heroTabContent');
    const mgr = this.engine.heroManager;
    const maxSlots = mgr.maxHeroSlots;
    const deployedCount = mgr.deployedHeroes.length;

    let html = `
      <div class="hero-slot-bar">
        <span class="hero-slot-count">${t('hero.slots', deployedCount, maxSlots)}</span>
        ${maxSlots < 4 ? `<button class="hero-btn upgrade-slot-btn" id="btnUpgradeSlot">${t('hero.upgradeSlots', mgr.getSlotUpgradeCost())}</button>` : '<span class="hero-slot-max">MAX</span>'}
      </div>
    `;

    for (const [id, tmpl] of Object.entries(HERO_TEMPLATES)) {
      const owned = mgr.ownedHeroes.includes(id);
      const isPlayer = mgr.currentHeroType === id;
      const deployed = mgr.isDeployed(id);

      let actionHtml = '';
      if (isPlayer && deployed) {
        actionHtml = '<span class="hero-badge">✓</span>';
      } else if (deployed) {
        actionHtml = `<button class="hero-btn unequip-btn" data-id="${id}" data-action="undeploy">${t('hero.undeploy')}</button>`;
      } else if (owned && mgr.canDeploy()) {
        actionHtml = `<button class="hero-btn equip-btn" data-id="${id}" data-action="deploy">${t('hero.deploy')}</button>`;
      } else if (owned) {
        actionHtml = `<span class="hero-badge" style="color:#667">${t('hero.slotFull')}</span>`;
      } else {
        actionHtml = `<button class="hero-btn recruit-btn" data-id="${id}" data-action="recruit">${t('hero.recruit')} (${tmpl.cost}g)</button>`;
      }

      const data = mgr.heroLevels[id] || { level: 1, xp: 0 };
      html += `
        <div class="hero-card ${isPlayer ? 'active' : ''}">
          <div class="hero-card-color" style="background:${tmpl.color}"></div>
          <div class="hero-card-info">
            <div class="hero-card-name">${t(tmpl.nameKey)}</div>
            <div class="hero-card-desc">${t(tmpl.descKey)}</div>
            <div class="hero-card-stats">
              HP:${tmpl.baseHp} ATK:${tmpl.baseAttack} RNG:${tmpl.baseRange} SPD:${tmpl.baseSpeed}
            </div>
            ${owned ? `<div class="hero-card-level">Lv.${data.level} XP:${data.xp}/100</div>` : ''}
          </div>
          <div class="hero-card-action">
            ${actionHtml}
          </div>
        </div>
      `;
    }
    container.innerHTML = html;

    container.querySelectorAll('[data-action="deploy"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.deployHero(btn.dataset.id);
        this._renderHeroes();
      });
    });

    container.querySelectorAll('[data-action="undeploy"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.undeployHero(btn.dataset.id);
        this._renderHeroes();
      });
    });

    container.querySelectorAll('[data-action="recruit"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.recruitHero(btn.dataset.id);
        this._renderHeroes();
      });
    });

    const upgradeBtn = container.querySelector('#btnUpgradeSlot');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        this.engine.heroManager.upgradeMaxSlots();
        this._renderHeroes();
      });
    }
  }

  _renderWeapons() {
    const container = this.element.querySelector('#weaponTabContent');
    const mgr = this.engine.heroManager;
    let html = `<div class="weapon-inventory-info">${t('hero.equipped')}: ${mgr.equippedWeapons.length}/${MAX_EQUIPPED}</div>`;
    for (const [id, wpn] of Object.entries(WEAPONS)) {
      const owned = mgr.weaponInventory.includes(id);
      const equipped = mgr.equippedWeapons.includes(id);
      let statStr = '';
      if (wpn.stat === 'attack') statStr = `ATK ${wpn.bonus > 0 ? '+' : ''}${wpn.bonus}`;
      else if (wpn.stat === 'range') statStr = `RNG ${wpn.bonus > 0 ? '+' : ''}${wpn.bonus}`;
      else if (wpn.stat === 'maxHp') statStr = `HP ${wpn.bonus > 0 ? '+' : ''}${wpn.bonus}`;
      else if (wpn.stat === 'speed') statStr = `SPD ${wpn.bonus > 0 ? '+' : ''}${wpn.bonus}`;
      else if (wpn.stat === 'attackSpeed') statStr = `ATKSPD ${wpn.bonus < 0 ? '' : '+'}${-wpn.bonus}s`;

      html += `
        <div class="weapon-card ${equipped ? 'equipped' : ''}">
          <div class="weapon-card-info">
            <div class="weapon-card-name">${t(wpn.nameKey)}</div>
            <div class="weapon-card-desc">${t(wpn.descKey)}</div>
            <div class="weapon-card-stat">${statStr}</div>
          </div>
          <div class="weapon-card-action">
            ${equipped ? `<button class="hero-btn unequip-btn" data-id="${id}">${t('hero.unequip')}</button>` :
              owned ? `<button class="hero-btn equip-btn" data-id="${id}">${t('hero.equip')}</button>` :
              `<button class="hero-btn buy-btn" data-id="${id}">${t('hero.buy')} (${wpn.cost}g)</button>`}
          </div>
        </div>
      `;
    }
    container.innerHTML = html;

    container.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.buyWeapon(btn.dataset.id);
        this._renderWeapons();
      });
    });

    container.querySelectorAll('.equip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.equipWeapon(btn.dataset.id);
        this._renderWeapons();
      });
    });

    container.querySelectorAll('.unequip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.engine.unequipWeapon(btn.dataset.id);
        this._renderWeapons();
      });
    });
  }
}
