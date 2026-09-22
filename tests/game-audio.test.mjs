import assert from "node:assert/strict";
import test from "node:test";
import { AUDIO_CATALOG, GameAudio } from "../src/js/audio/game-audio.js";
import { GameController } from "../src/js/game/game-controller.js";

class FakeParam {
  constructor() { this.value = 0; this.values = []; }
  setValueAtTime(value) { this.value = value; this.values.push(value); }
  exponentialRampToValueAtTime(value) { this.value = value; }
  linearRampToValueAtTime(value) { this.value = value; }
  cancelScheduledValues() {}
}
class FakeNode { connect() {} }
class FakeOscillator extends FakeNode {
  constructor() { super(); this.frequency = new FakeParam(); this.stopped = false; }
  start() { this.started = true; }
  stop() { this.stopped = true; }
}
class FakeGain extends FakeNode { constructor() { super(); this.gain = new FakeParam(); } }
class FakeContext {
  constructor() { this.state = "running"; this.currentTime = 0; this.destination = {}; this.oscillators = []; this.sampleRate = 44100; }
  createOscillator() { const oscillator = new FakeOscillator(); this.oscillators.push(oscillator); return oscillator; }
  createGain() { return new FakeGain(); }
  createBuffer() { return { getChannelData: () => new Float32Array(64) }; }
  createBufferSource() { return { connect() {}, start() {} }; }
}

const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) };
globalThis.window = { AudioContext: FakeContext, setTimeout: (callback) => { callback(); return 1; }, setInterval: () => 1 };

test("pausar finaliza propulsor, ambiente y secuencia musical", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.setThrust(true);
  audio.resumeForWave(1);
  const engine = audio.engine.oscillator;
  const ambience = Object.values(audio.ambience).filter((node) => typeof node.stop === "function");

  audio.pause();

  assert.equal(audio.engine, null);
  assert.equal(audio.ambience, null);
  assert.equal(audio.musicState, "paused");
  assert.equal(engine.stopped, true);
  assert.ok(ambience.every((oscillator) => oscillator.stopped));
});

test("la cuenta regresiva genera tres señales ascendentes", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.countdownTick(3);
  audio.countdownTick(2);
  audio.countdownTick(1);

  assert.deepEqual(audio.context.oscillators.slice(-3).map((oscillator) => oscillator.frequency.values[0]), [270, 360, 520]);
});

test("la cuenta del jefe usa una alarma distinta a la señal de oleada", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.bossCountdownAlarm(3);

  assert.deepEqual(audio.context.oscillators.slice(-2).map((oscillator) => oscillator.frequency.values[0]), [430, 615]);
  assert.ok(AUDIO_CATALOG.some((event) => event.id === "boss.countdown"));
});

test("la carga de descarga del jefe tiene una señal ascendente propia", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.bossCharge();

  assert.deepEqual(audio.context.oscillators.slice(-3).map((oscillator) => oscillator.frequency.values[0]), [145, 190, 265]);
  assert.ok(AUDIO_CATALOG.some((event) => event.id === "boss.charge"));
});

test("perder la partida reproduce un arpegio descendente propio", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.playerDeath();

  assert.deepEqual(audio.context.oscillators.slice(-4).map((oscillator) => oscillator.frequency.values[0]), [659.25, 523.25, 392, 261.63]);
  assert.ok(AUDIO_CATALOG.some((event) => event.id === "player.death"));
});

test("victoria y game over detienen la capa musical continua", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.resumeForWave(3, true);
  audio.victory();
  assert.equal(audio.musicState, "victory");
  assert.equal(audio.ambience, null);

  audio.resumeForWave(1);
  audio.gameOver();
  assert.equal(audio.musicState, "gameover");
  assert.equal(audio.ambience, null);
});

test("la victoria resuelve el motivo del boss con una fanfarria en Re mayor", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.victory();
  const frequencies = audio.context.oscillators.map((oscillator) => oscillator.frequency.values[0]);

  assert.ok(frequencies.includes(587.33)); // D5: primera nota de la fanfarria.
  assert.ok(frequencies.includes(739.99)); // F#5: tercera mayor, no el Fa menor del boss.
  assert.ok(frequencies.includes(1174.66)); // D6: resolución final.
});

test("el tema del boss suma capas y acelera al perder integridad", async () => {
  const audio = new GameAudio();
  await audio.unlock();
  audio.resumeForWave(3, true);
  assert.equal(audio.musicState, "boss");
  assert.equal(audio.bossPhase, 0);
  const arrivalVoices = audio.context.oscillators.length;

  audio.setBossIntensity(.4);
  assert.equal(audio.bossPhase, 1);
  assert.ok(audio.context.oscillators.length > arrivalVoices);

  audio.setBossIntensity(.7);
  assert.equal(audio.bossPhase, 2);
});

test("la pausa del controlador delega el apagado completo de audio", () => {
  let pauses = 0;
  const controller = Object.create(GameController.prototype);
  controller.state = "playing";
  controller.audio = { pause: () => { pauses += 1; } };
  controller.ui = { "pause-game": {} };
  controller.setScreen = (screen) => { controller.screen = screen; };

  controller.pause();

  assert.equal(controller.state, "paused");
  assert.equal(pauses, 1);
  assert.equal(controller.screen, "pause-screen");
  assert.equal(controller.ui["pause-game"].hidden, true);
});

test("el catálogo semántico y los presets se persisten sin tocar audio fuente", async () => {
  const audio = new GameAudio();
  assert.ok(AUDIO_CATALOG.some((event) => event.id === "player.shot"));
  assert.ok(AUDIO_CATALOG.some((event) => event.id === "boss.attack"));
  audio.savePreset("player.shot", { gain: .5, detune: -80, review: "APROBADO" });
  assert.deepEqual(audio.preset("player.shot"), { gain: .5, detune: -80, rate: 1, loop: false, variation: 0, review: "APROBADO", favorite: false });
  const exported = audio.exportPresets();
  const second = new GameAudio();
  second.importPresets(exported);
  assert.equal(second.preset("player.shot").detune, -80);
  await second.unlock();
  assert.equal(second.playEvent("player.shot"), true);
});

test("el mezclador del laboratorio persiste y aplica refuerzo musical", async () => {
  const audio = new GameAudio();
  audio.setMix("music", 1.6);
  audio.setMix("boss", 1.4);
  audio.setMix("master", 1.2);
  await audio.unlock();
  assert.equal(audio.mix.music, 1.6);
  assert.equal(audio.mix.boss, 1.4);
  assert.equal(audio.master.gain.value, audio.settings.volume * 1.2);
  assert.equal(audio.music.gain.value, audio.settings.music * 1.6);
  const restored = new GameAudio();
  assert.equal(restored.mix.music, 1.6);
  assert.equal(restored.mix.boss, 1.4);
});

test("el control principal limita la música de fondo a 70 por ciento", () => {
  const audio = new GameAudio();
  audio.setMusicVolume(1);
  assert.equal(audio.settings.music, .7);
  audio.setMusicVolume(-1);
  assert.equal(audio.settings.music, 0);
});

test("cada oleada emite los tonos 3, 2 y 1", () => {
  const originalInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
  const scheduled = [];
  globalThis.setInterval = (callback) => { scheduled.push(callback); return scheduled.length; };
  globalThis.clearInterval = () => {};
  globalThis.requestAnimationFrame = () => 1;

  try {
    const tones = [];
    const controller = Object.create(GameController.prototype);
    controller.audio = { stopEngine() {}, countdownTick: (value) => tones.push(value) };
    controller.wave = 0;
    controller.state = "ready";
    controller.idleSeconds = 0;
    controller.difficulty = "easy";
    controller.ship = {};
    controller.width = 1200;
    controller.height = 800;
    controller.ui = {
      "reinforcement-countdown": {}, "wave-title": {}, "wave-detail": {}, "wave-intro": {}, "wave-countdown": {},
    };

    controller.beginWave();
    scheduled[0]();
    scheduled[0]();

    assert.deepEqual(tones, [3, 2, 1]);
    assert.equal(controller.ui["wave-countdown"].textContent, "1");
  } finally {
    globalThis.setInterval = originalInterval;
    globalThis.clearInterval = originalClearInterval;
    globalThis.requestAnimationFrame = originalRequestAnimationFrame;
  }
});
