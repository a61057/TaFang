import { t } from '../config/locale.js';
import { ITEM_RARITY_COLORS } from '../config/itemData.js';
import { iconHTML } from './IconProvider.js';

export class InventoryPanel {
  constructor(engine) {
    this.engine = engine;
    this.element = null;
    this._visible = false;
    this._selectedItemId = null;
    this._create();
  }

  _create() {
    this.element = document.createElement('div');
    this.element.id = 'inventoryPanel';
    this.element.className = 'inventory-panel';
    this.element.style.display = 'none';
    this.element.innerHTML = `
      <div class="inv-header">
        <span class="inv-title">${t('inventory.title')}</span>
        <button class="inv-close" id="invCloseBtn">×</button>
      </div>
      <div class="inv-hint">${t('inventory.hint')}</div>
      <div class="inv-grid" id="invGrid"></div>
    `;
    document.body.appendChild(this.element);

    this._grid = this.element.querySelector('#invGrid');
    this.element.querySelector('#invCloseBtn').addEventListener('click', () => this.hide());
  }

  show() {
    this._visible = true;
    this._selectedItemId = null;
    this._render();
    this.element.style.display = 'flex';
  }

  hide() {
    this._visible = false;
    this._selectedItemId = null;
    this.element.style.display = 'none';
  }

  toggle() {
    if (this._visible) this.hide();
    else this.show();
  }

  _render() {
    const items = this.engine.inventory.getAll();
    this._grid.innerHTML = '';

    if (items.length === 0) {
      this._grid.innerHTML = `<div class="inv-empty">${t('inventory.empty')}</div>`;
      return;
    }

    for (const item of items) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot';
      if (this._selectedItemId === item.id) slot.classList.add('selected');
      slot.dataset.itemId = item.id;

      const color = ITEM_RARITY_COLORS[item.def.rarity] || '#aab';
      slot.style.borderColor = color;

      slot.innerHTML = `
        <div class="inv-slot-icon">${iconHTML(item.def.icon)}</div>
        <div class="inv-slot-name" style="color:${color}">${t('item.' + item.def.id + '.name')}</div>
        <div class="inv-slot-count">×${item.count}</div>
        <div class="inv-slot-rarity">${t('rarity.' + item.def.rarity)}</div>
      `;

      slot.addEventListener('click', () => this._onSlotClick(item.id));
      slot.addEventListener('dblclick', () => this._onSlotDblClick(item.id));
      this._grid.appendChild(slot);
    }
  }

  _onSlotClick(itemId) {
    const def = this.engine.inventory.getAll().find(i => i.id === itemId)?.def;
    if (!def) return;

    if (this._selectedItemId === itemId) {
      this._selectedItemId = null;
      this._render();
      return;
    }

    if (def.type === 'sell' || def.type === 'nuke' || def.type === 'freeze') {
      this._useItem(itemId);
      return;
    }

    this._selectedItemId = itemId;
    this._render();
  }

  _onSlotDblClick(itemId) {
    this._useItem(itemId);
  }

  _useItem(itemId) {
    const def = this.engine.inventory.getAll().find(i => i.id === itemId)?.def;
    if (!def) return;

    const used = this.engine.inventory.use(itemId, this.engine, null);
    if (used) {
      this._selectedItemId = null;
      this._render();
    }
  }

  useOnTower(tower) {
    if (!this._selectedItemId) return false;
    const used = this.engine.inventory.use(this._selectedItemId, this.engine, tower);
    if (used) {
      this._selectedItemId = null;
      this._render();
      return true;
    }
    return false;
  }

  isVisible() {
    return this._visible;
  }

  getSelectedItem() {
    return this._selectedItemId;
  }
}
