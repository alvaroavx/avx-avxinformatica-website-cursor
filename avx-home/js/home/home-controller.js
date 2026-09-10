import { initPlanets } from "./planets.js";
import { UiEffects } from "./ui-effects.js";

export class HomeController {
  constructor() {
    this._planets = null;
    this._effects = new UiEffects();
    this._active = false;
  }

  start() {
    if (this._active) return;
    this._active = true;
    this._planets = initPlanets();
    this._effects.start();
  }

  stop() {
    if (!this._active) return;
    this._active = false;
    if (this._planets) this._planets.destroy();
    this._planets = null;
    this._effects.stop();
  }
}
