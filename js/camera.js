import { CAMERA } from './config.js';
import { lerp } from './math.js';

export function updateCamera(state) {
  const { width: vw, height: vh, mobile } = state.viewport;
  const { mx, my } = state.mouse;
  const { amount: E, focus: focused } = state.world;
  const h = state.values.heroCamera, q = state.values.prologCamera;
  const fit = CAMERA.fit[mobile ? 'mobile' : 'desktop'];
  const fz = Math.min(vw / fit.width, vh / fit.height);
  const zG = fz * lerp(1, CAMERA.heroZoom, h) * lerp(1, CAMERA.prologZoom, q);
  const shiftX = q * (mobile ? 0 : vw * CAMERA.prologX);
  const shiftY = h * vh * CAMERA.heroY + q * (mobile ? vh * CAMERA.prologMobileY : 0);
  const camGX = -(shiftX - mx * CAMERA.parallax.x) / zG;
  const camGY = -(shiftY - my * CAMERA.parallax.y) / zG;
  const tilt = CAMERA.tilt + my * CAMERA.tiltParallax * (1 - E);
  for (const body of state.world.planets) body.wy = body.orbit.a * tilt * Math.sin(body.angle);
  let z = zG, x = camGX, y = camGY;
  if (focused) {
    const layout = CAMERA.focus[focused.layout ?? 'side'][mobile ? 'mobile' : 'desktop'];
    const size = Math.min(vw * layout.width, vh * layout.height) * (focused.focusScale ?? 1);
    const focusZoom = size / (focused.size * focused.depth);
    const gx = vw / 2 + (focused.wx - camGX) * zG;
    const gy = vh / 2 + (focused.wy - camGY) * zG;
    z = Math.exp(lerp(Math.log(zG), Math.log(focusZoom), E));
    x = focused.wx - (lerp(gx, vw * layout.x, E) - vw / 2) / z;
    y = focused.wy - (lerp(gy, vh * layout.y, E) - vh / 2) / z;
  }
  state.camera = { x, y, z, fz, galaxyX: camGX, galaxyY: camGY, tilt, dim: 1 - CAMERA.heroDim * h };
}
export const projectX = (wx, state) => state.viewport.width / 2 + (wx - state.camera.x) * state.camera.z;
export const projectY = (wy, state) => state.viewport.height / 2 + (wy - state.camera.y) * state.camera.z;
