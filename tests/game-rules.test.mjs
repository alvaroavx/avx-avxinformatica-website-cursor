import assert from "node:assert/strict";
import test from "node:test";
import { GameController } from "../src/js/game/game-controller.js";

const controller = () => Object.create(GameController.prototype);

test("los refuerzos respetan el intervalo y cantidad de cada dificultad", () => {
  for (const [difficulty, seconds, expected] of [["easy", 20, 1], ["normal", 14, 2], ["hard", 9, 3]]) {
    const game = controller();
    game.difficulty = difficulty;
    game.idleSeconds = seconds - .1;
    game.ui = { "reinforcement-countdown": {} };
    game.spawned = 0;
    game.spawnRock = () => { game.spawned += 1; };
    game.flashMessage = (message) => { game.message = message; };
    game.updateReinforcementTimer(.1);
    assert.equal(game.spawned, expected, difficulty);
    assert.equal(game.idleSeconds, 0, difficulty);
    assert.equal(game.message, "REFUERZOS DETECTADOS", difficulty);
  }
});

test("el contador de refuerzos solo aparece durante los últimos cinco segundos", () => {
  const game = controller();
  game.difficulty = "easy";
  game.idleSeconds = 14;
  game.ui = { "reinforcement-countdown": {} };
  game.spawnRock = () => {};
  game.flashMessage = () => {};
  game.updateReinforcementTimer(.1);
  assert.equal(game.ui["reinforcement-countdown"].textContent, "");
  game.idleSeconds = 15;
  game.updateReinforcementTimer(.1);
  assert.equal(game.ui["reinforcement-countdown"].textContent, "REFUERZOS EN 05");
});

test("la arena de desarrollo no altera una partida fuera de lab", () => {
  const game = controller();
  game.labMode = false;
  game.rocks = [{ typeId: "scout" }];
  game.boss = { coreHp: 1 };
  game.labSpawn("scout", 40, 40);
  game.labClear();
  assert.equal(game.rocks.length, 1);
  assert.ok(game.boss);
});

test("la arena crea entidades reales, alterna freeze e IA y puede limpiarse", () => {
  const game = controller();
  game.labMode = true;
  game.width = 1200;
  game.height = 800;
  game.rocks = [];
  game.bullets = [{ life: 1 }];
  game.enemyBullets = [{ life: 1 }];
  game.particles = [{ life: 1 }];
  game.boss = null;
  game.labFreeze = true;
  game.labAi = true;
  game.audio = { droneSpawn: () => { game.droneSound = true; }, playEvent: () => {} };
  game.labSpawn("scout", 100, 200);
  game.labSpawn("intruder", 300, 400);
  game.labSpawn("boss", 600, 160);
  assert.equal(game.rocks.length, 2);
  assert.deepEqual([game.rocks[0].x, game.rocks[0].y], [100, 200]);
  assert.equal(game.rocks[1].typeId, "intruder");
  assert.equal(game.droneSound, true);
  assert.equal(game.boss.nodes.length, 2);
  game.labCommand("freeze");
  game.labCommand("ai");
  assert.equal(game.labFreeze, false);
  assert.equal(game.labAi, false);
  game.labClear();
  assert.deepEqual(game.rocks, []);
  assert.deepEqual(game.bullets, []);
  assert.equal(game.boss, null);
});

test("el modo laboratorio congelado no actualiza mecánicas normales", () => {
  const game = controller();
  game.labMode = true;
  game.labFreeze = true;
  game.state = "playing";
  game.updateHud = () => { game.hudUpdated = true; };
  game.update(.016);
  assert.equal(game.hudUpdated, true);
});
