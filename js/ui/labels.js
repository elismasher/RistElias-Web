import { UI, RENDER } from '../config.js';
import { t } from '../i18n.js';
import { projectX, projectY } from '../camera.js';

export function fillPlanetLabel(state) {
  const body = state.hoverPlanet;
  if (!body) return;
  const label = document.getElementById('plabel');
  label.querySelector('b').textContent = t(body.copy.name);
  const small = label.querySelector('small');
  small.replaceChildren();
  if (body.type === 'asteroid') small.textContent = t(body.copy.hint ?? 'asteroid.hint');
  else if (state.explored.has(body.id)) {
    const done = document.createElement('span'); done.className = 'done'; done.textContent = t('explored'); small.append(done);
  } else small.textContent = t('land');
}
export function updateLabels(state) {
  const planetLabel = document.getElementById('plabel');
  const asteroidLabel = document.getElementById('alabel');
  const body = state.hoverPlanet;
  if (body && state.world.amount < RENDER.hoverFocus && !state.reducedMotion) {
    fillPlanetLabel(state);
    planetLabel.style.transform = `translate(${projectX(body.wx, state)}px,${projectY(body.wy, state) - body.size * body.depth * state.camera.z * UI.labelSize - UI.labelGap}px) translate(-50%,-100%)`;
    planetLabel.classList.add('on');
  } else planetLabel.classList.remove('on');
  const asteroid = state.hoverAsteroid;
  if (asteroid && !state.reducedMotion) {
    asteroidLabel.style.transform = `translate(${asteroid.x}px,${asteroid.y - asteroid.size * UI.asteroidLabelSize - UI.asteroidLabelGap}px) translate(-50%,-100%)`;
    asteroidLabel.classList.add('on');
  } else asteroidLabel.classList.remove('on');
}
