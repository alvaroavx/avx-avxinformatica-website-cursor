export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function wrapAngleRad(rad) {
  const twoPi = Math.PI * 2;
  let r = rad % twoPi;
  if (r < 0) r += twoPi;
  return r;
}

export function vec2(x = 0, y = 0) {
  return { x, y };
}

export function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function sub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function scale(v, s) {
  return { x: v.x * s, y: v.y * s };
}

export function lengthSq(v) {
  return v.x * v.x + v.y * v.y;
}

export function length(v) {
  return Math.sqrt(lengthSq(v));
}

export function normalize(v) {
  const len = length(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function distSq(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function dist(a, b) {
  return Math.sqrt(distSq(a, b));
}

export function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function fromAngle(angleRad, magnitude = 1) {
  return { x: Math.cos(angleRad) * magnitude, y: Math.sin(angleRad) * magnitude };
}

