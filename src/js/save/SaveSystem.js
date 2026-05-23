export class SaveSystem {
  constructor() {
    this.saveSlots = [1, 2, 3];
  }

  async save(slot, gameState) {
    const data = {
      version: 1,
      timestamp: Date.now(),
      state: gameState
    };

    if (window.electronAPI) {
      const result = await window.electronAPI.saveGame(slot, data);
      return result;
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(`td_save_${slot}`, JSON.stringify(data));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async load(slot) {
    if (window.electronAPI) {
      const result = await window.electronAPI.loadGame(slot);
      return result;
    }

    try {
      const data = localStorage.getItem(`td_save_${slot}`);
      if (!data) return { success: false, error: 'No save found' };
      return { success: true, data: JSON.parse(data) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async listSaves() {
    if (window.electronAPI) {
      const result = await window.electronAPI.listSaves();
      return result;
    }

    try {
      const saves = [];
      for (const slot of this.saveSlots) {
        const data = localStorage.getItem(`td_save_${slot}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            saves.push({ slot, modified: new Date(parsed.timestamp).toISOString() });
          } catch {}
        }
      }
      return { success: true, saves };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async deleteSave(slot) {
    if (window.electronAPI) {
      return await window.electronAPI.deleteSave(slot);
    }
    try {
      localStorage.removeItem(`td_save_${slot}`);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async getSettings() {
    if (window.electronAPI) {
      return await window.electronAPI.getSettings();
    }
    try {
      const data = localStorage.getItem('td_settings');
      return { success: true, data: data ? JSON.parse(data) : {} };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async setSettings(settings) {
    if (window.electronAPI) {
      return await window.electronAPI.setSettings(settings);
    }
    try {
      localStorage.setItem('td_settings', JSON.stringify(settings));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}
