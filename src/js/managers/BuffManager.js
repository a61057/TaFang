import { t } from '../config/locale.js';

const BUFFS = [
  { id: 'tower_damage', duration: 3, towerDamageMult: 1.25, icon: '⚔️' },
  { id: 'tower_range', duration: 3, towerRangeMult: 1.2, icon: '🎯' },
  { id: 'tower_speed', duration: 3, towerFireRateMult: 0.8, icon: '⚡' },
  { id: 'gold_bonus', duration: 3, goldMult: 1.5, icon: '💰' },
  { id: 'enemy_slow', duration: 3, enemySpeedMult: 0.8, icon: '❄️' },
  { id: 'hero_power', duration: 3, heroAtkMult: 1.4, icon: '👊' },
];

const DEBUFFS = [
  { id: 'tower_weaken', duration: 3, towerDamageMult: 0.8, icon: '🦠' },
  { id: 'tower_nearsight', duration: 3, towerRangeMult: 0.8, icon: '🌫️' },
  { id: 'tower_sluggish', duration: 3, towerFireRateMult: 1.25, icon: '🐌' },
  { id: 'gold_tax', duration: 3, goldMult: 0.7, icon: '📉' },
  { id: 'enemy_haste', duration: 3, enemySpeedMult: 1.25, icon: '💨' },
  { id: 'lives_loss', duration: 0, livesChange: -5, icon: '💔' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class BuffManager {
  constructor() {
    this._activeBuffs = [];
    this._activeDebuffs = [];
    this._pending = false;
    this._callback = null;
    this._element = null;
    this._selectedBuff = null;
    this._selectedDebuff = null;
    this._buffOptions = [];
    this._debuffOptions = [];
  }

  isPending() {
    return this._pending;
  }

  show(engine, callback) {
    this._pending = true;
    this._callback = callback;
    this._selectedBuff = null;
    this._selectedDebuff = null;

    const buffCount = 1 + Math.floor(Math.random() * 3);
    const debuffCount = 1 + Math.floor(Math.random() * 3);
    this._buffOptions = shuffle(BUFFS).slice(0, buffCount);
    this._debuffOptions = shuffle(DEBUFFS).slice(0, debuffCount);

    this._buildOverlay(engine);
  }

  hide() {
    if (this._element) {
      this._element.remove();
      this._element = null;
    }
    this._pending = false;
    this._selectedBuff = null;
    this._selectedDebuff = null;
    this._buffOptions = [];
    this._debuffOptions = [];
  }

  onWaveStart() {
    const decrement = (arr, src) => {
      for (let i = arr.length - 1; i >= 0; i--) {
        arr[i].remaining--;
        if (arr[i].remaining <= 0) {
          arr.splice(i, 1);
        }
      }
    };
    decrement(this._activeBuffs, BUFFS);
    decrement(this._activeDebuffs, DEBUFFS);
  }

  _buildOverlay(engine) {
    this._element = document.createElement('div');
    this._element.className = 'overlay-screen';
    this._element.style.zIndex = '870';
    this._element.innerHTML = `
      <div class="buff-overlay">
        <div class="buff-header">${t('buff.title')}</div>
        <div class="buff-subtitle">${t('buff.subtitle')}</div>
        <div class="buff-columns">
          <div class="buff-col">
            <div class="buff-col-title buff-positive">${t('buff.positive')}</div>
            <div class="buff-col-cards" id="buffCards"></div>
          </div>
          <div class="buff-divider"></div>
          <div class="buff-col">
            <div class="buff-col-title buff-negative">${t('buff.negative')}</div>
            <div class="buff-col-cards" id="debuffCards"></div>
          </div>
        </div>
        <button class="buff-confirm" id="buffConfirm" disabled>${t('buff.confirm')}</button>
      </div>
    `;
    document.body.appendChild(this._element);

    const buffContainer = this._element.querySelector('#buffCards');
    const debuffContainer = this._element.querySelector('#debuffCards');

    this._buffOptions.forEach((buff) => {
      const card = document.createElement('div');
      card.className = 'buff-card buff-card-positive';
      card.dataset.id = buff.id;
      card.innerHTML = `
        <div class="buff-card-icon">${buff.icon}</div>
        <div class="buff-card-info">
          <div class="buff-card-name">${t('buff.' + buff.id + '.name')}</div>
          <div class="buff-card-desc">${t('buff.' + buff.id + '.desc')}</div>
          <div class="buff-card-duration">${t('buff.duration', buff.duration)}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this._selectedBuff = buff;
        buffContainer.querySelectorAll('.buff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._updateConfirm();
      });
      buffContainer.appendChild(card);
    });

    this._debuffOptions.forEach((debuff) => {
      const card = document.createElement('div');
      card.className = 'buff-card buff-card-negative';
      card.dataset.id = debuff.id;
      card.innerHTML = `
        <div class="buff-card-icon">${debuff.icon}</div>
        <div class="buff-card-info">
          <div class="buff-card-name">${t('buff.' + debuff.id + '.name')}</div>
          <div class="buff-card-desc">${t('buff.' + debuff.id + '.desc')}</div>
          <div class="buff-card-duration">${debuff.duration > 0 ? t('buff.duration', debuff.duration) : t('buff.instant')}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this._selectedDebuff = debuff;
        debuffContainer.querySelectorAll('.buff-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this._updateConfirm();
      });
      debuffContainer.appendChild(card);
    });

    this._element.querySelector('#buffConfirm').addEventListener('click', () => {
      this._applySelection(engine);
    });
  }

  _updateConfirm() {
    const btn = this._element.querySelector('#buffConfirm');
    btn.disabled = !(this._selectedBuff && this._selectedDebuff);
  }

  _applySelection(engine) {
    const buff = this._selectedBuff;
    const debuff = this._selectedDebuff;
    if (!buff || !debuff) return;

    const apply = (effect, activeArr, srcArr) => {
      const existing = activeArr.find(a => a.id === effect.id);
      if (existing) {
        existing.remaining = effect.duration;
      } else if (effect.duration > 0) {
        activeArr.push({ id: effect.id, remaining: effect.duration });
      }
      if (effect.livesChange !== undefined) {
        engine.lives = Math.max(0, Math.min(99, engine.lives + effect.livesChange));
      }
      if (effect.goldChange !== undefined) {
        engine.gold = Math.max(0, engine.gold + effect.goldChange);
      }

    };

    apply(buff, this._activeBuffs, BUFFS);
    apply(debuff, this._activeDebuffs, DEBUFFS);

    this.hide();
    if (this._callback) {
      const cb = this._callback;
      this._callback = null;
      cb();
    }
  }

  getEnemyHpMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.enemyHpMult !== undefined) mult *= def.enemyHpMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.enemyHpMult !== undefined) mult *= def.enemyHpMult;
    }
    return mult;
  }

  getEnemySpeedMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.enemySpeedMult !== undefined) mult *= def.enemySpeedMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.enemySpeedMult !== undefined) mult *= def.enemySpeedMult;
    }
    return mult;
  }

  getTowerDamageMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.towerDamageMult !== undefined) mult *= def.towerDamageMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.towerDamageMult !== undefined) mult *= def.towerDamageMult;
    }
    return mult;
  }

  getTowerRangeMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.towerRangeMult !== undefined) mult *= def.towerRangeMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.towerRangeMult !== undefined) mult *= def.towerRangeMult;
    }
    return mult;
  }

  getTowerFireRateMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.towerFireRateMult !== undefined) mult *= def.towerFireRateMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.towerFireRateMult !== undefined) mult *= def.towerFireRateMult;
    }
    return mult;
  }

  getGoldMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.goldMult !== undefined) mult *= def.goldMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.goldMult !== undefined) mult *= def.goldMult;
    }
    return mult;
  }

  getHeroAttackMultiplier() {
    let mult = 1;
    for (const d of this._activeDebuffs) {
      const def = DEBUFFS.find(x => x.id === d.id);
      if (def && def.heroAtkMult !== undefined) mult *= def.heroAtkMult;
    }
    for (const b of this._activeBuffs) {
      const def = BUFFS.find(x => x.id === b.id);
      if (def && def.heroAtkMult !== undefined) mult *= def.heroAtkMult;
    }
    return mult;
  }

  toJSON() {
    return {
      activeBuffs: this._activeBuffs,
      activeDebuffs: this._activeDebuffs,
    };
  }

  fromJSON(data) {
    if (!data) return;
    this._activeBuffs = data.activeBuffs || [];
    this._activeDebuffs = data.activeDebuffs || [];
  }

  clear() {
    this._activeBuffs = [];
    this._activeDebuffs = [];
    this._pending = false;
    this._callback = null;
    if (this._element) {
      this._element.remove();
      this._element = null;
    }
  }
}
