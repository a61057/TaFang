export class ObjectPool {
  constructor(factory, reset, initialSize = 50) {
    this._factory = factory;
    this._reset = reset;
    this._pool = [];
    this._active = [];
    for (let i = 0; i < initialSize; i++) {
      this._pool.push(factory());
    }
  }

  get() {
    let obj;
    if (this._pool.length > 0) {
      obj = this._pool.pop();
    } else {
      obj = this._factory();
    }
    this._active.push(obj);
    return obj;
  }

  release(obj) {
    const idx = this._active.indexOf(obj);
    if (idx !== -1) {
      this._active.splice(idx, 1);
      this._reset(obj);
      this._pool.push(obj);
    }
  }

  releaseAll() {
    for (const obj of this._active) {
      this._reset(obj);
      this._pool.push(obj);
    }
    this._active.length = 0;
  }

  getActive() {
    return this._active;
  }

  get activeCount() {
    return this._active.length;
  }

  get poolSize() {
    return this._pool.length;
  }
}
