import { HERO_TEMPLATES, WEAPONS, MAX_EQUIPPED } from '../config/heroData.js';

export class HeroManager {
  constructor(engine) {
    this.engine = engine;
    this.ownedHeroes = ['scout'];
    this.currentHeroType = 'scout';
    this.heroLevels = { scout: { level: 1, xp: 0 } };
    this.weaponInventory = [];
    this.equippedWeapons = [];
  }

  setHeroType(typeId) {
    const tmpl = HERO_TEMPLATES[typeId];
    if (!tmpl) return false;
    this.currentHeroType = typeId;
    if (!this.heroLevels[typeId]) {
      this.heroLevels[typeId] = { level: 1, xp: 0 };
    }
    return true;
  }

  saveHeroState(hero) {
    if (!hero) return;
    this.heroLevels[this.currentHeroType] = {
      level: hero.level,
      xp: hero.xp
    };
  }

  applyHeroState(hero) {
    if (!hero) return;
    const data = this.heroLevels[this.currentHeroType] || { level: 1, xp: 0 };
    hero.level = data.level;
    hero.xp = data.xp;
    hero.equippedWeapons = [...this.equippedWeapons];
    hero.recalc();
    if (hero.hp > hero.maxHp) hero.hp = hero.maxHp;
  }

  toJSON() {
    return {
      ownedHeroes: this.ownedHeroes,
      currentHeroType: this.currentHeroType,
      heroLevels: this.heroLevels,
      weaponInventory: this.weaponInventory,
      equippedWeapons: this.equippedWeapons
    };
  }

  fromJSON(data) {
    if (!data) return;
    if (data.ownedHeroes) this.ownedHeroes = data.ownedHeroes;
    if (data.currentHeroType) this.currentHeroType = data.currentHeroType;
    if (data.heroLevels) this.heroLevels = data.heroLevels;
    if (data.weaponInventory) this.weaponInventory = data.weaponInventory;
    if (data.equippedWeapons) this.equippedWeapons = data.equippedWeapons;
  }
}
