import { TILE_SIZE, TERRAIN } from '../config/constants.js';
import { t } from '../config/locale.js';

export const FLOWER_VARIETIES = [
  { id: 'daisy',    cost: 30,  sellPrice: 45,  petals: 8,  petalR: 3,   color: '#ffffff', center: '#ffdd44', stem: '#3a7a3a' },
  { id: 'rose',     cost: 50,  sellPrice: 75,  petals: 6,  petalR: 4.5, color: '#ff4466', center: '#ffdd44', stem: '#2a6a2a' },
  { id: 'tulip',    cost: 100, sellPrice: 150, petals: 3,  petalR: 5,   color: '#ff88cc', center: '#ffaa44', stem: '#3a7a3a' },
  { id: 'sunflower',cost: 200, sellPrice: 300, petals: 10, petalR: 5,   color: '#ffcc33', center: '#8B4513', stem: '#2a6a2a' },
  { id: 'orchid',   cost: 400, sellPrice: 600, petals: 5,  petalR: 5,   color: '#aa66ff', center: '#ffdd44', stem: '#4a8a4a' },
];

const MATURE_WAVES = 3;

export class FlowerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.map = gameEngine.map;
    this.flowers = new Map();
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
      varietyId: v.id,
      plantedAtWave: this.engine.waveManager.currentWave
    });
    this.engine.particles.emit(
      col * TILE_SIZE + TILE_SIZE / 2,
      row * TILE_SIZE + TILE_SIZE / 2,
      10, { color: v.color, speed: 60, size: 3, life: 400 }
    );
    return true;
  }

  isMature(col, row) {
    const f = this.flowers.get(`${col},${row}`);
    if (!f) return false;
    const currentWave = this.engine.waveManager.currentWave;
    return currentWave >= f.plantedAtWave + MATURE_WAVES;
  }

  getRemainingWaves(col, row) {
    const f = this.flowers.get(`${col},${row}`);
    if (!f) return 0;
    return f.plantedAtWave + MATURE_WAVES - this.engine.waveManager.currentWave;
  }

  sell(col, row) {
    const f = this.flowers.get(`${col},${row}`);
    if (!f || !this.isMature(col, row)) return false;
    const v = FLOWER_VARIETIES.find(vv => vv.id === f.varietyId) || FLOWER_VARIETIES[0];
    this.engine.addGold(v.sellPrice);
    this.flowers.delete(`${col},${row}`);
    this.engine.particles.emit(
      f.x, f.y,
      15, { color: '#ffdd44', speed: 80, size: 4, life: 500 }
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

  getMatureCount() {
    let count = 0;
    for (const f of this.flowers.values()) {
      if (this.engine.waveManager.currentWave >= f.plantedAtWave + MATURE_WAVES) {
        count++;
      }
    }
    return count;
  }

  getVariety(col, row) {
    const f = this.flowers.get(`${col},${row}`);
    if (!f) return null;
    return FLOWER_VARIETIES.find(v => v.id === f.varietyId) || FLOWER_VARIETIES[0];
  }

  update(dt) {
  }

  render(ctx, offsetX = 0, offsetY = 0) {
    const time = Date.now() / 1000;
    for (const flower of this.flowers.values()) {
      const v = FLOWER_VARIETIES.find(vv => vv.id === flower.varietyId) || FLOWER_VARIETIES[0];
      const x = flower.x + offsetX;
      const y = flower.y + offsetY;
      const sway = Math.sin(time * 2 + flower.phase) * 2;
      const mature = this.isMature(flower.col, flower.row);

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

      if (mature) {
        ctx.fillStyle = '#ffdd44';
        ctx.globalAlpha = 0.6 + Math.sin(time * 4) * 0.3;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('💰', x + sway, y - 8);
      }

      ctx.restore();
    }
  }

  toJSON() {
    return {
      selectedVarietyIdx: this.selectedVarietyIdx,
      flowers: Array.from(this.flowers.values()).map(f => ({
        col: f.col, row: f.row, phase: f.phase, varietyId: f.varietyId,
        plantedAtWave: f.plantedAtWave
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
            varietyId: f.varietyId || 'rose',
            plantedAtWave: f.plantedAtWave || 0
          });
        }
      }
    }
  }
}
