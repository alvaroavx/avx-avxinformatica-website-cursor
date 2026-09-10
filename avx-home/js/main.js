import { StateManager } from "./state-manager.js";
import { canPlayGame, createViewportWatcher, getViewportSize } from "./utils/viewport.js";
import { HomeController } from "./home/home-controller.js";
import { initLogoAnimator } from "./logo/logo-animator.js";

const DEBUG_MODE = false;
const GAME_WELCOME_SECONDS = 5;

function getInitialState() {
  return canPlayGame(getViewportSize()) ? "home" : "fallback";
}

function safeDebug(...args) {
  if (!DEBUG_MODE) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

function initCtas(stateManager) {
  const ctaGame = document.getElementById("cta-game");
  if (!ctaGame) return;

  ctaGame.addEventListener("click", () => {
    if (canPlayGame(getViewportSize())) {
      stateManager.transitionTo("game", { reason: "cta-game" });
      return;
    }
    stateManager.transitionTo("fallback", { reason: "viewport-insufficient" });
  });
}

function createGameWelcome() {
  const overlay = document.getElementById("game-welcome");
  const countdownEl = document.getElementById("game-countdown");
  let t = null;
  let remaining = GAME_WELCOME_SECONDS;

  function setVisible(visible) {
    if (!overlay) return;
    if (visible) overlay.removeAttribute("hidden");
    else overlay.setAttribute("hidden", "");
  }

  function render() {
    if (!countdownEl) return;
    countdownEl.textContent = String(remaining);
  }

  function stop() {
    if (t) window.clearInterval(t);
    t = null;
    remaining = GAME_WELCOME_SECONDS;
    render();
    setVisible(false);
  }

  function start() {
    stop();
    setVisible(true);
    remaining = GAME_WELCOME_SECONDS;
    render();
    window.dispatchEvent(new CustomEvent("avx:gamestart"));

    t = window.setInterval(() => {
      remaining -= 1;
      render();
      if (remaining <= 0) {
        stop();
        window.dispatchEvent(new CustomEvent("avx:gamebegin"));
      }
    }, 1000);
  }

  return { start, stop };
}

function init() {
  const stateManager = new StateManager();
  const home = new HomeController();
  const logoAnimator = initLogoAnimator();
  const welcome = createGameWelcome();
  let game = null;
  stateManager.transitionTo(getInitialState(), { reason: "initial" });

  if (stateManager.getCurrentState() === "home") home.start();

  window.addEventListener("avx:statechange", (e) => {
    document.body.classList.toggle("app--simulation-active", e.detail.to === "game");

    if (e.detail.to === "home") home.start();
    else home.stop();

    if (e.detail.to === "game") welcome.start();
    else welcome.stop();
  });

  window.addEventListener("avx:gamebegin", async () => {
    if (game) return;
    const mod = await import("./game/game-controller.js");
    game = new mod.GameController();
    game.init();
    game.start();
  });

  window.addEventListener("avx:gameexit", () => {
    if (game) {
      game.destroy();
      game = null;
    }
    stateManager.transitionTo("home", { reason: "gameexit" });
  });

  window.addEventListener("avx:statechange", (e) => {
    if (e.detail.from === "game" && game) {
      game.destroy();
      game = null;
    }
  });

  initCtas(stateManager);

  const watcher = createViewportWatcher({ debounceMs: 250 });
  watcher.start();

  window.addEventListener("avx:viewportchange", (e) => {
    const shouldFallback = !e.detail.canPlayGame;
    const current = stateManager.getCurrentState();

    if (current === "game") return;

    if (shouldFallback) stateManager.transitionTo("fallback", { reason: "resize" });
    else stateManager.transitionTo("home", { reason: "resize" });
  });

  safeDebug("AVX init", { state: stateManager.getCurrentState() });

  window.addEventListener("unload", () => {
    logoAnimator.destroy();
    welcome.stop();
    if (game) game.destroy();
  });
}

init();
