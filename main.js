const { app, BrowserWindow, ipcMain, Tray, Menu, Notification, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let settingsWindow = null;
let achievementsWindow = null;
let tray = null;
let isQuitting = false;

const userDataPath = app.getPath('userData');
const savesDir = path.join(userDataPath, 'saves');
const settingsPath = path.join(userDataPath, 'settings.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    frame: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: process.argv.includes('--dev')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, 'src', 'icon.png');
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
  } catch {
    trayIcon = nativeImage.createEmpty();
  }
  tray = new Tray(trayIcon);
  tray.setToolTip('Tower Defense');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Window', click: () => { if (mainWindow) mainWindow.show(); } },
    { label: 'Quit', click: () => { isQuitting = true; app.quit(); } }
  ]);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => { if (mainWindow) mainWindow.show(); });
}

function createSettingsWindow() {
  if (settingsWindow) { settingsWindow.focus(); return; }
  settingsWindow = new BrowserWindow({
    width: 600,
    height: 500,
    parent: mainWindow,
    modal: true,
    frame: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  settingsWindow.loadFile(path.join(__dirname, 'src', 'index.html'), { hash: 'settings' });
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function createAchievementsWindow() {
  if (achievementsWindow) { achievementsWindow.focus(); return; }
  achievementsWindow = new BrowserWindow({
    width: 700,
    height: 600,
    parent: mainWindow,
    modal: true,
    frame: false,
    backgroundColor: '#1a1a2e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  achievementsWindow.loadFile(path.join(__dirname, 'src', 'index.html'), { hash: 'achievements' });
  achievementsWindow.on('closed', () => { achievementsWindow = null; });
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+P', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'toggle-pause');
  });
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'quick-save');
  });
  globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'quick-load');
  });
  globalShortcut.register('CommandOrControl+Shift+R', () => {
    if (mainWindow) mainWindow.webContents.send('shortcut', 'reset-game');
  });
}

app.whenReady().then(() => {
  ensureDir(savesDir);
  createMainWindow();
  createTray();
  registerShortcuts();

  app.on('activate', () => {
    if (mainWindow) mainWindow.show();
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (tray) tray.destroy();
});

// IPC Handlers

// Window controls
ipcMain.on('window-minimize', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
  }
});
ipcMain.on('window-close', () => {
  if (settingsWindow) settingsWindow.close();
  else if (achievementsWindow) achievementsWindow.close();
  else if (mainWindow) { isQuitting = true; app.quit(); }
});

ipcMain.on('open-settings', () => createSettingsWindow());
ipcMain.on('open-achievements', () => createAchievementsWindow());

// File operations
ipcMain.handle('save-game', async (event, slot, data) => {
  try {
    const filePath = path.join(savesDir, `save_${slot}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-game', async (event, slot) => {
  try {
    const filePath = path.join(savesDir, `save_${slot}.json`);
    if (!fs.existsSync(filePath)) return { success: false, error: 'No save found' };
    const data = fs.readFileSync(filePath, 'utf-8');
    return { success: true, data: JSON.parse(data) };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('list-saves', async () => {
  try {
    ensureDir(savesDir);
    const files = fs.readdirSync(savesDir).filter(f => f.startsWith('save_') && f.endsWith('.json'));
    const saves = files.map(f => {
      const stat = fs.statSync(path.join(savesDir, f));
      const slot = parseInt(f.replace('save_', '').replace('.json', ''));
      return { slot, modified: stat.mtime.toISOString() };
    });
    return { success: true, saves };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-save', async (event, slot) => {
  try {
    const filePath = path.join(savesDir, `save_${slot}.json`);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Settings
ipcMain.handle('get-settings', async () => {
  try {
    if (fs.existsSync(settingsPath)) {
      return { success: true, data: JSON.parse(fs.readFileSync(settingsPath, 'utf-8')) };
    }
    return { success: true, data: {} };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('set-settings', async (event, data) => {
  try {
    ensureDir(userDataPath);
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Native notification
ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

// Send settings to child windows
ipcMain.on('request-settings', (event) => {
  if (mainWindow) {
    mainWindow.webContents.send('relay-settings-request');
  }
});

ipcMain.on('settings-data', (event, data) => {
  if (settingsWindow) settingsWindow.webContents.send('settings-loaded', data);
  if (achievementsWindow) achievementsWindow.webContents.send('settings-loaded', data);
});
