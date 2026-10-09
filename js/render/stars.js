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
const ALPHA_STEPS = 12;
const COLOR_KEYS = ['stars', 'warmStars', 'coolStars'];
let batches = null;
// Stars are batched per colour and quantised alpha, so a frame costs a few
// dozen fills instead of one path and fill per star.
function batchFor(color, step) {
  if (!batches) batches = COLOR_KEYS.map(() => Array.from({ length: ALPHA_STEPS + 1 }, () => null));
  return batches[color][step];
}
export function renderStars(state) {
  const ctx = state.canvas.backgroundContext;
  const { width: vw, height: vh } = state.viewport;
  const camera = state.camera, mouse = state.mouse;
  ctx.clearRect(0, 0, vw, vh);
  const expand = camera.z / camera.fz;
  const expansions = [];
  const camX = (camera.x - camera.galaxyX) * camera.z * STARS.cameraParallax;
  const camY = (camera.y - camera.galaxyY) * camera.z * STARS.cameraParallax;
  const margin = STARS.clipMargin;
  const still = state.reducedMotion;
  const used = [];
  for (const star of state.stars) {
    const depth = star.depth;
    const expansion = expansions[depth] ??= Math.pow(expand, STARS.expansion * depth);
    const x = vw / 2 + star.x * expansion - mouse.mx * STARS.parallaxX * depth - camX * depth;
    const y = vh / 2 + star.y * expansion - mouse.my * STARS.parallaxY * depth - camY * depth;
    if (x < -margin || y < -margin || x > vw + margin || y > vh + margin) continue;
    const alpha = star.alpha * (still ? 1 : STARS.twinkleBase + STARS.twinkleAmplitude
      * Math.sin(state.sceneTime * STARS.twinkleFrequency * (1 + depth * STARS.twinkleDepth) + star.twinkle));
    const step = Math.max(0, Math.min(ALPHA_STEPS, Math.round(alpha * ALPHA_STEPS)));
    const color = star.warm ? 1 : star.cool ? 2 : 0;
    const batch = batchFor(color, step) ?? (batches[color][step] = []);
    if (batch.length === 0) used.push(color * (ALPHA_STEPS + 1) + step);
    batch.push(x, y, star.radius);
  }
  for (const key of used) {
    const color = Math.floor(key / (ALPHA_STEPS + 1)), step = key % (ALPHA_STEPS + 1);
    const batch = batches[color][step];
    ctx.fillStyle = `rgba(${COLORS[COLOR_KEYS[color]]},${step / ALPHA_STEPS})`;
    ctx.beginPath();
    for (let i = 0; i < batch.length; i += 3) {
      ctx.moveTo(batch[i] + batch[i + 2], batch[i + 1]);
      ctx.arc(batch[i], batch[i + 1], batch[i + 2], 0, TAU);
    }
    ctx.fill();
    batch.length = 0;
  }
}
