const previews = [];
const upgrades = [];
const fullImages = new Map();

function loadFullImage(source) {
  if (!fullImages.has(source)) {
    const image = new Image();
    image.decoding = 'async';
    image.fetchPriority = 'low';
    image.src = source;
    fullImages.set(source, image.decode().then(() => image));
  }
  return fullImages.get(source);
}

export function createPlanetImage(body, className) {
  const container = document.createElement('span');
  container.className = `progressive-image ${className}`;
  container.setAttribute('aria-hidden', 'true');
  const preview = new Image();
  preview.alt = '';
  preview.className = 'planet-image-preview';
  preview.decoding = 'async';
  preview.src = body.preview ?? body.image;
  container.append(preview);
  previews.push(preview.decode().catch(() => {}));
  if (body.preview) upgrades.push({ container, source: body.image });
  return container;
}

export function startPlanetImageUpgrades() {
  // Let all small previews finish before the larger images compete for bandwidth.
  Promise.all(previews).then(() => {
    const upgrade = () => {
      for (const { container, source } of upgrades) {
        loadFullImage(source).then(async image => {
          const full = image.cloneNode();
          full.alt = '';
          full.className = 'planet-image-full';
          await full.decode();
          container.append(full);
          // Paint the decoded image at opacity 0 before starting the crossfade.
          requestAnimationFrame(() => requestAnimationFrame(() => container.classList.add('is-sharp')));
        }).catch(() => {
          // A failed full-size download leaves the usable preview in place.
        });
      }
    };
    if ('requestIdleCallback' in window) window.requestIdleCallback(upgrade, { timeout: 1500 });
    else setTimeout(upgrade, 300);
  });
}
