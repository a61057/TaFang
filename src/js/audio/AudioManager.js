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

  _createReverb() {
    const sr = this.ctx.sampleRate;
    const len = sr * 1.5;
    const buf = this.ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    }
    const reverb = this.ctx.createConvolver();
    reverb.buffer = buf;
    return reverb;
  }

  startBGM() {
    if (!this.ctx || !this.musicEnabled) return;
    if (this._bgm) return;
    this.ensureResumed();

    const vol = this.musicVolume * this.masterVolume * 0.3;

    const reverb = this._createReverb();
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.25;
    reverbGain.connect(reverb);
    reverb.connect(this.ctx.destination);
    const dryBus = this.ctx.createGain();
    dryBus.gain.value = 0.7;
    dryBus.connect(this.ctx.destination);

    // Pads - 2 detuned triangle oscillators per note for warmth
    const chordVoices = [];
    for (const ch of this._bgmChords) {
      const gn = this.ctx.createGain();
      gn.gain.value = vol * 0.35;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      filter.Q.value = 1;
      gn.connect(filter);
      filter.connect(dryBus);
      filter.connect(reverbGain);

      const oscs = ch.tones.map(f => {
        const freq = this._noteToFreq(f);
        const o1 = this.ctx.createOscillator();
        o1.type = 'triangle';
        o1.frequency.value = freq;
        const o2 = this.ctx.createOscillator();
        o2.type = 'triangle';
        o2.frequency.value = freq * 1.003;
        const mix = this.ctx.createGain();
        mix.gain.value = 0.5;
        o1.connect(mix);
        o2.connect(mix);
        mix.connect(gn);
        o1.start();
        o2.start();
        return { o1, o2, mix, freq };
      });
      chordVoices.push({ gn, filter, oscs });
    }

    // Bass
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = vol * 1.5;
    bassGain.connect(dryBus);
    const bass = this.ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = 55;
    bass.connect(bassGain);
    bass.start();
    const bassSub = this.ctx.createOscillator();
    bassSub.type = 'sine';
    bassSub.frequency.value = 27.5;
    const bassSubGain = this.ctx.createGain();
    bassSubGain.gain.value = vol * 0.6;
    bassSub.connect(bassSubGain);
    bassSubGain.connect(dryBus);
    bassSub.start();

    // Bump (soft kick-like pulse)
    const pulseGain = this.ctx.createGain();
    pulseGain.gain.value = 0;
    pulseGain.connect(dryBus);

    // Melody
    const melodyGain = this.ctx.createGain();
    melodyGain.gain.value = 0;
    const melodyFilter = this.ctx.createBiquadFilter();
    melodyFilter.type = 'lowpass';
    melodyFilter.frequency.value = 1200;
    melodyGain.connect(melodyFilter);
    melodyFilter.connect(dryBus);
    melodyFilter.connect(reverbGain);
    const melody = this.ctx.createOscillator();
    melody.type = 'triangle';
    melody.frequency.value = 400;
    melody.connect(melodyGain);
    melody.start();

    this._bgm = {
      chordVoices, bass, bassSub, bassSubGain, bassGain,
      pulseGain, melody, melodyGain, reverb,
      chordIdx: 0, chordTimer: 0, chordDuration: 6,
      melodyNoteIdx: 0, melodyTimer: 0, melodyInterval: 0.28,
      bumpTimer: 0, bumpInterval: 1.5,
      active: true, time: 0
    };
  }

  stopBGM() {
    if (!this._bgm) return;
    this._bgm.active = false;
    for (const cv of this._bgm.chordVoices) {
      for (const o of cv.oscs) { try { o.o1.stop(); o.o2.stop(); } catch (e) {} }
    }
    try { this._bgm.bass.stop(); } catch (e) {}
    try { this._bgm.bassSub.stop(); } catch (e) {}
    try { this._bgm.melody.stop(); } catch (e) {}
    this._bgm = null;
  }

  updateBGM(dt) {
    if (!this._bgm || !this._bgm.active || !this.ctx) return;
    if (!this.musicEnabled) { this.stopBGM(); return; }
    this.ensureResumed();

    const bgm = this._bgm;
    bgm.time += dt;

    // Chord changes
    bgm.chordTimer += dt;
    if (bgm.chordTimer >= bgm.chordDuration) {
      bgm.chordTimer = 0;
      bgm.chordIdx = (bgm.chordIdx + 1) % this._bgmChords.length;
      const chord = this._bgmChords[bgm.chordIdx];
      const rootFreq = this._noteToFreq(chord.root);

      bgm.bass.frequency.setTargetAtTime(rootFreq, this.ctx.currentTime, 0.08);
      bgm.bassSub.frequency.setTargetAtTime(rootFreq / 2, this.ctx.currentTime, 0.1);

      for (let i = 0; i < bgm.chordVoices.length; i++) {
        const cv = bgm.chordVoices[i];
        const target = i < chord.tones.length
          ? this._noteToFreq(chord.tones[i])
          : this._noteToFreq(chord.tones[chord.tones.length - 1] + 12);
        for (const o of cv.oscs) {
          o.o1.frequency.setTargetAtTime(target, this.ctx.currentTime, 0.2);
          o.o2.frequency.setTargetAtTime(target * 1.003, this.ctx.currentTime, 0.2);
        }
      }
    }

    // Pad filter sweep
    const filterSweep = 600 + Math.sin(bgm.time * 0.15) * 300;
    for (const cv of bgm.chordVoices) {
      cv.filter.frequency.setTargetAtTime(filterSweep, this.ctx.currentTime, 0.05);
    }

    // Subtle pulse / bump
    bgm.bumpTimer += dt;
    if (bgm.bumpTimer >= bgm.bumpInterval) {
      bgm.bumpTimer = 0;
      const now = this.ctx.currentTime;
      bgm.pulseGain.gain.setValueAtTime(this.musicVolume * this.masterVolume * 0.12, now);
      bgm.pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    // Melody
    bgm.melodyTimer += dt;
    if (bgm.melodyTimer >= bgm.melodyInterval) {
      bgm.melodyTimer = 0;
      const note = this._bgmMelody[bgm.melodyNoteIdx];
      const freq = this._noteToFreq(note);
      const now = this.ctx.currentTime;

      bgm.melody.frequency.setTargetAtTime(freq, now, 0.05);
      bgm.melodyGain.gain.setTargetAtTime(this.musicVolume * this.masterVolume * 0.12, now, 0.03);

      const release = Math.min(bgm.melodyInterval * 0.7, 0.18);
      setTimeout(() => {
        if (this._bgm) {
          this._bgm.melodyGain.gain.setTargetAtTime(0, this.ctx.currentTime || 0, release);
        }
      }, bgm.melodyInterval * 400);

      bgm.melodyNoteIdx = (bgm.melodyNoteIdx + 1) % this._bgmMelody.length;
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
