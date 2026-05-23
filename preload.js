const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),

  // Open windows
  openSettings: () => ipcRenderer.send('open-settings'),
  openAchievements: () => ipcRenderer.send('open-achievements'),

  // Save/Load
  saveGame: (slot, data) => ipcRenderer.invoke('save-game', slot, data),
  loadGame: (slot) => ipcRenderer.invoke('load-game', slot),
  listSaves: () => ipcRenderer.invoke('list-saves'),
  deleteSave: (slot) => ipcRenderer.invoke('delete-save', slot),

  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  setSettings: (data) => ipcRenderer.invoke('set-settings', data),

  // Notifications
  showNotification: (title, body) => ipcRenderer.send('show-notification', { title, body }),

  // Shortcuts
  onShortcut: (callback) => {
    ipcRenderer.on('shortcut', (event, action) => callback(action));
  },
  removeShortcutListeners: () => {
    ipcRenderer.removeAllListeners('shortcut');
  },

  // Settings relay
  onRelaySettings: (callback) => {
    ipcRenderer.on('relay-settings-request', () => callback());
  },
  sendSettings: (data) => ipcRenderer.send('settings-data', data),
  onSettingsLoaded: (callback) => {
    ipcRenderer.on('settings-loaded', (event, data) => callback(data));
  }
});
