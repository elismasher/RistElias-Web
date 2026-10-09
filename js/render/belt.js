import { ASSETS, BELT, RENDER, COLORS } from '../config.js';
import { TAU } from '../math.js';
import { projectX, projectY } from '../camera.js';

export function createBeltImage() {
  const image = new Image(); image.src = ASSETS.belt;
  return image;
}
export function renderBelt(state) {
  const ctx = state.canvas.backgroundContext;
  const { width: vw, height: vh } = state.viewport;
  const { amount: E } = state.world;
  const { z, tilt, dim } = state.camera;
  const opacity = (1 - E) * dim;
  const mouse = state.mouse;
  const dpr = state.viewport.dpr;
  state.hoverAsteroid = null;
  if (opacity > RENDER.orbitThreshold) {
    for (const body of state.world.planets) {
      ctx.strokeStyle = `rgba(${COLORS.stars},${(RENDER.orbitAlpha + body.hover * RENDER.orbitHoverAlpha) * opacity})`;
      ctx.lineWidth = RENDER.orbitWidth;
      ctx.setLineDash(body.orbit.dashed ? RENDER.orbitDash : []);
      ctx.beginPath();
      ctx.ellipse(projectX(0, state), projectY(0, state), body.orbit.a * z, body.orbit.a * tilt * z, 0, 0, TAU);
      ctx.stroke(); ctx.setLineDash([]);
    }
  }
  const image = state.beltImage;
  if (image.complete && image.naturalWidth && opacity > RENDER.orbitThreshold) {
    for (const asteroid of state.world.belt) {
      const sin = Math.sin(asteroid.angle);
      const x = projectX(asteroid.radius * Math.cos(asteroid.angle), state);
      const y = projectY(asteroid.radius * tilt * sin, state);
      const size = asteroid.size * z * (1 + BELT.depthScale * sin);
      if (x < -size || y < -size || x > vw + size || y > vh + size) continue;
      const depthAlpha = BELT.depthAlpha + (1 - BELT.depthAlpha) * (sin + 1) / 2;
      const wave = state.values.beltWave * (0.5 + 0.5 * Math.sin(state.sceneTime * BELT.waveFrequency - asteroid.angle * BELT.waveAngle));
      let glow = wave * BELT.waveGlow;
      if (asteroid.marked) {
        glow = Math.max(glow, BELT.markedGlow + BELT.markedPulse * Math.sin(state.sceneTime * BELT.markedFrequency + asteroid.angle * BELT.markedAngle));
        const distance = Math.hypot(mouse.x - x, mouse.y - y);
        if (mouse.inside && E < RENDER.hoverFocus && dim > BELT.hoverDim && distance < Math.max(BELT.hitRadius, size * BELT.hitSize) && !mouse.interactive) {
          state.hoverAsteroid = { x, y, size }; glow = 1;
        }
      }
      if (glow > BELT.glowThreshold) {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * BELT.glowRadius);
        gradient.addColorStop(0, `rgba(${COLORS.belt},${BELT.glowAlpha * glow * opacity})`);
        gradient.addColorStop(1, `rgba(${COLORS.belt},0)`);
        ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(x, y, size * BELT.glowRadius, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = opacity * Math.min(1, depthAlpha + glow * BELT.alphaGlow);
      const cos = Math.cos(asteroid.rotation), sinR = Math.sin(asteroid.rotation);
      ctx.setTransform(dpr * cos, dpr * sinR, -dpr * sinR, dpr * cos, dpr * x, dpr * y);
      ctx.drawImage(image, -size / 2, -size / 2, size, size);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalAlpha = 1;
    }
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  state.canvas.background.style.cursor = state.hoverAsteroid ? 'pointer' : '';
}
