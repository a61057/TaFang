const PALETTE = {
  skin: '#e8c880',
  skinShadow: '#c4a060',
  skinDark: '#2a2a3a',
  blue: '#4a90d9',
  blueDark: '#2a6aaa',
  blueLight: '#88bbee',
  gray: '#888899',
  grayDark: '#555566',
  grayLight: '#ccccdd',
  white: '#ffffff',
  green: '#5a8a4a',
  greenDark: '#3a5a2a',
  brown: '#8a7a5a',
  brownDark: '#5a4a2a',
  red: '#cc5555',
  redDark: '#883333',
  purple: '#6a4a7a',
  purpleDark: '#3a2a4a',
  coat: '#ddeeff',
  gold: '#ffd700',
};

function createCanvas(size) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return c;
}

function fillCircle(ctx, cx, cy, r, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCommander(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders
  fillRect(ctx, cx - 12, cy + 6, 24, 10, PALETTE.blueDark);
  fillRect(ctx, cx - 14, cy + 8, 28, 8, PALETTE.blue);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);
  fillCircle(ctx, cx, cy - 5, 9, PALETTE.blue);
  fillRect(ctx, cx - 9, cy - 6, 18, 4, PALETTE.blue);
  // Helmet visor
  fillRect(ctx, cx - 5, cy - 4, 10, 2, PALETTE.blueLight);
  fillRect(ctx, cx - 3, cy - 4, 6, 2, PALETTE.white);

  // Eyes
  fillRect(ctx, cx - 4, cy - 1, 2, 2, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy - 1, 2, 2, PALETTE.skinDark);

  // Mouth
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);

  return c;
}

function drawSoldier(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders
  fillRect(ctx, cx - 14, cy + 7, 28, 10, PALETTE.grayDark);
  fillRect(ctx, cx - 12, cy + 9, 24, 6, PALETTE.gray);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);

  // Full helmet
  fillCircle(ctx, cx, cy - 5, 9, PALETTE.gray);
  fillRect(ctx, cx - 9, cy - 6, 18, 5, PALETTE.gray);
  // Helmet visor
  fillRect(ctx, cx - 6, cy - 3, 12, 3, PALETTE.grayDark);
  fillRect(ctx, cx - 4, cy - 3, 8, 3, PALETTE.grayLight);
  // Helmet slit
  fillRect(ctx, cx - 3, cy - 2, 6, 1, PALETTE.skinDark);

  // Eyes
  fillRect(ctx, cx - 4, cy, 2, 2, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy, 2, 2, PALETTE.skinDark);

  // Mouth
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);

  return c;
}

function drawScout(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders
  fillRect(ctx, cx - 12, cy + 7, 24, 10, PALETTE.greenDark);
  fillRect(ctx, cx - 10, cy + 9, 20, 6, PALETTE.green);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);

  // Hood
  fillCircle(ctx, cx, cy - 5, 9, PALETTE.green);
  fillRect(ctx, cx - 9, cy - 6, 18, 6, PALETTE.green);
  fillRect(ctx, cx - 8, cy, 16, 4, PALETTE.green);
  // Hood opening
  fillRect(ctx, cx - 5, cy, 10, 3, PALETTE.skin);

  // Eyes
  fillRect(ctx, cx - 4, cy - 1, 2, 2, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy - 1, 2, 2, PALETTE.skinDark);
  fillRect(ctx, cx - 4, cy - 2, 2, 1, PALETTE.grayLight);
  fillRect(ctx, cx + 2, cy - 2, 2, 1, PALETTE.grayLight);

  // Mouth
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);

  return c;
}

function drawScientist(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders
  fillRect(ctx, cx - 12, cy + 6, 24, 12, PALETTE.coat);
  fillRect(ctx, cx - 10, cy + 8, 20, 8, PALETTE.white);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);

  // Hair
  fillCircle(ctx, cx, cy - 6, 8, PALETTE.grayDark);
  fillRect(ctx, cx - 8, cy - 7, 16, 5, PALETTE.grayDark);

  // Glasses
  fillRect(ctx, cx - 6, cy - 1, 5, 3, PALETTE.skinDark);
  fillRect(ctx, cx + 1, cy - 1, 5, 3, PALETTE.skinDark);
  fillRect(ctx, cx - 7, cy - 1, 1, 3, PALETTE.gray);
  fillRect(ctx, cx + 6, cy - 1, 1, 3, PALETTE.gray);
  fillRect(ctx, cx - 7, cy, 14, 1, PALETTE.gray);

  // Eyes behind glasses
  fillRect(ctx, cx - 4, cy, 2, 1, PALETTE.white);
  fillRect(ctx, cx + 2, cy, 2, 1, PALETTE.white);
  fillRect(ctx, cx - 3, cy, 1, 1, PALETTE.skinDark);
  fillRect(ctx, cx + 3, cy, 1, 1, PALETTE.skinDark);

  // Mouth
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);

  return c;
}

function drawRefugee(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders (worn clothes)
  fillRect(ctx, cx - 12, cy + 7, 24, 10, PALETTE.brownDark);
  fillRect(ctx, cx - 10, cy + 9, 20, 6, PALETTE.brown);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);

  // Hair (messy)
  fillCircle(ctx, cx, cy - 6, 8, PALETTE.brownDark);
  fillRect(ctx, cx - 8, cy - 7, 16, 5, PALETTE.brownDark);
  fillRect(ctx, cx - 7, cy - 3, 2, 4, PALETTE.brownDark);
  fillRect(ctx, cx + 5, cy - 3, 2, 4, PALETTE.brownDark);

  // Eyes (worried)
  fillRect(ctx, cx - 4, cy - 1, 2, 2, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy - 1, 2, 2, PALETTE.skinDark);

  // Eyebrows (worried)
  fillRect(ctx, cx - 5, cy - 3, 4, 1, PALETTE.brownDark);
  fillRect(ctx, cx + 1, cy - 3, 4, 1, PALETTE.brownDark);

  // Mouth (slight frown)
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);
  fillRect(ctx, cx - 1, cy + 4, 2, 1, PALETTE.skinDark);

  // Dirt mark
  fillRect(ctx, cx + 3, cy + 1, 2, 2, PALETTE.brownDark);

  return c;
}

function drawSpy(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shoulders (dark cloak)
  fillRect(ctx, cx - 13, cy + 7, 26, 12, PALETTE.purpleDark);
  fillRect(ctx, cx - 11, cy + 9, 22, 8, PALETTE.purple);

  // Head
  fillCircle(ctx, cx, cy - 1, 9, PALETTE.skin);

  // Hood
  fillCircle(ctx, cx, cy - 6, 9, PALETTE.purpleDark);
  fillRect(ctx, cx - 9, cy - 7, 18, 7, PALETTE.purpleDark);
  fillRect(ctx, cx - 8, cy, 16, 4, PALETTE.purpleDark);
  fillRect(ctx, cx - 5, cy, 10, 3, PALETTE.skin);
  fillRect(ctx, cx - 9, cy + 2, 18, 3, PALETTE.purpleDark);

  // Red scarf
  fillRect(ctx, cx - 5, cy + 4, 10, 3, PALETTE.red);

  // Eyes (sharp)
  fillRect(ctx, cx - 5, cy - 1, 3, 2, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy - 1, 3, 2, PALETTE.skinDark);
  fillRect(ctx, cx - 5, cy - 2, 3, 1, PALETTE.white);
  fillRect(ctx, cx + 2, cy - 2, 3, 1, PALETTE.white);

  // Mouth (smirk)
  fillRect(ctx, cx - 2, cy + 3, 4, 1, PALETTE.skinDark);
  fillRect(ctx, cx + 2, cy + 3, 2, 1, PALETTE.redDark);

  return c;
}

function drawAlly(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Shield shape
  fillRect(ctx, cx - 9, cy - 8, 18, 18, PALETTE.blue);
  fillRect(ctx, cx - 7, cy - 6, 14, 14, PALETTE.white);
  fillRect(ctx, cx - 5, cy - 4, 10, 10, PALETTE.blue);

  // Star
  fillRect(ctx, cx - 2, cy - 5, 4, 1, PALETTE.gold);
  fillRect(ctx, cx - 1, cy - 4, 2, 8, PALETTE.gold);
  fillRect(ctx, cx - 4, cy - 1, 8, 2, PALETTE.gold);
  fillRect(ctx, cx - 2, cy + 1, 4, 2, PALETTE.gold);
  fillRect(ctx, cx - 3, cy - 2, 1, 4, PALETTE.gold);
  fillRect(ctx, cx + 2, cy - 2, 1, 4, PALETTE.gold);
  fillRect(ctx, cx - 5, cy - 2, 1, 3, PALETTE.gold);
  fillRect(ctx, cx + 4, cy - 2, 1, 3, PALETTE.gold);

  return c;
}

function drawEnemy(size) {
  const c = createCanvas(size);
  const ctx = c.getContext('2d');
  const cx = size / 2, cy = size / 2;

  // Skull/evil face
  fillCircle(ctx, cx, cy - 1, 10, PALETTE.grayDark);
  fillCircle(ctx, cx, cy - 1, 8, PALETTE.grayLight);

  // Eyes (angry red)
  fillRect(ctx, cx - 5, cy - 3, 4, 3, PALETTE.red);
  fillRect(ctx, cx + 1, cy - 3, 4, 3, PALETTE.red);
  fillRect(ctx, cx - 4, cy - 3, 2, 3, PALETTE.redDark);
  fillRect(ctx, cx + 2, cy - 3, 2, 3, PALETTE.redDark);

  // Mouth (grin)
  fillRect(ctx, cx - 4, cy + 2, 8, 3, PALETTE.skinDark);
  fillRect(ctx, cx - 3, cy + 2, 6, 1, PALETTE.white);
  fillRect(ctx, cx - 1, cy + 3, 2, 1, PALETTE.white);

  // Horns
  fillRect(ctx, cx - 6, cy - 6, 3, 4, PALETTE.grayDark);
  fillRect(ctx, cx + 3, cy - 6, 3, 4, PALETTE.grayDark);
  fillRect(ctx, cx - 5, cy - 7, 1, 2, PALETTE.grayDark);
  fillRect(ctx, cx + 4, cy - 7, 1, 2, PALETTE.grayDark);

  return c;
}

const DRAW_FUNCTIONS = {
  commander: drawCommander,
  soldier: drawSoldier,
  scout: drawScout,
  scientist: drawScientist,
  refugee: drawRefugee,
  spy: drawSpy,
  faction_ally: drawAlly,
  faction_enemy: drawEnemy,
};

export function generatePortrait(speakerId, size = 36) {
  const fn = DRAW_FUNCTIONS[speakerId];
  if (!fn) return null;
  return fn(size);
}

export function getPortraitDataUrl(speakerId, size = 36) {
  const canvas = generatePortrait(speakerId, size);
  if (!canvas) return null;
  return canvas.toDataURL();
}
