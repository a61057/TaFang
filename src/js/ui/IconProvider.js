const CELL = 16;
const COLS = 10;
const PAD = 0;

const _icons = {};
let _spriteCanvas = null;
let _spriteDataURL = '';
let _cssInjected = false;

function px(c, x, y, color) {
  c.fillStyle = color;
  c.fillRect(x, y, 1, 1);
}

function hline(c, x, y, w, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, 1);
}

function vline(c, x, y, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, 1, h);
}

function rect(c, x, y, w, h, color) {
  c.fillStyle = color;
  c.fillRect(x, y, w, h);
}

const ICONS = [
  { name: 'sword', draw(c, x, y) {
    hline(c, x+5, y+1, 3, '#ccc');
    hline(c, x+4, y+2, 5, '#ccc');
    vline(c, x+6, y+3, 6, '#ccc');
    hline(c, x+4, y+9, 3, '#888');
    hline(c, x+5, y+10, 2, '#888');
    rect(c, x+2, y+8, 5, 2, '#c44');
    rect(c, x+3, y+10, 3, 3, '#654');
    hline(c, x+2, y+13, 5, '#888');
    hline(c, x+3, y+14, 3, '#888');
  }},
  { name: 'shield', draw(c, x, y) {
    rect(c, x+2, y+1, 10, 2, '#4a7');
    rect(c, x+1, y+3, 12, 6, '#4a7');
    rect(c, x+2, y+9, 10, 2, '#4a7');
    rect(c, x+3, y+11, 8, 1, '#4a7');
    rect(c, x+4, y+12, 6, 1, '#4a7');
    rect(c, x+5, y+13, 4, 1, '#4a7');
    rect(c, x+3, y+2, 1, 8, '#7d9');
    rect(c, x+4, y+2, 6, 1, '#7d9');
    rect(c, x+9, y+2, 1, 8, '#368');
    rect(c, x+4, y+8, 6, 1, '#368');
  }},
  { name: 'coin', draw(c, x, y) {
    rect(c, x+3, y+2, 8, 1, '#fa0');
    rect(c, x+2, y+3, 10, 1, '#fc0');
    rect(c, x+1, y+4, 12, 6, '#fc0');
    rect(c, x+2, y+10, 10, 1, '#fc0');
    rect(c, x+3, y+11, 8, 1, '#fa0');
    rect(c, x+4, y+5, 6, 4, '#fff');
    vline(c, x+5, y+6, 2, '#888');
    hline(c, x+6, y+7, 2, '#888');
    rect(c, x+8, y+5, 1, 4, '#da0');
    rect(c, x+4, y+5, 1, 4, '#da0');
  }},
  { name: 'skull', draw(c, x, y) {
    rect(c, x+3, y+2, 8, 1, '#ddd');
    rect(c, x+2, y+3, 10, 6, '#ddd');
    rect(c, x+3, y+9, 8, 2, '#ddd');
    rect(c, x+4, y+11, 6, 1, '#ddd');
    rect(c, x+5, y+12, 4, 2, '#ddd');
    rect(c, x+3, y+4, 2, 3, '#111');
    rect(c, x+9, y+4, 2, 3, '#111');
    rect(c, x+5, y+5, 4, 2, '#111');
    rect(c, x+6, y+3, 2, 1, '#111');
    rect(c, x+6, y+7, 2, 2, '#111');
    rect(c, x+7, y+10, 1, 1, '#111');
  }},
  { name: 'heart', draw(c, x, y) {
    rect(c, x+2, y+2, 2, 2, '#e44');
    rect(c, x+6, y+2, 2, 2, '#e44');
    rect(c, x+1, y+4, 2, 3, '#e44');
    rect(c, x+8, y+4, 2, 3, '#e44');
    rect(c, x+2, y+7, 1, 2, '#e44');
    rect(c, x+8, y+7, 1, 2, '#e44');
    rect(c, x+3, y+9, 1, 1, '#e44');
    rect(c, x+7, y+9, 1, 1, '#e44');
    rect(c, x+4, y+10, 2, 1, '#e44');
    rect(c, x+5, y+11, 1, 1, '#e44');
    rect(c, x+3, y+4, 5, 5, '#e44');
    rect(c, x+4, y+4, 3, 4, '#f66');
    rect(c, x+4, y+8, 3, 1, '#c33');
    rect(c, x+6, y+5, 1, 2, '#f88');
    rect(c, x+5, y+4, 1, 1, '#f88');
  }},
  { name: 'star', draw(c, x, y) {
    hline(c, x+6, y+1, 2, '#fd0');
    hline(c, x+5, y+2, 4, '#fd0');
    hline(c, x+4, y+3, 6, '#fd0');
    hline(c, x+3, y+4, 8, '#fd0');
    hline(c, x+2, y+5, 10, '#fd0');
    hline(c, x+4, y+6, 6, '#fd0');
    hline(c, x+3, y+7, 8, '#fd0');
    hline(c, x+5, y+8, 4, '#fd0');
    hline(c, x+6, y+9, 2, '#fd0');
  }},
  { name: 'gear', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 2, '#aac');
    rect(c, x+3, y+3, 2, 2, '#aac');
    rect(c, x+9, y+3, 2, 2, '#aac');
    rect(c, x+2, y+5, 2, 4, '#aac');
    rect(c, x+10, y+5, 2, 4, '#aac');
    rect(c, x+3, y+9, 2, 2, '#aac');
    rect(c, x+9, y+9, 2, 2, '#aac');
    rect(c, x+5, y+11, 4, 2, '#aac');
    rect(c, x+4, y+4, 6, 6, '#dde');
    rect(c, x+5, y+5, 4, 4, '#667');
  }},
  { name: 'trophy', draw(c, x, y) {
    rect(c, x+3, y+1, 8, 2, '#fd0');
    rect(c, x+4, y+3, 6, 5, '#fd0');
    rect(c, x+5, y+8, 4, 1, '#fd0');
    rect(c, x+4, y+9, 6, 1, '#fd0');
    rect(c, x+5, y+10, 4, 2, '#da0');
    rect(c, x+6, y+12, 2, 1, '#da0');
    rect(c, x+5, y+13, 4, 1, '#888');
    rect(c, x+2, y+1, 1, 3, '#da0');
    rect(c, x+11, y+1, 1, 3, '#da0');
    rect(c, x+2, y+4, 1, 2, '#da0');
    rect(c, x+11, y+4, 1, 2, '#da0');
    rect(c, x+5, y+4, 4, 3, '#ff4');
  }},
  { name: 'lightning', draw(c, x, y) {
    hline(c, x+4, y+1, 3, '#ff0');
    hline(c, x+3, y+2, 4, '#ff0');
    hline(c, x+2, y+3, 5, '#ff0');
    hline(c, x+1, y+4, 6, '#ff0');
    hline(c, x+2, y+5, 5, '#ff0');
    hline(c, x+3, y+6, 4, '#ff0');
    hline(c, x+4, y+7, 3, '#ff0');
    hline(c, x+5, y+8, 2, '#ff0');
    hline(c, x+6, y+9, 1, '#ff0');
    hline(c, x+7, y+10, 3, '#ff0');
    hline(c, x+8, y+11, 2, '#ff0');
    hline(c, x+9, y+12, 1, '#ff0');
  }},
  { name: 'target', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 2, '#e44');
    rect(c, x+5, y+11, 4, 2, '#e44');
    rect(c, x+1, y+5, 2, 4, '#e44');
    rect(c, x+11, y+5, 2, 4, '#e44');
    rect(c, x+4, y+3, 6, 8, '#444');
    rect(c, x+5, y+4, 4, 6, '#888');
    rect(c, x+6, y+5, 2, 4, '#e44');
    rect(c, x+5, y+6, 4, 2, '#e44');
  }},
  { name: 'hammer', draw(c, x, y) {
    rect(c, x+3, y+1, 8, 3, '#aaa');
    rect(c, x+4, y+4, 6, 1, '#aaa');
    rect(c, x+7, y+5, 2, 1, '#aaa');
    rect(c, x+2, y+1, 1, 3, '#888');
    rect(c, x+11, y+1, 1, 3, '#888');
    rect(c, x+5, y+4, 1, 2, '#888');
    rect(c, x+7, y+6, 2, 6, '#964');
    rect(c, x+8, y+12, 1, 1, '#964');
    rect(c, x+6, y+6, 1, 5, '#b86');
  }},
  { name: 'book', draw(c, x, y) {
    rect(c, x+1, y+1, 12, 12, '#aac');
    rect(c, x+2, y+2, 5, 10, '#dde');
    rect(c, x+8, y+2, 4, 10, '#dde');
    rect(c, x+6, y+2, 1, 10, '#889');
    hline(c, x+3, y+4, 3, '#aac');
    hline(c, x+9, y+4, 2, '#aac');
    hline(c, x+3, y+7, 3, '#aac');
    hline(c, x+9, y+7, 2, '#aac');
    hline(c, x+3, y+10, 3, '#aac');
    hline(c, x+9, y+10, 2, '#aac');
  }},
  { name: 'play', draw(c, x, y) {
    rect(c, x+3, y+2, 2, 10, '#7d9');
    rect(c, x+5, y+3, 2, 8, '#7d9');
    rect(c, x+7, y+4, 2, 6, '#7d9');
    rect(c, x+9, y+5, 2, 4, '#7d9');
  }},
  { name: 'pause', draw(c, x, y) {
    rect(c, x+3, y+2, 3, 10, '#aac');
    rect(c, x+8, y+2, 3, 10, '#aac');
  }},
  { name: 'ffwd', draw(c, x, y) {
    rect(c, x+1, y+3, 2, 8, '#7d9');
    rect(c, x+3, y+4, 2, 6, '#7d9');
    rect(c, x+5, y+5, 2, 4, '#7d9');
    rect(c, x+7, y+3, 2, 8, '#7d9');
    rect(c, x+9, y+4, 2, 6, '#7d9');
    rect(c, x+11, y+5, 2, 4, '#7d9');
  }},
  { name: 'folder', draw(c, x, y) {
    rect(c, x+1, y+3, 12, 9, '#da0');
    rect(c, x+2, y+4, 10, 7, '#fc0');
    rect(c, x+1, y+1, 5, 2, '#da0');
    rect(c, x+2, y+2, 3, 1, '#fc0');
    rect(c, x+3, y+3, 8, 1, '#fc0');
  }},
  { name: 'check', draw(c, x, y) {
    hline(c, x+1, y+7, 2, '#7d9');
    hline(c, x+3, y+8, 2, '#7d9');
    hline(c, x+5, y+9, 2, '#7d9');
    hline(c, x+7, y+8, 3, '#7d9');
    hline(c, x+10, y+6, 2, '#7d9');
    hline(c, x+8, y+9, 2, '#7d9');
    hline(c, x+11, y+5, 2, '#7d9');
    hline(c, x+12, y+3, 2, '#7d9');
  }},
  { name: 'flag', draw(c, x, y) {
    vline(c, x+3, y+1, 13, '#889');
    vline(c, x+4, y+1, 13, '#aab');
    rect(c, x+5, y+1, 6, 5, '#4a7');
    rect(c, x+5, y+6, 4, 1, '#4a7');
    rect(c, x+6, y+2, 4, 3, '#7d9');
    rect(c, x+9, y+2, 1, 4, '#368');
  }},
  { name: 'lock', draw(c, x, y) {
    rect(c, x+4, y+1, 6, 5, '#da0');
    rect(c, x+3, y+6, 8, 7, '#da0');
    rect(c, x+4, y+2, 4, 4, '#fc0');
    rect(c, x+4, y+7, 6, 5, '#fc0');
    rect(c, x+6, y+8, 2, 2, '#111');
    rect(c, x+7, y+10, 1, 1, '#111');
    rect(c, x+3, y+2, 1, 2, '#a80');
    rect(c, x+10, y+2, 1, 2, '#a80');
  }},
  { name: 'unlock', draw(c, x, y) {
    rect(c, x+4, y+1, 6, 5, '#da0');
    rect(c, x+3, y+6, 8, 7, '#da0');
    rect(c, x+2, y+3, 2, 3, '#da0');
    rect(c, x+4, y+2, 4, 4, '#fc0');
    rect(c, x+4, y+7, 6, 5, '#fc0');
    rect(c, x+6, y+8, 2, 2, '#111');
    rect(c, x+7, y+10, 1, 1, '#111');
    rect(c, x+3, y+2, 1, 2, '#a80');
    rect(c, x+10, y+2, 1, 2, '#a80');
  }},
  { name: 'sun', draw(c, x, y) {
    rect(c, x+6, y+0, 2, 2, '#fc0');
    vline(c, x+6, y+4, 2, '#fc0');
    rect(c, x+1, y+6, 2, 2, '#fc0');
    rect(c, x+11, y+6, 2, 2, '#fc0');
    rect(c, x+5, y+7, 4, 4, '#fd0');
    rect(c, x+6, y+6, 2, 2, '#fc0');
    rect(c, x+4, y+11, 2, 2, '#fc0');
    rect(c, x+8, y+11, 2, 2, '#fc0');
  }},
  { name: 'moon', draw(c, x, y) {
    rect(c, x+2, y+2, 6, 1, '#ccc');
    rect(c, x+1, y+3, 8, 1, '#ccc');
    rect(c, x+1, y+4, 9, 1, '#ccc');
    rect(c, x+2, y+5, 9, 3, '#ccc');
    rect(c, x+3, y+8, 8, 1, '#ccc');
    rect(c, x+4, y+9, 7, 1, '#ccc');
    rect(c, x+5, y+10, 5, 1, '#ccc');
    rect(c, x+6, y+11, 3, 1, '#ccc');
    rect(c, x+4, y+3, 4, 2, '#444');
    rect(c, x+3, y+5, 3, 2, '#444');
    rect(c, x+4, y+7, 2, 1, '#444');
    rect(c, x+8, y+4, 1, 2, '#eee');
  }},
  { name: 'rain', draw(c, x, y) {
    rect(c, x+2, y+2, 8, 4, '#aac');
    rect(c, x+3, y+6, 6, 1, '#aac');
    rect(c, x+1, y+3, 2, 1, '#aac');
    rect(c, x+10, y+3, 2, 1, '#aac');
    rect(c, x+1, y+7, 2, 1, '#68d');
    rect(c, x+5, y+7, 2, 1, '#68d');
    rect(c, x+9, y+8, 2, 1, '#68d');
    vline(c, x+3, y+8, 2, '#68d');
    vline(c, x+7, y+8, 2, '#68d');
    vline(c, x+11, y+9, 2, '#68d');
  }},
  { name: 'snow', draw(c, x, y) {
    rect(c, x+2, y+2, 8, 4, '#dde');
    rect(c, x+3, y+6, 6, 1, '#dde');
    rect(c, x+1, y+3, 2, 1, '#dde');
    rect(c, x+10, y+3, 2, 1, '#dde');
    vline(c, x+3, y+8, 3, '#dde');
    vline(c, x+7, y+8, 3, '#dde');
    vline(c, x+11, y+9, 2, '#dde');
    hline(c, x+2, y+9, 3, '#dde');
    hline(c, x+6, y+9, 3, '#dde');
    hline(c, x+10, y+10, 3, '#dde');
  }},
  { name: 'storm', draw(c, x, y) {
    rect(c, x+2, y+2, 8, 3, '#889');
    rect(c, x+1, y+3, 2, 1, '#889');
    rect(c, x+10, y+3, 2, 1, '#889');
    rect(c, x+3, y+5, 6, 2, '#889');
    rect(c, x+5, y+6, 2, 1, '#ff0');
    rect(c, x+6, y+7, 2, 1, '#ff0');
    rect(c, x+7, y+8, 2, 1, '#ff0');
    rect(c, x+8, y+9, 1, 1, '#ff0');
    rect(c, x+4, y+10, 1, 1, '#ff0');
  }},
  { name: 'fog', draw(c, x, y) {
    hline(c, x+1, y+3, 12, '#889');
    hline(c, x+1, y+6, 12, '#889');
    hline(c, x+1, y+9, 12, '#889');
    hline(c, x+1, y+12, 12, '#889');
    hline(c, x+3, y+4, 10, '#aab');
    hline(c, x+3, y+7, 10, '#aab');
    hline(c, x+3, y+10, 10, '#aab');
  }},
  { name: 'flower', draw(c, x, y) {
    rect(c, x+6, y+10, 2, 4, '#7d9');
    rect(c, x+5, y+3, 1, 1, '#fd0');
    rect(c, x+7, y+1, 1, 1, '#fd0');
    rect(c, x+6, y+2, 2, 2, '#fd0');
    rect(c, x+5, y+4, 2, 2, '#fd0');
    rect(c, x+7, y+4, 2, 2, '#fd0');
    rect(c, x+6, y+5, 2, 2, '#fd0');
    rect(c, x+4, y+5, 1, 3, '#7d9');
    rect(c, x+9, y+5, 1, 3, '#7d9');
    rect(c, x+5, y+7, 4, 1, '#7d9');
  }},
  { name: 'cherry', draw(c, x, y) {
    rect(c, x+3, y+2, 3, 3, '#f8a');
    rect(c, x+8, y+1, 3, 3, '#f8a');
    rect(c, x+2, y+5, 3, 2, '#f8a');
    rect(c, x+9, y+4, 2, 2, '#f8a');
    rect(c, x+4, y+5, 1, 2, '#c6a');
    rect(c, x+9, y+6, 1, 1, '#c6a');
    rect(c, x+3, y+7, 2, 1, '#c6a');
    rect(c, x+9, y+3, 1, 2, '#c6a');
    rect(c, x+8, y+2, 1, 1, '#fcc');
    rect(c, x+5, y+3, 2, 1, '#7d9');
    hline(c, x+6, y+2, 3, '#7d9');
    hline(c, x+4, y+8, 3, '#889');
    vline(c, x+6, y+8, 2, '#889');
  }},
  { name: 'crown', draw(c, x, y) {
    rect(c, x+3, y+1, 1, 1, '#fd0');
    rect(c, x+7, y+0, 1, 1, '#fd0');
    rect(c, x+10, y+1, 1, 1, '#fd0');
    rect(c, x+2, y+2, 3, 2, '#fd0');
    rect(c, x+6, y+1, 3, 2, '#fd0');
    rect(c, x+10, y+2, 3, 2, '#fd0');
    rect(c, x+1, y+4, 12, 2, '#fd0');
    rect(c, x+2, y+6, 10, 7, '#fd0');
    rect(c, x+3, y+4, 2, 2, '#f80');
    rect(c, x+9, y+4, 2, 2, '#f80');
    rect(c, x+6, y+3, 2, 2, '#f80');
    rect(c, x+4, y+5, 6, 1, '#f80');
    rect(c, x+5, y+7, 4, 3, '#ff4');
    rect(c, x+6, y+10, 2, 1, '#f80');
  }},
  { name: 'infinity', draw(c, x, y) {
    rect(c, x+1, y+5, 2, 4, '#aac');
    rect(c, x+3, y+4, 2, 6, '#aac');
    rect(c, x+5, y+5, 4, 4, '#aac');
    rect(c, x+9, y+4, 2, 6, '#aac');
    rect(c, x+11, y+5, 2, 4, '#aac');
    rect(c, x+12, y+6, 1, 2, '#aac');
    rect(c, x+0, y+6, 1, 2, '#aac');
  }},
  { name: 'person', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 4, '#aac');
    rect(c, x+4, y+5, 6, 2, '#aac');
    rect(c, x+3, y+7, 8, 2, '#aac');
    rect(c, x+2, y+9, 10, 5, '#aac');
    rect(c, x+5, y+2, 2, 2, '#dde');
    rect(c, x+6, y+3, 1, 1, '#dde');
  }},
  { name: 'fire', draw(c, x, y) {
    rect(c, x+6, y+0, 1, 1, '#f80');
    rect(c, x+5, y+1, 3, 1, '#f80');
    rect(c, x+4, y+2, 4, 2, '#f80');
    rect(c, x+3, y+4, 6, 2, '#f80');
    rect(c, x+4, y+6, 4, 1, '#f80');
    rect(c, x+5, y+7, 2, 1, '#f80');
    rect(c, x+4, y+3, 2, 1, '#fd0');
    rect(c, x+5, y+5, 2, 1, '#fd0');
    rect(c, x+3, y+6, 1, 1, '#fd0');
    rect(c, x+2, y+3, 2, 3, '#e44');
    rect(c, x+8, y+3, 2, 2, '#e44');
    rect(c, x+3, y+8, 4, 2, '#e44');
    rect(c, x+4, y+10, 2, 2, '#e44');
    rect(c, x+5, y+12, 2, 2, '#e44');
  }},
  { name: 'bomb', draw(c, x, y) {
    rect(c, x+7, y+0, 3, 3, '#888');
    rect(c, x+8, y+3, 2, 1, '#888');
    rect(c, x+3, y+4, 2, 1, '#888');
    rect(c, x+2, y+5, 3, 1, '#888');
    rect(c, x+3, y+2, 3, 2, '#888');
    rect(c, x+2, y+2, 1, 2, '#666');
    rect(c, x+1, y+6, 12, 8, '#444');
    rect(c, x+2, y+7, 10, 6, '#666');
    rect(c, x+6, y+8, 2, 2, '#f80');
    rect(c, x+7, y+10, 1, 1, '#f80');
    rect(c, x+9, y+10, 1, 1, '#f80');
  }},
  { name: 'diamond', draw(c, x, y) {
    hline(c, x+5, y+1, 4, '#6cf');
    hline(c, x+4, y+2, 6, '#6cf');
    hline(c, x+3, y+3, 8, '#6cf');
    hline(c, x+2, y+4, 10, '#6cf');
    hline(c, x+3, y+5, 8, '#6cf');
    hline(c, x+4, y+6, 6, '#6cf');
    hline(c, x+5, y+7, 4, '#6cf');
    hline(c, x+6, y+8, 2, '#6cf');
    hline(c, x+5, y+2, 4, '#aff');
    hline(c, x+8, y+3, 2, '#48b');
    hline(c, x+5, y+4, 4, '#48b');
  }},
  { name: 'alien', draw(c, x, y) {
    rect(c, x+2, y+2, 10, 10, '#7d9');
    rect(c, x+3, y+3, 8, 8, '#7d9');
    rect(c, x+4, y+4, 6, 6, '#4a7');
    rect(c, x+5, y+5, 2, 2, '#111');
    rect(c, x+7, y+5, 2, 2, '#111');
    rect(c, x+5, y+8, 4, 1, '#7d9');
    rect(c, x+1, y+6, 1, 3, '#7d9');
    rect(c, x+12, y+6, 1, 3, '#7d9');
  }},
  { name: 'card', draw(c, x, y) {
    rect(c, x+1, y+1, 12, 12, '#aac');
    rect(c, x+2, y+2, 10, 10, '#dde');
    rect(c, x+3, y+3, 8, 8, '#dde');
    rect(c, x+5, y+4, 4, 6, '#e44');
    rect(c, x+6, y+5, 2, 4, '#f66');
    hline(c, x+4, y+7, 6, '#c33');
  }},
  { name: 'box', draw(c, x, y) {
    rect(c, x+1, y+1, 12, 9, '#da0');
    rect(c, x+2, y+2, 10, 7, '#fc0');
    rect(c, x+3, y+3, 8, 5, '#fc0');
    hline(c, x+4, y+4, 6, '#da0');
    hline(c, x+4, y+6, 6, '#da0');
    hline(c, x+1, y+10, 12, '#a80');
    hline(c, x+2, y+11, 10, '#a80');
    hline(c, x+3, y+12, 8, '#a80');
    hline(c, x+4, y+13, 6, '#a80');
  }},
  { name: 'explosion', draw(c, x, y) {
    hline(c, x+3, y+0, 1, '#f80');
    rect(c, x+2, y+1, 3, 1, '#f80');
    hline(c, x+7, y+0, 3, '#f80');
    hline(c, x+10, y+1, 2, '#f80');
    hline(c, x+0, y+3, 2, '#f80');
    rect(c, x+1, y+2, 2, 2, '#fd0');
    rect(c, x+9, y+2, 3, 3, '#fd0');
    hline(c, x+11, y+4, 2, '#fd0');
    rect(c, x+0, y+5, 2, 3, '#fd0');
    rect(c, x+11, y+7, 3, 3, '#fd0');
    rect(c, x+2, y+8, 3, 2, '#e44');
    rect(c, x+6, y+10, 2, 1, '#e44');
    hline(c, x+0, y+9, 2, '#e44');
    hline(c, x+11, y+11, 2, '#e44');
    rect(c, x+3, y+4, 6, 6, '#fd0');
    rect(c, x+4, y+5, 4, 4, '#ff4');
    rect(c, x+5, y+6, 2, 2, '#fff');
  }},
  { name: 'trash', draw(c, x, y) {
    rect(c, x+4, y+1, 6, 2, '#aac');
    rect(c, x+2, y+3, 10, 1, '#aac');
    rect(c, x+3, y+4, 8, 9, '#dde');
    rect(c, x+4, y+5, 2, 6, '#aac');
    rect(c, x+8, y+5, 2, 6, '#aac');
    rect(c, x+6, y+5, 2, 6, '#aac');
    rect(c, x+4, y+4, 2, 1, '#889');
    rect(c, x+8, y+4, 2, 1, '#889');
  }},
  { name: 'sparkle', draw(c, x, y) {
    vline(c, x+7, y+1, 2, '#fd0');
    hline(c, x+6, y+3, 3, '#fd0');
    vline(c, x+7, y+3, 2, '#fd0');
    vline(c, x+5, y+7, 2, '#fd0');
    hline(c, x+7, y+6, 3, '#fd0');
    vline(c, x+10, y+5, 2, '#fd0');
    hline(c, x+2, y+6, 2, '#fd0');
    hline(c, x+1, y+8, 2, '#fd0');
    vline(c, x+3, y+8, 2, '#fd0');
    vline(c, x+10, y+8, 2, '#fd0');
    vline(c, x+8, y+10, 3, '#fd0');
    hline(c, x+9, y+7, 2, '#fd0');
  }},
  { name: 'tools', draw(c, x, y) {
    rect(c, x+2, y+2, 2, 8, '#aaa');
    rect(c, x+10, y+3, 2, 8, '#aaa');
    rect(c, x+8, y+1, 2, 10, '#888');
    rect(c, x+4, y+2, 2, 10, '#888');
    hline(c, x+1, y+10, 4, '#888');
    hline(c, x+9, y+10, 4, '#888');
    rect(c, x+5, y+11, 4, 2, '#888');
    hline(c, x+4, y+10, 6, '#666');
  }},
  { name: 'arrow_up', draw(c, x, y) {
    hline(c, x+6, y+1, 2, '#7d9');
    hline(c, x+5, y+2, 4, '#7d9');
    hline(c, x+4, y+3, 6, '#7d9');
    hline(c, x+3, y+4, 8, '#7d9');
    hline(c, x+2, y+5, 10, '#7d9');
    vline(c, x+6, y+6, 8, '#7d9');
    vline(c, x+7, y+6, 8, '#7d9');
    hline(c, x+6, y+7, 2, '#4a7');
  }},
  { name: 'arrow_down', draw(c, x, y) {
    vline(c, x+6, y+0, 8, '#7d9');
    vline(c, x+7, y+0, 8, '#7d9');
    hline(c, x+2, y+8, 10, '#7d9');
    hline(c, x+3, y+9, 8, '#7d9');
    hline(c, x+4, y+10, 6, '#7d9');
    hline(c, x+5, y+11, 4, '#7d9');
    hline(c, x+6, y+12, 2, '#7d9');
    hline(c, x+6, y+8, 2, '#4a7');
  }},
  { name: 'hourglass', draw(c, x, y) {
    hline(c, x+3, y+1, 8, '#da0');
    hline(c, x+3, y+2, 8, '#fc0');
    hline(c, x+4, y+3, 6, '#fc0');
    hline(c, x+5, y+4, 4, '#fc0');
    hline(c, x+6, y+5, 2, '#fc0');
    hline(c, x+5, y+6, 4, '#fc0');
    hline(c, x+4, y+7, 6, '#fc0');
    hline(c, x+3, y+8, 8, '#fc0');
    hline(c, x+3, y+9, 8, '#fc0');
    hline(c, x+4, y+10, 6, '#fc0');
    hline(c, x+5, y+11, 4, '#fc0');
    hline(c, x+6, y+12, 2, '#fc0');
    rect(c, x+5, y+4, 1, 2, '#a80');
    rect(c, x+5, y+7, 1, 2, '#a80');
    hline(c, x+4, y+5, 1, '#a80');
    hline(c, x+6, y+6, 1, '#a80');
  }},
  { name: 'tower', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 5, '#889');
    rect(c, x+4, y+6, 6, 3, '#889');
    rect(c, x+3, y+9, 8, 1, '#889');
    rect(c, x+2, y+10, 10, 3, '#889');
    rect(c, x+1, y+13, 12, 1, '#889');
    rect(c, x+6, y+2, 2, 1, '#aab');
    hline(c, x+5, y+6, 4, '#aab');
    hline(c, x+4, y+10, 6, '#667');
    rect(c, x+7, y+4, 1, 3, '#667');
    rect(c, x+4, y+11, 6, 1, '#556');
  }},
  { name: 'rocket', draw(c, x, y) {
    hline(c, x+6, y+0, 2, '#e44');
    hline(c, x+5, y+1, 4, '#e44');
    hline(c, x+4, y+2, 6, '#e44');
    hline(c, x+3, y+3, 8, '#e44');
    hline(c, x+4, y+4, 6, '#e44');
    hline(c, x+5, y+5, 4, '#e44');
    hline(c, x+6, y+6, 2, '#e44');
    rect(c, x+3, y+4, 1, 3, '#f88');
    rect(c, x+10, y+4, 1, 3, '#f88');
    rect(c, x+5, y+7, 4, 2, '#f88');
    rect(c, x+6, y+9, 2, 3, '#f88');
    rect(c, x+5, y+12, 4, 1, '#e44');
    rect(c, x+6, y+13, 2, 1, '#f88');
  }},
  { name: 'pin', draw(c, x, y) {
    rect(c, x+4, y+1, 6, 2, '#e44');
    rect(c, x+3, y+3, 8, 3, '#e44');
    rect(c, x+4, y+6, 6, 2, '#e44');
    rect(c, x+5, y+8, 4, 1, '#e44');
    rect(c, x+6, y+9, 2, 3, '#e44');
    rect(c, x+5, y+12, 4, 1, '#e44');
    rect(c, x+7, y+13, 1, 1, '#e44');
    rect(c, x+5, y+2, 4, 1, '#f88');
    rect(c, x+5, y+6, 4, 1, '#f88');
  }},
  { name: 'refresh', draw(c, x, y) {
    rect(c, x+2, y+3, 2, 3, '#7d9');
    rect(c, x+4, y+2, 2, 2, '#7d9');
    rect(c, x+6, y+1, 4, 2, '#7d9');
    rect(c, x+10, y+3, 2, 4, '#7d9');
    rect(c, x+12, y+7, 1, 2, '#7d9');
    rect(c, x+9, y+9, 3, 2, '#7d9');
    rect(c, x+6, y+11, 4, 2, '#7d9');
    rect(c, x+4, y+10, 2, 2, '#7d9');
    rect(c, x+2, y+8, 2, 2, '#7d9');
    rect(c, x+4, y+4, 1, 2, '#4a7');
    rect(c, x+9, y+10, 1, 1, '#4a7');
  }},
  { name: 'save', draw(c, x, y) {
    rect(c, x+1, y+1, 12, 12, '#aac');
    rect(c, x+2, y+2, 10, 10, '#dde');
    rect(c, x+3, y+2, 4, 5, '#889');
    rect(c, x+7, y+3, 3, 3, '#889');
    rect(c, x+4, y+8, 6, 4, '#aac');
    rect(c, x+5, y+9, 4, 2, '#dde');
    hline(c, x+3, y+7, 8, '#889');
    rect(c, x+12, y+3, 1, 2, '#667');
    rect(c, x+3, y+2, 1, 5, '#667');
  }},
  { name: 'controller', draw(c, x, y) {
    rect(c, x+1, y+5, 2, 4, '#889');
    rect(c, x+11, y+5, 2, 4, '#889');
    rect(c, x+3, y+3, 8, 8, '#aac');
    rect(c, x+4, y+4, 6, 6, '#dde');
    rect(c, x+5, y+5, 1, 1, '#111');
    rect(c, x+8, y+5, 1, 1, '#111');
    rect(c, x+6, y+8, 2, 1, '#111');
    rect(c, x+5, y+6, 4, 2, '#667');
  }},
  { name: 'target2', draw(c, x, y) {
    hline(c, x+5, y+1, 4, '#e44');
    hline(c, x+5, y+12, 4, '#e44');
    vline(c, x+1, y+5, 4, '#e44');
    vline(c, x+12, y+5, 4, '#e44');
    hline(c, x+4, y+3, 6, '#888');
    hline(c, x+4, y+10, 6, '#888');
    vline(c, x+3, y+4, 6, '#888');
    vline(c, x+10, y+4, 6, '#888');
    hline(c, x+5, y+4, 4, '#dde');
    hline(c, x+5, y+9, 4, '#dde');
    vline(c, x+4, y+5, 4, '#dde');
    vline(c, x+9, y+5, 4, '#dde');
    rect(c, x+5, y+5, 4, 4, '#e44');
    rect(c, x+6, y+6, 2, 2, '#dde');
  }},
  { name: 'flag2', draw(c, x, y) {
    vline(c, x+3, y+1, 13, '#889');
    hline(c, x+4, y+1, 8, '#e44');
    hline(c, x+4, y+2, 6, '#e44');
    hline(c, x+4, y+3, 7, '#e44');
    hline(c, x+4, y+4, 5, '#e44');
    hline(c, x+4, y+5, 3, '#e44');
  }},
  { name: 'fist', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 3, '#da0');
    rect(c, x+4, y+4, 6, 3, '#da0');
    rect(c, x+3, y+7, 8, 2, '#da0');
    rect(c, x+4, y+9, 6, 3, '#da0');
    rect(c, x+5, y+2, 2, 2, '#fc0');
    rect(c, x+5, y+5, 4, 1, '#fc0');
    rect(c, x+5, y+10, 4, 1, '#fc0');
    rect(c, x+2, y+5, 2, 4, '#c80');
    rect(c, x+10, y+5, 2, 3, '#c80');
  }},
  { name: 'skull2', draw(c, x, y) {
    rect(c, x+3, y+1, 8, 1, '#ccc');
    rect(c, x+2, y+2, 10, 6, '#ccc');
    rect(c, x+3, y+8, 8, 2, '#ccc');
    rect(c, x+4, y+10, 6, 1, '#ccc');
    rect(c, x+5, y+11, 4, 2, '#ccc');
    rect(c, x+3, y+3, 2, 2, '#111');
    rect(c, x+9, y+3, 2, 2, '#111');
    rect(c, x+5, y+4, 4, 2, '#111');
    rect(c, x+6, y+6, 2, 2, '#111');
    rect(c, x+5, y+5, 1, 1, '#111');
    rect(c, x+8, y+5, 1, 1, '#111');
    hline(c, x+5, y+9, 4, '#111');
    hline(c, x+4, y+6, 1, '#111');
    hline(c, x+9, y+6, 1, '#111');
  }},
  { name: 'microbe', draw(c, x, y) {
    rect(c, x+5, y+1, 4, 4, '#4a7');
    rect(c, x+4, y+5, 6, 4, '#4a7');
    rect(c, x+5, y+9, 4, 2, '#4a7');
    rect(c, x+3, y+3, 3, 3, '#7d9');
    rect(c, x+8, y+3, 3, 4, '#7d9');
    rect(c, x+6, y+6, 2, 3, '#7d9');
    rect(c, x+5, y+3, 2, 2, '#4a7');
  }},
  { name: 'snail', draw(c, x, y) {
    rect(c, x+6, y+10, 6, 3, '#7d9');
    rect(c, x+5, y+11, 2, 2, '#7d9');
    rect(c, x+3, y+2, 8, 5, '#da0');
    rect(c, x+4, y+7, 6, 2, '#da0');
    rect(c, x+5, y+9, 2, 2, '#da0');
    rect(c, x+4, y+3, 4, 3, '#fc0');
    rect(c, x+6, y+4, 4, 1, '#a80');
    rect(c, x+10, y+3, 1, 4, '#a80');
  }},
  { name: 'wind', draw(c, x, y) {
    hline(c, x+1, y+4, 10, '#aac');
    hline(c, x+1, y+5, 8, '#aac');
    hline(c, x+3, y+8, 10, '#aac');
    hline(c, x+3, y+9, 6, '#aac');
    hline(c, x+1, y+10, 3, '#aac');
    hline(c, x+5, y+11, 8, '#aac');
    hline(c, x+5, y+12, 4, '#aac');
  }},
  { name: 'chart_down', draw(c, x, y) {
    vline(c, x+2, y+1, 12, '#e44');
    hline(c, x+2, y+12, 10, '#e44');
    rect(c, x+4, y+8, 3, 4, '#e44');
    rect(c, x+9, y+4, 3, 8, '#e44');
    hline(c, x+3, y+7, 4, '#e44');
    hline(c, x+7, y+3, 4, '#e44');
    rect(c, x+4, y+7, 1, 1, '#f88');
    rect(c, x+10, y+4, 1, 1, '#f88');
  }},
  { name: 'broken_heart', draw(c, x, y) {
    rect(c, x+2, y+2, 2, 2, '#e44');
    rect(c, x+6, y+2, 2, 2, '#e44');
    rect(c, x+1, y+4, 2, 3, '#e44');
    rect(c, x+8, y+4, 2, 3, '#e44');
    rect(c, x+3, y+4, 5, 5, '#e44');
    rect(c, x+4, y+4, 3, 4, '#f66');
    rect(c, x+5, y+8, 2, 1, '#c33');
    rect(c, x+2, y+7, 1, 2, '#e44');
    rect(c, x+8, y+7, 1, 2, '#e44');
    rect(c, x+3, y+9, 1, 1, '#e44');
    rect(c, x+7, y+9, 1, 1, '#e44');
    rect(c, x+4, y+10, 2, 1, '#e44');
    rect(c, x+5, y+11, 1, 1, '#e44');
    hline(c, x+6, y+6, 2, '#111');
    vline(c, x+6, y+7, 2, '#111');
    hline(c, x+4, y+8, 1, '#111');
    hline(c, x+5, y+7, 1, '#111');
  }},
  { name: 'eye', draw(c, x, y) {
    rect(c, x+1, y+4, 12, 6, '#dde');
    rect(c, x+2, y+5, 10, 4, '#dde');
    rect(c, x+3, y+5, 8, 4, '#fff');
    rect(c, x+5, y+6, 4, 2, '#222');
    rect(c, x+6, y+6, 2, 2, '#aac');
    rect(c, x+6, y+7, 1, 1, '#fff');
    hline(c, x+4, y+4, 6, '#aac');
    hline(c, x+5, y+3, 4, '#aac');
    hline(c, x+6, y+2, 2, '#aac');
  }},
  { name: 'construct', draw(c, x, y) {
    rect(c, x+4, y+1, 6, 2, '#da0');
    rect(c, x+3, y+3, 8, 2, '#fc0');
    rect(c, x+2, y+5, 10, 1, '#da0');
    rect(c, x+1, y+6, 12, 4, '#fc0');
    rect(c, x+2, y+10, 10, 1, '#da0');
    rect(c, x+3, y+11, 8, 2, '#fc0');
    rect(c, x+5, y+3, 1, 2, '#888');
    rect(c, x+8, y+6, 1, 4, '#888');
    rect(c, x+5, y+11, 1, 2, '#888');
  }},
  { name: 'mole', draw(c, x, y) {
    rect(c, x+3, y+3, 8, 2, '#da0');
    rect(c, x+2, y+5, 10, 4, '#da0');
    rect(c, x+3, y+9, 8, 2, '#da0');
    rect(c, x+4, y+2, 6, 1, '#da0');
    rect(c, x+4, y+4, 2, 2, '#222');
    rect(c, x+8, y+4, 2, 2, '#222');
    rect(c, x+5, y+7, 4, 1, '#c80');
    rect(c, x+6, y+6, 2, 1, '#c80');
    rect(c, x+5, y+11, 1, 1, '#a80');
    rect(c, x+8, y+11, 1, 1, '#a80');
  }},
  { name: 'gem', draw(c, x, y) {
    hline(c, x+5, y+1, 4, '#6cf');
    hline(c, x+4, y+2, 6, '#6cf');
    hline(c, x+3, y+3, 8, '#6cf');
    hline(c, x+4, y+4, 6, '#6cf');
    hline(c, x+5, y+5, 4, '#6cf');
    hline(c, x+5, y+2, 4, '#aff');
    hline(c, x+8, y+3, 2, '#48b');
    rect(c, x+5, y+4, 4, 1, '#48b');
  }},
  { name: 'hexagon', draw(c, x, y) {
    hline(c, x+4, y+0, 6, '#aac');
    hline(c, x+3, y+1, 8, '#aac');
    hline(c, x+2, y+2, 10, '#aac');
    hline(c, x+1, y+3, 12, '#aac');
    hline(c, x+1, y+4, 12, '#aac');
    hline(c, x+1, y+5, 12, '#aac');
    hline(c, x+1, y+6, 12, '#aac');
    hline(c, x+1, y+7, 12, '#aac');
    hline(c, x+1, y+8, 12, '#aac');
    hline(c, x+1, y+9, 12, '#aac');
    hline(c, x+1, y+10, 12, '#aac');
    hline(c, x+2, y+11, 10, '#aac');
    hline(c, x+3, y+12, 8, '#aac');
    hline(c, x+4, y+13, 6, '#aac');
    rect(c, x+3, y+1, 2, 12, '#dde');
    rect(c, x+2, y+2, 2, 10, '#dde');
    rect(c, x+1, y+3, 2, 8, '#dde');
  }},
  { name: 'wave', draw(c, x, y) {
    hline(c, x+2, y+3, 3, '#6cf');
    hline(c, x+7, y+1, 3, '#6cf');
    hline(c, x+12, y+3, 2, '#6cf');
    hline(c, x+3, y+6, 4, '#6cf');
    hline(c, x+8, y+8, 3, '#6cf');
    hline(c, x+1, y+9, 2, '#6cf');
    hline(c, x+11, y+9, 1, '#6cf');
    hline(c, x+5, y+11, 3, '#6cf');
    hline(c, x+10, y+12, 4, '#6cf');
    hline(c, x+2, y+4, 1, '#aff');
    hline(c, x+8, y+2, 1, '#aff');
    hline(c, x+4, y+7, 1, '#aff');
    hline(c, x+10, y+9, 1, '#aff');
    hline(c, x+6, y+12, 1, '#aff');
  }},
];

const EMOJI_MAP = {
  '⚔': 'sword', '🛡': 'shield', '💰': 'coin', '💀': 'skull',
  '❤️': 'heart', '⭐': 'star', '⚙': 'gear', '🏆': 'trophy',
  '⚡': 'lightning', '🎯': 'target', '🔨': 'hammer', '📖': 'book',
  '▶': 'play', '⏸': 'pause', '⏩': 'ffwd', '📂': 'folder',
  '✅': 'check', '🏴': 'flag', '🔒': 'lock', '🔓': 'unlock',
  '☀️': 'sun', '🌙': 'moon', '🌧️': 'rain', '❄️': 'snow',
  '⛈️': 'storm', '🌫️': 'fog', '🌻': 'flower', '🌸': 'cherry',
  '👑': 'crown', '♾️': 'infinity', '👤': 'person', '🔥': 'fire',
  '💣': 'bomb', '💎': 'diamond', '👾': 'alien', '🃏': 'card',
  '📦': 'box', '💥': 'explosion', '🗑': 'trash', '✨': 'sparkle',
  '🛠️': 'tools', '⬆': 'arrow_up', '⬇': 'arrow_down', '⏳': 'hourglass',
  '🗼': 'tower', '🚀': 'rocket', '📌': 'pin', '🔄': 'refresh',
  '💾': 'save', '🎮': 'controller', '☠': 'skull2', '🦠': 'microbe',
  '🐌': 'snail', '💨': 'wind',   '📉': 'chart_down', '💔': 'broken_heart',
  '👊': 'fist', '👀': 'eye', '🏗️': 'construct', '🎉': 'star',
  '🪙': 'coin', '✨': 'sparkle', '🗑️': 'trash', '🏴': 'flag',
  '🌊': 'wave', '👹': 'skull2',
  '⚔️': 'sword', '🛡️': 'shield',
  '☠️': 'skull2', '⬡': 'hexagon',
};

export function initIconProvider() {
  if (_spriteCanvas) return;
  const totalIcons = ICONS.length;
  const rows = Math.ceil(totalIcons / COLS);
  const w = COLS * CELL;
  const h = rows * CELL;
  _spriteCanvas = document.createElement('canvas');
  _spriteCanvas.width = w;
  _spriteCanvas.height = h;
  const ctx = _spriteCanvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  ICONS.forEach((icon, i) => {
    const cx = (i % COLS) * CELL + PAD;
    const cy = Math.floor(i / COLS) * CELL + PAD;
    icon.draw(ctx, cx, cy);
    _icons[icon.name] = { col: i % COLS, row: Math.floor(i / COLS) };
  });
  _spriteDataURL = _spriteCanvas.toDataURL('image/png');
  _injectCSS();
}

function _injectCSS() {
  if (_cssInjected) return;
  _cssInjected = true;
  const totalIcons = ICONS.length;
  const rows = Math.ceil(totalIcons / COLS);
  const w = COLS * CELL;
  const h = rows * CELL;
  const css = `
.pix-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url(${_spriteDataURL}) no-repeat;
  background-size: ${w}px ${h}px;
  vertical-align: middle;
  flex-shrink: 0;
  image-rendering: pixelated;
}
.pix-icon.pix-sm { width: 12px; height: 12px; }
.pix-icon.pix-lg { width: 24px; height: 24px; }
.pix-icon.pix-xl { width: 32px; height: 32px; }
${ICONS.map((icon, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return `.pix-${icon.name} { background-position: -${col * CELL}px -${row * CELL}px; }`;
}).join('\n')}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
}

export function iconHTML(name, size) {
  const cls = size ? `pix-icon pix-${name} pix-${size}` : `pix-icon pix-${name}`;
  return `<span class="${cls}"></span>`;
}

export function iconElem(name, size) {
  const el = document.createElement('span');
  el.className = `pix-icon pix-${name}${size ? ` pix-${size}` : ''}`;
  return el;
}

export function replaceEmoji(text) {
  let result = '';
  let i = 0;
  const len = text.length;
  while (i < len) {
    const ch = text[i];
    const ch2 = text.substring(i, i + 2);
    let iconName = null;
    if (EMOJI_MAP[ch2] !== undefined) {
      iconName = EMOJI_MAP[ch2];
      if (iconName) {
        result += iconHTML(iconName);
        i += 2;
        continue;
      }
      i += 2;
      continue;
    }
    if (EMOJI_MAP[ch] !== undefined) {
      iconName = EMOJI_MAP[ch];
      if (iconName) {
        result += iconHTML(iconName);
        i += 1;
        continue;
      }
    }
    if (ch === '★') { result += iconHTML('star'); i++; continue; }
    if (ch === '☆') { result += iconHTML('star'); i++; continue; }
    if (ch === '✓') { result += iconHTML('check'); i++; continue; }
    if (ch === '✕') { result += iconHTML('check'); i++; continue; }
    if (ch === '▼') { result += iconHTML('arrow_down'); i++; continue; }
    if (ch === '■') { result += iconHTML('check'); i++; continue; }
    result += ch === '<' ? '&lt;' : ch === '>' ? '&gt;' : ch === '&' ? '&amp;' : ch;
    i++;
  }
  return result;
}

export function drawIcon(ctx, name, x, y, size) {
  if (!_spriteCanvas) return;
  const info = _icons[name];
  if (!info) return;
  const sx = info.col * CELL;
  const sy = info.row * CELL;
  const s = size || 16;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(_spriteCanvas, sx, sy, CELL, CELL, x, y, s, s);
  ctx.restore();
}

export function injectIconCSS(dataURL) {
  if (_cssInjected) return;
  _spriteDataURL = dataURL || _spriteDataURL;
  _injectCSS();
}
