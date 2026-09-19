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
  easy: { lives: 4, rocks: 2, types: ["scout"], speedMultipliers: [1], reinforcementSeconds: 20, reinforcementRocks: 1 },
  normal: { lives: 3, rocks: 3, types: ["scout", "shard"], speedMultipliers: [2], reinforcementSeconds: 14, reinforcementRocks: 2 },
  hard: { lives: 2, rocks: 5, types: ["scout", "shard", "fortress"], speedMultipliers: [3, 4, 5], reinforcementSeconds: 9, reinforcementRocks: 3 },
};
const ASTEROID_TYPES = {
  scout: { radius: [32, 50], sides: [8, 12], speed: 1, hp: 1, score: 120, lineWidth: 1.5 },
  shard: { radius: [19, 30], sides: [4, 6], speed: 1.7, hp: 1, score: 190, lineWidth: 1.2 },
  fortress: { radius: [48, 64], sides: [10, 14], speed: 0.62, hp: 2, score: 420, lineWidth: 2.4 },
};

function rock(x, y, typeId, speed = 32) {
  const type = ASTEROID_TYPES[typeId];
  const radius = type.radius[0] + Math.random() * (type.radius[1] - type.radius[0]);
  const sides = type.sides[0] + Math.floor(Math.random() * (type.sides[1] - type.sides[0] + 1));
  return { x, y, typeId, radius, sides, hp: type.hp, maxHp: type.hp, score: type.score, lineWidth: type.lineWidth, angle: Math.random() * TAU, spin: (Math.random() - 0.5) * (typeId === "shard" ? 2.4 : 1.1), vx: Math.cos(Math.random() * TAU) * speed * type.speed, vy: Math.sin(Math.random() * TAU) * speed * type.speed, shape: Array.from({ length: sides }, () => typeId === "shard" ? 0.55 + Math.random() * 0.65 : 0.7 + Math.random() * 0.35) };
}

export class GameController {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.ui = Object.fromEntries(["score", "high-score", "lives", "final-score", "wave-message", "reinforcement-countdown", "wave-intro", "wave-title", "wave-countdown", "wave-detail", "start-screen", "pause-screen", "settings-screen", "game-over-screen", "pause-game"].map((id) => [id, document.getElementById(id)]));
    this.shell = document.getElementById("game-shell");
    this.keys = new Set(); this.state = "ready"; this.highScore = Number(localStorage.getItem("avx-vector-field-high-score")) || 0; this.stars = [];
    this.theme = localStorage.getItem("avx-vector-field-theme") || "green";
    this.difficulty = localStorage.getItem("avx-vector-field-difficulty") || "normal";
    this.applyTheme(this.theme);
    this.applyDifficulty(this.difficulty);
    this.resize(); this.bind(); this.render();
  }

  init() { this.updateHud(); }
  bind() {
    document.getElementById("start-game").addEventListener("click", () => this.start());
    document.getElementById("restart-game").addEventListener("click", () => this.start());
    document.getElementById("resume-game").addEventListener("click", () => this.resume());
    document.getElementById("restart-from-pause").addEventListener("click", () => this.start());
    document.getElementById("main-menu").addEventListener("click", () => this.mainMenu());
    document.getElementById("open-settings-from-menu").addEventListener("click", () => this.openSettings("ready"));
    document.getElementById("open-settings-from-pause").addEventListener("click", () => this.openSettings("paused"));
    document.getElementById("close-settings").addEventListener("click", () => this.closeSettings());
    document.querySelectorAll("[data-theme-choice]").forEach((button) => button.addEventListener("click", () => this.applyTheme(button.dataset.themeChoice)));
    document.querySelectorAll("[data-difficulty-choice]").forEach((button) => button.addEventListener("click", () => this.applyDifficulty(button.dataset.difficultyChoice)));
    this.ui["pause-game"].addEventListener("click", () => this.pause());
    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener("keydown", (e) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space"].includes(e.code)) e.preventDefault(); if (e.code === "Escape") { if (!this.ui["settings-screen"].hidden) this.closeSettings(); else if (this.state === "playing") this.pause(); else if (this.state === "paused") this.resume(); } this.keys.add(e.code); });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = { left: "ArrowLeft", right: "ArrowRight", thrust: "ArrowUp", fire: "Space" }[button.dataset.control];
      const down = (e) => { e.preventDefault(); this.keys.add(key); }, up = (e) => { e.preventDefault(); this.keys.delete(key); };
      button.addEventListener("pointerdown", down); button.addEventListener("pointerup", up); button.addEventListener("pointercancel", up); button.addEventListener("pointerleave", up);
    });
  }
  resize() { const dpr = Math.min(devicePixelRatio || 1, 2); this.width = Math.max(320, innerWidth); this.height = Math.max(480, innerHeight); this.canvas.width = this.width * dpr; this.canvas.height = this.height * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.stars = Array.from({ length: Math.ceil(this.width * this.height / 12000) }, () => ({ x: Math.random() * this.width, y: Math.random() * this.height, z: 0.2 + Math.random() * 0.8 })); if (this.ship) Object.assign(this.ship, { x: this.width / 2, y: this.height / 2 }); }
  start() { this.score = 0; this.wave = 0; this.rocks = []; this.bullets = []; this.particles = []; this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; this.ship = { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, lives: DIFFICULTIES[this.difficulty].lives, safe: 3, fire: 0 }; this.setScreen(null); this.ui["pause-game"].hidden = true; this.beginWave(); }
  spawnRock() { const difficulty = DIFFICULTIES[this.difficulty], multiplier = difficulty.speedMultipliers[Math.floor(Math.random() * difficulty.speedMultipliers.length)], typeId = difficulty.types[Math.floor(Math.random() * difficulty.types.length)], baseSpeed = 20 + this.wave * 5; let next; do next = rock(Math.random() * this.width, Math.random() * this.height, typeId, baseSpeed * multiplier); while (distanceSq(next, this.ship) < 260 ** 2); this.rocks.push(next); }
  beginWave() { clearInterval(this.waveTimer); this.wave += 1; this.state = "intermission"; this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; Object.assign(this.ship, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 3 }); this.ui["wave-title"].textContent = `NUEVA OLEADA // ${String(this.wave).padStart(2, "0")}`; this.ui["wave-detail"].textContent = `${DIFFICULTIES[this.difficulty].types.map((type) => ({ scout: "EXPLORADOR", shard: "FRAGMENTO", fortress: "BLINDADO" }[type])).join(" · ")}`; this.ui["wave-intro"].hidden = false; let count = 3; this.ui["wave-countdown"].textContent = String(count); this.waveTimer = setInterval(() => { count -= 1; if (count > 0) { this.ui["wave-countdown"].textContent = String(count); return; } clearInterval(this.waveTimer); this.ui["wave-intro"].hidden = true; const difficulty = DIFFICULTIES[this.difficulty]; for (let i = 0; i < Math.min(difficulty.rocks + this.wave, 13); i += 1) this.spawnRock(); this.state = "playing"; this.ui["pause-game"].hidden = false; this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); }, 1000); }
  pause() { if (this.state === "playing") { this.state = "paused"; this.setScreen("pause-screen"); this.ui["pause-game"].hidden = true; } }
  resume() { if (this.state === "paused") { this.state = "playing"; this.setScreen(null); this.ui["pause-game"].hidden = false; this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); } }
  mainMenu() { cancelAnimationFrame(this.raf); clearInterval(this.waveTimer); this.keys.clear(); this.state = "ready"; this.ui["pause-game"].hidden = true; this.ui["wave-intro"].hidden = true; this.setScreen("start-screen"); this.render(); }
  openSettings(origin) { this.settingsOrigin = origin; this.setScreen("settings-screen"); }
  closeSettings() { this.setScreen(this.settingsOrigin === "paused" ? "pause-screen" : "start-screen"); }
  applyTheme(theme) { if (!THEMES[theme]) return; this.theme = theme; this.colors = THEMES[theme]; this.shell.dataset.theme = theme; localStorage.setItem("avx-vector-field-theme", theme); document.querySelectorAll("[data-theme-choice]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme))); this.render(); }
  applyDifficulty(difficulty) { if (!DIFFICULTIES[difficulty]) return; this.difficulty = difficulty; localStorage.setItem("avx-vector-field-difficulty", difficulty); document.querySelectorAll("[data-difficulty-choice]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.difficultyChoice === difficulty))); }
  setScreen(id) { ["start-screen", "pause-screen", "settings-screen", "game-over-screen"].forEach((screen) => { this.ui[screen].hidden = screen !== id; }); }
  loop(time) { if (this.state !== "playing") { this.render(); return; } const dt = Math.min((time - this.last) / 1000, 0.033); this.last = time; this.update(dt); this.render(); this.raf = requestAnimationFrame((t) => this.loop(t)); }
  update(dt) {
    const s = this.ship, left = this.keys.has("ArrowLeft") || this.keys.has("KeyA"), right = this.keys.has("ArrowRight") || this.keys.has("KeyD"), thrust = this.keys.has("ArrowUp") || this.keys.has("KeyW");
    s.angle += (Number(right) - Number(left)) * 4.4 * dt;
    if (thrust) { s.vx += Math.cos(s.angle) * 250 * dt; s.vy += Math.sin(s.angle) * 250 * dt; this.emit(s.x - Math.cos(s.angle) * 16, s.y - Math.sin(s.angle) * 16, this.colors.thrust, 1); }
    s.vx *= 0.995; s.vy *= 0.995; s.x = wrap(s.x + s.vx * dt, this.width); s.y = wrap(s.y + s.vy * dt, this.height); s.safe = Math.max(0, s.safe - dt); s.fire -= dt;
    if (this.keys.has("Space") && s.fire <= 0) { this.bullets.push({ x: s.x + Math.cos(s.angle) * 22, y: s.y + Math.sin(s.angle) * 22, vx: s.vx + Math.cos(s.angle) * 520, vy: s.vy + Math.sin(s.angle) * 520, life: 0.9 }); s.fire = 0.18; }
    this.rocks.forEach((r) => { r.x = wrap(r.x + r.vx * dt, this.width); r.y = wrap(r.y + r.vy * dt, this.height); r.angle += r.spin * dt; });
    this.bullets = this.bullets.filter((b) => { b.x = wrap(b.x + b.vx * dt, this.width); b.y = wrap(b.y + b.vy * dt, this.height); b.life -= dt; return b.life > 0; });
    for (const b of this.bullets) for (const r of [...this.rocks]) if (distanceSq(b, r) < r.radius ** 2) { this.hitRock(r); b.life = 0; }
    if (!s.safe) for (const r of this.rocks) if (distanceSq(s, r) < (r.radius + 14) ** 2) { this.hitShip(); break; }
    this.particles = this.particles.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
    this.updateReinforcementTimer(dt);
    if (!this.rocks.length) this.beginWave(); this.updateHud();
  }
  updateReinforcementTimer(dt) { const difficulty = DIFFICULTIES[this.difficulty]; this.idleSeconds += dt; const secondsLeft = Math.ceil(difficulty.reinforcementSeconds - this.idleSeconds); if (secondsLeft <= 5 && secondsLeft > 0) this.ui["reinforcement-countdown"].textContent = `REFUERZOS EN ${String(secondsLeft).padStart(2, "0")}`; else this.ui["reinforcement-countdown"].textContent = ""; if (this.idleSeconds < difficulty.reinforcementSeconds) return; this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; for (let i = 0; i < difficulty.reinforcementRocks; i += 1) this.spawnRock(); this.ui["wave-message"].textContent = "REFUERZOS DETECTADOS"; setTimeout(() => { if (this.state === "playing") this.ui["wave-message"].textContent = ""; }, 1400); }
  hitRock(r) { const i = this.rocks.indexOf(r); if (i < 0) return; if (r.hp > 1) { r.hp -= 1; r.vx *= 1.18; r.vy *= 1.18; this.emit(r.x, r.y, "#ffcf66", 10); return; } this.idleSeconds = 0; this.ui["reinforcement-countdown"].textContent = ""; this.rocks.splice(i, 1); this.score += r.score; this.emit(r.x, r.y, this.colors.line, 18); if (r.typeId === "scout" && r.radius > 40) { const fragmentType = this.difficulty === "easy" ? "scout" : "shard"; for (let i = 0; i < 2; i += 1) this.rocks.push(rock(r.x, r.y, fragmentType, Math.hypot(r.vx, r.vy) * 1.35)); } }
  hitShip() { const s = this.ship; s.lives -= 1; this.emit(s.x, s.y, "#ff5f6d", 34); if (s.lives <= 0) { this.state = "over"; this.ui["final-score"].textContent = String(this.score).padStart(6, "0"); this.ui["pause-game"].hidden = true; this.setScreen("game-over-screen"); return; } Object.assign(s, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 2 }); }
  emit(x, y, color, amount) { for (let i = 0; i < amount; i += 1) { const a = Math.random() * TAU, v = 30 + Math.random() * 180; this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, color, life: 0.25 + Math.random() * 0.55 }); } }
  updateHud() { this.highScore = Math.max(this.highScore, this.score || 0); localStorage.setItem("avx-vector-field-high-score", this.highScore); this.ui.score.textContent = String(this.score || 0).padStart(6, "0"); this.ui["high-score"].textContent = String(this.highScore).padStart(6, "0"); this.ui.lives.textContent = this.ship ? "● ".repeat(this.ship.lives).trim() || "—" : "● ● ●"; }
  render() { const c = this.ctx; c.fillStyle = "#020711"; c.fillRect(0, 0, this.width, this.height); c.fillStyle = "#9ddcff"; this.stars.forEach((s) => { c.globalAlpha = s.z; c.fillRect(s.x, s.y, 1.2, 1.2); }); c.globalAlpha = 1; if (!this.ship) return; c.strokeStyle = this.colors.line; c.lineWidth = 1.5; c.shadowColor = this.colors.glow; c.shadowBlur = 12; this.rocks.forEach((r) => { c.save(); c.translate(r.x, r.y); c.rotate(r.angle); c.beginPath(); r.shape.forEach((size, i) => { const a = i / r.sides * TAU, x = Math.cos(a) * r.radius * size, y = Math.sin(a) * r.radius * size; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.stroke(); c.restore(); }); c.shadowColor = this.colors.bullet; c.strokeStyle = this.colors.bullet; this.bullets.forEach((b) => { c.beginPath(); c.arc(b.x, b.y, 2, 0, TAU); c.stroke(); }); this.particles.forEach((p) => { c.globalAlpha = Math.max(0, p.life * 1.5); c.fillStyle = p.color; c.fillRect(p.x, p.y, 2, 2); }); c.globalAlpha = 1; const s = this.ship; if (!s.safe || Math.floor(s.safe * 10) % 2 === 0) { c.save(); c.translate(s.x, s.y); c.rotate(s.angle); c.strokeStyle = this.colors.ship; c.shadowColor = this.colors.glow; c.shadowBlur = 18; c.lineWidth = 2; c.beginPath(); c.moveTo(19, 0); c.lineTo(-14, 12); c.lineTo(-7, 0); c.lineTo(-14, -12); c.closePath(); c.stroke(); c.restore(); } c.shadowBlur = 0; }
}
