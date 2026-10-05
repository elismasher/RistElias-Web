import { STARS, COLORS } from '../config.js';
import { TAU, random } from '../math.js';

export function createStars(state) {
  const radius = Math.hypot(state.viewport.width, state.viewport.height) * STARS.radius;
  const rnd = random(STARS.seed);
  state.stars = [];
  for (const [count, depth] of STARS.layers) {
    for (let i = 0; i < count; i++) state.stars.push({
      x: (rnd() * 2 - 1) * radius * STARS.width, y: (rnd() * 2 - 1) * radius, depth,
      radius: (STARS.minSize + rnd() * STARS.sizeSpread) * (STARS.sizeBase + depth * STARS.sizeDepth),
      twinkle: rnd() * TAU, alpha: STARS.minAlpha + rnd() * STARS.alphaSpread,
      warm: rnd() < STARS.warmChance, cool: rnd() < STARS.coolChance,
    });
  }
}
export function renderStars(state) {
  const ctx = state.canvas.backgroundContext;
  const { width: vw, height: vh } = state.viewport;
  const camera = state.camera, mouse = state.mouse;
  ctx.clearRect(0, 0, vw, vh);
  const expand = camera.z / camera.fz;
  for (const star of state.stars) {
    const expansion = Math.pow(expand, STARS.expansion * star.depth);
    const x = vw / 2 + star.x * expansion - mouse.mx * STARS.parallaxX * star.depth
      - (camera.x - camera.galaxyX) * camera.z * STARS.cameraParallax * star.depth;
    const y = vh / 2 + star.y * expansion - mouse.my * STARS.parallaxY * star.depth
      - (camera.y - camera.galaxyY) * camera.z * STARS.cameraParallax * star.depth;
    if (x < -STARS.clipMargin || y < -STARS.clipMargin || x > vw + STARS.clipMargin || y > vh + STARS.clipMargin) continue;
    const alpha = star.alpha * (state.reducedMotion ? 1 : STARS.twinkleBase + STARS.twinkleAmplitude
      * Math.sin(state.time * STARS.twinkleFrequency * (1 + star.depth * STARS.twinkleDepth) + star.twinkle));
    const color = star.warm ? COLORS.warmStars : star.cool ? COLORS.coolStars : COLORS.stars;
    ctx.fillStyle = `rgba(${color},${alpha})`;
    ctx.beginPath(); ctx.arc(x, y, star.radius, 0, TAU); ctx.fill();
  }
}
