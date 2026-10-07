import { COMET, COLORS } from '../config.js';
import { TAU } from '../math.js';

export function renderComet(dt, state) {
  const ctx = state.canvas.effectsContext;
  ctx.clearRect(0, 0, state.viewport.width, state.viewport.height);
  const mouse = state.mouse, comet = state.comet;
  if (state.documentFlow || !state.finePointer || !mouse.inside) { comet.trail.length = 0; return; }
  comet.trail.push({ x: mouse.x, y: mouse.y, time: state.time });
  while (comet.trail.length && state.time - comet.trail[0].time > COMET.duration) comet.trail.shift();
  const head = mouse.interactive || state.hoverAsteroid ? COMET.interactiveHead : COMET.head;
  comet.head += (head - comet.head) * Math.min(1, dt * COMET.smoothing);
  ctx.lineCap = 'round';
  for (let i = 1; i < comet.trail.length; i++) {
    const a = comet.trail[i - 1], b = comet.trail[i];
    const k = 1 - (state.time - b.time) / COMET.duration;
    ctx.strokeStyle = `rgba(${COLORS.cometTrail},${k * k * COMET.trailAlpha})`;
    ctx.lineWidth = Math.max(COMET.minWidth, comet.head * COMET.width * k);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, comet.head * COMET.glowRadius);
  gradient.addColorStop(0, `rgba(${COLORS.cometGlow},${COMET.glowAlpha})`);
  gradient.addColorStop(1, `rgba(${COLORS.cometTrail},0)`);
  ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, comet.head * COMET.glowRadius, 0, TAU); ctx.fill();
  ctx.fillStyle = COLORS.cometCore; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, comet.head * COMET.coreRadius, 0, TAU); ctx.fill();
}
