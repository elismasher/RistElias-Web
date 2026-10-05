import { SCROLL } from './config.js';
import { clamp } from './math.js';

export function readScroll(state) {
  state.scroll.target = clamp(scrollY / state.scroll.max);
  if (state.scroll.navigation && Math.abs(state.scroll.target - state.scroll.navigation.target) > SCROLL.scrollCancelThreshold) {
    state.scroll.navigation = null;
  }
}
export function updateScroll(dt, state) {
  const scroll = state.scroll;
  const mouse = state.mouse;
  mouse.mx += (mouse.targetX - mouse.mx) * Math.min(1, dt * SCROLL.parallaxSmoothing);
  mouse.my += (mouse.targetY - mouse.my) * Math.min(1, dt * SCROLL.parallaxSmoothing);
  const nav = scroll.navigation;
  if (nav) {
    const target = nav.stage === 0 ? nav.waypoint : nav.target;
    const d = target - scroll.progress;
    scroll.progress += Math.sign(d) * Math.min(Math.abs(d),
      Math.max(Math.abs(d) * (1 - Math.exp(-dt * SCROLL.navSmoothing)), dt * SCROLL.navMinSpeed));
    if (Math.abs(target - scroll.progress) < SCROLL.navThreshold) {
      if (nav.stage === 0) { scroll.progress = nav.jump; nav.stage = 1; }
      else { scroll.progress = target; scroll.navigation = null; }
    }
  } else {
    scroll.progress += (scroll.target - scroll.progress) * (1 - Math.exp(-dt * SCROLL.smoothing));
    if (Math.abs(scroll.target - scroll.progress) < SCROLL.settleThreshold) scroll.progress = scroll.target;
  }
}
export function replaceHash(id) {
  history.replaceState(null, '', id === 'start' ? location.pathname + location.search : '#' + id);
}
export function navigate(id, state) {
  const target = state.timeline.anchors[id];
  if (target == null) return;
  if (state.reducedMotion) {
    document.getElementById(id)?.scrollIntoView();
    replaceHash(id);
    return;
  }
  const scroll = state.scroll;
  const lo = Math.min(scroll.progress, target), hi = Math.max(scroll.progress, target);
  const between = state.timeline.gaps.map(gap => gap.anchor).filter(gap => gap > lo && gap < hi);
  if (between.length >= 2) {
    const forwards = target > scroll.progress;
    scroll.navigation = { target, stage: 0, waypoint: forwards ? between[0] : between.at(-1),
      jump: forwards ? between.at(-1) : between[0] };
  } else scroll.navigation = { target, stage: 1 };
  scrollTo({ top: target * scroll.max, behavior: 'instant' });
  scroll.target = target;
  replaceHash(id);
}
