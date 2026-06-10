(function () {
  if (typeof window.__TAURI__ === 'undefined') return;

  var win = null;
  try { win = window.__TAURI__.window.getCurrentWindow(); } catch (_) { console.warn('bridge: Tauri window API not available'); }

  var WebviewWindow = null;
  try { WebviewWindow = window.__TAURI__.webviewWindow.WebviewWindow; } catch (_) { console.warn('bridge: Tauri WebviewWindow API not available'); }
  if (!WebviewWindow) try { WebviewWindow = window.__TAURI__.window.WebviewWindow; } catch (_) {}

  var listen = null;
  try { listen = window.__TAURI__.event.listen; } catch (_) { console.warn('bridge: Tauri event API not available'); }

  var SAVE_SLOTS = [1, 2, 3];

  window.electronAPI = {

    // ── Window control ──
    close: function () { if (win) win.close(); },
    minimize: function () { if (win) win.minimize(); },
    maximize: function () { if (win) win.toggleMaximize(); },

    openSettings: function () {
      if (!WebviewWindow) {
        window.location.hash = '#settings';
        window.location.reload();
        return;
      }
      WebviewWindow.getByLabel('settings').then(function (existing) {
        if (existing) { existing.close(); }
      });
      new WebviewWindow('settings', {
        url: '/index.html#settings',
        width: 600, height: 500,
        resizable: false,
        decorations: false,
      });
    },

    openAchievements: function () {
      if (!WebviewWindow) {
        window.location.hash = '#achievements';
        window.location.reload();
        return;
      }
      WebviewWindow.getByLabel('achievements').then(function (existing) {
        if (existing) { existing.close(); }
      });
      new WebviewWindow('achievements', {
        url: '/index.html#achievements',
        width: 700, height: 600,
        resizable: false,
        decorations: false,
      });
    },

    // ── Save / Load (localStorage) ──
    saveGame: function (slot, data) {
      try {
        localStorage.setItem('td_save_' + slot, JSON.stringify(data));
        return Promise.resolve({ success: true });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    loadGame: function (slot) {
      try {
        var raw = localStorage.getItem('td_save_' + slot);
        if (!raw) return Promise.resolve({ success: false, error: 'No save found' });
        return Promise.resolve({ success: true, data: JSON.parse(raw) });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    listSaves: function () {
      try {
        var saves = [];
        for (var i = 0; i < SAVE_SLOTS.length; i++) {
          var slot = SAVE_SLOTS[i];
          var raw = localStorage.getItem('td_save_' + slot);
          if (raw) {
            try {
              var parsed = JSON.parse(raw);
              saves.push({ slot: slot, modified: new Date(parsed.timestamp).toISOString() });
            } catch (_) {}
          }
        }
        return Promise.resolve({ success: true, saves: saves });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    deleteSave: function (slot) {
      try {
        localStorage.removeItem('td_save_' + slot);
        return Promise.resolve({ success: true });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    // ── Settings (localStorage) ──
    getSettings: function () {
      try {
        var raw = localStorage.getItem('td_settings');
        return Promise.resolve({ success: true, data: raw ? JSON.parse(raw) : {} });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    setSettings: function (data) {
      try {
        localStorage.setItem('td_settings', JSON.stringify(data));
        return Promise.resolve({ success: true });
      } catch (err) {
        return Promise.resolve({ success: false, error: err.message });
      }
    },

    // ── Notifications (Web API) ──
    showNotification: function (title, body) {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(title, { body: body });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(function (p) {
            if (p === 'granted') new Notification(title, { body: body });
          });
        }
      }
    },

    // ── Shortcuts (handled via game's own keydown listeners) ──
    onShortcut: function () {},
    removeShortcutListeners: function () {},

    // ── Settings relay (cross-window via localStorage events) ──
    onRelaySettings: function (callback) {
      window.addEventListener('storage', function (e) {
        if (e.key === 'td_settings' || e.key === 'td_settings_broadcast') {
          callback();
        }
      });
    },

    sendSettings: function (data) {
      window.dispatchEvent(new CustomEvent('settings-data', { detail: data }));
      localStorage.setItem('td_settings_broadcast', JSON.stringify(data));
    },

    onSettingsLoaded: function (callback) {
      window.addEventListener('settings-data', function (e) { callback(e.detail); });
    },
  };

  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
})();
