import { WEATHER_TYPES, WEATHER_CHANGE_INTERVAL, DAY_NIGHT_INTERVAL, DAY_NIGHT_CYCLE, TILE_SIZE } from '../config/constants.js';

export class WeatherSystem {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentWeather = { ...WEATHER_TYPES.CLEAR };
    this.dayNight = DAY_NIGHT_CYCLE.DAY;
    this.weatherWaveCounter = 0;
    this.dayNightWaveCounter = 0;
    this.stormTimer = 0;
    this.stormStrikes = [];
  }

  onWaveEnd(wave) {
    this.weatherWaveCounter++;
    this.dayNightWaveCounter++;

    if (this.dayNightWaveCounter >= DAY_NIGHT_INTERVAL) {
      this.dayNightWaveCounter = 0;
      this.dayNight = this.dayNight === DAY_NIGHT_CYCLE.DAY ? DAY_NIGHT_CYCLE.NIGHT : DAY_NIGHT_CYCLE.DAY;
      if (this.gameEngine) {
        this.gameEngine.emit('daynight-change', this.dayNight);
      }
    }

    if (this.weatherWaveCounter >= WEATHER_CHANGE_INTERVAL) {
      this.weatherWaveCounter = 0;
      this._changeWeather();
    }
  }

  _changeWeather() {
    const types = Object.values(WEATHER_TYPES);
    const filtered = types.filter(t => t.id !== this.currentWeather.id);
    const pool = filtered.length > 0 ? filtered : types;
    const idx = Math.floor(Math.random() * pool.length);
    this.currentWeather = { ...pool[idx] };
    this.stormStrikes = [];
    if (this.gameEngine) {
      this.gameEngine.emit('weather-change', this.currentWeather);
    }
  }

  update(dt, towers, enemies) {
    if (this.currentWeather.id === 'storm' && towers) {
      this.stormTimer -= dt;
      if (this.stormTimer <= 0) {
        this.stormTimer = 2 + Math.random() * 3;
        const target = towers[Math.floor(Math.random() * towers.length)];
        if (target) {
          target.stunned = true;
          this.stormStrikes.push({ x: target.x, y: target.y, timer: 0.5 });
          setTimeout(() => { if (target) target.stunned = false; }, 3000);
          if (enemies) {
            const strikeX = target.x;
            const strikeY = target.y;
            for (const e of enemies) {
              if (!e.alive) continue;
              const dx = e.x - strikeX;
              const dy = e.y - strikeY;
              if (Math.sqrt(dx * dx + dy * dy) < TILE_SIZE * 2) {
                e.takeDamage(60, false);
              }
            }
          }
        }
      }
    }
  }

  getEnemySpeedMultiplier() {
    let mult = 1;
    if (this.currentWeather.id === 'rainy') mult *= 0.9;
    if (this.currentWeather.id === 'blizzard') mult *= 0.8;
    if (this.dayNight === DAY_NIGHT_CYCLE.NIGHT) mult *= 1.15;
    return mult;
  }

  getTowerRangeMultiplier() {
    let mult = 1;
    if (this.currentWeather.id === 'rainy') mult *= 0.9;
    if (this.dayNight === DAY_NIGHT_CYCLE.NIGHT) mult *= 0.9;
    return mult;
  }

  getTowerFireRateMultiplier() {
    let mult = 1;
    if (this.currentWeather.id === 'blizzard') mult *= 0.8;
    return mult;
  }

  getHeroAttackMultiplier() {
    let mult = 1;
    if (this.dayNight === DAY_NIGHT_CYCLE.NIGHT) mult *= 1.2;
    return mult;
  }

  renderOverlay(ctx) {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    if (this.dayNight === DAY_NIGHT_CYCLE.NIGHT) {
      ctx.fillStyle = 'rgba(0,0,40,0.2)';
      ctx.fillRect(0, 0, w, h);
    }

    if (this.currentWeather.id === 'rainy') {
      ctx.strokeStyle = 'rgba(180,200,255,0.15)';
      ctx.lineWidth = 1;
      const t = Date.now() / 600;
      for (let i = 0; i < 60; i++) {
        const rx = (i * 47 + t * 70) % w;
        const ry = (i * 31 + t * 200) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 3, ry + 12);
        ctx.stroke();
      }
    }

    if (this.currentWeather.id === 'fog') {
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.7);
      grad.addColorStop(0, 'rgba(200,200,200,0)');
      grad.addColorStop(0.6, 'rgba(200,200,200,0)');
      grad.addColorStop(1, 'rgba(180,180,180,0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    }

    if (this.currentWeather.id === 'storm' || this.currentWeather.id === 'blizzard') {
      ctx.fillStyle = 'rgba(30,30,60,0.12)';
      ctx.fillRect(0, 0, w, h);
    }

    for (let i = this.stormStrikes.length - 1; i >= 0; i--) {
      const s = this.stormStrikes[i];
      s.timer -= 0.016;
      if (s.timer <= 0) {
        this.stormStrikes.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255,255,200,${s.timer * 2})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - 30);
      ctx.lineTo(s.x + Math.random() * 20 - 10, s.y + 30 + Math.random() * 20);
      ctx.stroke();
      ctx.fillStyle = `rgba(255,255,200,${s.timer})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 20 * s.timer, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  getCurrentWeather() {
    return this.currentWeather;
  }

  isNight() {
    return this.dayNight === DAY_NIGHT_CYCLE.NIGHT;
  }

  clear() {
    this.currentWeather = { ...WEATHER_TYPES.CLEAR };
    this.dayNight = DAY_NIGHT_CYCLE.DAY;
    this.stormStrikes = [];
  }
}
