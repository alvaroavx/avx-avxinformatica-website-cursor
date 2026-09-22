import { GameAudio } from "../audio/game-audio.js";

const TAU = Math.PI * 2;
const wrap = (n, limit) => ((n % limit) + limit) % limit;
const distanceSq = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
const THEMES = {
  green: { line: "#00ff88", glow: "#00cc6a", bullet: "#dcffc2", ship: "#baffdc", thrust: "#ffb45d" },
  cyan: { line: "#65f4ff", glow: "#00d8ff", bullet: "#fff2a7", ship: "#9fffe2", thrust: "#ffb45d" },
  pink: { line: "#ff69c7", glow: "#f347ad", bullet: "#ffe0f2", ship: "#ffd0ed", thrust: "#ffc061" },
  yellow: { line: "#ffe16b", glow: "#e8ba35", bullet: "#fff8ce", ship: "#fff0a8", thrust: "#ff9d5d" },
};
const DIFFICULTIES = {
  easy: { lives: 4, rocks: 2, types: ["scout", "shard", "fortress", "intruder"], speedMultipliers: [1], fortressHp: 2, reinforcementSeconds: 20, reinforcementRocks: 1 },
  normal: { lives: 3, rocks: 3, types: ["scout", "shard", "fortress", "intruder"], speedMultipliers: [2], fortressHp: 3, reinforcementSeconds: 14, reinforcementRocks: 2 },
  hard: { lives: 2, rocks: 5, types: ["scout", "shard", "fortress", "intruder"], speedMultipliers: [3, 4, 5], fortressHp: 5, reinforcementSeconds: 9, reinforcementRocks: 3 },
};
const ASTEROID_TYPES = {
  scout: { radius: [32, 50], sides: [8, 12], speed: 1, hp: 1, score: 120, lineWidth: 1.5 },
  shard: { radius: [19, 30], sides: [4, 6], speed: 1.7, hp: 1, score: 190, lineWidth: 1.2 },
  fortress: { radius: [48, 64], sides: [10, 14], speed: .62, hp: 2, score: 420, lineWidth: 2.4 },
  intruder: { radius: [25, 34], sides: [4, 4], speed: 1.15, hp: 2, score: 560, lineWidth: 1.8 },
};
const TYPE_NAMES = { scout: "EXPLORADOR", shard: "FRAGMENTO", fortress: "BLINDADO", intruder: "DRON INTRUSO" };
const UPGRADES = [
  { id: "twin", signal: "PULSO DOBLE", copy: "Dos pulsos paralelos en cada disparo." },
  { id: "overclock", signal: "SOBREMARCHA", copy: "Reduce el intervalo de disparo un 35%." },
  { id: "shield", signal: "ESCUDO REACTIVO", copy: "Absorbe un impacto crítico." },
  { id: "long-shot", signal: "DISPARO LARGO", copy: "Duplica el alcance de cada pulso." },
];
function rock(x, y, typeId, speed = 32, canSplit = true, hitPoints = null) {
  const type = ASTEROID_TYPES[typeId], radius = type.radius[0] + Math.random() * (type.radius[1] - type.radius[0]);
  const sides = type.sides[0] + Math.floor(Math.random() * (type.sides[1] - type.sides[0] + 1));
  return { x, y, typeId, radius, sides, hp: hitPoints ?? type.hp, score: type.score, lineWidth: type.lineWidth, canSplit, angle: Math.random() * TAU, spin: (Math.random() - .5) * (typeId === "shard" ? 2.4 : 1.1), vx: Math.cos(Math.random() * TAU) * speed * type.speed, vy: Math.sin(Math.random() * TAU) * speed * type.speed, shot: 1.2 + Math.random(), droneMode: "search", droneTimer: 1 + Math.random(), burstRemaining: 0, shape: Array.from({ length: sides }, () => typeId === "shard" ? .55 + Math.random() * .65 : .7 + Math.random() * .35) };
}

export class GameController {
  constructor() {
    this.canvas = document.getElementById("game-canvas"); this.ctx = this.canvas.getContext("2d", { alpha: false });
    const ids = ["game-hud", "score", "high-score", "lives", "combo", "wave", "mission-time", "difficulty-status", "final-score", "victory-score", "wave-message", "reinforcement-countdown", "wave-intro", "wave-title", "wave-countdown", "wave-detail", "tutorial-hint", "upgrade-options", "start-screen", "pause-screen", "settings-screen", "upgrade-screen", "game-over-screen", "victory-screen", "pause-game", "audio-toggle", "audio-volume", "music-volume"];
    this.ui = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)])); this.shell = document.getElementById("game-shell");
    this.keys = new Set(); this.state = "ready"; this.highScore = Number(localStorage.getItem("avx-vector-field-high-score")) || 0; this.stars = []; this.audio = new GameAudio(); this.labMode = false; this.labFreeze = false; this.labAi = true;
    this.theme = localStorage.getItem("avx-vector-field-theme") || "green"; this.difficulty = localStorage.getItem("avx-vector-field-difficulty") || "normal";
    this.applyTheme(this.theme); this.applyDifficulty(this.difficulty); this.resize(); this.bind(); this.render();
  }
  init() { this.updateHud(); this.updateAudioControls(); }
  bind() {
    document.querySelectorAll("[data-start-difficulty]").forEach((button) => button.addEventListener("click", () => { this.applyDifficulty(button.dataset.startDifficulty); this.start(); }));
    ["restart-game", "restart-victory"].forEach((id) => document.getElementById(id).addEventListener("click", () => this.start()));
    ["main-menu", "main-menu-from-game-over", "main-menu-from-victory"].forEach((id) => document.getElementById(id).addEventListener("click", () => this.mainMenu()));
    document.getElementById("resume-game").addEventListener("click", () => this.resume()); document.getElementById("restart-from-pause").addEventListener("click", () => this.start());
    document.getElementById("open-settings-from-menu").addEventListener("click", () => this.openSettings("ready")); document.getElementById("open-settings-from-pause").addEventListener("click", () => this.openSettings("paused")); document.getElementById("close-settings").addEventListener("click", () => this.closeSettings());
    document.querySelectorAll("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => this.applyTheme(button.dataset.themeChoice)));
    this.ui["audio-toggle"].addEventListener("click", () => { this.audio.setMuted(!this.audio.settings.muted); this.updateAudioControls(); });
    this.ui["audio-volume"].addEventListener("input", (event) => this.audio.setVolume(event.target.value));
    this.ui["music-volume"].addEventListener("input", (event) => this.audio.setMusicVolume(event.target.value));
    this.ui["pause-game"].addEventListener("click", () => this.pause());
    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener("keydown", (event) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space"].includes(event.code)) event.preventDefault(); if (event.code === "Escape") { if (!this.ui["settings-screen"].hidden) this.closeSettings(); else if (this.state === "playing") this.pause(); else if (this.state === "paused") this.resume(); } this.keys.add(event.code); });
    window.addEventListener("keyup", (event) => this.keys.delete(event.code));
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && this.state === "playing") this.pause(); });
    document.querySelectorAll("[data-control]").forEach((button) => { const key = { left: "ArrowLeft", right: "ArrowRight", thrust: "ArrowUp", fire: "Space" }[button.dataset.control], down = (event) => { event.preventDefault(); this.keys.add(key); }, up = (event) => { event.preventDefault(); this.keys.delete(key); }; button.addEventListener("pointerdown", down); button.addEventListener("pointerup", up); button.addEventListener("pointercancel", up); button.addEventListener("pointerleave", up); });
  }
  resize() { const dpr = Math.min(devicePixelRatio || 1, 2); this.width = Math.max(320, innerWidth); this.height = Math.max(480, innerHeight); this.canvas.width = this.width * dpr; this.canvas.height = this.height * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.stars = Array.from({ length: Math.ceil(this.width * this.height / 12000) }, () => ({ x: Math.random() * this.width, y: Math.random() * this.height, z: .2 + Math.random() * .8 })); }
  start() {
    cancelAnimationFrame(this.raf); clearInterval(this.waveTimer); this.audio.stopEngine(); this.score = 0; this.wave = 0; this.rocks = []; this.bullets = []; this.enemyBullets = []; this.particles = []; this.boss = null; this.idleSeconds = 0; this.missionSeconds = 0; this.combo = 1; this.comboTime = 0; this.threatsDestroyed = 0; this.reboots = 0; this.upgrades = new Set(); this.prepareUpgradeDeck(); this.tutorialStep = 0;
    this.ui["reinforcement-countdown"].textContent = ""; this.ui["tutorial-hint"].hidden = true; this.ship = { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, lives: DIFFICULTIES[this.difficulty].lives, safe: 3, fire: 0, shield: 0 };
    this.audio.unlock().then(() => { this.audio.startSignal(); this.audio.resumeForWave(1); }); this.updateAudioControls(); this.setScreen(null); this.setHudVisible(true); this.ui["pause-game"].hidden = true; this.beginWave();
  }
  spawnRock() {
    const difficulty = DIFFICULTIES[this.difficulty], typeId = difficulty.types[Math.floor(Math.random() * difficulty.types.length)];
    const multiplier = difficulty.speedMultipliers[Math.floor(Math.random() * difficulty.speedMultipliers.length)], baseSpeed = 20 + this.wave * 5; let next; do next = rock(Math.random() * this.width, Math.random() * this.height, typeId, baseSpeed * multiplier, true, typeId === "fortress" ? difficulty.fortressHp : null); while (distanceSq(next, this.ship) < 260 ** 2); this.rocks.push(next); if (typeId === "intruder") this.audio.droneSpawn();
  }
  beginWave() {
    clearInterval(this.waveTimer); this.audio.stopEngine(); this.wave += 1; this.state = "intermission"; this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; Object.assign(this.ship, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 3 });
    this.ui["wave-title"].textContent = `FASE ${String(this.wave).padStart(2, "0")} // NUEVA OLEADA`; this.ui["wave-detail"].textContent = DIFFICULTIES[this.difficulty].types.map((type) => TYPE_NAMES[type]).join(" · "); this.ui["wave-intro"].hidden = false; let count = 3; this.ui["wave-countdown"].textContent = String(count); this.audio.countdownTick(count);
    this.waveTimer = setInterval(() => { count -= 1; if (count > 0) { this.ui["wave-countdown"].textContent = String(count); this.audio.countdownTick(count); return; } clearInterval(this.waveTimer); this.ui["wave-intro"].hidden = true; const difficulty = DIFFICULTIES[this.difficulty]; for (let i = 0; i < Math.min(difficulty.rocks + this.wave, 13); i += 1) this.spawnRock(); this.state = "playing"; this.audio.waveSignal(); this.audio.resumeForWave(this.wave); this.ui["pause-game"].hidden = false; this.last = performance.now(); this.showTutorial(); this.raf = requestAnimationFrame((time) => this.loop(time)); }, 1000);
  }
  prepareUpgradeDeck() { this.upgradeDeck = [...UPGRADES]; for (let index = this.upgradeDeck.length - 1; index > 0; index -= 1) { const replacement = Math.floor(Math.random() * (index + 1)); [this.upgradeDeck[index], this.upgradeDeck[replacement]] = [this.upgradeDeck[replacement], this.upgradeDeck[index]]; } this.upgradeRound = 0; }
  nextUpgradeChoices() { if (!this.upgradeDeck) this.prepareUpgradeDeck(); const start = this.upgradeRound * 2, choices = this.upgradeDeck.slice(start, start + 2); this.upgradeRound += 1; return choices; }
  openUpgrade() {
    this.state = "upgrade"; this.audio.stopEngine(); this.audio.setMusicState("paused"); this.ui["pause-game"].hidden = true; const choices = this.nextUpgradeChoices();
    this.ui["upgrade-options"].replaceChildren(...choices.map((upgrade) => { const button = document.createElement("button"); button.type = "button"; button.className = "upgrade-option"; button.innerHTML = `<strong>${upgrade.signal}</strong><small>${upgrade.copy}</small>`; button.addEventListener("click", () => { this.upgrades.add(upgrade.id); if (upgrade.id === "shield") this.ship.shield += 1; this.setScreen(null); this.beginWave(); }); return button; })); this.setScreen("upgrade-screen");
  }
  beginBoss() {
    this.audio.stopEngine(); this.state = "intermission"; this.ui["wave-title"].textContent = "ALERTA CRÍTICA // JEFE FINAL"; this.ui["wave-detail"].textContent = "SE ACERCA EL JEFE FINAL"; this.ui["wave-intro"].hidden = false; let count = 3; this.ui["wave-countdown"].textContent = String(count); this.audio.bossCountdownAlarm(count);
    this.waveTimer = setInterval(() => { count -= 1; if (count > 0) { this.ui["wave-countdown"].textContent = String(count); this.audio.bossCountdownAlarm(count); return; } clearInterval(this.waveTimer); this.ui["wave-intro"].hidden = true; this.boss = { x: this.width / 2, y: this.height * .26, vx: 80, coreHp: 12, shot: 1, nodes: [-1, 1].map((side) => ({ x: this.width / 2 + side * 90, y: this.height * .26, hp: 3, side })) }; this.state = "playing"; this.audio.bossArrival(); this.audio.resumeForWave(3, true); window.setTimeout(() => { if (this.state === "playing" && this.boss) this.audio.setBossIntensity(.4); }, 1800); this.ui["pause-game"].hidden = false; this.last = performance.now(); this.raf = requestAnimationFrame((time) => this.loop(time)); }, 1000);
  }
  pause() { if (this.state === "playing") { this.state = "paused"; this.audio.pause(); this.setScreen("pause-screen"); this.ui["pause-game"].hidden = true; } }
  resume() { if (this.state === "paused") { this.state = "playing"; this.audio.resumeForWave(this.wave, Boolean(this.boss)); this.setScreen(null); this.ui["pause-game"].hidden = false; this.last = performance.now(); this.raf = requestAnimationFrame((time) => this.loop(time)); } }
  mainMenu() { cancelAnimationFrame(this.raf); clearInterval(this.waveTimer); this.keys.clear(); this.state = "ready"; this.audio.pause(); this.setHudVisible(false); this.ui["pause-game"].hidden = true; this.ui["wave-intro"].hidden = true; this.ui["tutorial-hint"].hidden = true; this.setScreen("start-screen"); this.render(); }
  openSettings(origin) { this.settingsOrigin = origin; this.setScreen("settings-screen"); }
  closeSettings() { this.setScreen(this.settingsOrigin === "paused" ? "pause-screen" : "start-screen"); }
  applyTheme(theme) { if (!THEMES[theme]) return; this.theme = theme; this.colors = THEMES[theme]; this.shell.dataset.theme = theme; localStorage.setItem("avx-vector-field-theme", theme); document.querySelectorAll("[data-theme-choice]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme))); this.render(); }
  applyDifficulty(difficulty) { if (!DIFFICULTIES[difficulty]) return; this.difficulty = difficulty; localStorage.setItem("avx-vector-field-difficulty", difficulty); document.querySelectorAll("[data-start-difficulty]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.startDifficulty === difficulty))); }
  setHudVisible(visible) { this.ui["game-hud"].classList.toggle("hud--visible", visible); this.ui["game-hud"].setAttribute("aria-hidden", String(!visible)); this.ui["audio-toggle"].hidden = !visible; }
  updateAudioControls() { const { muted, volume, music } = this.audio.settings; this.ui["audio-toggle"].textContent = muted ? "🔇" : "🔊"; this.ui["audio-toggle"].setAttribute("aria-label", muted ? "Activar sonido" : "Silenciar sonido"); this.ui["audio-toggle"].setAttribute("aria-pressed", String(muted)); this.ui["audio-volume"].value = String(volume); this.ui["music-volume"].value = String(music); }
  setScreen(id) { ["start-screen", "pause-screen", "settings-screen", "upgrade-screen", "game-over-screen", "victory-screen"].forEach((screen) => { this.ui[screen].hidden = screen !== id; }); }
  loop(time) { if (this.state !== "playing") { this.render(); return; } const dt = Math.min((time - this.last) / 1000, .033); this.last = time; this.update(dt); this.render(); this.raf = requestAnimationFrame((next) => this.loop(next)); }
  update(dt) {
    if (this.labMode && this.labFreeze) { this.updateHud(); return; }
    const s = this.ship, left = this.keys.has("ArrowLeft") || this.keys.has("KeyA"), right = this.keys.has("ArrowRight") || this.keys.has("KeyD"), thrust = this.keys.has("ArrowUp") || this.keys.has("KeyW");
    s.angle += (Number(right) - Number(left)) * 4.4 * dt;
    if (thrust) { s.vx += Math.cos(s.angle) * 250 * dt; s.vy += Math.sin(s.angle) * 250 * dt; this.emit(s.x - Math.cos(s.angle) * 16, s.y - Math.sin(s.angle) * 16, this.colors.thrust, 1); } this.audio.setThrust(thrust);
    s.vx *= .995; s.vy *= .995; s.x = wrap(s.x + s.vx * dt, this.width); s.y = wrap(s.y + s.vy * dt, this.height); s.safe = Math.max(0, s.safe - dt); s.fire -= dt; if (this.keys.has("Space")) this.fire();
    this.updateRocks(dt); this.updateBoss(dt); this.updateBullets(dt); this.updateEnemyBullets(dt); if (!s.safe && this.collidesShip()) this.hitShip();
    this.particles = this.particles.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; }); this.missionSeconds += dt; if (this.comboTime > 0) { this.comboTime -= dt; if (this.comboTime <= 0) this.combo = 1; }
    if (!this.labMode && this.state === "playing" && !this.boss) this.updateReinforcementTimer(dt); if (!this.labMode && this.state === "playing" && !this.boss && !this.rocks.length) { if (this.wave < 3) this.openUpgrade(); else this.beginBoss(); } this.updateHud();
  }
  fire() { const s = this.ship; if (s.fire > 0) return; const range = this.upgrades.has("long-shot") ? 1.8 : .9; (this.upgrades.has("twin") ? [-.12, .12] : [0]).forEach((offset) => { const angle = s.angle + offset; this.bullets.push({ x: s.x + Math.cos(angle) * 22, y: s.y + Math.sin(angle) * 22, vx: s.vx + Math.cos(angle) * 520, vy: s.vy + Math.sin(angle) * 520, life: range }); }); this.audio.playerShot(); s.fire = this.upgrades.has("overclock") ? .117 : .18; }
  fireDrone(r, angle, cooldown) { this.enemyBullets.push({ x: r.x, y: r.y, vx: Math.cos(angle) * 180, vy: Math.sin(angle) * 180, life: this.difficulty === "hard" ? 5.2 : 2.6 }); this.audio.droneShot(); r.shot = cooldown; }
  easyDroneApproachTarget(r) { const angle = r.lastApproachAngle === undefined ? Math.random() * TAU : (r.lastApproachAngle + Math.PI / 2 + Math.random() * Math.PI) % TAU; r.lastApproachAngle = angle; return { x: wrap(this.ship.x + Math.cos(angle) * 220, this.width), y: wrap(this.ship.y + Math.sin(angle) * 220, this.height) }; }
  easyDroneRetreatTarget() { const margin = 48, corners = [[margin, margin], [this.width - margin, margin], [margin, this.height - margin], [this.width - margin, this.height - margin]]; const [x, y] = corners.reduce((farthest, candidate) => distanceSq({ x: candidate[0], y: candidate[1] }, this.ship) > distanceSq({ x: farthest[0], y: farthest[1] }, this.ship) ? candidate : farthest); return { x, y }; }
  updateIntruder(r, dt) {
    const angle = Math.atan2(this.ship.y - r.y, this.ship.x - r.x), distance = Math.hypot(this.ship.x - r.x, this.ship.y - r.y);
    if (this.difficulty === "hard") {
      if (r.droneMode === "burst") {
        r.vx *= .9; r.vy *= .9; r.shot -= dt;
        if (r.shot <= 0) { this.fireDrone(r, angle, .24); r.burstRemaining -= 1; if (r.burstRemaining <= 0) { r.droneMode = "move"; r.droneTimer = 1.15 + Math.random() * .55; } }
        return;
      }
      r.droneMode = "move"; r.droneTimer = (r.droneTimer ?? 1) - dt;
      r.vx += (Math.cos(angle) * 118 - r.vx) * 1.8 * dt; r.vy += (Math.sin(angle) * 118 - r.vy) * 1.8 * dt;
      if (r.droneTimer <= 0) { r.droneMode = "burst"; r.burstRemaining = 3; r.shot = 0; }
      return;
    }
    if (this.difficulty === "easy") {
      if (!r.droneTarget) { r.droneMode = "approach"; r.droneTarget = this.easyDroneApproachTarget(r); }
      if (Math.hypot(r.droneTarget.x - r.x, r.droneTarget.y - r.y) < 38) {
        if (r.droneMode === "retreat") { r.droneMode = "approach"; r.droneTarget = this.easyDroneApproachTarget(r); } else { r.droneMode = "retreat"; r.droneTarget = this.easyDroneRetreatTarget(); } r.vx = 0; r.vy = 0; r.droneTimer = .35;
      }
      if (r.droneTimer > 0) { r.droneTimer -= dt; return; }
      const heading = Math.atan2(r.droneTarget.y - r.y, r.droneTarget.x - r.x);
      r.vx += (Math.cos(heading) * 86 - r.vx) * 1.25 * dt; r.vy += (Math.sin(heading) * 86 - r.vy) * 1.25 * dt;
      return;
    }
    // Normal patrulla cerca de la nave, pero dispara de manera espaciada.
    r.droneTimer = (r.droneTimer ?? 0) - dt;
    if (distance < 220) { r.droneHeading = angle + Math.PI; r.droneTimer = .85; } else if (r.droneTimer <= 0 || r.droneHeading === undefined) { r.droneHeading = angle; r.droneTimer = 1.2 + Math.random() * 1.5; }
    r.vx += (Math.cos(r.droneHeading) * 74 - r.vx) * 1.5 * dt; r.vy += (Math.sin(r.droneHeading) * 74 - r.vy) * 1.5 * dt;
    if (this.difficulty === "normal") { r.shot -= dt; if (r.shot <= 0) this.fireDrone(r, angle, 3.4 + Math.random() * 1.4); }
  }
  updateRocks(dt) { this.rocks.forEach((r) => { if (r.typeId === "intruder" && (!this.labMode || this.labAi)) this.updateIntruder(r, dt); r.x = wrap(r.x + r.vx * dt, this.width); r.y = wrap(r.y + r.vy * dt, this.height); r.angle += r.spin * dt; }); }
  updateBullets(dt) { this.bullets = this.bullets.filter((b) => { b.x = wrap(b.x + b.vx * dt, this.width); b.y = wrap(b.y + b.vy * dt, this.height); b.life -= dt; return b.life > 0; }); for (const bullet of this.bullets) { if (this.boss && this.hitBoss(bullet)) { bullet.life = 0; continue; } for (const r of [...this.rocks]) if (distanceSq(bullet, r) < r.radius ** 2) { this.hitRock(r); bullet.life = 0; break; } } }
  updateEnemyBullets(dt) { this.enemyBullets = this.enemyBullets.filter((bullet) => { bullet.x += bullet.vx * dt; bullet.y += bullet.vy * dt; bullet.life -= dt; return bullet.life > 0 && bullet.x >= 0 && bullet.x <= this.width && bullet.y >= 0 && bullet.y <= this.height; }); }
  collidesShip() { return this.rocks.some((r) => (r.typeId !== "intruder" || this.difficulty === "hard") && distanceSq(this.ship, r) < (r.radius + 14) ** 2) || this.enemyBullets.some((bullet) => distanceSq(this.ship, bullet) < 17 ** 2) || Boolean(this.boss && distanceSq(this.ship, this.boss) < 62 ** 2); }
  updateBoss(dt) { if (!this.boss || (this.labMode && !this.labAi)) return; const boss = this.boss; boss.x += boss.vx * dt; if (boss.x < 120 || boss.x > this.width - 120) boss.vx *= -1; boss.nodes.forEach((node) => { node.x = boss.x + node.side * 90; node.y = boss.y + Math.sin(performance.now() / 420 + node.side) * 20; }); if (this.difficulty !== "easy" && boss.nodes.every((node) => node.hp <= 0)) this.updateFinalBossAttack(boss, dt); boss.shot -= dt; if (boss.shot <= 0 && boss.finalAttackState !== "charging") { const angle = Math.atan2(this.ship.y - boss.y, this.ship.x - boss.x), range = this.difficulty === "hard" ? 4.6 : 3, shots = this.difficulty === "hard" ? 3 + Math.floor(Math.random() * 3) : 3; Array.from({ length: shots }, (_, index) => (index - (shots - 1) / 2) * .18).forEach((offset) => this.enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(angle + offset) * 220, vy: Math.sin(angle + offset) * 220, life: range })); this.audio.bossAttack(); boss.shot = 1.45; } }
  beginFinalBossCharge(boss) { boss.finalAttackState = "charging"; boss.finalAttackTimer = 1.35; this.audio.bossCharge(); this.flashMessage("NÚCLEO INESTABLE // EVASIÓN"); }
  releaseFinalBossAttack(boss) { for (let index = 0; index < 12; index += 1) { const angle = index / 12 * TAU; this.enemyBullets.push({ x: boss.x, y: boss.y, vx: Math.cos(angle) * 260, vy: Math.sin(angle) * 260, life: this.difficulty === "hard" ? 4.6 : 2.8 }); } boss.finalAttackState = this.difficulty === "hard" ? "cooldown" : "complete"; boss.finalAttackTimer = this.difficulty === "hard" ? 3.65 : 0; boss.shot = Math.max(boss.shot || 0, .8); this.audio.bossAttack(); this.flashMessage("DESCARGA FINAL // EVASIÓN"); }
  updateFinalBossAttack(boss, dt) { if (!boss.finalAttackState) { this.beginFinalBossCharge(boss); return; } if (boss.finalAttackState === "complete") return; boss.finalAttackTimer -= dt; if (boss.finalAttackTimer > 0) return; if (boss.finalAttackState === "charging") this.releaseFinalBossAttack(boss); else this.beginFinalBossCharge(boss); }
  hitBoss(bullet) { const boss = this.boss, node = boss.nodes.find((candidate) => candidate.hp > 0 && distanceSq(bullet, candidate) < 30 ** 2); if (node) { node.hp -= 1; this.audio.bossHit(); this.emit(node.x, node.y, this.colors.line, 9); if (node.hp === 0) { this.registerKill(420); if (this.difficulty !== "easy" && boss.nodes.every((candidate) => candidate.hp <= 0) && !boss.finalAttackState) this.beginFinalBossCharge(boss); } return true; } if (boss.nodes.some((candidate) => candidate.hp > 0) || distanceSq(bullet, boss) >= 54 ** 2) return false; boss.coreHp -= 1; this.audio.bossHit(); this.audio.setBossIntensity(1 - boss.coreHp / 12); this.emit(boss.x, boss.y, "#ffcf66", 10); if (boss.coreHp <= 0) this.victory(); return true; }
  updateReinforcementTimer(dt) { const difficulty = DIFFICULTIES[this.difficulty]; this.idleSeconds += dt; const secondsLeft = Math.ceil(difficulty.reinforcementSeconds - this.idleSeconds); this.ui["reinforcement-countdown"].textContent = secondsLeft <= 5 && secondsLeft > 0 ? `REFUERZOS EN ${String(secondsLeft).padStart(2, "0")}` : ""; if (this.idleSeconds < difficulty.reinforcementSeconds) return; this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; for (let i = 0; i < difficulty.reinforcementRocks; i += 1) this.spawnRock(); this.flashMessage("REFUERZOS DETECTADOS"); }
  hitRock(r) { const index = this.rocks.indexOf(r); if (index < 0) return; if (r.hp > 1) { r.hp -= 1; this.audio.asteroidHit(false); r.vx *= 1.18; r.vy *= 1.18; this.emit(r.x, r.y, "#ffcf66", 10); return; } this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; this.rocks.splice(index, 1); this.audio.asteroidHit(r.radius > 40); this.registerKill(r.score); this.emit(r.x, r.y, this.colors.line, 18); if (r.canSplit && r.typeId === "scout" && r.radius > 40) { const fragmentType = this.difficulty === "easy" ? "scout" : "shard"; for (let i = 0; i < 2; i += 1) this.rocks.push(rock(r.x, r.y, fragmentType, Math.hypot(r.vx, r.vy) * 1.35, false)); } }
  registerKill(points) { this.combo = Math.min(5, this.combo + 1); this.comboTime = 4; this.score += points * this.combo; this.threatsDestroyed += 1; }
  hitShip() { const s = this.ship; this.enemyBullets = []; this.audio.playerHit(); this.emit(s.x, s.y, "#ff5f6d", 34); if (s.shield > 0) { s.shield -= 1; s.safe = 2.5; this.flashMessage("ESCUDO REACTIVO ACTIVADO"); return; } s.lives -= 1; this.combo = 1; if (s.lives > 0) { Object.assign(s, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 2 }); return; } if (this.difficulty !== "hard") { this.reboots += 1; s.lives = DIFFICULTIES[this.difficulty].lives; this.score = Math.floor(this.score * .75); Object.assign(s, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 3 }); this.flashMessage("REINICIO DE EMERGENCIA // INTEGRIDAD 75%"); return; } this.gameOver(); }
  gameOver() { this.state = "over"; this.audio.stopEngine(); this.audio.playerDeath(); this.audio.gameOver(); this.setHudVisible(false); this.ui["final-score"].textContent = String(this.score).padStart(6, "0"); this.ui["pause-game"].hidden = true; this.setScreen("game-over-screen"); this.saveRun("game_over"); }
  victory() { this.state = "victory"; this.boss = null; this.audio.stopEngine(); this.audio.victory(); this.setHudVisible(false); this.ui["victory-score"].textContent = String(this.score).padStart(6, "0"); this.ui["pause-game"].hidden = true; this.setScreen("victory-screen"); this.saveRun("victory"); }
  startLabArena() { cancelAnimationFrame(this.raf); clearInterval(this.waveTimer); this.labMode = true; this.labFreeze = true; this.labAi = true; this.score = 0; this.wave = 1; this.rocks = []; this.bullets = []; this.enemyBullets = []; this.particles = []; this.boss = null; this.ship = { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, lives: 99, safe: Infinity, fire: 0, shield: 0 }; this.state = "playing"; this.setScreen(null); this.setHudVisible(true); this.ui["pause-game"].hidden = true; this.audio.unlock().then(() => this.audio.resumeForWave(1)); this.last = performance.now(); this.raf = requestAnimationFrame((time) => this.loop(time)); }
  labSpawn(typeId, x = this.width / 2, y = this.height / 2) { if (!this.labMode) return; if (typeId === "boss") { this.boss = { x, y, vx: 80, coreHp: 12, shot: 1, nodes: [-1, 1].map((side) => ({ x: x + side * 90, y, hp: 3, side })) }; return; } if (!ASTEROID_TYPES[typeId]) return; this.rocks.push(rock(x, y, typeId, 35)); if (typeId === "intruder") this.audio.droneSpawn(); }
  labClear() { if (!this.labMode) return; this.rocks = []; this.bullets = []; this.enemyBullets = []; this.particles = []; this.boss = null; }
  labCommand(command) { if (command === "start") return this.startLabArena(); if (command === "clear") return this.labClear(); if (command === "freeze") { this.labFreeze = !this.labFreeze; return; } if (command === "ai") { this.labAi = !this.labAi; return; } if (command === "shot") return this.fire(); if (command === "hit") return this.hitShip(); if (command === "boss") return this.labSpawn("boss"); if (ASTEROID_TYPES[command]) return this.labSpawn(command); this.audio.playEvent(command); }
  async saveRun(outcome) { try { await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score: this.score, difficulty: this.difficulty, outcome, threatsDestroyed: this.threatsDestroyed, reboots: this.reboots, upgrades: [...this.upgrades] }) }); } catch (_) { /* Static hosting remains playable without persistence. */ } }
  showTutorial() { if (this.difficulty !== "easy") return; const prompts = ["GIRA: ← → / A D · PROPULSA: ↑ / W", "DISPARA CON ESPACIO", "ELIMINA AMENAZAS SIN PERDER EL COMBO"], text = prompts[this.tutorialStep]; if (!text) return; this.ui["tutorial-hint"].textContent = text; this.ui["tutorial-hint"].hidden = false; window.setTimeout(() => { if (this.state === "playing") { this.ui["tutorial-hint"].hidden = true; this.tutorialStep += 1; } }, 3600); }
  flashMessage(message) { this.ui["wave-message"].textContent = message; window.setTimeout(() => { if (this.ui["wave-message"].textContent === message) this.ui["wave-message"].textContent = ""; }, 1600); }
  emit(x, y, color, amount) { for (let i = 0; i < amount; i += 1) { const angle = Math.random() * TAU, velocity = 30 + Math.random() * 180; this.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, color, life: .25 + Math.random() * .55 }); } }
  updateHud() { this.highScore = Math.max(this.highScore, this.score || 0); localStorage.setItem("avx-vector-field-high-score", this.highScore); this.ui.score.textContent = String(this.score || 0).padStart(6, "0"); this.ui["high-score"].textContent = String(this.highScore).padStart(6, "0"); this.ui.lives.textContent = this.ship ? "● ".repeat(this.ship.lives).trim() || "—" : "● ● ●"; this.ui.combo.textContent = `×${this.combo || 1}`; this.ui.wave.textContent = this.wave >= 3 || this.boss ? "FINAL" : String(Math.max(1, this.wave || 1)).padStart(2, "0"); this.ui["difficulty-status"].textContent = ({ easy: "FÁCIL", normal: "NORMAL", hard: "DIFÍCIL" })[this.difficulty]; const seconds = Math.floor(this.missionSeconds || 0); this.ui["mission-time"].textContent = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`; }
  render() {
    const c = this.ctx; c.fillStyle = "#020711"; c.fillRect(0, 0, this.width, this.height); c.fillStyle = "#9ddcff"; this.stars.forEach((star) => { c.globalAlpha = star.z; c.fillRect(star.x, star.y, 1.2, 1.2); }); c.globalAlpha = 1; if (!this.ship) return; c.shadowColor = this.colors.glow; c.shadowBlur = 12;
    this.rocks.forEach((r) => this.renderRock(c, r)); if (this.boss) this.renderBoss(c, this.boss); c.shadowColor = this.colors.bullet; c.strokeStyle = this.colors.bullet; c.lineWidth = 1.5; this.bullets.forEach((bullet) => { c.beginPath(); c.arc(bullet.x, bullet.y, 2, 0, TAU); c.stroke(); }); c.strokeStyle = "#ffcf66"; this.enemyBullets.forEach((bullet) => { c.beginPath(); c.arc(bullet.x, bullet.y, 3, 0, TAU); c.stroke(); });
    this.particles.forEach((particle) => { c.globalAlpha = Math.max(0, particle.life * 1.5); c.fillStyle = particle.color; c.fillRect(particle.x, particle.y, 2, 2); }); c.globalAlpha = 1; const s = this.ship; if (!s.safe || Math.floor(s.safe * 10) % 2 === 0) { c.save(); c.translate(s.x, s.y); c.rotate(s.angle); c.strokeStyle = this.colors.ship; c.shadowColor = this.colors.glow; c.shadowBlur = 18; c.lineWidth = 2; c.beginPath(); c.moveTo(19, 0); c.lineTo(-14, 12); c.lineTo(-7, 0); c.lineTo(-14, -12); c.closePath(); c.stroke(); if (s.shield) { c.globalAlpha = .65; c.beginPath(); c.arc(0, 0, 27, 0, TAU); c.stroke(); } c.restore(); } c.shadowBlur = 0;
  }
  renderRock(c, r) { c.save(); c.translate(r.x, r.y); c.rotate(r.angle); c.strokeStyle = r.typeId === "fortress" ? "#ffcf66" : r.typeId === "intruder" ? "#ff6fae" : this.colors.line; c.lineWidth = r.lineWidth; if (r.typeId === "shard") c.setLineDash([5, 4]); c.beginPath(); r.shape.forEach((size, index) => { const angle = index / r.sides * TAU, x = Math.cos(angle) * r.radius * size, y = Math.sin(angle) * r.radius * size; index ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.stroke(); c.setLineDash([]); if (r.typeId === "fortress" || r.typeId === "intruder") { c.globalAlpha = .75; c.beginPath(); c.arc(0, 0, r.radius * .42, 0, TAU); c.stroke(); c.globalAlpha = 1; } c.restore(); }
  renderBoss(c, boss) { const charging = boss.finalAttackState === "charging", pulse = charging ? (Math.sin(performance.now() / 52) + 1) / 2 : 0; c.save(); c.shadowColor = "#ffcf66"; c.strokeStyle = "#ffcf66"; c.lineWidth = 2.4 + pulse * 1.4; c.shadowBlur = charging ? 24 + pulse * 30 : 0; c.translate(boss.x + (charging ? (Math.random() - .5) * (2 + pulse * 4) : 0), boss.y + (charging ? (Math.random() - .5) * (2 + pulse * 4) : 0)); c.beginPath(); c.arc(0, 0, 50, 0, TAU); c.stroke(); if (boss.nodes.every((node) => node.hp <= 0)) { c.beginPath(); c.arc(0, 0, 20 + Math.sin(performance.now() / 160) * 4 + pulse * 8, 0, TAU); c.stroke(); if (charging) { c.globalAlpha = .45 + pulse * .35; c.beginPath(); c.arc(0, 0, 58 + pulse * 18, 0, TAU); c.stroke(); } } c.restore(); boss.nodes.filter((node) => node.hp > 0).forEach((node) => { c.save(); c.translate(node.x, node.y); c.rotate(Math.PI / 4); c.strokeStyle = "#ff6fae"; c.lineWidth = 2; c.strokeRect(-18, -18, 36, 36); c.restore(); }); }
}
