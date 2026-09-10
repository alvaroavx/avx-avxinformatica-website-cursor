const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
const STAR_COUNT = 140;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function createStar(width, height) {
  const edgeBias = Math.random();
  let x = rand(0, width);
  let y = rand(0, height);

  // Menos densidad en el centro (donde va el core)
  const cx = width / 2;
  const cy = height / 2;
  const dx = (x - cx) / width;
  const dy = (y - cy) / height;
  const centerDist = Math.sqrt(dx * dx + dy * dy);
  if (centerDist < 0.18 && Math.random() < 0.65) {
    x = rand(0, width);
    y = edgeBias < 0.5 ? rand(0, height * 0.22) : rand(height * 0.78, height);
  }

  return {
    x,
    y,
    r: rand(0.6, 1.8),
    base: rand(0.25, 0.55),
    amp: rand(0.25, 0.55),
    phase: rand(0, Math.PI * 2),
    speed: rand(0.8, 2.2),
  };
}

function resizeCanvas(canvas, ctx) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(window.innerWidth));
  const h = Math.max(1, Math.floor(window.innerHeight));

  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: w, height: h };
}

export class UiEffects {
  constructor() {
    this._canvas = document.getElementById("home-canvas");
    this._ctx = this._canvas ? this._canvas.getContext("2d") : null;

    this._stars = [];
    this._raf = null;
    this._running = false;
    this._lastFrameTs = 0;
    this._lastPaintTs = 0;
    this._size = { width: 1, height: 1 };

    this._resizeT = null;
    this._onResize = () => {
      if (this._resizeT) window.clearTimeout(this._resizeT);
      this._resizeT = window.setTimeout(() => {
        this._regen();
      }, 250);
    };

    this._onVisibility = () => {
      if (document.hidden) this.pause();
      else this.resume();
    };
  }

  _regen() {
    if (!this._canvas || !this._ctx) return;
    this._size = resizeCanvas(this._canvas, this._ctx);
    this._stars = Array.from({ length: STAR_COUNT }, () => createStar(this._size.width, this._size.height));
    this._render(performance.now());
  }

  _clear() {
    this._ctx.clearRect(0, 0, this._size.width, this._size.height);
  }

  _render(ts) {
    if (!this._ctx) return;
    this._clear();
    this._ctx.fillStyle = "rgba(232, 244, 240, 1)";

    for (const s of this._stars) {
      const alpha = clamp(s.base + Math.sin(ts / 1000 * s.speed + s.phase) * s.amp, 0.18, 1);
      this._ctx.globalAlpha = alpha;
      this._ctx.beginPath();
      this._ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      this._ctx.fill();
    }
    this._ctx.globalAlpha = 1;
  }

  _loop = (ts) => {
    if (!this._running) return;

    const delta = ts - this._lastFrameTs;
    if (delta >= FRAME_INTERVAL_MS) {
      this._lastFrameTs = ts - (delta % FRAME_INTERVAL_MS);
      this._render(ts);
      this._lastPaintTs = ts;
    }

    this._raf = window.requestAnimationFrame(this._loop);
  };

  start() {
    if (this._running) return;
    if (!this._canvas || !this._ctx) return;

    this._regen();
    window.addEventListener("resize", this._onResize, { passive: true });
    document.addEventListener("visibilitychange", this._onVisibility, { passive: true });

    this._running = true;
    this._lastFrameTs = performance.now();
    this._raf = window.requestAnimationFrame(this._loop);
  }

  pause() {
    if (!this._running) return;
    this._running = false;
    if (this._raf) window.cancelAnimationFrame(this._raf);
    this._raf = null;
  }

  resume() {
    if (this._running) return;
    if (document.hidden) return;
    if (!this._canvas || !this._ctx) return;

    this._running = true;
    this._lastFrameTs = performance.now();
    this._raf = window.requestAnimationFrame(this._loop);
  }

  stop() {
    this.pause();
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibility);
    if (this._resizeT) window.clearTimeout(this._resizeT);
    this._resizeT = null;
    this._stars = [];
    if (this._ctx) this._clear();
  }
}

