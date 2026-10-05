import { CONTENT, FACTS, UI } from '../config.js';

function node(tag, className, key) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (key) el.dataset.i18n = key;
  return el;
}
function image(body, className) {
  const el = node('img', className); el.src = body.image; el.alt = '';
  return el;
}
function features(body) {
  const box = node('div', 'features');
  box.append(node('h3', '', 'features'));
  const list = node('ul');
  for (const hotspot of body.hotspots ?? []) {
    const item = node('li');
    item.append(node('b', '', `${hotspot.key}.t`), node('span', '', `${hotspot.key}.b`));
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
    panel.prepend(image(body, 'rm-planet'));
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
      // TODO: Replace the planet image used as the icon with the real app icon.
      kicker.append(image(body, 'icon'), domain);
      panel.append(kicker, node('h2', 'title', body.copy.name), node('p', 'tag', body.copy.tag),
        node('p', 'desc', body.copy.body), node('p', 'explore mono', 'explore'), features(body));
      const shots = node('div', 'shots');
      // TODO: Replace the dashed frames with real app screenshots.
      for (let i = 0; i < CONTENT.screenshotCount; i++) {
        const shot = node('div', 'shot'); shot.append(node('span', '', 'shot')); shots.append(shot);
      }
      const facts = node('dl', 'facts');
      for (const key of body.facts ?? []) {
        const fact = typeof key === 'string' ? FACTS[key] : key;
        facts.append(node('dt', '', fact.label), node('dd', '', fact.value));
      }
      const actions = node('div', 'actions');
      const link = node('a', 'textlink act', body.copy.link);
      link.href = body.url; link.target = '_blank'; link.rel = 'noopener';
      const back = node('button', 'back act', 'back'); back.type = 'button'; back.dataset.go = 'galaxie';
      actions.append(link, back); panel.append(shots, facts, actions);
    }
    if (!isOutro) { section.append(panel); container.append(section); }
    state.overlays.push({ el: panel, kind: center ? 'center' : 'panel', body });
  }
  const projectTarget = bodies.find(body => body.type === 'asteroid') ?? bodies.at(-1);
  document.querySelector('[data-project-link]').href = `#${projectTarget.id}`;
  document.querySelector('[data-project-link]').dataset.go = projectTarget.id;
}
export function renderPanels(state) {
  if (state.reducedMotion) return;
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
