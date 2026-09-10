export const GAME_MIN_WIDTH = 1024; // px
export const GAME_MIN_HEIGHT = 600; // px

export function canPlayGame(viewport = getViewportSize()) {
  return viewport.width >= GAME_MIN_WIDTH && viewport.height >= GAME_MIN_HEIGHT;
}

export function getViewportSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function getViewportState(viewport = getViewportSize()) {
  return canPlayGame(viewport) ? "desktop" : "small";
}

export function createViewportWatcher({ debounceMs = 250 } = {}) {
  let t = null;
  let last = getViewportSize();

  function emit() {
    const next = getViewportSize();
    if (next.width === last.width && next.height === last.height) return;
    const prev = last;
    last = next;
    window.dispatchEvent(
      new CustomEvent("avx:viewportchange", {
        detail: {
          from: prev,
          to: next,
          canPlayGame: canPlayGame(next),
          state: getViewportState(next),
        },
      }),
    );
  }

  function onResize() {
    if (t) window.clearTimeout(t);
    t = window.setTimeout(emit, debounceMs);
  }

  function start() {
    window.addEventListener("resize", onResize, { passive: true });
  }

  function stop() {
    window.removeEventListener("resize", onResize);
    if (t) window.clearTimeout(t);
    t = null;
  }

  return { start, stop, getLast: () => last };
}
