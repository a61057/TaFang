import { TILE_SIZE, TERRAIN } from '../config/constants.js';
import { t } from '../config/locale.js';

export const FLOWER_VARIETIES = [
  { id: 'daisy',    cost: 30,  income: 1,  interval: 2000, petals: 8,  petalR: 3,   color: '#ffffff', center: '#ffdd44', stem: '#3a7a3a' },
  { id: 'rose',     cost: 50,  income: 2,  interval: 2000, petals: 6,  petalR: 4.5, color: '#ff4466', center: '#ffdd44', stem: '#2a6a2a' },
  { id: 'tulip',    cost: 100, income: 5,  interval: 2000, petals: 3,  petalR: 5,   color: '#ff88cc', center: '#ffaa44', stem: '#3a7a3a' },
  { id: 'sunflower',cost: 200, income: 12, interval: 2000, petals: 10, petalR: 5,   color: '#ffcc33', center: '#8B4513', stem: '#2a6a2a' },
  { id: 'orchid',   cost: 400, income: 30, interval: 2000, petals: 5,  petalR: 5,   color: '#aa66ff', center: '#ffdd44', stem: '#4a8a4a' },
];

export class FlowerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.map = gameEngine.map;
    this.flowers = new Map();
    this._incomeAccum = 0;
    this._goldPopups = [];
    this.selectedVarietyIdx = 0;
  }

  get selectedVariety() {
    return FLOWER_VARIETIES[this.selectedVarietyIdx];
  }

  cycleVariety() {
    this.selectedVarietyIdx = (this.selectedVarietyIdx + 1) % FLOWER_VARIETIES.length;
  }

  canPlant(col, row) {
    const terrain = this.map.getTerrain(col, row);
    if (terrain !== TERRAIN.GRASS) return false;
    if (this.flowers.has(`${col},${row}`)) return false;
    if (this.engine.towerManager.getTowerAt(col, row)) return false;
    return true;
  }

  plant(col, row, varietyId) {
    if (!this.canPlant(col, row)) return false;
    const v = FLOWER_VARIETIES.find(vv => vv.id === varietyId) || this.selectedVariety;
    if (this.engine.gold < v.cost) return false;
    this.engine.gold -= v.cost;
    this.flowers.set(`${col},${row}`, {
      col, row,
      x: col * TILE_SIZE + TILE_SIZE / 2,
      y: row * TILE_SIZE + TILE_SIZE / 2,
      phase: Math.random() * Math.PI * 2,
      varietyId: v.id
    });
    this.engine.particles.emit(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      10, { color: v.color, speed: 60, size: 3, life: 400 }
    );
    return true;
  }

  remove(col, row) {
    this.flowers.delete(`${col},${row}`);
  }

  getFlowerAt(col, row) {
    return this.flowers.get(`${col},${row}`) || null;
  }

  getCount() {
    return this.flowers.size;
  }

  getVariety(col, row) {
    const f = this.flowers.get(`${col},${row}`);
    if (!f) return null;
    return FLOWER_VARIETIES.find(v => v.id === f.varietyId) || FLOWER_VARIETIES[0];
  }

  update(dt) {
    if (this.flowers.size === 0) return;
    this._incomeAccum += dt * 1000;
    if (this._incomeAccum >= 2000) {
      this._incomeAccum -= 2000;
      for (const flower of this.flowers.values()) {
        const v = FLOWER_VARIETIES.find(vv => vv.id === flower.varietyId) || FLOWER_VARIETIES[0];
        const income = v.income;
        this.engine.addGold(income);
        this._goldPopups.push({
          x: flower.x,
          y: flower.y - 10,
          text: `+${income}`,
          life: 1000,
          vy: -40,
          color: v.color
        });
      }
    }
    for (let i = this._goldPopups.length - 1; i >= 0; i--) {
      const p = this._goldPopups[i];
      p.life -= dt * 1000;
      p.y += p.vy * dt;
      if (p.life <= 0) {
        this._goldPopups.splice(i, 1);
      }
    }
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    const time = Date.now() / 1000;
    for (const flower of this.flowers.values()) {
      const v = FLOWER_VARIETIES.find(vv => vv.id === flower.varietyId) || FLOWER_VARIETIES[0];
      const x = flower.x + offsetX;
      const y = flower.y + offsetY;
      const sway = Math.sin(time * 2 + flower.phase) * 2;

      ctx.save();

      if (v.id === 'tulip') {
        ctx.strokeStyle = v.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + sway * 0.3, y + 2);
        ctx.lineTo(x + sway * 0.1, y + 12);
        ctx.stroke();
        ctx.fillStyle = v.color;
        ctx.globalAlpha = 0.85;
        ctx.beginPath();
        ctx.ellipse(x + sway, y - 2, 5, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + sway - 3, y + 1, 4, 6, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + sway + 3, y + 1, 4, 6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = v.center;
        ctx.beginPath();
        ctx.ellipse(x + sway, y + 1, 2.5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.strokeStyle = v.stem;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + sway, y + 4);
        ctx.lineTo(x + sway * 0.5, y + 12);
        ctx.stroke();

        const count = v.petals || 5;
        const r = v.petalR || 4;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const px = x + sway + Math.cos(angle) * r;
          const py = y + Math.sin(angle) * r;
          ctx.fillStyle = v.color;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = v.center;
        ctx.beginPath();
        ctx.arc(x + sway, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    ctx.save();
    for (const p of this._goldPopups) {
      ctx.globalAlpha = p.life / 1000;
      ctx.fillStyle = p.color || '#ffdd44';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x + offsetX, p.y + offsetY);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  toJSON() {
    return {
      selectedVarietyIdx: this.selectedVarietyIdx,
      flowers: Array.from(this.flowers.values()).map(f => ({
        col: f.col, row: f.row, phase: f.phase, varietyId: f.varietyId
      }))
    };
  }

  fromJSON(data) {
    this.flowers.clear();
    if (data) {
      this.selectedVarietyIdx = data.selectedVarietyIdx || 0;
      if (data.flowers) {
        for (const f of data.flowers) {
          this.flowers.set(`${f.col},${f.row}`, {
            col: f.col, row: f.row,
            x: f.col * TILE_SIZE + TILE_SIZE / 2,
            y: f.row * TILE_SIZE + TILE_SIZE / 2,
            phase: f.phase || Math.random() * Math.PI * 2,
            varietyId: f.varietyId || 'rose'
          });
        }
      }
    }
  }
}
