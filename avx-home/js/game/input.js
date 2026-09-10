const KEY = {
  A: "KeyA",
  D: "KeyD",
  W: "KeyW",
  SPACE: "Space",
  ESC: "Escape",
};

export class InputManager {
  constructor({
    rotateSpeed = 1.0, // rad/s (se aplica multiplicando por delta)
    fireCooldownMs = 250,
    maxProjectiles = 6, // referencia (enforzado por el juego después)
  } = {}) {
    this.rotateSpeed = rotateSpeed;
    this.fireCooldownMs = fireCooldownMs;
    this.maxProjectiles = maxProjectiles;

    this._keys = new Set();
    this._mouse = {
      x: 0,
      y: 0,
      down: false,
      movedRecently: false,
    };

    this._lastRotationSource = "keyboard"; // 'keyboard' | 'mouse'
    this._lastFireTs = 0;
    this._pendingFire = false;
    this._exitRequested = false;

    this._onKeyDown = (e) => {
      if (e.code === KEY.SPACE || e.code === KEY.ESC) e.preventDefault();
      this._keys.add(e.code);
      if (e.code === KEY.A || e.code === KEY.D || e.code === KEY.W) {
        this._lastRotationSource = "keyboard";
      }
      if (e.code === KEY.SPACE) this._pendingFire = true;
      if (e.code === KEY.ESC) this._exitRequested = true;
    };

    this._onKeyUp = (e) => {
      this._keys.delete(e.code);
    };

    this._onMouseMove = (e) => {
      this._mouse.x = e.clientX;
      this._mouse.y = e.clientY;
      this._mouse.movedRecently = true;
      this._lastRotationSource = "mouse";
    };

    this._onMouseDown = (e) => {
      if (e.button !== 0) return;
      this._mouse.down = true;
      this._pendingFire = true;
    };

    this._onMouseUp = (e) => {
      if (e.button !== 0) return;
      this._mouse.down = false;
    };
  }

  start() {
    window.addEventListener("keydown", this._onKeyDown, { passive: false });
    window.addEventListener("keyup", this._onKeyUp, { passive: true });
    window.addEventListener("mousemove", this._onMouseMove, { passive: true });
    window.addEventListener("mousedown", this._onMouseDown, { passive: true });
    window.addEventListener("mouseup", this._onMouseUp, { passive: true });
  }

  stop() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("mousedown", this._onMouseDown);
    window.removeEventListener("mouseup", this._onMouseUp);
    this.reset();
  }

  reset() {
    this._keys.clear();
    this._mouse.down = false;
    this._mouse.movedRecently = false;
    this._pendingFire = false;
    this._exitRequested = false;
    this._lastFireTs = 0;
  }

  isThrustActive() {
    return this._keys.has(KEY.W) || this._mouse.down;
  }

  consumeExitRequested() {
    const v = this._exitRequested;
    this._exitRequested = false;
    return v;
  }

  /**
   * Devuelve:
   * - rotationDelta: delta radianes para sumar al ángulo (teclado)
   * - aimAngle: ángulo absoluto hacia el mouse (si la fuente activa es mouse)
   */
  getRotationIntent({ deltaSec, shipX, shipY } = {}) {
    const a = this._keys.has(KEY.A);
    const d = this._keys.has(KEY.D);
    const keyboardDelta = (Number(d) - Number(a)) * this.rotateSpeed * (deltaSec || 0);

    if (keyboardDelta !== 0) {
      this._lastRotationSource = "keyboard";
      return { source: "keyboard", rotationDelta: keyboardDelta, aimAngle: null };
    }

    if (this._lastRotationSource === "mouse" && typeof shipX === "number" && typeof shipY === "number") {
      const dx = this._mouse.x - shipX;
      const dy = this._mouse.y - shipY;
      const aimAngle = Math.atan2(dy, dx) + Math.PI / 2; // +90° para que "arriba" sea 0 si la nave apunta al norte
      return { source: "mouse", rotationDelta: 0, aimAngle };
    }

    return { source: this._lastRotationSource, rotationDelta: 0, aimAngle: null };
  }

  /**
   * consumeFireIntent:
   * - Respeta cooldown 250ms
   * - Limita la señal a un "pulso" (aunque el input esté sostenido)
   */
  consumeFireIntent(nowMs = performance.now()) {
    if (!this._pendingFire && !this._keys.has(KEY.SPACE)) return false;

    const elapsed = nowMs - this._lastFireTs;
    if (elapsed < this.fireCooldownMs) return false;

    this._pendingFire = false;
    this._lastFireTs = nowMs;
    return true;
  }
}

