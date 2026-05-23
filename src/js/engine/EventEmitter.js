export class EventEmitter {
  constructor() {
    this._listeners = {};
  }

  on(event, callback) {
    if (!this._listeners[event]) this._listeners[event] = [];
    this._listeners[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this._listeners[event]) return this;
    this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
    return this;
  }

  emit(event, ...args) {
    if (!this._listeners[event]) return;
    for (const cb of this._listeners[event]) {
      cb(...args);
    }
  }

  removeAllListeners(event) {
    if (event) {
      delete this._listeners[event];
    } else {
      this._listeners = {};
    }
  }
}
