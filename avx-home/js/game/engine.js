export class Engine {
  constructor({ update, render }) {
    this._update = update;
    this._render = render;
    this._raf = null;
    this._running = false;
    this._lastTs = 0;
  }

  start() {
    if (this._running) return;
    this._running = true;
    this._lastTs = performance.now();
    this._raf = requestAnimationFrame(this._loop);
  }

  stop() {
    this._running = false;
    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  _loop = (ts) => {
    if (!this._running) return;
    const deltaSec = Math.min((ts - this._lastTs) / 1000, 0.05);
    this._lastTs = ts;
    this._update(deltaSec, ts);
    this._render(ts);
    this._raf = requestAnimationFrame(this._loop);
  };
}

