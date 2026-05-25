// Grid and map
export const COLS = 24;
export const ROWS = 18;
export const TILE_SIZE = 40;
export const GRID_WIDTH = COLS * TILE_SIZE;
export const GRID_HEIGHT = ROWS * TILE_SIZE;

// Terrain types
export const TERRAIN = {
  NORMAL: 0,
  PATH: 1,
  BUILDABLE: 2,
  START: 3,
  END: 4,
  SWAMP: 5,
  HIGHLAND: 6,
  BLOCKED: 7,
  GRASS: 8
};

export const TERRAIN_COLORS = {
  0: '#2d5a27',
  1: '#8b7355',
  2: '#3a7d32',
  3: '#4a90d9',
  4: '#d94a4a',
  5: '#2a5a4a',
   6: '#6b8e23',
   7: '#1a1a1a',
   8: '#5a9e4a'
};

// Economy
export const STARTING_GOLD = 300;
export const STARTING_LIVES = 20;
export const SELL_REFUND_RATE = 0.7;

// Wave settings
export const PREP_TIME = 15;
export const WAVE_BASE_REWARD = 80;
export const PER_WAVE_REWARD = 15;
export const BOSS_INTERVAL = 5;

// Game speeds
export const GAME_SPEEDS = [1, 2, 4];

// Tower limits
export const MAX_TOWER_LEVEL = 3;

// Enemy movement
export const ENEMY_PATH_INTERPOLATION = 'linear';

// Hero
export const HERO_START_X = 0;
export const HERO_START_Y = 0;
export const HERO_BASE_HP = 300;
export const HERO_BASE_ATTACK = 20;
export const HERO_BASE_ATTACK_RANGE = 150;
export const HERO_BASE_ATTACK_SPEED = 1.2;
export const HERO_XP_PER_KILL = 10;
export const HERO_XP_PER_LEVEL = 100;
export const HERO_MAX_LEVEL = 10;
export const HERO_REVIVE_COST = 50;

// Factions
export const FACTIONS = {
  HUMAN:  { id: 'human', name: 'Human' },
  ELF:    { id: 'elf', name: 'Elf' },
  MACHINE:{ id: 'machine', name: 'Machine' },
  UNDEAD: { id: 'undead', name: 'Undead' }
};
export const FACTION_BREAKPOINTS = [3, 6, 9];
export const FACTION_BONUS_DESCRIPTION = {
  human:  { 3: 'Tower attack speed +15%', 6: 'Tower attack speed +30%', 9: 'Tower attack speed +50%' },
  elf:    { 3: 'Range +10%, chance to entangle', 6: 'Range +20%, entangle chance +', 9: 'Range +30%, guaranteed entangle' },
  machine:{ 3: '15% splash on hit', 6: '25% splash on hit', 9: '40% splash on hit' },
  undead: { 3: 'Spawn skeleton on kill (20%)', 6: 'Spawn skeleton (35%)', 9: 'Spawn skeleton (50%)' }
};

// Weather
export const WEATHER_TYPES = {
  CLEAR:    { id: 'clear', name: 'Clear - no effects' },
  RAINY:    { id: 'rainy', name: 'Rainy - enemies -10% speed, tower range -10%' },
  STORM:    { id: 'storm', name: 'Thunderstorm - random strikes' },
  BLIZZARD: { id: 'blizzard', name: 'Blizzard - all units -20% speed/attack speed' },
  FOG:      { id: 'fog', name: 'Fog - enemies partially hidden' }
};
export const WEATHER_CHANGE_INTERVAL = 3;
export const DAY_NIGHT_INTERVAL = 2;
export const DAY_NIGHT_CYCLE = { DAY: 0, NIGHT: 1 };

// Event config
export const EVENT_CHANCE = 0.35;
export const EVENT_TYPES_COUNT = 20;
