// The travel order, visual parameters and content keys live here. No station data in renderers.
export const BODIES = [
  {
    id: 'spotjar', type: 'planet', layout: 'side', image: 'assets/img/planets/planet-spotJar.webp',
    preview: 'assets/img/planets/planet-spotJar-preview.webp',
    icon: 'assets/img/mocks/spotjar/icon.png',
    screenshots: {
      de: ['assets/img/mocks/spotjar/de/1.png', 'assets/img/mocks/spotjar/de/3.png', 'assets/img/mocks/spotjar/de/4.png'],
      en: ['assets/img/mocks/spotjar/en/1.png', 'assets/img/mocks/spotjar/en/3.png', 'assets/img/mocks/spotjar/en/4.png'],
    },
    url: 'https://www.spotjar.app', domain: 'spotjar.app', accent: '#5CC8F0',
    orbit: { a: 300, period: 46, startAngle: 2.3 }, size: 130, focusScale: 1,
    motion: { mode: 'wobble', amplitude: 4, period: 9 },
    copy: { name: 'spotjar.name', hit: 'hit.spot', tag: 'spot.tag', body: 'spot.body', link: 'spot.link' },
    hotspots: [{ key: 's1', x: 53.6, y: 14.7 }, { key: 's2', x: 39.8, y: 41.7 },
      { key: 's3', x: 81.5, y: 55.4 }, { key: 's4', x: 54, y: 76.5 }],
    facts: ['works', 'langs', 'status'],
  },
  {
    id: 'phaseparadise', type: 'planet', layout: 'side', image: 'assets/img/planets/planet-phaseparadise.webp',
    preview: 'assets/img/planets/planet-phaseparadise-preview.webp',
    icon: 'assets/img/mocks/phaseparadise/icon.png',
    screenshots: {
      de: ['assets/img/mocks/phaseparadise/de/2.png', 'assets/img/mocks/phaseparadise/de/3.png', 'assets/img/mocks/phaseparadise/de/4.png'],
      en: ['assets/img/mocks/phaseparadise/en/2.png', 'assets/img/mocks/phaseparadise/en/3.png', 'assets/img/mocks/phaseparadise/en/4.png'],
    },
    url: 'https://www.phaseparadise.app', domain: 'phaseparadise.app', accent: '#FF8C3A',
    orbit: { a: 470, period: 80, startAngle: -0.5 }, size: 205, focusScale: 1.18,
    motion: { mode: 'wobble', amplitude: 3, period: 11 },
    // TODO: Check the existing copy against phaseparadise.app; no invented replacement copy.
    copy: { name: 'phaseparadise.name', hit: 'hit.phase', tag: 'phase.tag', body: 'phase.body', link: 'phase.link' },
    hotspots: [{ key: 'p1', x: 39.4, y: 20.5 }, { key: 'p2', x: 63, y: 50 },
      { key: 'p3', x: 86.5, y: 16.3 }, { key: 'p4', x: 11.4, y: 80.6 }],
    facts: ['for', 'widgets', 'status'],
  },
  {
    id: 'unerforscht', type: 'asteroid', layout: 'center', image: 'assets/img/planets/asteroid.webp',
    preview: 'assets/img/planets/asteroid-preview.webp',
    accent: '#FFD7A3', size: 102, focusScale: 1,
    orbit: { a: 600, period: 120, startAngle: 1.15, dashed: true },
    motion: { mode: 'spin', speed: 0.07 },
    copy: { name: 'unerforscht.name', hit: 'hit.rock', hint: 'asteroid.hint',
      title: 'outro.title', body: 'outro.body', link: 'outro.cta' },
    hotspots: [], facts: [],
  },
];

export const FACTS = {
  works: { label: 'f.works', value: 'f.mapsv' },
  langs: { label: 'f.langs', value: 'f.langsv' },
  status: { label: 'f.status', value: 'f.statusv' },
  for: { label: 'f.for', value: 'f.forv' },
  widgets: { label: 'f.widgets', value: 'f.widgetsv' },
};
export const ASSETS = { sun: 'assets/img/logo-mark-light.png', belt: 'assets/img/planets/asteroid-preview.webp' };
export const CONTENT = { contact: 'mailto:' }; // TODO: Real email address.
export const MOTION_DEFAULTS = {
  planet: { mode: 'wobble', amplitude: 4, period: 9 },
  asteroid: { mode: 'spin', speed: 0.07 },
};
export const COLORS = {
  stars: '236,233,226', warmStars: '255,214,170', coolStars: '185,215,255',
  belt: '255,215,163', cometTrail: '255,214,165', cometGlow: '255,236,205', cometCore: '#FFF4E3',
};
export const TIMING = {
  vhPerWeight: 1.1,
  hero: { weight: 60, fadeStart: 15 },
  prolog: { lead: 25, fadeIn: 30, hold: 55, fadeOut: 25, anchorInHold: 20 },
  firstGap: { weight: 15, anchorOffset: 10 },
  station: { rise: 80, hold: 180, fall: 60, gap: 20, anchorOffset: 90 },
  last: { rise: 65, hold: 45, anchorFromEnd: 15 },
  panel: { afterRise: 5, fadeIn: 20, beforeFall: 5, fadeOut: 20 },
  outro: { beforeRiseEnd: 10, fadeIn: 25 },
  lastGapAnchorOffset: 5,
  introCamera: { hero: [20, 90], prologRise: [70, 120], prologFall: [170, 200] },
  beltWave: { beforeRise: [14, 2], afterRise: [10, 40] },
};
export const CAMERA = {
  mobileBreakpoint: 760, dprCap: 2, tilt: 0.36, tiltParallax: 0.035,
  fit: { desktop: { width: 1760, height: 760 }, mobile: { width: 1060, height: 800 } },
  heroZoom: 0.72, prologZoom: 0.9, heroY: 0.25, prologX: 0.1, prologMobileY: -0.16,
  parallax: { x: 22, y: 12 }, heroDim: 0.45,
  focus: {
    side: { desktop: { width: 0.42, height: 0.74, x: 0.29, y: 0.5 },
      mobile: { width: 0.8, height: 0.4, x: 0.5, y: 0.26 } },
    center: { desktop: { width: 0.58, height: 0.86, x: 0.5, y: 0.37 },
      mobile: { width: 1, height: 0.58, x: 0.5, y: 0.33 } },
  },
};
export const BELT = {
  seed: 11, count: 58, radius: 700, radiusSpread: 110, size: 7, sizeSpread: 18,
  spinSpread: 0.5, period: 260,
  marked: { angles: [0.55, 2.2, 3.75, 5.25], radius: 740, radiusStep: 9, size: 30, spin: 0.12 },
  depthScale: 0.12, depthAlpha: 0.5, waveFrequency: 0.0022, waveAngle: 2,
  waveGlow: 0.5, markedGlow: 0.32, markedPulse: 0.18, markedFrequency: 0.003, markedAngle: 3,
  hitRadius: 22, hitSize: 0.7, hoverDim: 0.7, glowThreshold: 0.02, glowRadius: 1.5,
  glowAlpha: 0.55, alphaGlow: 0.6,
};
export const STARS = {
  seed: 3, layers: [[300, 1], [140, 2], [45, 3]], radius: 0.62, width: 1.15,
  minSize: 0.35, sizeSpread: 0.6, sizeBase: 0.55, sizeDepth: 0.35,
  minAlpha: 0.3, alphaSpread: 0.6, warmChance: 0.18, coolChance: 0.15,
  expansion: 0.1, parallaxX: 5, parallaxY: 4, cameraParallax: 0.015,
  clipMargin: 4, twinkleBase: 0.72, twinkleAmplitude: 0.28, twinkleFrequency: 0.0013, twinkleDepth: 0.4,
};
export const RENDER = {
  bodyCanvasSize: 600, depthScale: 0.14, sunSize: 170, sunPulse: 0.025, sunFrequency: 0.0016,
  sunFocusDim: 0.95, sunLayer: 100, bodyLayer: 100, focusLayer: 300, depthLayer: 50,
  hoverSmoothing: 10, hoverScale: 0.08, focusFloat: 7, floatFrequency: 0.0011,
  perspective: 1400, rotateX: 7, rotateY: 9, focusAura: 0.9, hoverAura: 0.6,
  orbitAlpha: 0.13, orbitHoverAlpha: 0.22, orbitWidth: 1, orbitDash: [3, 7],
  orbitThreshold: 0.01, hoverFocus: 0.05, hitFocus: 0.04, landedFocus: 0.93, exploredFocus: 0.99,
};
export const SCROLL = {
  maxDt: 0.05, parallaxSmoothing: 3, smoothing: 5, navSmoothing: 3.4,
  navMinSpeed: 0.03, navThreshold: 0.0015, scrollCancelThreshold: 0.004, settleThreshold: 0.00001,
};
export const UI = {
  hotspotDelay: 0.12, cardGap: 26, cardMargin: 12, cardTop: 70, cardDesktopLimit: 0.53,
  cardCloseFocus: 0.9, labelSize: 0.42, labelGap: 10, asteroidLabelSize: 0.7, asteroidLabelGap: 8,
  overlayOffset: 18, panelX: 1.6, panelY: 1.4, heroY: 2, visibleOpacity: 0.02, interactiveOpacity: 0.6,
};
export const COMET = {
  duration: 420, head: 3.5, interactiveHead: 7, smoothing: 12, trailAlpha: 0.55,
  minWidth: 0.5, width: 1.6, glowRadius: 4.5, glowAlpha: 0.55, coreRadius: 0.75,
};
