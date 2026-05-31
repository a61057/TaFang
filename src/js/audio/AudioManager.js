export class AudioManager {
  constructor() {
    this.ctx = null;
    this.masterVolume = 0.7;
    this.musicVolume = 0.4;
    this.sfxVolume = 0.7;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.initialized = false;
    this.oscillators = {};
    this._bgm = null;
    this._bgmMaster = null;
    this._generateSounds();
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Audio not available:', e);
    }
  }

  ensureResumed() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _generateSounds() {
    this.sounds = {};
  }

  _playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.ctx || !this.sfxEnabled) return;
    this.ensureResumed();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume * this.sfxVolume * this.masterVolume;
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // ── Background Music ──

  _noteToFreq(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  _bgmChords = [
    { root: 36, tones: [36, 43, 47, 52] },
    { root: 33, tones: [33, 40, 45, 48] },
    { root: 38, tones: [38, 45, 50, 53] },
    { root: 31, tones: [31, 38, 43, 47] },
  ];

  _bgmMelody = [
    60, 62, 64, 62, 60, 67, 64, 60,
    62, 64, 65, 67, 65, 64, 62, 60,
    64, 65, 67, 69, 67, 65, 64, 62,
    60, 62, 64, 60, 59, 60, 59, 55,
  ];

  // ── BGM: Pre-recorded Piano Audio ──

  async _loadAudio(url) {
    if (!this.ctx) return null;
    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const arrayBuf = await resp.arrayBuffer();
      const audioBuf = await this.ctx.decodeAudioData(arrayBuf);
      return audioBuf;
    } catch (e) {
      console.warn(`Failed to load ${url}:`, e);
      return null;
    }
  }

  async startBGM() {
    if (!this.ctx || !this.musicEnabled) return;
    if (this._bgm && this._bgm.active) return;
    if (this._bgm && this._bgm.loading) return;
    this.ensureResumed();

    this._bgm = { active: false, loading: true };

    const audioBuf = await this._loadAudio('assets/audio/bgm_piano.mp3');
    if (!audioBuf) { this._bgm = null; return; }

    const source = this.ctx.createBufferSource();
    source.buffer = audioBuf;
    source.loop = true;

    const gain = this.ctx.createGain();
    gain.gain.value = this.musicVolume * this.masterVolume * 0.45;

    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();

    this._bgm = { source, gain, active: true, loading: false };
  }

  stopBGM() {
    if (!this._bgm) return;
    if (this._bgm.loading) { this._bgm = null; return; }
    const { source, gain } = this._bgm;
    this._bgm = null;
    try {
      const now = this.ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.15);
      setTimeout(() => { try { source.stop(); } catch (e) {} }, 200);
    } catch (e) {}
  }

  updateBGM(dt) {
    if (!this._bgm || !this._bgm.active || !this.ctx) return;
    if (!this.musicEnabled) { this.stopBGM(); return; }
    this.ensureResumed();

    const targetVol = this.musicVolume * this.masterVolume * 0.45;
    const currentVol = this._bgm.gain.gain.value;
    if (Math.abs(currentVol - targetVol) > 0.01) {
      this._bgm.gain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.1);
    }
  }

  playShoot(typeId) {
    switch (typeId) {
      case 'cannon': this._playTone(100, 0.3, 'sawtooth', 0.2); break;
      case 'machine': this._playTone(800, 0.05, 'square', 0.1); break;
      case 'mortar': this._playTone(150, 0.4, 'sawtooth', 0.25); break;
      case 'slow': this._playTone(400, 0.2, 'sine', 0.15); break;
      case 'electric': this._playTone(1200, 0.15, 'sawtooth', 0.2); break;
      default: this._playTone(300, 0.1, 'sine', 0.15);
    }
  }

  playEnemyDeath() {
    this._playTone(200, 0.15, 'sine', 0.15);
  }

  playBuild() {
    this._playTone(600, 0.1, 'sine', 0.2);
    setTimeout(() => this._playTone(800, 0.15, 'sine', 0.2), 100);
  }

  playUpgrade() {
    this._playTone(500, 0.1, 'sine', 0.2);
    setTimeout(() => this._playTone(700, 0.1, 'sine', 0.2), 80);
    setTimeout(() => this._playTone(900, 0.15, 'sine', 0.2), 160);
  }

  playWaveStart() {
    this._playTone(300, 0.15, 'square', 0.15);
    setTimeout(() => this._playTone(500, 0.15, 'square', 0.15), 150);
    setTimeout(() => this._playTone(700, 0.2, 'square', 0.15), 300);
  }

  playLoseLife() {
    this._playTone(200, 0.3, 'sawtooth', 0.25);
  }

  playGameOver() {
    this._playTone(300, 0.3, 'sawtooth', 0.2);
    setTimeout(() => this._playTone(200, 0.3, 'sawtooth', 0.2), 300);
    setTimeout(() => this._playTone(100, 0.5, 'sawtooth', 0.2), 600);
  }

  playAchievement() {
    this._playTone(523, 0.12, 'sine', 0.2);
    setTimeout(() => this._playTone(659, 0.12, 'sine', 0.2), 120);
    setTimeout(() => this._playTone(784, 0.12, 'sine', 0.2), 240);
    setTimeout(() => this._playTone(1047, 0.25, 'sine', 0.2), 360);
  }

  playSell() {
    this._playTone(400, 0.1, 'sine', 0.15);
    setTimeout(() => this._playTone(300, 0.1, 'sine', 0.15), 80);
  }

  setMasterVolume(v) { this.masterVolume = Math.max(0, Math.min(1, v)); }
  setMusicVolume(v) { this.musicVolume = Math.max(0, Math.min(1, v)); }
  setSfxVolume(v) { this.sfxVolume = Math.max(0, Math.min(1, v)); }
  toggleMusic() { this.musicEnabled = !this.musicEnabled; return this.musicEnabled; }
  toggleSfx() { this.sfxEnabled = !this.sfxEnabled; return this.sfxEnabled; }
}
