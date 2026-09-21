import { GameController } from "./game/game-controller.js";

const game = new GameController();
game.init();

if (new URLSearchParams(location.search).has("__dev_arena")) {
  window.addEventListener("message", (event) => {
    if (event.origin !== location.origin || event.data?.type !== "avx-audio-lab-command") return;
    game.labCommand(event.data.command);
  });
  window.parent.postMessage({ type: "avx-audio-lab-ready" }, location.origin);
}
