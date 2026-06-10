import { GameEngine } from './engine/GameEngine.js';
import { GRID_WIDTH, GRID_HEIGHT } from './config/constants.js';
import { ACHIEVEMENTS } from './config/achievements.js';
import { t, th, getLanguage, setLanguage, setEmojiReplacer } from './config/locale.js';
import { MainMenu } from './ui/MainMenu.js';
import { initIconProvider, replaceEmoji, iconHTML, iconElem } from './ui/IconProvider.js';
import { loadTheme, getThemeNames, getCurrentTheme, applyTheme } from './managers/ThemeManager.js';
import { ChallengePanel } from './ui/ChallengePanel.js';
import { TalentPanel } from './ui/TalentPanel.js';
import { MapSelectPanel } from './ui/MapSelectPanel.js';
import { getChallenge } from './config/challengeData.js';

let engine = null;
let mainMenu = null;
let challengePanel = null;
let talentPanel = null;
let mapSelectPanel = null;
let _pendingMode = null;
let _pendingChallengeId = null;
const achievementNotifyEl = document.getElementById('achievementNotify');
const achIcon = document.getElementById('achIcon');
const achName = document.getElementById('achName');
const achDesc = document.getElementById('achDesc');

function init() {
  initIconProvider();
  setEmojiReplacer(replaceEmoji);
  loadTheme();
  const hash = window.location.hash;

  // Child windows - don't start game engine
  if (hash === '#settings') {
    document.getElementById('gameContainer').style.display = 'none';
    initSettingsWindow();
    return;
  } else if (hash === '#achievements') {
    document.getElementById('gameContainer').style.display = 'none';
    initAchievementsWindow();
    return;
  }

  const canvas = document.getElementById('gameCanvas');
  const container = document.getElementById('gameContainer');

  engine = new GameEngine(canvas);
  handleResize();

  talentPanel = new TalentPanel();
  engine.setTalentPanel(talentPanel);

  mapSelectPanel = new MapSelectPanel(
    (mapId) => {
      if (_pendingMode) {
        engine.startGame(_pendingMode, mapId);
        _pendingMode = null;
      } else if (_pendingChallengeId) {
        const ch = getChallenge(_pendingChallengeId);
        if (ch) {
          engine.startChallenge(_pendingChallengeId, ch.modifiers, ch.waves, mapId);
        }
        _pendingChallengeId = null;
      }
    },
    () => {
      mainMenu.show();
    }
  );

  challengePanel = new ChallengePanel((challengeId) => {
    challengePanel.hide();
    const ch = getChallenge(challengeId);
    if (ch) {
      _pendingChallengeId = challengeId;
      mapSelectPanel.show(t('challenge.title') + ' — ' + t('map.select'));
    }
  });

  // Show main menu
  mainMenu = new MainMenu(
    () => { // Campaign
      _pendingMode = 'campaign';
      mapSelectPanel.show(t('menu.campaign') + ' — ' + t('map.select'));
    },
    () => { // Endless
      _pendingMode = 'endless';
      mapSelectPanel.show(t('menu.endless') + ' — ' + t('map.select'));
    },
    () => { // Tutorial
      _pendingMode = 'tutorial';
      mapSelectPanel.show(t('menu.tutorial') + ' — ' + t('map.select'));
    },
    () => { // Load Game
      engine.showLoadDialog();
    },
    () => { // Settings
      window.location.hash = '#settings';
      window.location.reload();
    },
    () => { // Achievements
      window.location.hash = '#achievements';
      window.location.reload();
    },
    () => { // Challenge
      challengePanel.show();
    },
    () => { // Talents
      talentPanel.show();
    }
  );
  engine.mainMenu = mainMenu;
  mainMenu.show();

  // Achievement listener
  engine.on('achievement', (ach) => {
    showAchievementNotification(ach);
  });

  // Save/Load notifications
  engine.on('save-complete', (slot) => {
    showNotification(t('notify.saveComplete', slot));
  });

  engine.on('load-complete', (slot) => {
    mainMenu.hide();
    document.getElementById('gameContainer').style.display = '';
    showNotification(t('notify.loadComplete', slot));
  });

  engine.on('wave-complete', ({ wave, reward, perfect }) => {
    if (perfect) {
      showNotification(t('notify.waveComplete', wave, reward));
    }
  });

  engine.on('random-event', (evt) => {
    const icons = { positive: 'check', negative: 'skull', neutral: 'box' };
    showNotification(`${iconHTML(icons[evt.type] || 'pin')} ${t('event.' + evt.id)}`);
  });

  engine.on('weather-change', (weather) => {
    const icons = { clear: 'sun', rainy: 'rain', storm: 'storm', blizzard: 'snow', fog: 'fog' };
    showNotification(`${iconHTML(icons[weather.id] || 'sun')} ${t('weather.' + weather.id)}`);
  });

  engine.on('daynight-change', (phase) => {
    showNotification(phase === 0 ? th('notify.day') : th('notify.night'));
  });

  engine.on('faction-change', (bonuses) => {
    const entries = Object.entries(bonuses);
    if (entries.length === 0) return;
    const lines = entries.map(([f, thresholds]) => `${iconHTML('flag')} ${t('faction.' + f)} ${Math.max(...thresholds)}/9`).join(' ');
    showNotification(lines);
  });
}

function handleResize() {
  const canvas = document.getElementById('gameCanvas');
  const container = document.getElementById('gameContainer');
  const hud = document.getElementById('hud');

  let hudHeight = 0;
  if (hud) {
    hudHeight = hud.offsetHeight;
    container.style.top = (32 + hudHeight) + 'px';
  }

  const availW = container.clientWidth;
  const availH = container.clientHeight;

  const scale = Math.min(availW / GRID_WIDTH, availH / GRID_HEIGHT);
  const dispW = Math.floor(GRID_WIDTH * scale);
  const dispH = Math.floor(GRID_HEIGHT * scale);

  canvas.style.width = dispW + 'px';
  canvas.style.height = dispH + 'px';
}

function showAchievementNotification(ach) {
  const achNameKey = `achievement.${ach.id}.name`;
  const achDescKey = `achievement.${ach.id}.desc`;
  achIcon.innerHTML = replaceEmoji(ach.icon);
  achName.innerHTML = th(achNameKey);
  achDesc.innerHTML = th(achDescKey);
  achievementNotifyEl.classList.add('show');
  setTimeout(() => {
    achievementNotifyEl.classList.remove('show');
  }, 3500);
}

function showNotification(html) {
  const el = document.createElement('div');
  el.className = 'notification';
  el.innerHTML = html;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function initSettingsWindow() {
  document.getElementById('gameContainer').style.display = 'none';

  const app = document.createElement('div');
  app.style.cssText = 'padding:40px;max-width:500px;margin:0 auto;';

  const currentLang = getLanguage();

  app.innerHTML = `
    <h2 style="color:#dde;margin-bottom:24px;font-size:22px;">${t('settings.title')}</h2>

    <div class="settings-section">
      <h3>${t('settings.audio')}</h3>
      <div class="setting-row">
        <label>${t('settings.masterVolume')}</label>
        <input type="range" id="masterVolume" min="0" max="100" value="70">
      </div>
      <div class="setting-row">
        <label>${t('settings.sfxVolume')}</label>
        <input type="range" id="sfxVolume" min="0" max="100" value="70">
      </div>
      <div class="setting-row">
        <label>${t('settings.music')}</label>
        <label class="toggle-switch">
          <input type="checkbox" id="musicEnabled" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
      <div class="setting-row">
        <label>${t('settings.soundEffects')}</label>
        <label class="toggle-switch">
          <input type="checkbox" id="sfxEnabled" checked>
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3>${t('settings.display')}</h3>
      <div class="setting-row">
        <label>${t('settings.showFps')}</label>
        <label class="toggle-switch">
          <input type="checkbox" id="showFps">
          <span class="toggle-slider"></span>
        </label>
      </div>
    </div>

    <div class="settings-section">
      <h3>${t('settings.game')}</h3>
      <div class="setting-row">
        <label>${t('settings.gameSpeed')}</label>
        <select id="defaultSpeed">
          <option value="1">${t('settings.speed1x')}</option>
          <option value="2" selected>${t('settings.speed2x')}</option>
          <option value="4">${t('settings.speed4x')}</option>
        </select>
      </div>
      <div class="setting-row">
        <label>${t('settings.language')}</label>
        <select id="languageSelect">
          <option value="en" ${currentLang === 'en' ? 'selected' : ''}>${t('lang.en')}</option>
          <option value="zh" ${currentLang === 'zh' ? 'selected' : ''}>${t('lang.zh')}</option>
        </select>
      </div>
      <div class="setting-row">
        <label>${t('settings.theme')}</label>
        <select id="themeSelect">
          ${getThemeNames().map(name =>
            `<option value="${name}" ${getCurrentTheme() === name ? 'selected' : ''}>${t('theme.' + name)}</option>`
          ).join('')}
        </select>
      </div>
    </div>

    <button class="hud-btn primary" id="btnSettingsClose" style="margin-top:20px;">${t('settings.close')}</button>
  `;

  document.body.appendChild(app);

  // Load settings
  if (window.electronAPI) {
    window.electronAPI.getSettings().then(result => {
      if (result.success && result.data) {
        applySettings(result.data);
      }
    });
  } else {
    const saved = localStorage.getItem('td_settings');
    if (saved) {
      try {
        applySettings(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse saved settings:', e);
      }
    }
  }

  // Save on change
  function saveSettings() {
    const data = {
      masterVolume: parseInt(document.getElementById('masterVolume').value) / 100,
      sfxVolume: parseInt(document.getElementById('sfxVolume').value) / 100,
      musicEnabled: document.getElementById('musicEnabled').checked,
      sfxEnabled: document.getElementById('sfxEnabled').checked,
      showFps: document.getElementById('showFps').checked,
      defaultSpeed: parseInt(document.getElementById('defaultSpeed').value),
      language: document.getElementById('languageSelect').value,
      theme: document.getElementById('themeSelect').value
    };
    if (window.electronAPI) {
      window.electronAPI.setSettings(data);
      window.electronAPI.sendSettings(data);
    } else {
      localStorage.setItem('td_settings', JSON.stringify(data));
    }
  }

  document.querySelectorAll('#masterVolume, #sfxVolume, #musicEnabled, #sfxEnabled, #showFps, #defaultSpeed, #languageSelect, #themeSelect').forEach(el => {
    el.addEventListener('change', saveSettings);
    el.addEventListener('input', saveSettings);
  });

  document.getElementById('btnSettingsClose').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.close();
    else window.location.href = window.location.href.replace('#settings', '');
  });

  function refreshSettingsLabels() {
    const lang = getLanguage();
    document.querySelector('#btnSettingsClose').textContent = t('settings.close');
    document.querySelector('#masterVolume').previousElementSibling.textContent = t('settings.masterVolume');
    document.querySelector('#sfxVolume').previousElementSibling.textContent = t('settings.sfxVolume');
    document.querySelector('#musicEnabled').closest('.setting-row').previousElementSibling.previousElementSibling.textContent = t('settings.audio');
    // section titles
    const sections = app.querySelectorAll('.settings-section h3');
    sections[0].textContent = t('settings.audio');
    sections[1].textContent = t('settings.display');
    sections[2].textContent = t('settings.game');
    // labels by sibling structure
    const rows = app.querySelectorAll('.setting-row');
    rows[0].querySelector('label').textContent = t('settings.masterVolume');
    rows[1].querySelector('label').textContent = t('settings.sfxVolume');
    rows[2].querySelector('label').textContent = t('settings.music');
    rows[3].querySelector('label').textContent = t('settings.soundEffects');
    rows[4].querySelector('label').textContent = t('settings.showFps');
    rows[5].querySelector('label').textContent = t('settings.gameSpeed');
    rows[6].querySelector('label').textContent = t('settings.language');
    rows[7].querySelector('label').textContent = t('settings.theme');
    const langOpts = document.querySelectorAll('#languageSelect option');
    langOpts[0].textContent = t('lang.en');
    langOpts[1].textContent = t('lang.zh');
    const themeOpts = document.querySelectorAll('#themeSelect option');
    themeOpts[0].textContent = t('theme.naval');
    themeOpts[1].textContent = t('theme.shadow');
    themeOpts[2].textContent = t('theme.forest');
    themeOpts[3].textContent = t('theme.magma');
    themeOpts[4].textContent = t('theme.cyber');
  }

  document.getElementById('languageSelect').addEventListener('change', (e) => {
    setLanguage(e.target.value);
    refreshSettingsLabels();
    if (window.electronAPI) {
      window.electronAPI.sendSettings({ language: e.target.value });
    }
  });

  document.getElementById('themeSelect').addEventListener('change', (e) => {
    applyTheme(e.target.value);
  });

  if (window.electronAPI) {
    window.electronAPI.onSettingsLoaded((data) => applySettings(data));
    // Request current settings
    window.electronAPI.onRelaySettings(() => {
      window.electronAPI.getSettings().then(result => {
        if (result.success && result.data) window.electronAPI.sendSettings(result.data);
      });
    });
  }
}

function applySettings(data) {
  if (data.masterVolume !== undefined) document.getElementById('masterVolume').value = data.masterVolume * 100;
  if (data.sfxVolume !== undefined) document.getElementById('sfxVolume').value = data.sfxVolume * 100;
  if (data.musicEnabled !== undefined) document.getElementById('musicEnabled').checked = data.musicEnabled;
  if (data.sfxEnabled !== undefined) document.getElementById('sfxEnabled').checked = data.sfxEnabled;
  if (data.showFps !== undefined) document.getElementById('showFps').checked = data.showFps;
  if (data.defaultSpeed !== undefined) document.getElementById('defaultSpeed').value = data.defaultSpeed;
  if (data.language !== undefined) {
    setLanguage(data.language);
    document.getElementById('languageSelect').value = data.language;
  }
  if (data.theme !== undefined) {
    document.getElementById('themeSelect').value = data.theme;
    applyTheme(data.theme);
  }
}

function initAchievementsWindow() {
  document.getElementById('gameContainer').style.display = 'none';

  const app = document.createElement('div');
  app.style.cssText = 'padding:40px;max-width:500px;margin:0 auto;';

  app.innerHTML = `
    <h2 style="color:#dde;margin-bottom:24px;font-size:22px;">${t('achievements.title')}</h2>
    <div id="achievementsList"></div>
    <button class="hud-btn primary" id="btnAchClose" style="margin-top:20px;">${t('achievements.close')}</button>
  `;

  document.body.appendChild(app);

  const list = document.getElementById('achievementsList');
  const achievements = JSON.parse(localStorage.getItem('td_achievements') || '{}');

  for (const ach of ACHIEVEMENTS) {
    const unlocked = achievements[ach.id];
    const div = document.createElement('div');
    div.style.cssText = `
      display:flex;align-items:center;gap:12px;
      padding:12px;margin-bottom:8px;
      background: ${unlocked ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)'};
      border: 1px solid ${unlocked ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)'};
      border-radius: 6px;
    `;
    const achNameKey = `achievement.${ach.id}.name`;
    const achDescKey = `achievement.${ach.id}.desc`;
    div.innerHTML = `
      <span style="font-size:28px;opacity:${unlocked ? 1 : 0.3};">${replaceEmoji(ach.icon)}</span>
      <div>
        <div style="font-weight:600;color:${unlocked ? '#ffd700' : '#667'};">${t(achNameKey)}</div>
        <div style="font-size:12px;color:#889;">${t(achDescKey)}</div>
        <div style="font-size:10px;color:#556;margin-top:2px;">
          ${unlocked ? `${t('achievements.unlocked', new Date(unlocked).toLocaleDateString())}` : t('achievements.locked')}
        </div>
      </div>
    `;
    list.appendChild(div);
  }

  document.getElementById('btnAchClose').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.close();
    else window.location.href = window.location.href.replace('#achievements', '');
  });
}

// Global error handlers
window.addEventListener('error', (e) => {
  console.error('[Global Error]', e.error?.message || e.message, 'at', e.filename, 'line', e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[Unhandled Promise]', e.reason?.message || e.reason);
});

// Resize handler
window.addEventListener('resize', handleResize);

// Init when ready
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
