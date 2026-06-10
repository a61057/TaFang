import { getTree, getTalentCost, computeAllEffects, getTotalSpent, getMaxTalentPoints, saveTalentProgress, loadTalentProgress, resetTalentProgress, getTalent } from '../config/talentData.js';
import { t } from '../config/locale.js';

export class TalentPanel {
  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'talentPanel';
    this.element.className = 'popup-panel talent-panel';
    this.element.innerHTML = `<div class="talent-container"></div>`;
    document.body.appendChild(this.element);
    this.progress = loadTalentProgress();
    this.visible = false;
    this._render();
  }

  show() {
    this.visible = true;
    this.progress = loadTalentProgress();
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
    const tree = getTree();
    const spent = getTotalSpent(this.progress);
    const maxPts = getMaxTalentPoints();

    let html = `
      <div class="panel-header">
        <span>${t('talent.title')}</span>
        <span style="font-size:14px;color:#aab;">${spent}/${maxPts} ${t('talent.points')}</span>
        <button class="panel-close" data-action="close">&times;</button>
      </div>
      <div class="talent-branches">
    `;

    for (const [branchId, branch] of Object.entries(tree)) {
      html += `<div class="talent-branch">
        <div class="branch-header">${branch.icon} ${branch.name}</div>
        <div class="talent-grid">`;

      for (const talent of branch.talents) {
        const level = this.progress[talent.id] || 0;
        const maxed = level >= talent.maxLevel;
        const cost = maxed ? -1 : talent.cost[level];
        const canAfford = !maxed && spent + cost <= maxPts;

        html += `<div class="talent-node ${maxed ? 'maxed' : ''} ${canAfford ? 'available' : ''} ${level > 0 ? 'has-level' : ''}" data-talent="${talent.id}">
          <div class="talent-name">${t(`talent.${talent.id}.name`)}</div>
          <div class="talent-level">${'▰'.repeat(level)}${'▱'.repeat(talent.maxLevel - level)}</div>
          <div class="talent-desc">${t(`talent.${talent.id}.desc`)}</div>
          <div class="talent-cost">${maxed ? t('talent.maxed') : t('talent.cost', cost)}</div>
        </div>`;
      }

      html += `</div></div>`;
    }

    html += `</div>
      <div class="talent-footer">
        <button class="hud-btn" data-action="reset">${t('talent.reset')}</button>
        <button class="hud-btn primary" data-action="close">${t('talent.close')}</button>
      </div>
    `;

    this.element.querySelector('.talent-container').innerHTML = html;

    // Event listeners
    this.element.querySelectorAll('.talent-node').forEach(node => {
      node.addEventListener('click', () => {
        const id = node.dataset.talent;
        this._purchase(id);
      });
    });

    this.element.querySelectorAll('[data-action="close"]').forEach(el => {
      el.addEventListener('click', () => this.hide());
    });

    this.element.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      resetTalentProgress();
      this.progress = {};
      this._render();
    });
  }

  _purchase(id) {
    const talent = getTalent(id);
    if (!talent) return;
    const level = this.progress[id] || 0;
    const cost = getTalentCost(talent, level);
    if (cost < 0) return;
    const spent = getTotalSpent(this.progress);
    const maxPts = getMaxTalentPoints();
    if (spent + cost > maxPts) return;

    this.progress[id] = (this.progress[id] || 0) + 1;
    saveTalentProgress(this.progress);
    this._render();
  }
}
