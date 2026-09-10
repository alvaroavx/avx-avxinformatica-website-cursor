export function createHiDPICanvas({ id, className, parent = document.body } = {}) {
  const canvas = document.createElement("canvas");
  if (id) canvas.id = id;
  if (className) canvas.className = className;
  parent.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  return { canvas, ctx };
}

export function resizeCanvasToViewport(canvas, ctx, { dpr = window.devicePixelRatio || 1 } = {}) {
  const w = Math.max(1, Math.floor(window.innerWidth));
  const h = Math.max(1, Math.floor(window.innerHeight));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width: w, height: h, dpr };
}

export function clear(ctx, { width, height, fill = null } = {}) {
  if (fill) {
    ctx.save();
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }
  ctx.clearRect(0, 0, width, height);
}

export function drawPolygon(ctx, points, { fill = null, stroke = null, lineWidth = 1 } = {}) {
  if (!points || points.length < 3) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();

  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

export function withGlow(ctx, { color = "rgba(0,255,136,0.35)", blur = 12 } = {}, fn) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  fn();
  ctx.restore();
}

