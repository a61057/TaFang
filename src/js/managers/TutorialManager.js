import { t } from '../config/locale.js';

const STEPS = [
  { id: 'welcome', autoNext: true },
  { id: 'moveHero', autoNext: false },
  { id: 'openBuildMenu', autoNext: false },
  { id: 'buildTower', autoNext: false },
  { id: 'startWave1', autoNext: false },
  { id: 'watchBattle', autoNext: false },
  { id: 'upgradeTower', autoNext: false },
  { id: 'buildMore', autoNext: false },
  { id: 'startWave2', autoNext: false },
  { id: 'tutorialEnd', autoNext: true },
];

export class TutorialManager {
  constructor(engine) {
    this.engine = engine;
    this._stepIndex = -1;
    this._active = false;
    this._wasdUsed = false;
    this._buildMenuOpened = false;
    this._towerBuilt = false;
    this._towerUpgraded = false;
    this._wave1Started = false;
    this._wave1Cleared = false;
    this._wave2Started = false;
    this._towerCountAtBuildMore = 0;
    this._nextBtn = null;
    this._overlay = null;
    this._hintEl = null;
    this._textEl = null;
    this._progressEl = null;
    this._arrowEl = null;
    this._onKeyDown = null;
    this._onTowerBuilt = null;
    this._onWaveStart = null;
    this._onWaveComplete = null;
    this._onBuildMenuShow = null;
    this._onUpgradeDone = null;
  }

  start() {
    this._active = true;
    this._createUI();
    this._setupListeners();
    this._showStep(0);
  }

  _createUI() {
    this._overlay = document.createElement('div');
    this._overlay.id = 'tutorialOverlay';
    this._overlay.innerHTML = `
      <div class="tutorial-hint" id="tutorialHint">
        <div class="tutorial-progress" id="tutorialProgress"></div>
        <div class="tutorial-text" id="tutorialText"></div>
        <div class="tutorial-actions">
          <button class="tutorial-btn" id="tutorialNextBtn">${t('tutorial.next')}</button>
        </div>
      </div>
    `;
    document.body.appendChild(this._overlay);

    this._hintEl = this._overlay.querySelector('#tutorialHint');
    this._textEl = this._overlay.querySelector('#tutorialText');
    this._progressEl = this._overlay.querySelector('#tutorialProgress');
    this._nextBtn = this._overlay.querySelector('#tutorialNextBtn');

    this._arrowEl = document.createElement('div');
    this._arrowEl.id = 'tutorialArrow';
    this._arrowEl.style.display = 'none';
    document.body.appendChild(this._arrowEl);

    this._nextBtn.addEventListener('click', () => this._onNextClick());
  }

  _setupListeners() {
    this._onKeyDown = (e) => {
      if (!this._active) return;
      const step = STEPS[this._stepIndex];
      if (!step || step.id !== 'moveHero') return;
      if (['w', 'W', 'a', 'A', 's', 'S', 'd', 'D'].includes(e.key)) {
        this._wasdUsed = true;
        this._advanceIfReady();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onTowerBuilt = (tower) => {
      if (!this._active) return;
      const step = STEPS[this._stepIndex];
      if (step && (step.id === 'buildTower' || step.id === 'buildMore')) {
        this._towerBuilt = true;
        this._advanceIfReady();
      }
    };
    this.engine.on('tower-built', this._onTowerBuilt);

    this._onBuildMenuShow = () => {
      if (!this._active) return;
      const step = STEPS[this._stepIndex];
      if (step && step.id === 'openBuildMenu') {
        this._buildMenuOpened = true;
        this._advanceIfReady();
      }
    };
    this.engine.on('build-menu-show', this._onBuildMenuShow);

    this.engine.on('tower-info-show', this._onTowerInfoShow);

    this._onUpgradeDone = (tower) => {
      if (!this._active) return;
      const step = STEPS[this._stepIndex];
      if (step && step.id === 'upgradeTower') {
        this._towerUpgraded = true;
        this._advanceIfReady();
      }
    };
    this.engine.on('tower-upgraded', this._onUpgradeDone);

    this._onWaveStart = (wave) => {
      if (!this._active) return;
      if (wave === 1) {
        this._wave1Started = true;
        this._advanceIfReady();
      }
      if (wave === 2) {
        this._wave2Started = true;
        this._advanceIfReady();
      }
    };
    this.engine.on('wave-started', this._onWaveStart);

    this._onWaveComplete = (data) => {
      if (!this._active) return;
      const step = STEPS[this._stepIndex];
      if (step && step.id === 'watchBattle') {
        this._wave1Cleared = true;
        this._advanceIfReady();
      }
    };
    this.engine.on('wave-complete', this._onWaveComplete);
  }

  _removeListeners() {
    if (this._onKeyDown) document.removeEventListener('keydown', this._onKeyDown);
    if (this._onTowerBuilt) this.engine.off('tower-built', this._onTowerBuilt);
    if (this._onBuildMenuShow) this.engine.off('build-menu-show', this._onBuildMenuShow);
    if (this._onUpgradeDone) this.engine.off('tower-upgraded', this._onUpgradeDone);
    if (this._onWaveStart) this.engine.off('wave-started', this._onWaveStart);
    if (this._onWaveComplete) this.engine.off('wave-complete', this._onWaveComplete);
  }

  _showStep(index) {
    if (index >= STEPS.length) {
      this.end();
      return;
    }
    this._stepIndex = index;
    const step = STEPS[index];
    if (!step) return;

    this._textEl.textContent = t('tutorial.step.' + step.id);
    this._progressEl.textContent = t('tutorial.progress', index + 1, STEPS.length);

    if (step.autoNext) {
      this._nextBtn.style.display = 'block';
      this._nextBtn.textContent = t('tutorial.next');
    } else {
      this._nextBtn.style.display = 'none';
    }

    this._hideArrow();

    if (step.id === 'welcome') {
      this._highlightElement(null);
    } else if (step.id === 'moveHero') {
      this._highlightElement(null);
      this._showArrow(220, 60, 'W');
    } else if (step.id === 'openBuildMenu') {
      this._highlightElement(null);
    } else if (step.id === 'buildTower') {
      this._highlightElement('#buildMenu');
    } else if (step.id === 'startWave1') {
      this._highlightElement('#btnStartWave');
    } else if (step.id === 'watchBattle') {
      this._highlightElement(null);
    } else if (step.id === 'upgradeTower') {
      this._highlightElement(null);
    } else if (step.id === 'buildMore') {
      this._highlightElement('#buildMenu');
      this._towerCountAtBuildMore = this.engine.towerManager.getTowers().length;
      this._towerBuilt = false;
    } else if (step.id === 'startWave2') {
      this._highlightElement('#btnStartWave');
    } else if (step.id === 'tutorialEnd') {
      this._highlightElement(null);
      this._nextBtn.textContent = t('tutorial.next');
    }

    this._updateOverlayPosition();
  }

  _advanceIfReady() {
    const step = STEPS[this._stepIndex];
    if (!step || step.autoNext) return;

    let ready = false;
    switch (step.id) {
      case 'moveHero':
        ready = this._wasdUsed;
        break;
      case 'openBuildMenu':
        ready = this._buildMenuOpened;
        break;
      case 'buildTower':
        ready = this._towerBuilt && this.engine.towerManager.getTowers().length >= 1;
        break;
      case 'startWave1':
        ready = this._wave1Started;
        break;
      case 'watchBattle':
        ready = this._wave1Cleared;
        break;
      case 'upgradeTower':
        ready = this._towerUpgraded;
        break;
      case 'buildMore':
        ready = this.engine.towerManager.getTowers().length >= this._towerCountAtBuildMore + 2;
        break;
      case 'startWave2':
        ready = this._wave2Started;
        break;
    }

    if (ready) {
      this._showStep(this._stepIndex + 1);
    }
  }

  _onNextClick() {
    const step = STEPS[this._stepIndex];
    if (!step) return;
    if (step.id === 'tutorialEnd') {
      this.end();
      this.engine._onTutorialEnd();
      return;
    }
    this._showStep(this._stepIndex + 1);
  }

  _highlightElement(selector) {
    const existing = document.querySelector('.tutorial-highlight');
    if (existing) existing.classList.remove('tutorial-highlight');
    if (selector) {
      const el = document.querySelector(selector);
      if (el) el.classList.add('tutorial-highlight');
    }
  }

  _showArrow(x, y, label) {
    this._arrowEl.style.display = 'block';
    this._arrowEl.style.left = x + 'px';
    this._arrowEl.style.top = y + 'px';
    this._arrowEl.textContent = label || '';
  }

  _hideArrow() {
    this._arrowEl.style.display = 'none';
  }

  _updateOverlayPosition() {
    if (this._hintEl) {
      this._hintEl.style.bottom = '16px';
    }
  }

  update() {
    if (!this._active) return;
    this._advanceIfReady();
  }

  isActive() {
    return this._active;
  }

  end() {
    this._active = false;
    this._removeListeners();
    if (this._overlay && this._overlay.parentNode) {
      this._overlay.parentNode.removeChild(this._overlay);
    }
    if (this._arrowEl && this._arrowEl.parentNode) {
      this._arrowEl.parentNode.removeChild(this._arrowEl);
    }
    this._highlightElement(null);
    this.engine.paused = false;
  }
}
