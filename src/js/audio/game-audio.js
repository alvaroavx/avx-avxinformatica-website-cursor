const STORAGE_KEY = "avx-vector-field-audio";
const LAB_STORAGE_KEY = "avx-vector-field-audio-lab";

export const AUDIO_CATALOG = [
  ["player.shot", "PLAYER", "Disparo", "playerShot"], ["player.hit", "PLAYER", "Impacto", "playerHit"], ["player.engine", "PLAYER", "Propulsor", "setThrust"],
  ["asteroid.hit", "ASTEROIDES", "Impacto", "asteroidHit"], ["asteroid.explode.small", "ASTEROIDES", "Explosión pequeña", "asteroidHit"], ["asteroid.explode.large", "ASTEROIDES", "Explosión grande", "asteroidHit"],
  ["drone.spawn", "DRONES", "Aparición", "droneSpawn"], ["drone.shot", "DRONES", "Disparo", "droneShot"],
  ["boss.arrival", "BOSS", "Llegada", "bossArrival"], ["boss.attack", "BOSS", "Ataque", "bossAttack"], ["boss.hit", "BOSS", "Impacto", "bossHit"],
  ["game.start", "JUEGO", "Inicio", "startSignal"], ["game.wave.start", "JUEGO", "Oleada", "waveSignal"], ["game.countdown", "JUEGO", "Cuenta regresiva", "countdownTick"], ["game.victory", "JUEGO", "Victoria", "victory"], ["game.over", "JUEGO", "Derrota", "gameOver"],
  ["ui.confirm", "INTERFAZ", "Confirmación", "uiConfirm"],
].map(([id, group, label, method]) => ({ id, group, label, method }));
const DEFAULT_PRESET = { gain: 1, detune: 0, rate: 1, loop: false, variation: 0, review: "SIN REVISAR", favorite: false };
const MIX_DEFAULTS = { master: 1, music: 1, sfx: 1, ambience: 1, boss: 1, player: 1, asteroids: 1, drones: 1, ui: 1 };
const BOSS_BASS = [73.42, null, 73.42, null, 73.42, null, 73.42, null, 73.42, null, 73.42, null, 65.41, null, 73.42, null, 58.27, null, 58.27, null, 58.27, null, 65.41, null, 73.42, null, 73.42, null, 65.41, null, 73.42, null];
const BOSS_MOTIF = [293.66, null, 293.66, null, 349.23, 415.3, 440, null, 293.66, null, 293.66, null, 523.25, 440, null, null];
const BOSS_ARP = [293.66, 440, 587.33, 698.46, 293.66, 440, 587.33, 698.46, 233.08, 349.23, 466.16, 587.33, 261.63, 392, 523.25, 659.25];
// Fanfarria original en Re mayor: resuelve la tensión cromática Re–Fa–Lab del boss.
const VICTORY_LEAD = [
  [0, 587.33, .16], [200, 739.99, .16], [400, 880, .34], [800, 1174.66, .58],
  [1600, 987.77, .16], [1800, 880, .16], [2000, 739.99, .34], [2400, 880, .58],
  [3200, 783.99, .16], [3400, 880, .16], [3600, 987.77, .34], [4000, 1174.66, .58],
  [4800, 880, .16], [5000, 739.99, .16], [5200, 659.25, .34], [5600, 1174.66, 1.55],
];
const VICTORY_CHORDS = [
  [0, [293.66, 369.99, 440]], [1600, [392, 493.88, 587.33]], [2400, [440, 554.37, 659.25]],
  [3200, [246.94, 293.66, 369.99]], [4000, [392, 493.88, 587.33]], [4800, [440, 554.37, 659.25]],
];
const VICTORY_BASS = [[0, 73.42], [800, 73.42], [1600, 98], [2400, 110], [3200, 123.47], [4000, 98], [4800, 110], [5600, 73.42]];
const VICTORY_SPARKLES = [[420, 1174.66], [530, 1760], [640, 1479.98], [750, 1760], [960, 2349.32]];

export class GameAudio {
  constructor() {
    this.settings = { muted: false, volume: .7, music: .32, ...this.readSettings() };
    this.context = null; this.master = null; this.music = null; this.sfx = null; this.engine = null; this.ambience = null; this.musicTimer = null; this.victoryTimers = []; this.musicStep = 0; this.musicState = "idle"; this.bossPhase = 0; this.lab = this.readLab(); this.mix = { ...MIX_DEFAULTS, ...(this.lab.__mix || {}) }; this.listeners = new Set(); this.activeSounds = 0;
  }

  readSettings() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; } }
  persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); }
  readLab() { try { return JSON.parse(localStorage.getItem(LAB_STORAGE_KEY)) || {}; } catch { return {}; } }
  preset(id) { return { ...DEFAULT_PRESET, ...(this.lab[id] || {}) }; }
  savePreset(id, changes) { this.lab[id] = { ...this.preset(id), ...changes }; localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(this.lab)); return this.preset(id); }
  resetPreset(id) { delete this.lab[id]; localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(this.lab)); return this.preset(id); }
  setMix(name, value) { if (!(name in MIX_DEFAULTS)) return; this.mix[name] = Math.max(0, Math.min(2, Number(value))); this.lab.__mix = this.mix; localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(this.lab)); this.applyGains(); }
  exportPresets() { return JSON.stringify(this.lab, null, 2); }
  importPresets(source) { const parsed = JSON.parse(source); if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") throw new Error("Configuración inválida"); this.lab = parsed; this.mix = { ...MIX_DEFAULTS, ...(this.lab.__mix || {}) }; localStorage.setItem(LAB_STORAGE_KEY, JSON.stringify(this.lab)); this.applyGains(); }
  onEvent(listener) { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  emitEvent(id) { const event = { id, at: new Date().toLocaleTimeString(), activeSounds: this.activeSounds }; this.listeners.forEach((listener) => listener(event)); }
  async unlock() {
    if (!this.context) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) return false;
      this.context = new Context(); this.master = this.context.createGain(); this.music = this.context.createGain(); this.sfx = this.context.createGain();
      this.music.connect(this.master); this.sfx.connect(this.master); this.master.connect(this.context.destination); this.applyGains();
    }
    if (this.context.state === "suspended") await this.context.resume();
    return true;
  }
  applyGains() { if (!this.master) return; this.master.gain.value = this.settings.muted ? 0 : this.settings.volume * this.mix.master; this.music.gain.value = this.settings.music * this.mix.music; this.sfx.gain.value = this.mix.sfx; if (this.ambience?.gain) this.ambience.gain.gain.value = .022 * this.mix.ambience; }
  eventMix(eventId, group) { const catalogGroup = eventId ? AUDIO_CATALOG.find((event) => event.id === eventId)?.group : null; const key = group || ({ PLAYER: "player", ASTEROIDES: "asteroids", DRONES: "drones", BOSS: "boss", INTERFAZ: "ui" }[catalogGroup] || "sfx"); return this.mix[key] ?? 1; }
  setMuted(muted) { this.settings.muted = muted; if (muted) { this.stopEngine(); this.stopAmbience(); } else if (!["idle", "paused", "victory", "gameover"].includes(this.musicState)) this.startAmbience(); this.persist(); this.applyGains(); }
  setVolume(volume) { this.settings.volume = Number(volume); this.persist(); this.applyGains(); }
  setMusicVolume(volume) { this.settings.music = Number(volume); this.persist(); this.applyGains(); }
  tone(frequency, duration, { type = "square", volume = .16, slide = 0, bus = this.sfx, eventId, group } = {}) {
    if (!this.context || this.settings.muted) return;
    const preset = eventId ? this.preset(eventId) : DEFAULT_PRESET, random = preset.variation ? (Math.random() * 2 - 1) * preset.variation : 0, rate = Math.max(.5, Math.min(2, preset.rate || 1)), detune = preset.detune + random;
    frequency *= 2 ** (detune / 1200); duration /= rate; volume *= Math.max(0, preset.gain + random / 100) * this.eventMix(eventId, group);
    const now = this.context.currentTime, oscillator = this.context.createOscillator(), gain = this.context.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now); if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(18, frequency + slide), now + duration);
    gain.gain.setValueAtTime(.0001, now); gain.gain.exponentialRampToValueAtTime(volume, now + .008); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain); gain.connect(bus); oscillator.start(now); oscillator.stop(now + duration + .03); this.activeSounds += 1; if (eventId) this.emitEvent(eventId); window.setTimeout(() => { this.activeSounds = Math.max(0, this.activeSounds - 1); }, (duration + .04) * 1000);
  }
  noise(duration, volume = .11, bus = this.sfx) {
    if (!this.context || this.settings.muted) return;
    const buffer = this.context.createBuffer(1, Math.max(1, Math.floor(this.context.sampleRate * duration)), this.context.sampleRate), data = buffer.getChannelData(0);
    for (let index = 0; index < data.length; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / data.length);
    const source = this.context.createBufferSource(), gain = this.context.createGain(); source.buffer = buffer; gain.gain.value = volume; source.connect(gain); gain.connect(bus); source.start();
  }
  playerShot() { this.tone(580 + Math.random() * 55, .075, { volume: .12, slide: 260, eventId: "player.shot" }); }
  asteroidHit(large = false) { this.tone(large ? 110 : 180, large ? .2 : .12, { type: "triangle", volume: large ? .2 : .12, slide: -45, eventId: large ? "asteroid.explode.large" : "asteroid.hit" }); this.noise(large ? .12 : .06, large ? .1 : .05); }
  playerHit() { this.tone(130, .32, { type: "sawtooth", volume: .25, slide: -90, eventId: "player.hit" }); this.noise(.18, .16); }
  droneSpawn() { this.tone(260, .18, { type: "sawtooth", volume: .11, slide: 150, eventId: "drone.spawn" }); }
  droneShot() { this.tone(210, .11, { type: "square", volume: .1, slide: -70, eventId: "drone.shot" }); }
  bossArrival() { this.duck(); this.tone(62, .55, { type: "sawtooth", volume: .3, slide: -25, eventId: "boss.arrival" }); this.noise(.24, .16); }
  bossAttack() { this.tone(95, .22, { type: "sawtooth", volume: .18, slide: 110, eventId: "boss.attack" }); }
  bossHit() { this.tone(155, .16, { type: "triangle", volume: .16, slide: -45, eventId: "boss.hit" }); }
  startSignal() { this.tone(380, .12, { volume: .13, slide: 200, eventId: "game.start" }); }
  countdownTick(value) { const frequency = ({ 3: 270, 2: 360, 1: 520 })[value] || 270; this.tone(frequency, .12, { type: "triangle", volume: value === 1 ? .17 : .12, slide: value === 1 ? 120 : 45, eventId: "game.countdown" }); if (value === 1) this.noise(.045, .035); }
  waveSignal() { this.tone(330, .1, { volume: .1, slide: 110, eventId: "game.wave.start" }); }
  uiConfirm() { this.tone(520, .06, { type: "square", volume: .08, slide: 80, eventId: "ui.confirm" }); }
  scheduleVictory(callback, delay) { this.victoryTimers.push(window.setTimeout(callback, delay)); }
  clearVictoryFanfare() { this.victoryTimers.forEach((timer) => (window.clearTimeout || clearTimeout)(timer)); this.victoryTimers = []; }
  playVictoryFanfare() {
    VICTORY_LEAD.forEach(([at, frequency, duration], index) => this.scheduleVictory(() => {
      // Dos timbres leves construyen un brass retro sin samples externos.
      this.tone(frequency, duration, { type: "sawtooth", volume: .085, bus: this.music, eventId: index === 0 ? "game.victory" : undefined, group: "boss" });
      this.tone(frequency, duration * .92, { type: "square", volume: .035, bus: this.music, group: "boss" });
    }, at));
    VICTORY_CHORDS.forEach(([at, chord]) => this.scheduleVictory(() => chord.forEach((frequency) => this.tone(frequency, .65, { type: "triangle", volume: .042, bus: this.music, group: "boss" })), at));
    VICTORY_BASS.forEach(([at, frequency]) => this.scheduleVictory(() => this.tone(frequency, .32, { type: "sawtooth", volume: .07, bus: this.music, group: "boss" }), at));
    [0, 1600, 3200, 4800].forEach((at) => this.scheduleVictory(() => this.tone(58, .09, { type: "sine", volume: .1, slide: -20, bus: this.music, group: "boss" }), at));
    [800, 2400, 4000].forEach((at) => this.scheduleVictory(() => this.noise(.055, .035, this.music), at));
    VICTORY_SPARKLES.forEach(([at, frequency]) => this.scheduleVictory(() => this.tone(frequency, .1, { type: "square", volume: .026, bus: this.music, group: "boss" }), at));
    this.scheduleVictory(() => {
      [293.66, 369.99, 440, 587.33].forEach((frequency) => this.tone(frequency, 1.9, { type: "triangle", volume: .065, bus: this.music, group: "boss" }));
      this.noise(.22, .06, this.music);
    }, 5600);
  }
  victory() {
    this.clearVictoryFanfare(); this.setMusicState("victory");
    // Explosión, vacío breve y destello ascendente antes de la fanfarria.
    this.tone(72, .28, { type: "sawtooth", volume: .22, slide: -42, bus: this.music, eventId: "game.victory", group: "boss" }); this.noise(.16, .1, this.music);
    this.scheduleVictory(() => this.tone(440, .32, { type: "sine", volume: .05, slide: 920, bus: this.music, group: "boss" }), 450);
    this.scheduleVictory(() => this.playVictoryFanfare(), 750);
  }
  gameOver() { this.setMusicState("gameover"); this.tone(240, .45, { type: "sawtooth", volume: .22, slide: -170, eventId: "game.over" }); }
  duck() { if (!this.music || !this.context) return; const now = this.context.currentTime; this.music.gain.cancelScheduledValues(now); this.music.gain.setValueAtTime(this.settings.music, now); this.music.gain.linearRampToValueAtTime(.05, now + .08); this.music.gain.linearRampToValueAtTime(this.settings.music, now + .7); }
  setThrust(active) {
    if (!this.context || this.settings.muted) return;
    if (active && !this.engine) { const oscillator = this.context.createOscillator(), gain = this.context.createGain(); oscillator.type = "sawtooth"; oscillator.frequency.value = 44; gain.gain.value = .0001; oscillator.connect(gain); gain.connect(this.sfx); oscillator.start(); this.engine = { oscillator, gain }; }
    if (!this.engine) return; const now = this.context.currentTime; this.engine.gain.gain.cancelScheduledValues(now); this.engine.gain.gain.linearRampToValueAtTime(active ? .055 : .0001, now + .06); this.engine.oscillator.frequency.linearRampToValueAtTime(active ? 68 : 42, now + .08);
  }
  stopEngine() { if (!this.engine) return; this.engine.oscillator.stop(); this.engine = null; }
  startAmbience() {
    if (!this.context || this.settings.muted || this.ambience) return;
    const carrier = this.context.createOscillator(), shimmer = this.context.createOscillator(), gain = this.context.createGain(), lfo = this.context.createOscillator(), depth = this.context.createGain();
    carrier.type = "sine"; carrier.frequency.value = 43; shimmer.type = "triangle"; shimmer.frequency.value = 86; gain.gain.value = .022; lfo.type = "sine"; lfo.frequency.value = .075; depth.gain.value = .012;
    carrier.connect(gain); shimmer.connect(gain); lfo.connect(depth); depth.connect(gain.gain); gain.connect(this.music); carrier.start(); shimmer.start(); lfo.start(); this.ambience = { carrier, shimmer, lfo, gain }; this.applyGains();
  }
  stopAmbience() { if (!this.ambience) return; Object.values(this.ambience).filter((node) => typeof node.stop === "function").forEach((node) => node.stop()); this.ambience = null; }
  bossStep() {
    const step = this.musicStep++ % 32, motif = BOSS_MOTIF[step % BOSS_MOTIF.length], bass = BOSS_BASS[step];
    if (bass) this.tone(bass, .15, { type: "sawtooth", volume: .09, bus: this.music, group: "boss" });
    if (motif) this.tone(motif, .11, { type: "square", volume: .05, bus: this.music, group: "boss" });
    if (this.bossPhase >= 1) { this.tone(BOSS_ARP[step % BOSS_ARP.length], .07, { type: "square", volume: .032, bus: this.music, group: "boss" }); if (step % 8 === 0) this.tone(52, .12, { type: "sine", volume: .15, slide: -24, bus: this.music, group: "boss" }); }
    if (this.bossPhase >= 2) { if (step % 4 === 2) this.noise(.07, .045, this.music); this.noise(.018, .013, this.music); }
  }
  startBossSequence() { clearInterval(this.musicTimer); this.musicStep = 0; this.bossStep(); this.musicTimer = window.setInterval(() => this.bossStep(), this.bossPhase >= 2 ? 105 : 114); }
  setBossIntensity(intensity) { const phase = intensity >= .7 ? 2 : intensity >= .4 ? 1 : 0; if (phase === this.bossPhase) return; this.bossPhase = phase; if (this.musicState === "boss") this.startBossSequence(); }
  setMusicState(state) {
    if (!this.context) return; if (this.musicState === state) return; if (state !== "victory") this.clearVictoryFanfare(); this.musicState = state; clearInterval(this.musicTimer); this.musicTimer = null;
    if (["idle", "paused", "victory", "gameover"].includes(state)) { this.stopAmbience(); return; }
    this.startAmbience();
    if (state === "boss") { this.bossPhase = 0; this.startBossSequence(); return; }
    const notes = state === "high" ? [110, 147, 165, 147] : state === "medium" ? [98, 131, 147, 131] : [82, 110, 123, 110];
    const interval = state === "high" ? 390 : 520; this.musicStep = 0;
    const tick = () => { this.tone(notes[this.musicStep++ % notes.length], .18, { type: "triangle", volume: .075, bus: this.music }); };
    tick(); this.musicTimer = window.setInterval(tick, interval);
  }
  pause() { this.stopEngine(); this.setMusicState("paused"); }
  resumeForWave(wave, boss = false) { this.setMusicState(boss ? "boss" : wave >= 3 ? "high" : wave === 2 ? "medium" : "low"); }
  playEvent(id) {
    const event = AUDIO_CATALOG.find((candidate) => candidate.id === id); if (!event) return false;
    if (event.method === "setThrust") { this.setThrust(true); return true; }
    if (event.method === "countdownTick") { this.countdownTick(3); return true; }
    if (event.method === "asteroidHit") { this.asteroidHit(id.endsWith("large")); return true; }
    this[event.method](); return true;
  }
}
