import { Engine } from "./engine.js";
import { InputManager } from "./input.js";
import { Player } from "./player.js";
import { clear, createHiDPICanvas, resizeCanvasToViewport } from "../utils/canvas-helpers.js";

export class GameController {
  constructor({ rootEl = document.getElementById("game-root") } = {}) {
    if (!rootEl) throw new Error("Missing #game-root");
    this.rootEl = rootEl;

    this._canvas = null;
    this._ctx = null;
    this._vp = { width: 1, height: 1, dpr: 1 };

    this.input = new InputManager({ rotateSpeed: 3.2 });
    this.player = new Player();
    this.engine = new Engine({
      update: (dt) => this._update(dt),
      render: () => this._render(),
    });

    this._onResize = () => this._resize();
    this._onVisibility = () => {
      if (document.hidden) this.pause();
      else this.resume();
    };
  }

  init() {
    const { canvas, ctx } = createHiDPICanvas({
      id: "game-canvas",
      className: "game__canvas",
      parent: this.rootEl,
    });
    this._canvas = canvas;
    this._ctx = ctx;

    this._resize();
    this.player.setCenter(this._vp.width / 2, this._vp.height / 2);

    window.addEventListener("resize", this._onResize, { passive: true });
    document.addEventListener("visibilitychange", this._onVisibility, { passive: true });
    this.input.start();
  }

  start() {
    this.engine.start();
  }

  pause() {
    this.engine.stop();
  }

  resume() {
    this.engine.start();
  }

  destroy() {
    this.engine.stop();
    this.input.stop();
    window.removeEventListener("resize", this._onResize);
    document.removeEventListener("visibilitychange", this._onVisibility);
    if (this._canvas) this._canvas.remove();
    this._canvas = null;
    this._ctx = null;
  }

  _resize() {
    if (!this._canvas || !this._ctx) return;
    this._vp = resizeCanvasToViewport(this._canvas, this._ctx);
    this.player.setCenter(this._vp.width / 2, this._vp.height / 2);
  }

  _update(dt) {
    // Salida inmediata por ESC (sin resultados)
    if (this.input.consumeExitRequested()) {
      window.dispatchEvent(new CustomEvent("avx:gameexit"));
      return;
    }

    this.player.update(dt, this.input);
  }

  _render() {
    if (!this._ctx) return;
    clear(this._ctx, { width: this._vp.width, height: this._vp.height });
    this.player.render(this._ctx);
  }
}

