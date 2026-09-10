function getLogoSvg() {
  return document.getElementById("avx-logo-svg");
}

export function setLogoState(state) {
  const svg = getLogoSvg();
  if (!svg) return;
  svg.classList.toggle("state--ship", state === "ship");
}

export function initLogoAnimator() {
  function onStateChange(e) {
    if (e.detail.to === "game") setLogoState("ship");
    else if (e.detail.to === "home") setLogoState("logo");
  }

  window.addEventListener("avx:statechange", onStateChange);
  return {
    destroy() {
      window.removeEventListener("avx:statechange", onStateChange);
    },
  };
}

