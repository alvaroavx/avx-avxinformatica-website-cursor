import { clamp, wrapAngleRad } from "../utils/math.js";

const DEFAULTS = {
  lives: 3,
  invulnerabilitySec: 1.5,
  radius: 18, // para colisión circle-circle (aprox)
  rotateSpeedRadPerSec: 3.2, // teclado
};

function createShipPath(size = 32) {
  // ASSET: ship-sprite.svg — Reemplazar con sprite SVG de la nave derivado del logo AVX
  // Placeholder: triángulo estilizado con “cuerpo” central.
  const s = size;
  const half = s / 2;

  const p = new Path2D();
  // cuerpo/ala principal (punta arriba)
  p.moveTo(0, -half);
  p.lineTo(half * 0.85, half);
  p.lineTo(0, half * 0.55);
  p.lineTo(-half * 0.85, half);
  p.closePath();

  // rombo central
  p.moveTo(0, -half * 0.15);
  p.lineTo(half * 0.25, 0);
  p.lineTo(0, half * 0.15);
  p.lineTo(-half * 0.25, 0);
  p.closePath();

  return p;
}

export class Player {
  constructor({ x, y } = {}, opts = {}) {
    const o = { ...DEFAULTS, ...opts };
    this.x = typeof x === "number" ? x : 0;
    this.y = typeof y === "number" ? y : 0;

    this.angle = 0; // rad. 0 = apuntando hacia arriba (norte)
    this.radius = o.radius;
    this.rotateSpeed = o.rotateSpeedRadPerSec;

    this.lives = o.lives;
    this.invulnerabilitySec = o.invulnerabilitySec;
    this._invulnLeft = 0;

    this.isThrusting = false;
    this._shipPath = createShipPath(34);
    this._blinkT = 0;
  }

  setCenter(x, y) {
    this.x = x;
    this.y = y;
  }

  reset({ x, y } = {}) {
    if (typeof x === "number" && typeof y === "number") this.setCenter(x, y);
    this.angle = 0;
    this.lives = DEFAULTS.lives;
    this._invulnLeft = 0;
    this.isThrusting = false;
    this._blinkT = 0;
  }

  isInvulnerable() {
    return this._invulnLeft > 0;
  }

  takeHit() {
    if (this.isInvulnerable()) return false;
    this.lives = Math.max(0, this.lives - 1);
    this._invulnLeft = this.invulnerabilitySec;
    this._blinkT = 0;
    return true;
  }

  /**
   * update:
   * - Mantiene posición fija (solo rotación/estado visual)
   * - input: instancia de InputManager (ver js/game/input.js)
   */
  update(deltaSec, input) {
    const dt = clamp(deltaSec || 0, 0, 0.05);

    if (this._invulnLeft > 0) {
      this._invulnLeft = Math.max(0, this._invulnLeft - dt);
      this._blinkT += dt;
    }

    if (input) {
      this.isThrusting = Boolean(input.isThrustActive());
      const intent = input.getRotationIntent({
        deltaSec: dt,
        shipX: this.x,
        shipY: this.y,
      });

      if (intent.source === "keyboard" && intent.rotationDelta) {
        this.angle = wrapAngleRad(this.angle + intent.rotationDelta);
      } else if (intent.source === "mouse" && typeof intent.aimAngle === "number") {
        // Suavizado mínimo para evitar jitter
        const a = wrapAngleRad(intent.aimAngle);
        const diff = ((a - this.angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        this.angle = wrapAngleRad(this.angle + diff * clamp(dt * 10, 0, 1));
      }
    }
  }

  render(ctx) {
    if (!ctx) return;

    const invuln = this.isInvulnerable();
    const blinkOn = !invuln || Math.floor(this._blinkT * 12) % 2 === 0;
    if (!blinkOn) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Glow
    ctx.shadowColor = "rgba(0, 255, 136, 0.45)";
    ctx.shadowBlur = 14;

    // Cuerpo
    ctx.strokeStyle = "rgba(0, 255, 136, 0.75)";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.fill(this._shipPath);
    ctx.stroke(this._shipPath);

    // Detalle central
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(232, 244, 240, 0.55)";
    ctx.lineWidth = 1;
    ctx.stroke(this._shipPath);

    // Propulsor visual (sin movimiento real)
    if (this.isThrusting) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.shadowColor = "rgba(0, 255, 136, 0.35)";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(-6, 18);
      ctx.lineTo(0, 28 + Math.random() * 6);
      ctx.lineTo(6, 18);
      ctx.closePath();
      ctx.fillStyle = "rgba(0, 255, 136, 0.18)";
      ctx.fill();
      ctx.strokeStyle = "rgba(0, 255, 136, 0.5)";
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
}

