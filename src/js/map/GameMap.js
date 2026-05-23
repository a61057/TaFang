import { COLS, ROWS, TILE_SIZE, TERRAIN, TERRAIN_COLORS, GRID_WIDTH, GRID_HEIGHT } from '../config/constants.js';

const DEFAULT_PATH = [
  { col: 0, row: 5 }, { col: 3, row: 5 }, { col: 3, row: 2 }, { col: 8, row: 2 },
  { col: 8, row: 8 }, { col: 5, row: 8 }, { col: 5, row: 12 }, { col: 10, row: 12 },
  { col: 10, row: 6 }, { col: 14, row: 6 }, { col: 14, row: 14 }, { col: 18, row: 14 },
  { col: 18, row: 4 }, { col: 22, row: 4 }, { col: 22, row: 9 }, { col: 23, row: 9 }
];

export class GameMap {
  constructor() {
    this.cols = COLS;
    this.rows = ROWS;
    this.tileSize = TILE_SIZE;
    this.grid = [];
    this.path = [];
    this.startTile = null;
    this.endTile = null;
    this._initDefault();
  }

  _initDefault() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        this.grid[r][c] = { terrain: TERRAIN.NORMAL, col: c, row: r };
      }
    }

    this.path = DEFAULT_PATH.map(p => ({ ...p }));

    this.startTile = this.path[0];
    this.endTile = this.path[this.path.length - 1];

    this._fillPathTiles();

    this._setBuildable();
  }

  _fillPathTiles() {
    const setTile = (c, r, terrain) => {
      if (c >= 0 && c < this.cols && r >= 0 && r < this.rows) {
        this.grid[r][c].terrain = terrain;
      }
    };

    for (let i = 0; i < this.path.length; i++) {
      const p = this.path[i];
      if (i === 0) {
        setTile(p.col, p.row, TERRAIN.START);
      } else if (i === this.path.length - 1) {
        setTile(p.col, p.row, TERRAIN.END);
      } else {
        setTile(p.col, p.row, TERRAIN.PATH);
      }

      if (i < this.path.length - 1) {
        const next = this.path[i + 1];
        const dc = Math.sign(next.col - p.col);
        const dr = Math.sign(next.row - p.row);

        if (dc !== 0 && dr !== 0) {
          // Diagonal segment - use L-shaped path
          for (let c = p.col; c !== next.col; c += dc) {
            setTile(c, p.row, TERRAIN.PATH);
          }
          for (let r = p.row; r !== next.row; r += dr) {
            setTile(next.col, r, TERRAIN.PATH);
          }
        } else {
          // Straight segment
          let c = p.col, r = p.row;
          while (c !== next.col || r !== next.row) {
            setTile(c, r, TERRAIN.PATH);
            c += dc;
            r += dr;
          }
        }
      }
    }

    setTile(this.startTile.col, this.startTile.row, TERRAIN.START);
    setTile(this.endTile.col, this.endTile.row, TERRAIN.END);
  }

  _setBuildable() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.grid[r][c].terrain;
        if (t === TERRAIN.NORMAL) {
          this.grid[r][c].terrain = Math.random() < 0.35 ? TERRAIN.GRASS : TERRAIN.BUILDABLE;
        }
      }
    }
  }

  isBuildable(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return false;
    const t = this.grid[row][col].terrain;
    return t === TERRAIN.BUILDABLE || t === TERRAIN.GRASS || t === TERRAIN.NORMAL;
  }

  getTerrain(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return TERRAIN.BLOCKED;
    return this.grid[row][col].terrain;
  }

  isPath(col, row) {
    const t = this.getTerrain(col, row);
    return t === TERRAIN.PATH || t === TERRAIN.START || t === TERRAIN.END;
  }

  getPathPixel(index) {
    if (index < 0 || index >= this.path.length) return null;
    return {
      x: this.path[index].col * this.tileSize + this.tileSize / 2,
      y: this.path[index].row * this.tileSize + this.tileSize / 2
    };
  }

  getPathLength() {
    return this.path.length;
  }

  getWorldPos(col, row) {
    return {
      x: col * this.tileSize + this.tileSize / 2,
      y: row * this.tileSize + this.tileSize / 2
    };
  }

  getTileAtPixel(px, py) {
    const col = Math.floor(px / this.tileSize);
    const row = Math.floor(py / this.tileSize);
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return null;
    return { col, row, terrain: this.grid[row][col].terrain };
  }

  setTerrain(col, row, terrain) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) return;
    this.grid[row][col].terrain = terrain;
  }

  render(ctx, offsetX = 0, offsetY = 0, showGrid = false, showRange = false) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const t = this.grid[r][c].terrain;
        const x = c * this.tileSize + offsetX;
        const y = r * this.tileSize + offsetY;
        ctx.fillStyle = TERRAIN_COLORS[t] || '#2d5a27';
        ctx.fillRect(x, y, this.tileSize, this.tileSize);

        if (t === TERRAIN.START) {
          ctx.fillStyle = 'rgba(74, 144, 217, 0.3)';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);
          ctx.fillStyle = '#4a90d9';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('▶', x + this.tileSize / 2, y + this.tileSize / 2);
        } else if (t === TERRAIN.END) {
          ctx.fillStyle = 'rgba(217, 74, 74, 0.3)';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);
          ctx.fillStyle = '#d94a4a';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('■', x + this.tileSize / 2, y + this.tileSize / 2);
        }

        if (showGrid) {
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, this.tileSize, this.tileSize);
        }
      }
    }

    // Draw path direction arrows
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,200,0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      for (let i = 0; i < this.path.length - 1; i++) {
        const p1 = this.getPathPixel(i);
        const p2 = this.getPathPixel(i + 1);
        if (p1 && p2) {
          ctx.beginPath();
          ctx.moveTo(p1.x + offsetX, p1.y + offsetY);
          ctx.lineTo(p2.x + offsetX, p2.y + offsetY);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    }
  }

  toJSON() {
    return {
      cols: this.cols,
      rows: this.rows,
      grid: this.grid.map(row => row.map(t => t.terrain)),
      path: this.path,
      startTile: { ...this.startTile },
      endTile: { ...this.endTile }
    };
  }

  static fromJSON(data) {
    const map = new GameMap();
    map.cols = data.cols || COLS;
    map.rows = data.rows || ROWS;
    map.path = data.path || [];
    map.startTile = data.startTile || map.path[0] || null;
    map.endTile = data.endTile || map.path[map.path.length - 1] || null;
    map.grid = [];
    for (let r = 0; r < map.rows; r++) {
      map.grid[r] = [];
      for (let c = 0; c < map.cols; c++) {
        const terrain = data.grid && data.grid[r] ? data.grid[r][c] : TERRAIN.NORMAL;
        map.grid[r][c] = { terrain, col: c, row: r };
      }
    }
    return map;
  }
}
