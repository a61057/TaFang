import { t, getLanguage } from '../config/locale.js';
import { SPEAKER_NAMES } from '../config/storyData.js';

export class DialogueBox {
  constructor() {
    this._dialogues = [];
    this._currentIndex = 0;
    this._visible = false;
    this._onComplete = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'dialogueBox';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="dialogue-backdrop"></div>
      <div class="dialogue-content">
        <div class="dialogue-speaker-area">
          <div class="dialogue-speaker-icon"></div>
          <div class="dialogue-speaker-name"></div>
        </div>
        <div class="dialogue-text"></div>
        <div class="dialogue-continue">▼</div>
      </div>
    `;
    document.body.appendChild(this.element);

    this._speakerIcon = this.element.querySelector('.dialogue-speaker-icon');
    this._speakerName = this.element.querySelector('.dialogue-speaker-name');
    this._textEl = this.element.querySelector('.dialogue-text');
    this._continueEl = this.element.querySelector('.dialogue-continue');

    this.element.querySelector('.dialogue-content').addEventListener('click', () => this._next());
  }

  show(dialogues, onComplete) {
    if (!dialogues || dialogues.length === 0) return;
    this._dialogues = dialogues;
    this._currentIndex = 0;
    this._onComplete = onComplete || null;
    this._visible = true;
    this.element.style.display = 'flex';
    this._renderDialogue(0);
  }

  hide() {
    this._visible = false;
    this.element.style.display = 'none';
    this._dialogues = [];
    this._currentIndex = 0;
    this._onComplete = null;
  }

  isVisible() {
    return this._visible;
  }

  _next() {
    if (this._currentIndex < this._dialogues.length - 1) {
      this._currentIndex++;
      this._renderDialogue(this._currentIndex);
    } else {
      this.hide();
      if (this._onComplete) {
        this._onComplete();
      }
    }
  }

  _renderDialogue(index) {
    const d = this._dialogues[index];
    if (!d) return;

    const lang = getLanguage();
    const nameMap = SPEAKER_NAMES[d.speaker] || {};
    const speakerName = nameMap[lang] || nameMap.en || d.speaker;

    this._speakerName.textContent = speakerName;

    if (d.side === 'ally') {
      this._speakerIcon.style.background = '#4a90d9';
      this._speakerIcon.textContent = '🛡';
    } else {
      this._speakerIcon.style.background = '#e74c3c';
      this._speakerIcon.textContent = '⚔';
    }

    this._textEl.textContent = t(d.textKey);

    const isLast = index >= this._dialogues.length - 1;
    this._continueEl.style.opacity = isLast ? '0.6' : '1';
    this._continueEl.textContent = isLast ? '✕' : '▼';

    this.element.querySelector('.dialogue-content').style.animation = 'none';
    requestAnimationFrame(() => {
      this.element.querySelector('.dialogue-content').style.animation = 'dialogueSlideIn 0.3s ease';
    });
  }

  toJSON() {
    return {
      dialogues: this._dialogues,
      currentIndex: this._currentIndex,
      visible: this._visible,
    };
  }

  fromJSON(data) {
    this._dialogues = data.dialogues || [];
    this._currentIndex = data.currentIndex || 0;
    this._visible = data.visible || false;
    if (this._visible && this._dialogues.length > 0) {
      this.element.style.display = 'flex';
      this._renderDialogue(this._currentIndex);
    }
  }
}
