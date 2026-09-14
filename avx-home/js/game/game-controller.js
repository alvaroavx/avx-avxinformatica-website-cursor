const TAU = Math.PI * 2;
const wrap = (n, limit) => ((n % limit) + limit) % limit;
const distanceSq = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

function rock(x, y, radius, speed = 32) {
  const sides = 8 + Math.floor(Math.random() * 5);
  return { x, y, radius, sides, angle: Math.random() * TAU, spin: (Math.random() - 0.5) * 1.1, vx: Math.cos(Math.random() * TAU) * speed, vy: Math.sin(Math.random() * TAU) * speed, shape: Array.from({ length: sides }, () => 0.7 + Math.random() * 0.35) };
}

export class GameController {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d", { alpha: false });
    this.ui = Object.fromEntries(["score", "high-score", "lives", "final-score", "wave-message", "start-screen", "pause-screen", "game-over-screen", "pause-game"].map((id) => [id, document.getElementById(id)]));
    this.keys = new Set(); this.state = "ready"; this.highScore = Number(localStorage.getItem("avx-vector-field-high-score")) || 0; this.stars = [];
    this.resize(); this.bind(); this.render();
  }

  init() { this.updateHud(); }
  bind() {
    document.getElementById("start-game").addEventListener("click", () => this.start());
    document.getElementById("restart-game").addEventListener("click", () => this.start());
    document.getElementById("resume-game").addEventListener("click", () => this.resume());
    document.getElementById("restart-from-pause").addEventListener("click", () => this.start());
    this.ui["pause-game"].addEventListener("click", () => this.pause());
    window.addEventListener("resize", () => this.resize(), { passive: true });
    window.addEventListener("keydown", (e) => { if (["ArrowLeft", "ArrowRight", "ArrowUp", "KeyA", "KeyD", "KeyW", "Space"].includes(e.code)) e.preventDefault(); if (e.code === "Escape") this.state === "playing" ? this.pause() : this.state === "paused" && this.resume(); this.keys.add(e.code); });
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));
    document.querySelectorAll("[data-control]").forEach((button) => {
      const key = { left: "ArrowLeft", right: "ArrowRight", thrust: "ArrowUp", fire: "Space" }[button.dataset.control];
      const down = (e) => { e.preventDefault(); this.keys.add(key); }, up = (e) => { e.preventDefault(); this.keys.delete(key); };
      button.addEventListener("pointerdown", down); button.addEventListener("pointerup", up); button.addEventListener("pointercancel", up); button.addEventListener("pointerleave", up);
    });
  }
  resize() { const dpr = Math.min(devicePixelRatio || 1, 2); this.width = Math.max(320, innerWidth); this.height = Math.max(480, innerHeight); this.canvas.width = this.width * dpr; this.canvas.height = this.height * dpr; this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.stars = Array.from({ length: Math.ceil(this.width * this.height / 12000) }, () => ({ x: Math.random() * this.width, y: Math.random() * this.height, z: 0.2 + Math.random() * 0.8 })); if (this.ship) Object.assign(this.ship, { x: this.width / 2, y: this.height / 2 }); }
  start() { this.score = 0; this.wave = 0; this.rocks = []; this.bullets = []; this.particles = []; this.ship = { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, angle: -Math.PI / 2, lives: 3, safe: 2, fire: 0 }; this.state = "playing"; this.setScreen(null); this.ui["pause-game"].hidden = false; this.nextWave(); this.last = performance.now(); cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame((t) => this.loop(t)); }
  nextWave() { this.wave += 1; for (let i = 0; i < Math.min(3 + this.wave, 11); i += 1) { let next; do next = rock(Math.random() * this.width, Math.random() * this.height, 32 + Math.random() * 22, 24 + this.wave * 5); while (distanceSq(next, this.ship) < 260 ** 2); this.rocks.push(next); } this.ui["wave-message"].textContent = `OLEADA ${String(this.wave).padStart(2, "0")}`; setTimeout(() => { if (this.state === "playing") this.ui["wave-message"].textContent = ""; }, 1400); }
  pause() { if (this.state === "playing") { this.state = "paused"; this.setScreen("pause-screen"); this.ui["pause-game"].hidden = true; } }
  resume() { if (this.state === "paused") { this.state = "playing"; this.setScreen(null); this.ui["pause-game"].hidden = false; this.last = performance.now(); this.raf = requestAnimationFrame((t) => this.loop(t)); } }
  setScreen(id) { ["start-screen", "pause-screen", "game-over-screen"].forEach((screen) => { this.ui[screen].hidden = screen !== id; }); }
  loop(time) { if (this.state !== "playing") { this.render(); return; } const dt = Math.min((time - this.last) / 1000, 0.033); this.last = time; this.update(dt); this.render(); this.raf = requestAnimationFrame((t) => this.loop(t)); }
  update(dt) {
    const s = this.ship, left = this.keys.has("ArrowLeft") || this.keys.has("KeyA"), right = this.keys.has("ArrowRight") || this.keys.has("KeyD"), thrust = this.keys.has("ArrowUp") || this.keys.has("KeyW");
    s.angle += (Number(right) - Number(left)) * 4.4 * dt;
    if (thrust) { s.vx += Math.cos(s.angle) * 250 * dt; s.vy += Math.sin(s.angle) * 250 * dt; this.emit(s.x - Math.cos(s.angle) * 16, s.y - Math.sin(s.angle) * 16, "#ffb45d", 1); }
    s.vx *= 0.995; s.vy *= 0.995; s.x = wrap(s.x + s.vx * dt, this.width); s.y = wrap(s.y + s.vy * dt, this.height); s.safe = Math.max(0, s.safe - dt); s.fire -= dt;
    if (this.keys.has("Space") && s.fire <= 0) { this.bullets.push({ x: s.x + Math.cos(s.angle) * 22, y: s.y + Math.sin(s.angle) * 22, vx: s.vx + Math.cos(s.angle) * 520, vy: s.vy + Math.sin(s.angle) * 520, life: 0.9 }); s.fire = 0.18; }
    this.rocks.forEach((r) => { r.x = wrap(r.x + r.vx * dt, this.width); r.y = wrap(r.y + r.vy * dt, this.height); r.angle += r.spin * dt; });
    this.bullets = this.bullets.filter((b) => { b.x = wrap(b.x + b.vx * dt, this.width); b.y = wrap(b.y + b.vy * dt, this.height); b.life -= dt; return b.life > 0; });
    for (const b of this.bullets) for (const r of [...this.rocks]) if (distanceSq(b, r) < r.radius ** 2) { this.hitRock(r); b.life = 0; }
    if (!s.safe) for (const r of this.rocks) if (distanceSq(s, r) < (r.radius + 14) ** 2) { this.hitShip(); break; }
    this.particles = this.particles.filter((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; return p.life > 0; });
    if (!this.rocks.length) this.nextWave(); this.updateHud();
  }
  hitRock(r) { const i = this.rocks.indexOf(r); if (i < 0) return; this.rocks.splice(i, 1); this.score += Math.round(120 * (54 / r.radius)); this.emit(r.x, r.y, "#51f5ff", 18); if (r.radius > 28) for (let i = 0; i < 2; i += 1) this.rocks.push(rock(r.x, r.y, r.radius * 0.56, Math.hypot(r.vx, r.vy) * 1.35)); }
  hitShip() { const s = this.ship; s.lives -= 1; this.emit(s.x, s.y, "#ff5f6d", 34); if (s.lives <= 0) { this.state = "over"; this.ui["final-score"].textContent = String(this.score).padStart(6, "0"); this.ui["pause-game"].hidden = true; this.setScreen("game-over-screen"); return; } Object.assign(s, { x: this.width / 2, y: this.height / 2, vx: 0, vy: 0, safe: 2 }); }
  emit(x, y, color, amount) { for (let i = 0; i < amount; i += 1) { const a = Math.random() * TAU, v = 30 + Math.random() * 180; this.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, color, life: 0.25 + Math.random() * 0.55 }); } }
  updateHud() { this.highScore = Math.max(this.highScore, this.score || 0); localStorage.setItem("avx-vector-field-high-score", this.highScore); this.ui.score.textContent = String(this.score || 0).padStart(6, "0"); this.ui["high-score"].textContent = String(this.highScore).padStart(6, "0"); this.ui.lives.textContent = this.ship ? "● ".repeat(this.ship.lives).trim() || "—" : "● ● ●"; }
  render() { const c = this.ctx; c.fillStyle = "#020711"; c.fillRect(0, 0, this.width, this.height); c.fillStyle = "#9ddcff"; this.stars.forEach((s) => { c.globalAlpha = s.z; c.fillRect(s.x, s.y, 1.2, 1.2); }); c.globalAlpha = 1; if (!this.ship) return; c.strokeStyle = "#65f4ff"; c.lineWidth = 1.5; c.shadowColor = "#00d8ff"; c.shadowBlur = 12; this.rocks.forEach((r) => { c.save(); c.translate(r.x, r.y); c.rotate(r.angle); c.beginPath(); r.shape.forEach((size, i) => { const a = i / r.sides * TAU, x = Math.cos(a) * r.radius * size, y = Math.sin(a) * r.radius * size; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.stroke(); c.restore(); }); c.shadowColor = "#ffe269"; c.strokeStyle = "#fff2a7"; this.bullets.forEach((b) => { c.beginPath(); c.arc(b.x, b.y, 2, 0, TAU); c.stroke(); }); this.particles.forEach((p) => { c.globalAlpha = Math.max(0, p.life * 1.5); c.fillStyle = p.color; c.fillRect(p.x, p.y, 2, 2); }); c.globalAlpha = 1; const s = this.ship; if (!s.safe || Math.floor(s.safe * 10) % 2 === 0) { c.save(); c.translate(s.x, s.y); c.rotate(s.angle + Math.PI / 2); c.strokeStyle = "#9fffe2"; c.shadowColor = "#00ffae"; c.shadowBlur = 18; c.lineWidth = 2; c.beginPath(); c.moveTo(19, 0); c.lineTo(-14, 12); c.lineTo(-7, 0); c.lineTo(-14, -12); c.closePath(); c.stroke(); c.restore(); } c.shadowBlur = 0; }
}
