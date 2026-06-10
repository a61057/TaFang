import { t } from '../config/locale.js';
import { getMapList, getMapData } from '../config/mapData.js';
import { COLS, ROWS } from '../config/constants.js';

const PREVIEW_W = 160;
const PREVIEW_H = 120;
const TILE_W = PREVIEW_W / COLS;
const TILE_H = PREVIEW_H / ROWS;

const DIFF_COLORS = ['#4ade80', '#fbbf24', '#fb923c', '#f87171'];

const PATH_COLORS = {
  0: '#2d5a27',
  1: '#8b7355',
  2: '#3a7d32',
  3: '#4a90d9',
  4: '#d94a4a',
  5: '#2a5a4a',
  6: '#6b8e23',
  7: '#1a1a1a',
  8: '#5a9e4a'
};

function drawMiniPreview(canvas, mapId) {
  const ctx = canvas.getContext('2d');
  const data = getMapData(mapId);
  const grid = [];

  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = 0;
    }
  }

  for (let i = 0; i < data.path.length; i++) {
    const p = data.path[i];
    if (i === 0) grid[p.row][p.col] = 3;
    else if (i === data.path.length - 1) grid[p.row][p.col] = 4;
    else grid[p.row][p.col] = 1;

    if (i < data.path.length - 1) {
      const next = data.path[i + 1];
      const dc = Math.sign(next.col - p.col);
      const dr = Math.sign(next.row - p.row);
      if (dc !== 0 && dr !== 0) {
        for (let c = p.col; c !== next.col; c += dc) {
          if (grid[p.row][c] === 0) grid[p.row][c] = 1;
        }
        for (let r = p.row; r !== next.row; r += dr) {
          if (grid[next.col][r] === 0) grid[next.col][r] = 1;
        }
      } else {
        let c = p.col, r = p.row;
        while (c !== next.col || r !== next.row) {
          if (grid[r][c] === 0) grid[r][c] = 1;
          c += dc;
          r += dr;
        }
      }
    }
  }

  if (data.terrainOverrides) {
    for (const ov of data.terrainOverrides) {
      for (let r = ov.row; r < ov.row + ov.h; r++) {
        for (let c = ov.col; c < ov.col + ov.w; c++) {
          if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            if (grid[r][c] === 0) grid[r][c] = ov.terrain;
          }
        }
      }
    }
  }

  ctx.clearRect(0, 0, PREVIEW_W, PREVIEW_H);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const val = grid[r][c];
      const color = PATH_COLORS[val] || '#2d5a27';
      ctx.fillStyle = val === 0 ? '#3a6b32' : color;
      ctx.fillRect(c * TILE_W, r * TILE_H, Math.ceil(TILE_W + 0.5), Math.ceil(TILE_H + 0.5));
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 0.5;
  for (let r = 0; r < ROWS; r++) {
    ctx.beginPath();
    ctx.moveTo(0, r * TILE_H);
    ctx.lineTo(PREVIEW_W, r * TILE_H);
    ctx.stroke();
  }
  for (let c = 0; c < COLS; c++) {
    ctx.beginPath();
    ctx.moveTo(c * TILE_W, 0);
    ctx.lineTo(c * TILE_W, PREVIEW_H);
    ctx.stroke();
  }

  const pathPixels = data.path.map(p => ({
    x: p.col * TILE_W + TILE_W / 2,
    y: p.row * TILE_H + TILE_H / 2
  }));

  ctx.strokeStyle = 'rgba(255,255,200,0.14)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 2]);
  for (let i = 0; i < pathPixels.length - 1; i++) {
    ctx.beginPath();
    ctx.moveTo(pathPixels[i].x, pathPixels[i].y);
    ctx.lineTo(pathPixels[i + 1].x, pathPixels[i + 1].y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  if (pathPixels.length > 0) {
    ctx.fillStyle = '#4a90d9';
    ctx.beginPath();
    ctx.arc(pathPixels[0].x, pathPixels[0].y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d94a4a';
    ctx.beginPath();
    ctx.arc(pathPixels[pathPixels.length - 1].x, pathPixels[pathPixels.length - 1].y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class MapSelectPanel {
  constructor(onSelect, onBack) {
    this.onSelect = onSelect;
    this.onBack = onBack;
    this.element = null;
    this._maps = getMapList();
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'mapSelectPanel';
    this.element.className = 'overlay-screen map-select-panel';

    let html = `
      <div class="map-select-content">
        <div class="map-select-title" id="mapSelectTitle">${t('map.select')}</div>
        <div class="map-select-grid">
    `;

    for (const map of this._maps) {
      const diffColor = DIFF_COLORS[map.diff - 1] || '#4ade80';
      let diffStars = '';
      for (let i = 0; i < map.diff; i++) diffStars += '★';
      for (let i = map.diff; i < 3; i++) diffStars += '☆';

      html += `
        <div class="map-card" data-map="${map.id}">
          <canvas class="map-preview" data-map="${map.id}" width="${PREVIEW_W}" height="${PREVIEW_H}"></canvas>
          <div class="map-card-info">
            <div class="map-card-name">${t(map.nameKey)}</div>
            <div class="map-card-diff" style="color:${diffColor}">${diffStars}</div>
            <div class="map-card-desc">${t(map.descKey)}</div>
          </div>
          <button class="map-card-btn">${t('map.selectMap')}</button>
        </div>
      `;
    }

    html += `
        </div>
        <button class="map-back-btn">${t('map.back')}</button>
      </div>
    `;

    this.element.innerHTML = html;
    document.body.appendChild(this.element);

    this.element.querySelectorAll('.map-card').forEach(card => {
      card.addEventListener('click', () => {
        const mapId = card.dataset.map;
        this.hide();
        if (this.onSelect) this.onSelect(mapId);
      });
    });

    this.element.querySelector('.map-back-btn').addEventListener('click', () => {
      this.hide();
      if (this.onBack) this.onBack();
    });

    this.element.querySelectorAll('.map-preview').forEach(canvas => {
      drawMiniPreview(canvas, canvas.dataset.map);
    });
  }

  show(title) {
    const titleEl = this.element.querySelector('#mapSelectTitle');
    if (title) titleEl.textContent = title;
    else titleEl.textContent = t('map.select');
    this.element.style.display = 'flex';
  }

  hide() {
    this.element.style.display = 'none';
  }
}
