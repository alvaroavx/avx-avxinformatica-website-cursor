import assert from "node:assert/strict";
import test from "node:test";
import { GameController } from "../src/js/game/game-controller.js";

const controller = () => Object.create(GameController.prototype);

test("la dificultad se selecciona desde las opciones de misión y se persiste", () => {
  const originalDocument = globalThis.document;
  const originalStorage = globalThis.localStorage;
  const options = ["easy", "normal", "hard"].map((difficulty) => ({ dataset: { startDifficulty: difficulty }, setAttribute(name, value) { this[name] = value; } }));
  const persisted = new Map();
  try {
    globalThis.document = { querySelectorAll: (selector) => selector === "[data-start-difficulty]" ? options : [] };
    globalThis.localStorage = { setItem: (key, value) => persisted.set(key, value) };
    const game = controller();

    game.applyDifficulty("hard");

    assert.equal(game.difficulty, "hard");
    assert.equal(persisted.get("avx-vector-field-difficulty"), "hard");
    assert.deepEqual(options.map((option) => option["aria-pressed"]), ["false", "false", "true"]);
  } finally {
    if (originalDocument === undefined) delete globalThis.document; else globalThis.document = originalDocument;
    if (originalStorage === undefined) delete globalThis.localStorage; else globalThis.localStorage = originalStorage;
  }
});

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

test("los fragmentos de explorador se destruyen sin volver a dividirse", () => {
  const game = controller();
  game.difficulty = "easy";
  game.idleSeconds = 0;
  game.colors = { line: "#00ff88" };
  game.ui = { "reinforcement-countdown": {} };
  game.audio = { asteroidHit() {} };
  game.registerKill = () => {};
  game.emit = () => {};
  const parent = { typeId: "scout", radius: 45, canSplit: true, hp: 1, score: 120, x: 100, y: 100, vx: 30, vy: 0 };
  game.rocks = [parent];

  game.hitRock(parent);
  assert.equal(game.rocks.length, 2);
  assert.ok(game.rocks.every((fragment) => fragment.canSplit === false));

  game.hitRock(game.rocks[0]);
  assert.equal(game.rocks.length, 1);
  game.hitRock(game.rocks[0]);
  assert.equal(game.rocks.length, 0);
});

test("las tres dificultades pueden generar todo el elenco y escalan los blindados", () => {
  const originalRandom = Math.random;
  try {
    for (const [difficulty, expectedHp] of [["easy", 2], ["normal", 3], ["hard", 5]]) {
      const seen = new Set();
      for (const selection of [.01, .3, .6, .9]) {
        const game = controller();
        game.difficulty = difficulty;
        game.wave = 1;
        game.width = 1000;
        game.height = 800;
        game.ship = { x: -1000, y: -1000 };
        game.rocks = [];
        game.audio = { droneSpawn() {} };
        Math.random = () => selection;
        game.spawnRock();
        seen.add(game.rocks[0].typeId);
        if (game.rocks[0].typeId === "fortress") assert.equal(game.rocks[0].hp, expectedHp);
      }
      assert.deepEqual([...seen].sort(), ["fortress", "intruder", "scout", "shard"]);
    }
  } finally { Math.random = originalRandom; }
});

test("los drones cambian de comportamiento por dificultad", () => {
  const game = controller();
  game.ship = { x: 400, y: 100 };
  game.width = 1000;
  game.height = 800;
  game.enemyBullets = [];
  game.audio = { droneShot: () => { game.shots = (game.shots || 0) + 1; } };
  const drone = { x: 100, y: 100, vx: 0, vy: 0, droneTimer: 0, shot: 0, droneMode: "search", burstRemaining: 0 };

  game.difficulty = "easy";
  game.updateIntruder(drone, .1);
  assert.equal(game.enemyBullets.length, 0);

  game.difficulty = "normal";
  drone.shot = 0;
  game.updateIntruder(drone, .1);
  assert.equal(game.enemyBullets.length, 1);
  assert.ok(drone.shot >= 3.4);

  game.difficulty = "hard";
  drone.droneMode = "burst";
  drone.burstRemaining = 3;
  drone.shot = 0;
  game.updateIntruder(drone, .25);
  game.updateIntruder(drone, .25);
  game.updateIntruder(drone, .25);
  assert.equal(game.enemyBullets.length, 4);
  assert.ok(game.enemyBullets.slice(-3).every((bullet) => bullet.life === 5.2));
  assert.equal(drone.droneMode, "move");
  assert.equal(drone.burstRemaining, 0);
});

test("los proyectiles enemigos se anulan al tocar un borde y los de la nave atraviesan el campo", () => {
  const game = controller();
  game.width = 100;
  game.height = 100;
  game.enemyBullets = [{ x: 99, y: 50, vx: 20, vy: 0, life: 2 }, { x: 50, y: 50, vx: 10, vy: 0, life: 2 }];

  game.updateEnemyBullets(.1);

  assert.equal(game.enemyBullets.length, 1);
  assert.equal(game.enemyBullets[0].x, 51);

  game.boss = null;
  game.rocks = [];
  game.bullets = [{ x: 99, y: 50, vx: 20, vy: 0, life: 2 }];
  game.updateBullets(.1);
  assert.equal(game.bullets.length, 1);
  assert.equal(game.bullets[0].x, 1);
});

test("el dron fácil alterna una aproximación segura con una retirada lejana", () => {
  const originalRandom = Math.random;
  try {
    Math.random = () => .25;
    const game = controller();
    game.difficulty = "easy";
    game.width = 1000;
    game.height = 800;
    game.ship = { x: 500, y: 400 };
    const drone = { x: 500, y: 180, vx: 0, vy: 0, droneMode: "approach", droneTarget: { x: 500, y: 180 }, lastApproachAngle: 0 };

    game.updateIntruder(drone, .1);
    assert.equal(drone.droneMode, "retreat");
    assert.ok(Math.hypot(drone.droneTarget.x - game.ship.x, drone.droneTarget.y - game.ship.y) > 500);

    Object.assign(drone, drone.droneTarget);
    game.updateIntruder(drone, .1);
    assert.equal(drone.droneMode, "approach");
    assert.ok(Math.abs(drone.lastApproachAngle) > 0);
  } finally { Math.random = originalRandom; }
});

test("los drones no impactan el casco fuera de difícil", () => {
  const game = controller();
  game.ship = { x: 100, y: 100 };
  game.enemyBullets = [];
  game.boss = null;
  game.rocks = [{ typeId: "intruder", x: 100, y: 100, radius: 30 }];
  game.difficulty = "easy";
  assert.equal(game.collidesShip(), false);
  game.difficulty = "hard";
  assert.equal(game.collidesShip(), true);
});

test("el arpegio se activa solo al perder la partida", () => {
  const game = controller();
  game.score = 1200;
  game.audio = { stopEngine() {}, playerDeath: () => { game.deathArpeggio = true; }, gameOver() {} };
  game.ui = { "final-score": {}, "pause-game": {} };
  game.setHudVisible = () => {};
  game.setScreen = () => {};
  game.saveRun = () => {};

  game.gameOver();

  assert.equal(game.deathArpeggio, true);
  assert.equal(game.state, "over");
});

test("la transición al jefe anuncia la alerta y activa su alarma", () => {
  const originalSetInterval = globalThis.setInterval;
  try {
    const game = controller();
    const alarms = [];
    globalThis.setInterval = () => 1;
    game.width = 1200;
    game.height = 800;
    game.ship = { x: 600, y: 400, vx: 0, vy: 0, safe: 0 };
    game.ui = { "wave-title": {}, "wave-detail": {}, "wave-intro": {}, "wave-countdown": {}, "pause-game": {} };
    game.audio = { stopEngine() {}, bossCountdownAlarm: (value) => alarms.push(value) };

    game.beginBoss();

    assert.equal(game.ui["wave-title"].textContent, "ALERTA CRÍTICA // JEFE FINAL");
    assert.equal(game.ui["wave-detail"].textContent, "SE ACERCA EL JEFE FINAL");
    assert.deepEqual(alarms, [3]);
  } finally { globalThis.setInterval = originalSetInterval; }
});

test("el jefe difícil carga y repite su descarga radial tras perder los nodos", () => {
  const game = controller();
  game.difficulty = "hard";
  game.enemyBullets = [];
  game.colors = { line: "#00ff88" };
  game.audio = { bossHit() {}, bossCharge: () => { game.chargeSound = true; }, bossAttack: () => { game.finalAttackSound = true; } };
  game.emit = () => {};
  game.registerKill = () => {};
  game.flashMessage = (message) => { game.message = message; };
  game.boss = { x: 600, y: 220, coreHp: 12, nodes: [{ x: 510, y: 220, hp: 0 }, { x: 690, y: 220, hp: 1 }] };

  game.hitBoss({ x: 690, y: 220 });

  assert.equal(game.enemyBullets.length, 0);
  assert.equal(game.boss.finalAttackState, "charging");
  assert.equal(game.chargeSound, true);
  assert.equal(game.message, "NÚCLEO INESTABLE // EVASIÓN");

  game.updateFinalBossAttack(game.boss, 1.35);
  assert.equal(game.enemyBullets.length, 12);
  assert.equal(game.finalAttackSound, true);
  assert.equal(game.message, "DESCARGA FINAL // EVASIÓN");
  assert.ok(game.enemyBullets.every((bullet) => bullet.life === 4.6));

  game.updateFinalBossAttack(game.boss, 3.65);
  assert.equal(game.boss.finalAttackState, "charging");
  game.updateFinalBossAttack(game.boss, 1.35);
  assert.equal(game.enemyBullets.length, 24);
});

test("los proyectiles dirigidos del jefe difícil alcanzan más lejos y alternan ráfagas", () => {
  const originalRandom = Math.random;
  try {
    Math.random = () => .99;
    const game = controller();
    game.difficulty = "hard";
    game.width = 1200;
    game.ship = { x: 600, y: 700 };
    game.enemyBullets = [];
    game.audio = { bossAttack() {} };
    game.boss = { x: 600, y: 220, vx: 0, shot: 0, nodes: [{ hp: 3 }, { hp: 3 }] };

    game.updateBoss(.1);

    assert.equal(game.enemyBullets.length, 5);
    assert.ok(game.enemyBullets.every((bullet) => bullet.life === 4.6));
  } finally { Math.random = originalRandom; }
});

test("el jefe normal hace una sola descarga al quedar expuesto", () => {
  const game = controller();
  game.difficulty = "normal";
  game.enemyBullets = [];
  game.audio = { bossCharge() {}, bossAttack() {} };
  game.flashMessage = () => {};
  const boss = { x: 600, y: 220, nodes: [{ hp: 0 }, { hp: 0 }], shot: 1 };

  game.updateFinalBossAttack(boss, .1);
  assert.equal(boss.finalAttackState, "charging");
  game.updateFinalBossAttack(boss, 1.35);
  assert.equal(game.enemyBullets.length, 12);
  assert.equal(boss.finalAttackState, "complete");
  game.updateFinalBossAttack(boss, 10);
  assert.equal(game.enemyBullets.length, 12);
});

test("cada etapa presenta dos mejoras distintas sin repetir la otra pareja", () => {
  const game = controller();
  game.upgradeDeck = [{ id: "twin" }, { id: "shield" }, { id: "overclock" }, { id: "long-shot" }];
  game.upgradeRound = 0;

  const first = game.nextUpgradeChoices();
  const second = game.nextUpgradeChoices();

  assert.deepEqual(first.map((upgrade) => upgrade.id), ["twin", "shield"]);
  assert.deepEqual(second.map((upgrade) => upgrade.id), ["overclock", "long-shot"]);
  assert.equal(new Set([...first, ...second].map((upgrade) => upgrade.id)).size, 4);
});

test("disparo largo duplica el tiempo de vida del pulso", () => {
  const game = controller();
  game.ship = { x: 100, y: 100, vx: 0, vy: 0, angle: 0, fire: 0 };
  game.bullets = [];
  game.audio = { playerShot() {} };
  game.upgrades = new Set();
  game.fire();
  assert.equal(game.bullets[0].life, .9);

  game.ship.fire = 0;
  game.bullets = [];
  game.upgrades = new Set(["long-shot"]);
  game.fire();
  assert.equal(game.bullets[0].life, 1.8);
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
