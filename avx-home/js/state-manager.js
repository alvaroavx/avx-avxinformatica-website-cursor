const VALID_STATES = new Set(["home", "game", "fallback"]);

function getEl(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: #${id}`);
  return el;
}

function setHidden(el, hidden) {
  if (hidden) el.setAttribute("hidden", "");
  else el.removeAttribute("hidden");
}

export class StateManager {
  constructor() {
    this.current = null;

    this.els = {
      home: getEl("home-state"),
      game: getEl("game-state"),
      fallback: getEl("fallback-state"),
    };

    this.homeOnly = [getEl("home-sections")];
  }

  getCurrentState() {
    return this.current;
  }

  transitionTo(next, { reason = "" } = {}) {
    if (!VALID_STATES.has(next)) {
      throw new Error(`Invalid state: ${String(next)}`);
    }

    const from = this.current;
    if (from === next) return;

    for (const [key, el] of Object.entries(this.els)) {
      setHidden(el, key !== next);
    }

    for (const el of this.homeOnly) {
      setHidden(el, next !== "home");
    }

    this.current = next;
    window.dispatchEvent(
      new CustomEvent("avx:statechange", {
        detail: { from, to: next, reason },
      }),
    );
  }
}
