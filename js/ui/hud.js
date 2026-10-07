import { RENDER } from '../config.js';
import { readJSON, write } from '../storage.js';
import { replaceHash } from '../scroll.js';
import { stationAt } from '../timeline.js';

export function createHud(state) {
  const stored = readJSON('rist.explored', []);
  state.explored = new Set(Array.isArray(stored) ? stored.filter(id => typeof id === 'string') : []);
  state.station = '';
  const entries = [{ id: 'start', key: 'nav.start' }, { id: 'galaxie', key: 'nav.galaxie' },
    ...state.world.planets.map(body => ({ id: body.id, key: body.copy.name, accent: body.accent }))];
  const nav = document.querySelector('.hud');
  state.hudButtons = entries.map(entry => {
    const button = document.createElement('button'); button.type = 'button'; button.dataset.go = entry.id;
    button.dataset.i18nAria = entry.key;
    if (entry.accent) button.style.setProperty('--accent', entry.accent);
    const text = document.createElement('span'); text.className = 't'; text.dataset.i18n = entry.key;
    const dot = document.createElement('span'); dot.className = 'd'; dot.setAttribute('aria-hidden', 'true');
    button.append(text, dot); nav.append(button); return button;
  });
}
export function updateHud(state) {
  if (state.documentFlow) return;
  let exploredChanged = false;
  for (const body of state.world.planets) {
    const ranges = state.timeline.stations.find(station => station.id === body.id);
    if (body.layout !== 'center' && body === state.world.focus && body.focus > RENDER.exploredFocus
      && state.scroll.progress > (ranges.hold[0] + ranges.hold[1]) / 2 && state.scroll.progress < ranges.hold[1]
      && !state.explored.has(body.id)) {
      state.explored.add(body.id); exploredChanged = true;
    }
  }
  if (exploredChanged) write('rist.explored', JSON.stringify([...state.explored]));
  const station = stationAt(state.timeline, state.scroll.target);
  const changed = state.station !== station;
  if (changed) {
    state.station = station;
    if (!state.scroll.navigation) replaceHash(station);
  }
  if (changed || exploredChanged) for (const button of state.hudButtons) {
    if (button.dataset.go === station) button.setAttribute('aria-current', 'step');
    else button.removeAttribute('aria-current');
    button.classList.toggle('explored', state.explored.has(button.dataset.go));
  }
}
