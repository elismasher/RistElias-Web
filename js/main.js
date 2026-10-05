import { BODIES, CAMERA, COMET, SCROLL, RENDER } from './config.js';
import { createTimeline, valuesAt } from './timeline.js';
import { applyLanguage, onLanguageChange } from './i18n.js';
import { readScroll, updateScroll, navigate } from './scroll.js';
import { createWorld, updateWorld } from './world.js';
import { updateCamera } from './camera.js';
import { createStars, renderStars } from './render/stars.js';
import { createBeltImage, renderBelt } from './render/belt.js';
import { createBodies, renderBodies } from './render/bodies.js';
import { createPanels, renderPanels } from './ui/panels.js';
import { createHotspots, fillCard, closeCard, showCard, updateHotspots } from './ui/hotspots.js';
import { createHud, updateHud } from './ui/hud.js';
import { fillPlanetLabel, updateLabels } from './ui/labels.js';
import { renderComet } from './ui/comet.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(pointer: fine)');
const background = document.getElementById('bg');
const effects = document.getElementById('fx');
const state = {
  reducedMotion: reducedMotion.matches, finePointer: finePointer.matches,
  timeline: createTimeline(), world: createWorld(BODIES), viewport: {},
  scroll: { target: 0, progress: 0, max: 1, navigation: null },
  mouse: { x: -999, y: -999, inside: false, interactive: false, mx: 0, my: 0, targetX: 0, targetY: 0 },
  comet: { trail: [], head: COMET.head },
  canvas: { background, effects, backgroundContext: background.getContext('2d'), effectsContext: effects.getContext('2d') },
  beltImage: createBeltImage(), card: document.getElementById('card'), openHotspot: null,
  hoverPlanet: null, hoverAsteroid: null, time: performance.now(),
};
createBodies(state, createHotspots);
createPanels(state);
createHud(state);
document.documentElement.style.setProperty('--track-height', `${state.timeline.trackHeight}vh`);
document.documentElement.style.setProperty('--body-canvas-size', `${RENDER.bodyCanvasSize}px`);

function applyMotionMode() {
  state.reducedMotion = reducedMotion.matches;
  document.body.classList.toggle('rm', state.reducedMotion);
  document.body.classList.toggle('motion', !state.reducedMotion);
  closeCard(state);
  if (state.reducedMotion) {
    for (const overlay of state.overlays) {
      overlay.el.removeAttribute('style');
      if (overlay.body) overlay.el.style.setProperty('--accent', overlay.body.accent);
      overlay.el.inert = false;
    }
    state.mouse.mx = state.mouse.my = state.mouse.targetX = state.mouse.targetY = 0;
    state.scroll.navigation = null;
  }
}
function resize() {
  state.viewport = { width: innerWidth, height: innerHeight, mobile: innerWidth < CAMERA.mobileBreakpoint };
  const dpr = Math.min(CAMERA.dprCap, devicePixelRatio || 1);
  for (const canvas of [background, effects]) {
    canvas.width = Math.round(innerWidth * dpr); canvas.height = Math.round(innerHeight * dpr);
  }
  state.canvas.backgroundContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.canvas.effectsContext.setTransform(dpr, 0, 0, dpr, 0, 0);
  state.scroll.max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  createStars(state);
  readScroll(state);
  if (state.reducedMotion) frame(performance.now(), 0);
}
function go(id) { closeCard(state); navigate(id, state); }

// One delegated click handler also covers future generated stations.
document.addEventListener('click', event => {
  const hotspot = event.target.closest('.hs');
  if (hotspot) {
    if (state.openHotspot === hotspot) closeCard(state); else showCard(hotspot, state);
    return;
  }
  const language = event.target.closest('[data-lang]');
  if (language) { applyLanguage(language.dataset.lang); return; }
  const destination = event.target.closest('[data-go]');
  if (destination) { event.preventDefault(); go(destination.dataset.go); return; }
  if (event.target === background && state.hoverAsteroid) {
    go(state.world.planets.find(body => body.type === 'asteroid')?.id); return;
  }
  if (state.openHotspot && !event.target.closest('#card')) closeCard(state);
});
for (const body of state.world.planets) {
  const enter = () => { body.hovered = true; state.hoverPlanet = body; fillPlanetLabel(state); };
  const leave = () => { body.hovered = false; if (state.hoverPlanet === body) state.hoverPlanet = null; };
  body.hit.addEventListener('pointerenter', enter); body.hit.addEventListener('pointerleave', leave);
  body.hit.addEventListener('focus', enter); body.hit.addEventListener('blur', leave);
}
addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  const mouse = state.mouse;
  mouse.x = event.clientX; mouse.y = event.clientY; mouse.inside = true;
  mouse.targetX = state.reducedMotion ? 0 : event.clientX / innerWidth * 2 - 1;
  mouse.targetY = state.reducedMotion ? 0 : event.clientY / innerHeight * 2 - 1;
  mouse.interactive = !!event.target.closest('a,button');
}, { passive: true });
document.addEventListener('pointerleave', () => { state.mouse.inside = false; });
addEventListener('scroll', () => readScroll(state), { passive: true });
addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (state.openHotspot) { const button = state.openHotspot; closeCard(state); button.focus(); }
  else if (state.station !== 'start' && state.station !== 'galaxie') go('galaxie');
});
addEventListener('hashchange', () => go(location.hash.slice(1) || 'start'));
addEventListener('resize', resize);
onLanguageChange(() => { fillCard(state); fillPlanetLabel(state); });
finePointer.addEventListener('change', () => { state.finePointer = finePointer.matches; });

function frame(time, dt) {
  state.time = time;
  if (!state.reducedMotion) updateScroll(dt, state);
  // Reduced motion shows an unchanging galaxy behind the normal document flow.
  state.values = valuesAt(state.timeline, state.reducedMotion ? state.timeline.gaps[0].anchor : state.scroll.progress);
  updateWorld(dt, state);
  updateCamera(state);
  renderStars(state); renderBelt(state); renderBodies(state);
  renderPanels(state); updateHud(state); updateLabels(state); updateHotspots(state); renderComet(dt, state);
}
let previousTime = performance.now();
let frameId = null;
function loop(time) {
  frameId = null;
  const dt = Math.min(SCROLL.maxDt, (time - previousTime) / 1000); previousTime = time;
  frame(time, dt);
  if (!state.reducedMotion) frameId = requestAnimationFrame(loop);
}
function startLoop() {
  if (frameId !== null || state.reducedMotion) return;
  previousTime = performance.now(); frameId = requestAnimationFrame(loop);
}
reducedMotion.addEventListener('change', () => {
  if (frameId !== null) { cancelAnimationFrame(frameId); frameId = null; }
  applyMotionMode(); resize();
  const id = location.hash.slice(1);
  if (state.timeline.anchors[id] != null) {
    if (state.reducedMotion) document.getElementById(id)?.scrollIntoView();
    else {
      state.scroll.target = state.scroll.progress = state.timeline.anchors[id];
      scrollTo({ top: state.scroll.target * state.scroll.max, behavior: 'instant' });
    }
  }
  startLoop();
});
state.beltImage.onload = () => { if (state.reducedMotion) frame(performance.now(), 0); };
applyLanguage(); applyMotionMode(); resize();
const initial = location.hash.slice(1);
if (state.timeline.anchors[initial] != null) {
  if (state.reducedMotion) document.getElementById(initial)?.scrollIntoView();
  else {
    state.scroll.target = state.scroll.progress = state.timeline.anchors[initial];
    scrollTo({ top: state.scroll.target * state.scroll.max, behavior: 'instant' });
  }
} else readScroll(state);
state.scroll.progress = state.scroll.target;
frame(performance.now(), 0);
startLoop();
