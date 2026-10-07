import { CONTENT, FACTS, UI } from '../config.js';
import { getLanguage, onLanguageChange, t } from '../i18n.js';
import { createPlanetImage } from './planet-images.js';

function node(tag, className, key) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (key) el.dataset.i18n = key;
  return el;
}
function image(source, className) {
  const el = node('img', className); el.src = source; el.alt = '';
  return el;
}
function screenshots(body) {
  const shots = node('div', 'shots');
  const update = () => {
    const sources = body.screenshots?.[getLanguage()] ?? body.screenshots?.de ?? [];
    shots.replaceChildren(...sources.map((source, index) => {
      const button = node('button', 'shot act');
      button.type = 'button';
      const preview = image(source);
      preview.alt = `${t(body.copy.name)} – ${t('shot')} ${index + 1}`;
      preview.decoding = 'async';
      button.setAttribute('aria-label', `${t('shot.open')}: ${preview.alt}`);
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'screenshotViewer');
      button.append(preview);
      return button;
    }));
  };
  update(); onLanguageChange(update);
  return shots;
}
function features(body) {
  const box = node('div', 'features');
  box.append(node('h3', '', 'features'));
  const list = node('ul');
  for (const hotspot of body.hotspots ?? []) {
    const item = node('li');
    const detail = node('details');
    detail.append(node('summary', '', `${hotspot.key}.t`), node('p', '', `${hotspot.key}.b`));
    item.append(detail);
    list.append(item);
  }
  box.append(list); return box;
}
export function createPanels(state) {
  const container = document.getElementById('panels');
  const staticOutro = document.getElementById('outro');
  const bodies = state.world.planets;
  const finalCenter = bodies.at(-1)?.layout === 'center';
  if (!finalCenter) staticOutro.remove();
  state.overlays = [
    { el: document.getElementById('ov-hero'), kind: 'hero' },
    { el: document.getElementById('ov-prolog'), kind: 'prolog' },
  ];
  for (const body of bodies) {
    const isOutro = finalCenter && body === bodies.at(-1);
    const section = isOutro ? staticOutro : node('section', 'ch');
    section.id = body.id;
    const center = body.layout === 'center';
    const panel = isOutro ? section.querySelector('.outro') : node('div', `ov ${center ? 'outro' : 'panel'}`);
    panel.id = `ov-${body.id}`; panel.style.setProperty('--accent', body.accent);
    panel.prepend(createPlanetImage(body, 'rm-planet'));
    if (center) {
      const title = isOutro ? panel.querySelector('h2') : node('h2');
      const desc = isOutro ? panel.querySelector('p') : node('p');
      const link = isOutro ? panel.querySelector('a') : node('a', 'cta act');
      title.dataset.i18n = body.copy.title ?? body.copy.name;
      desc.dataset.i18n = body.copy.body;
      link.dataset.i18n = body.copy.link; link.href = body.url ?? CONTENT.contact;
      if (!isOutro) panel.append(title, desc, link);
    } else {
      const kicker = node('div', 'kicker'), domain = node('span', 'mono');
      domain.textContent = body.domain;
      kicker.append(image(body.icon, 'icon'), domain);
      panel.append(kicker, node('h2', 'title', body.copy.name), node('p', 'tag', body.copy.tag),
        node('p', 'desc', body.copy.body), node('p', 'explore mono', 'explore'));
      const shots = screenshots(body);
      const facts = node('dl', 'facts');
      for (const key of body.facts ?? []) {
        const fact = typeof key === 'string' ? FACTS[key] : key;
        facts.append(node('dt', '', fact.label), node('dd', '', fact.value));
      }
      const actions = node('div', 'actions');
      const link = node('a', 'textlink act', body.copy.link);
      link.href = body.url; link.target = '_blank'; link.rel = 'noopener';
      const back = node('button', 'back act', 'back'); back.type = 'button'; back.dataset.go = 'galaxie';
      actions.append(link, back); panel.append(shots, features(body), facts, actions);
    }
    if (!isOutro) { section.append(panel); container.append(section); }
    state.overlays.push({ el: panel, kind: center ? 'center' : 'panel', body });
  }
  const projectTarget = bodies.find(body => body.type === 'asteroid') ?? bodies.at(-1);
  document.querySelector('[data-project-link]').href = `#${projectTarget.id}`;
  document.querySelector('[data-project-link]').dataset.go = projectTarget.id;
  const projects = node('nav', 'project-nav');
  projects.dataset.i18nAria = 'hud';
  for (const body of bodies) {
    const link = node('a', 'act', body.copy.name);
    link.href = `#${body.id}`; link.dataset.go = body.id;
    link.style.setProperty('--accent', body.accent);
    projects.append(link);
  }
  document.getElementById('ov-prolog').append(projects);
}
export function renderPanels(state) {
  if (state.documentFlow) return;
  let panelOpacity = 0, prologOpacity = 0, centerOpacity = 0;
  for (const overlay of state.overlays) {
    const { el, kind, body } = overlay;
    const opacity = kind === 'hero' ? state.values.hero : kind === 'prolog' ? state.values.prolog : body.panelOpacity;
    el.style.opacity = opacity;
    el.style.visibility = opacity < UI.visibleOpacity ? 'hidden' : 'visible';
    el.inert = opacity <= UI.interactiveOpacity;
    const offset = (1 - opacity) * UI.overlayOffset;
    if (kind === 'panel') {
      el.style.transform = state.viewport.mobile ? `translateY(${offset * UI.panelY}px)`
        : `translateY(-50%) translateX(${offset * UI.panelX}px)`;
      panelOpacity = Math.max(panelOpacity, opacity);
    } else if (kind === 'prolog') {
      el.style.transform = state.viewport.mobile ? `translateY(${offset}px)` : `translateY(calc(-50% + ${offset}px))`;
      prologOpacity = opacity;
    } else if (kind === 'center') {
      el.style.transform = `translateX(-50%) translateY(${offset}px)`;
      centerOpacity = Math.max(centerOpacity, opacity);
    } else el.style.transform = `translateY(${-offset * UI.heroY}px)`;
    el.style.pointerEvents = opacity > UI.interactiveOpacity && kind === 'panel' ? 'auto' : 'none';
  }
  document.getElementById('scrimL').style.opacity = prologOpacity;
  document.getElementById('scrimR').style.opacity = panelOpacity;
  document.getElementById('scrimB').style.opacity = centerOpacity;
}
