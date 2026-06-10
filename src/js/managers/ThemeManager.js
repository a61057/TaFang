const THEMES = {
  naval: {
    name: '深蓝',
    nameEn: 'Naval Blue',
    vars: {
      '--bg-body': '#1a1a2e',
      '--bg-game': '#0f0f1a',
      '--bg-overlay': 'rgba(10,10,20,0.85)',
      '--bg-surface': 'rgba(22,33,62,0.95)',
      '--bg-surface-strong': 'rgba(22,33,62,0.97)',
      '--bg-tooltip': 'rgba(10,10,20,0.92)',
      '--bg-card': 'rgba(255,255,255,0.04)',
      '--bg-btn': 'rgba(255,255,255,0.06)',
      '--bg-btn-hover': 'rgba(255,255,255,0.14)',
      '--text-primary': '#e0e0e0',
      '--text-heading': '#dde',
      '--text-bright': '#e0e0f0',
      '--text-btn': '#c0c0e0',
      '--text-secondary': '#aab',
      '--text-muted': '#889',
      '--text-dim': '#667',
      '--text-dim2': '#556',
      '--text-gold': '#ffd700',
      '--text-gold-light': '#ffdd44',
      '--text-red': '#e74c3c',
      '--text-green': '#66dd66',
      '--color-accent': '#4a90d9',
      '--color-accent-hover': '#5aa0e9',
      '--color-accent-border': 'rgba(100,120,200,0.3)',
      '--color-gold': '#ffd700',
      '--color-red': '#e74c3c',
      '--color-green': '#66dd66',
      '--color-orange': '#ff8844',
      '--border-subtle': 'rgba(255,255,255,0.1)',
      '--border-default': 'rgba(255,255,255,0.15)',
      '--border-card': 'rgba(255,255,255,0.08)',
      '--gradient-hud': 'linear-gradient(180deg, rgba(22,33,62,0.95) 0%, rgba(22,33,62,0.7) 100%)',
      '--gradient-hud-bottom': 'linear-gradient(0deg, rgba(22,33,62,0.9) 0%, rgba(22,33,62,0.4) 100%)',
      '--gradient-surface': 'linear-gradient(135deg, rgba(22,33,62,0.97), rgba(30,40,80,0.97))',
    }
  },
  shadow: {
    name: '暗影',
    nameEn: 'Dark Shadow',
    vars: {
      '--bg-body': '#0a0a14',
      '--bg-game': '#05050a',
      '--bg-overlay': 'rgba(0,0,0,0.9)',
      '--bg-surface': 'rgba(15,12,25,0.95)',
      '--bg-surface-strong': 'rgba(10,8,20,0.97)',
      '--bg-tooltip': 'rgba(0,0,0,0.92)',
      '--bg-card': 'rgba(180,160,255,0.04)',
      '--bg-btn': 'rgba(180,160,255,0.06)',
      '--bg-btn-hover': 'rgba(180,160,255,0.14)',
      '--text-primary': '#c8c0d8',
      '--text-heading': '#d8d0ee',
      '--text-bright': '#d0c8e8',
      '--text-btn': '#b8aed0',
      '--text-secondary': '#8877aa',
      '--text-muted': '#665588',
      '--text-dim': '#443366',
      '--text-dim2': '#332255',
      '--text-gold': '#c8a0ff',
      '--text-gold-light': '#d8b8ff',
      '--text-red': '#cc4466',
      '--text-green': '#66cc88',
      '--color-accent': '#7c5cbf',
      '--color-accent-hover': '#8c6ccf',
      '--color-accent-border': 'rgba(120,100,180,0.3)',
      '--color-gold': '#c8a0ff',
      '--color-red': '#cc4466',
      '--color-green': '#66cc88',
      '--color-orange': '#cc7744',
      '--border-subtle': 'rgba(180,160,255,0.08)',
      '--border-default': 'rgba(180,160,255,0.12)',
      '--border-card': 'rgba(180,160,255,0.06)',
      '--gradient-hud': 'linear-gradient(180deg, rgba(15,12,25,0.95) 0%, rgba(15,12,25,0.7) 100%)',
      '--gradient-hud-bottom': 'linear-gradient(0deg, rgba(15,12,25,0.9) 0%, rgba(15,12,25,0.4) 100%)',
      '--gradient-surface': 'linear-gradient(135deg, rgba(15,12,25,0.97), rgba(25,18,40,0.97))',
    }
  },
  forest: {
    name: '翠绿',
    nameEn: 'Forest',
    vars: {
      '--bg-body': '#142114',
      '--bg-game': '#0a140a',
      '--bg-overlay': 'rgba(5,20,10,0.85)',
      '--bg-surface': 'rgba(18,40,25,0.95)',
      '--bg-surface-strong': 'rgba(15,35,22,0.97)',
      '--bg-tooltip': 'rgba(5,15,10,0.92)',
      '--bg-card': 'rgba(100,255,150,0.04)',
      '--bg-btn': 'rgba(100,255,150,0.06)',
      '--bg-btn-hover': 'rgba(100,255,150,0.14)',
      '--text-primary': '#b8d8c0',
      '--text-heading': '#c8e8d0',
      '--text-bright': '#d0f0d8',
      '--text-btn': '#a8c8b0',
      '--text-secondary': '#7aaa88',
      '--text-muted': '#5a8868',
      '--text-dim': '#3a6648',
      '--text-dim2': '#2a5538',
      '--text-gold': '#88dd66',
      '--text-gold-light': '#aaee88',
      '--text-red': '#cc5544',
      '--text-green': '#55cc66',
      '--color-accent': '#4a9a5a',
      '--color-accent-hover': '#5aaa6a',
      '--color-accent-border': 'rgba(80,160,100,0.3)',
      '--color-gold': '#88dd66',
      '--color-red': '#cc5544',
      '--color-green': '#55cc66',
      '--color-orange': '#bb8833',
      '--border-subtle': 'rgba(100,255,150,0.08)',
      '--border-default': 'rgba(100,255,150,0.12)',
      '--border-card': 'rgba(100,255,150,0.06)',
      '--gradient-hud': 'linear-gradient(180deg, rgba(18,40,25,0.95) 0%, rgba(18,40,25,0.7) 100%)',
      '--gradient-hud-bottom': 'linear-gradient(0deg, rgba(18,40,25,0.9) 0%, rgba(18,40,25,0.4) 100%)',
      '--gradient-surface': 'linear-gradient(135deg, rgba(18,40,25,0.97), rgba(25,55,35,0.97))',
    }
  },
  magma: {
    name: '熔岩',
    nameEn: 'Magma',
    vars: {
      '--bg-body': '#1e1410',
      '--bg-game': '#140a08',
      '--bg-overlay': 'rgba(20,8,5,0.85)',
      '--bg-surface': 'rgba(45,22,15,0.95)',
      '--bg-surface-strong': 'rgba(40,18,12,0.97)',
      '--bg-tooltip': 'rgba(20,8,5,0.92)',
      '--bg-card': 'rgba(255,150,80,0.04)',
      '--bg-btn': 'rgba(255,150,80,0.06)',
      '--bg-btn-hover': 'rgba(255,150,80,0.14)',
      '--text-primary': '#d8b898',
      '--text-heading': '#e8c8a8',
      '--text-bright': '#f0d8b8',
      '--text-btn': '#c8a888',
      '--text-secondary': '#aa8855',
      '--text-muted': '#886644',
      '--text-dim': '#664433',
      '--text-dim2': '#553322',
      '--text-gold': '#ff8844',
      '--text-gold-light': '#ffaa66',
      '--text-red': '#ff4433',
      '--text-green': '#cc8844',
      '--color-accent': '#cc6633',
      '--color-accent-hover': '#dd7744',
      '--color-accent-border': 'rgba(200,120,60,0.3)',
      '--color-gold': '#ff8844',
      '--color-red': '#ff4433',
      '--color-green': '#cc8844',
      '--color-orange': '#ff6622',
      '--border-subtle': 'rgba(255,150,80,0.08)',
      '--border-default': 'rgba(255,150,80,0.12)',
      '--border-card': 'rgba(255,150,80,0.06)',
      '--gradient-hud': 'linear-gradient(180deg, rgba(45,22,15,0.95) 0%, rgba(45,22,15,0.7) 100%)',
      '--gradient-hud-bottom': 'linear-gradient(0deg, rgba(45,22,15,0.9) 0%, rgba(45,22,15,0.4) 100%)',
      '--gradient-surface': 'linear-gradient(135deg, rgba(45,22,15,0.97), rgba(60,30,20,0.97))',
    }
  },
  cyber: {
    name: '赛博',
    nameEn: 'Cyberpunk',
    vars: {
      '--bg-body': '#0e0a1e',
      '--bg-game': '#080414',
      '--bg-overlay': 'rgba(5,0,20,0.85)',
      '--bg-surface': 'rgba(16,10,35,0.95)',
      '--bg-surface-strong': 'rgba(12,8,30,0.97)',
      '--bg-tooltip': 'rgba(5,0,20,0.92)',
      '--bg-card': 'rgba(0,255,255,0.04)',
      '--bg-btn': 'rgba(255,0,200,0.06)',
      '--bg-btn-hover': 'rgba(255,0,200,0.14)',
      '--text-primary': '#b8d0e0',
      '--text-heading': '#c8e0f0',
      '--text-bright': '#d0f0ff',
      '--text-btn': '#b0c8d8',
      '--text-secondary': '#66aacc',
      '--text-muted': '#4488aa',
      '--text-dim': '#336688',
      '--text-dim2': '#225577',
      '--text-gold': '#ff66ee',
      '--text-gold-light': '#ff88f0',
      '--text-red': '#ff3366',
      '--text-green': '#00dd88',
      '--color-accent': '#00ccdd',
      '--color-accent-hover': '#22ddee',
      '--color-accent-border': 'rgba(0,200,220,0.3)',
      '--color-gold': '#ff66ee',
      '--color-red': '#ff3366',
      '--color-green': '#00dd88',
      '--color-orange': '#ff8800',
      '--border-subtle': 'rgba(0,255,255,0.08)',
      '--border-default': 'rgba(255,0,200,0.12)',
      '--border-card': 'rgba(0,255,255,0.06)',
      '--gradient-hud': 'linear-gradient(180deg, rgba(16,10,35,0.95) 0%, rgba(16,10,35,0.7) 100%)',
      '--gradient-hud-bottom': 'linear-gradient(0deg, rgba(16,10,35,0.9) 0%, rgba(16,10,35,0.4) 100%)',
      '--gradient-surface': 'linear-gradient(135deg, rgba(16,10,35,0.97), rgba(30,10,50,0.97))',
    }
  }
};

const STORAGE_KEY = 'td_theme';

let _currentTheme = null;

export function getThemeNames() {
  return Object.keys(THEMES);
}

export function getTheme(name) {
  return THEMES[name] || THEMES.naval;
}

export function getCurrentTheme() {
  return _currentTheme || 'naval';
}

export function applyTheme(name) {
  const theme = THEMES[name];
  if (!theme) return;
  _currentTheme = name;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  try {
    localStorage.setItem(STORAGE_KEY, name);
  } catch (e) {
    console.warn('Failed to save theme:', e);
  }
}

export function loadTheme() {
  let saved = 'naval';
  try {
    saved = localStorage.getItem(STORAGE_KEY) || 'naval';
  } catch (e) {
    console.warn('Failed to load theme:', e);
  }
  if (!THEMES[saved]) saved = 'naval';
  applyTheme(saved);
  return saved;
}
