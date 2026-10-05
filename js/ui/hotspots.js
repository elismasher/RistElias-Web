import { UI } from '../config.js';
import { clamp } from '../math.js';
import { t } from '../i18n.js';

export function createHotspots(body, container) {
  (body.hotspots ?? []).forEach((hotspot, i) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'hs';
    button.style.left = `${hotspot.x}%`; button.style.top = `${hotspot.y}%`;
    button.style.setProperty('--d', `${i * UI.hotspotDelay}s`);
    button.dataset.hs = hotspot.key; button.dataset.i18nAria = `${hotspot.key}.t`;
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'card');
    button.tabIndex = -1; button.append(document.createElement('span')); container.append(button);
  });
}
export function fillCard(state) {
  if (!state.openHotspot) return;
  const key = state.openHotspot.dataset.hs;
  state.card.querySelector('.card-t').textContent = t(`${key}.t`);
  state.card.querySelector('.card-b').textContent = t(`${key}.b`);
}
export function closeCard(state) {
  if (!state.openHotspot) return;
  state.openHotspot.setAttribute('aria-expanded', 'false');
  state.openHotspot = null; state.card.hidden = true;
}
export function showCard(button, state) {
  closeCard(state); state.openHotspot = button; fillCard(state);
  state.card.style.setProperty('--accent', button.closest('.planet').style.getPropertyValue('--accent'));
  state.card.hidden = false; button.setAttribute('aria-expanded', 'true'); placeCard(state);
}
export function placeCard(state) {
  if (!state.openHotspot) return;
  const rect = state.openHotspot.getBoundingClientRect();
  const card = state.card, width = card.offsetWidth, height = card.offsetHeight;
  const { width: vw, height: vh, mobile } = state.viewport;
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const limit = mobile ? vw - UI.cardMargin : vw * UI.cardDesktopLimit;
  let x = cx + UI.cardGap;
  if (x + width > limit) x = cx - UI.cardGap - width;
  x = clamp(x, UI.cardMargin, vw - width - UI.cardMargin);
  const y = clamp(cy - height / 2, UI.cardTop, vh - height - UI.cardMargin);
  card.style.transform = `translate(${x}px,${y}px)`;
}
export function updateHotspots(state) {
  if (!state.openHotspot) return;
  const owner = state.openHotspot.closest('.body');
  if (!state.world.focus || state.world.focus.el !== owner || state.world.amount < UI.cardCloseFocus || state.reducedMotion) closeCard(state);
  else placeCard(state);
}
