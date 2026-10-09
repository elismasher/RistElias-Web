import { ASSETS, RENDER } from '../config.js';
import { projectX, projectY } from '../camera.js';
import { createPlanetImage } from '../ui/planet-images.js';

export function createBodies(state, createHotspots) {
  const container = document.getElementById('world');
  const sun = document.createElement('div');
  sun.style.zIndex = RENDER.sunLayer; sun.id = 'sun'; sun.className = 'body sun'; sun.setAttribute('aria-hidden', 'true');
  const glow = document.createElement('div'); glow.className = 'glow';
  const mark = document.createElement('img'); mark.src = ASSETS.sun; mark.alt = '';
  sun.append(glow, mark); container.append(sun); state.sun = sun;
  for (const body of state.world.planets) {
    const el = document.createElement('div');
    el.id = `p-${body.id}`; el.className = `body planet${body.type === 'asteroid' ? ' rock' : ''}`;
    el.style.setProperty('--accent', body.accent);
    const aura = document.createElement('div'); aura.className = 'aura';
    const inner = document.createElement('div'); inner.className = 'body-inner';
    const image = createPlanetImage(body, 'planet-art');
    const hit = document.createElement('button'); hit.type = 'button'; hit.className = 'hit';
    hit.dataset.go = body.id; hit.dataset.i18nAria = body.copy.hit;
    inner.append(image, hit); createHotspots(body, inner);
    el.append(aura, inner); container.append(el);
    Object.assign(body, { el, aura, inner, imageEl: image, hit, hotspotEls: [...inner.querySelectorAll('.hs')], written: {} });
  }
}
// Skips style writes whose value did not change since the previous frame.
function setStyle(body, el, prop, value) {
  const key = el === body.el ? prop : `${el === body.inner ? 'i' : 'a'}${prop}`;
  if (body.written[key] === value) return;
  body.written[key] = value;
  el.style[prop] = value;
}
function setClass(body, name, on) {
  if (body.written[name] === on) return;
  body.written[name] = on;
  body.el.classList.toggle(name, on);
}
export function renderBodies(state) {
  const { z, dim } = state.camera;
  const { amount: E, focus: focused } = state.world;
  const half = RENDER.bodyCanvasSize / 2;
  const x = projectX(0, state), y = projectY(0, state);
  const sunScale = RENDER.sunSize * z / RENDER.bodyCanvasSize
    * (state.reducedMotion ? 1 : 1 + RENDER.sunPulse * Math.sin(state.time * RENDER.sunFrequency));
  state.sun.style.transform = `translate3d(${x - half}px,${y - half}px,0) scale(${sunScale})`;
  const sunOpacity = dim * (1 - RENDER.sunFocusDim * E);
  if (state.sunOpacity !== sunOpacity) { state.sunOpacity = sunOpacity; state.sun.style.opacity = sunOpacity; }
  for (const body of state.world.planets) {
    const isFocused = body === focused;
    setStyle(body, body.inner, 'transform', `rotate(${body.rotation}rad)`);
    const x = projectX(body.wx, state), y = projectY(body.wy, state);
    const scale = body.size * body.depth * z / RENDER.bodyCanvasSize * (1 + RENDER.hoverScale * body.hover);
    let extra = '';
    if (isFocused && !state.reducedMotion) {
      const float = Math.sin(state.time * RENDER.floatFrequency) * RENDER.focusFloat * E;
      extra = ` translateY(${float}px) perspective(${RENDER.perspective}px) rotateX(${-state.mouse.my * RENDER.rotateX * E}deg) rotateY(${state.mouse.mx * RENDER.rotateY * E}deg)`;
    }
    setStyle(body, body.el, 'transform', `translate3d(${x - half}px,${y - half}px,0)${extra} scale(${scale})`);
    setStyle(body, body.el, 'opacity', isFocused ? 1 : (1 - E) * dim);
    setStyle(body, body.el, 'zIndex', isFocused ? RENDER.focusLayer : RENDER.bodyLayer + Math.round(Math.sin(body.angle) * RENDER.depthLayer));
    setStyle(body, body.aura, 'opacity', isFocused ? E * RENDER.focusAura : body.hover * RENDER.hoverAura);
    setClass(body, 'focused', !!focused && E > RENDER.hitFocus);
    const landed = !state.reducedMotion && isFocused && E > RENDER.landedFocus;
    setClass(body, 'landed', landed);
    const hitTab = state.reducedMotion || (focused && E > RENDER.hitFocus) ? -1 : 0;
    if (body.written.hitTab !== hitTab) { body.written.hitTab = hitTab; body.hit.tabIndex = hitTab; }
    if (body.written.hsTab !== landed) { body.written.hsTab = landed; for (const hotspot of body.hotspotEls) hotspot.tabIndex = landed ? 0 : -1; }
  }
}
