import { EVENT_CHANCE, STARTING_GOLD } from '../config/constants.js';
import { t } from '../config/locale.js';

const EVENTS = [
  { id: 'merchant', type: 'positive', duration: 0 },
  { id: 'enemy_boost', type: 'negative', duration: 1 },
  { id: 'mystery_chest', type: 'neutral', duration: 0 },
  { id: 'gold_rush', type: 'positive', duration: 0 },
  { id: 'fog_ahead', type: 'negative', duration: 2 },
  { id: 'repair', type: 'positive', duration: 0 },
  { id: 'curse', type: 'negative', duration: 3 },
  { id: 'blessing', type: 'positive', duration: 2 },
  { id: 'swarm', type: 'negative', duration: 1 },
  { id: 'trade', type: 'neutral', duration: 0 },
  { id: 'earthquake', type: 'negative', duration: 1 },
  { id: 'inspire', type: 'positive', duration: 2 },
  { id: 'tax', type: 'negative', duration: 1 },
  { id: 'treasure', type: 'positive', duration: 0 },
  { id: 'plague', type: 'negative', duration: 2 },
  { id: 'moonlight', type: 'positive', duration: 2 },
  { id: 'sandstorm', type: 'negative', duration: 1 },
  { id: 'carnival', type: 'neutral', duration: 1 },
  { id: 'hero_boost', type: 'positive', duration: 2 },
  { id: 'time_warp', type: 'neutral', duration: 1 },
];

export class EventSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.activeEvent = null;
    this.activeDuration = 0;
    this.waveCounter = 0;
    this._rolledThisWave = false;
  }

  onWaveStart(wave) {
    if (this._rolledThisWave) return;

    this.waveCounter++;
    this._rolledThisWave = true;

    this.activeDuration = Math.max(0, this.activeDuration - 1);
    if (this.activeDuration <= 0) this.activeEvent = null;

    if (this.activeEvent) return;
    if (Math.random() > EVENT_CHANCE) return;

    const idx = Math.floor(Math.random() * EVENTS.length);
    const evt = EVENTS[idx];
    this.activeEvent = evt;
    this.activeDuration = evt.duration;
    this._applyEffect(true);
    if (this.gameEngine) {
      this.gameEngine.emit('random-event', evt);
    }
    return evt;
  }

  _applyEffect(activate) {
    const ge = this.gameEngine;
    if (!ge) return;
    const evt = this.activeEvent;
    if (!evt) return;

    if (!activate) return;

    switch (evt.id) {
      case 'merchant':
        ge.addGold(80);
        break;
      case 'enemy_boost':
        break;
      case 'mystery_chest':
        if (Math.random() < 0.5) {
          ge.addGold(100);
        } else {
          ge.lives = Math.min(ge.lives + 3, 99);
        }
        break;
      case 'gold_rush':
        ge.addGold(150);
        break;
      case 'fog_ahead':
        break;
      case 'repair':
        ge.lives = Math.min(ge.lives + 5, 99);
        break;
      case 'curse':
        break;
      case 'blessing':
        break;
      case 'swarm':
        break;
      case 'trade':
        if (ge.gold >= 50) {
          ge.gold -= 50;
          ge.lives = Math.min(ge.lives + 3, 99);
        }
        break;
      case 'earthquake':
        break;
      case 'inspire':
        break;
      case 'tax':
        ge.gold = Math.max(0, ge.gold - 40);
        break;
      case 'treasure':
        ge.addGold(200);
        break;
      case 'plague':
        ge.lives = Math.max(0, ge.lives - 2);
        break;
      case 'moonlight':
        break;
      case 'sandstorm':
        break;
      case 'carnival':
        ge.addGold(50);
        break;
      case 'hero_boost':
        break;
      case 'time_warp':
        break;
    }
  }

  onWaveEnd() {
    this._rolledThisWave = false;
  }

  getEnemyHpMultiplier() {
    if (this.activeEvent && this.activeEvent.id === 'enemy_boost') return 1.3;
    return 1;
  }

  getEnemySpeedMultiplier() {
    if (this.activeEvent && this.activeEvent.id === 'swarm') return 1.2;
    if (this.activeEvent && this.activeEvent.id === 'earthquake') return 0.85;
    return 1;
  }

  getTowerDamageMultiplier() {
    if (this.activeEvent && this.activeEvent.id === 'blessing') return 1.25;
    if (this.activeEvent && this.activeEvent.id === 'inspire') return 1.15;
    if (this.activeEvent && this.activeEvent.id === 'curse') return 0.8;
    return 1;
  }

  getGoldMultiplier() {
    if (this.activeEvent && this.activeEvent.id === 'carnival') return 2;
    return 1;
  }

  isActive(eventId) {
    return this.activeEvent && this.activeEvent.id === eventId && this.activeDuration > 0;
  }

  clear() {
    this.activeEvent = null;
    this.activeDuration = 0;
    this._rolledThisWave = false;
  }
}
