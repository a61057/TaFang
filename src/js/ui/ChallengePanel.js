import { getChallenges, isChallengeCompleted } from '../config/challengeData.js';
import { t } from '../config/locale.js';
import { iconElem } from './IconProvider.js';

export class ChallengePanel {
  constructor(onStart) {
    this.element = document.createElement('div');
    this.element.id = 'challengePanel';
    this.element.className = 'popup-panel challenge-panel';
    this.visible = false;
    this.onStart = onStart;
    this._render();
    document.body.appendChild(this.element);
  }

  show() {
    this.visible = true;
    this._render();
    this.element.style.display = 'flex';
  }

  hide() {
    this.visible = false;
    this.element.style.display = 'none';
  }

  toggle() {
    this.visible ? this.hide() : this.show();
  }

  _render() {
    const challenges = getChallenges();

    let html = `
      <div class="panel-header">
        <span>${t('challenge.title')}</span>
        <button class="panel-close" data-action="back">&times;</button>
      </div>
      <div class="challenge-list">
    `;

    for (const ch of challenges) {
      const done = isChallengeCompleted(ch.id);
      html += `<div class="challenge-card ${done ? 'completed' : ''}" data-id="${ch.id}">
        <div class="challenge-info">
          <div class="challenge-name">${t(`challenge.${ch.id}.name`)}</div>
          <div class="challenge-desc">${t(`challenge.${ch.id}.desc`)}</div>
          <div class="challenge-meta">${ch.waves} ${t('challenge.waves')}</div>
        </div>
        <div class="challenge-status">
          ${done ? iconElem('check') + t('challenge.completed') : iconElem('play') + t('challenge.start')}
        </div>
      </div>`;
    }

    html += `</div>
      <div class="challenge-footer">
        <button class="hud-btn" data-action="back">${t('challenge.back')}</button>
      </div>
    `;

    this.element.innerHTML = html;

    this.element.querySelectorAll('.challenge-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (this.onStart) this.onStart(id);
      });
    });

    this.element.querySelectorAll('[data-action="back"]').forEach(el => {
      el.addEventListener('click', () => this.hide());
    });
  }
}
