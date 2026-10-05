import { RENDER, BELT, MOTION_DEFAULTS } from './config.js';
import { TAU, random } from './math.js';

export function createWorld(bodies) {
  const planets = bodies.map(body => ({ ...body, angle: body.orbit.startAngle ?? 0,
    rotation: 0, hover: 0, hovered: false, focus: 0, panelOpacity: 0 }));
  const rnd = random(BELT.seed);
  const belt = Array.from({ length: BELT.count }, () => ({
    angle: rnd() * TAU, radius: BELT.radius + rnd() * BELT.radiusSpread,
    size: BELT.size + rnd() * BELT.sizeSpread, rotation: rnd() * TAU,
    spin: (rnd() - 0.5) * BELT.spinSpread, marked: false,
  }));
  BELT.marked.angles.forEach((angle, i) => belt.push({ angle,
    radius: BELT.marked.radius + i * BELT.marked.radiusStep, size: BELT.marked.size,
    rotation: rnd() * TAU, spin: BELT.marked.spin, marked: true }));
  return { planets, belt, focus: null, amount: 0, speed: 1 };
}
export function updateWorld(dt, state) {
  const world = state.world;
  world.focus = null;
  state.values.stations.forEach((station, i) => {
    const body = world.planets[i];
    body.focus = station.focus;
    body.panelOpacity = station.panel;
    if (body.focus > (world.focus?.focus ?? 0)) world.focus = body;
  });
  world.amount = world.focus?.focus ?? 0;
  world.speed = state.reducedMotion ? 0 : 1 - world.amount;
  for (const body of world.planets) {
    body.angle += TAU / body.orbit.period * dt * world.speed;
    body.wx = body.orbit.a * Math.cos(body.angle);
    body.depth = 1 + RENDER.depthScale * Math.sin(body.angle);
    const defaults = MOTION_DEFAULTS[body.type];
    const motion = { ...defaults, ...body.motion };
    if (state.reducedMotion) body.rotation = 0;
    else if (motion.mode === 'spin') body.rotation += motion.speed * dt;
    else if (motion.mode === 'wobble') {
      body.rotation = Math.sin(state.time / 1000 * TAU / motion.period) * motion.amplitude * Math.PI / 180;
    } else body.rotation = 0;
    body.hover += ((body.hovered && world.amount < RENDER.hoverFocus ? 1 : 0) - body.hover)
      * Math.min(1, dt * RENDER.hoverSmoothing);
  }
  for (const asteroid of world.belt) {
    asteroid.angle += TAU / BELT.period * dt * world.speed;
    asteroid.rotation += asteroid.spin * dt * world.speed;
  }
}
