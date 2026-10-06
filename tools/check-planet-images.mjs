import assert from 'node:assert/strict';

const pending = new Map();
const requests = [];
const frames = [];
let idle;
function download(source) {
  if (!pending.has(source)) {
    let resolve, reject;
    const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
    pending.set(source, { promise, resolve, reject });
  }
  return pending.get(source);
}
class TestImage {
  set src(value) { this.source = value; requests.push(value); }
  get src() { return this.source; }
  decode() { return download(this.src).promise; }
  cloneNode() { const copy = new TestImage(); copy.src = this.src; return copy; }
}
globalThis.Image = TestImage;
globalThis.document = {
  createElement: () => ({
    children: [], classes: new Set(),
    classList: { add(value) { this.owner.classes.add(value); } },
    setAttribute() {},
    append(child) { this.children.push(child); this.classList.owner = this; },
  }),
};
globalThis.window = { requestIdleCallback(callback) { idle = callback; } };
globalThis.requestAnimationFrame = callback => frames.push(callback);
const flush = () => new Promise(resolve => setImmediate(resolve));
const { createPlanetImage, startPlanetImageUpgrades } = await import('../js/ui/planet-images.js');

const body = { preview: 'small.webp', image: 'large.webp' };
const planet = createPlanetImage(body, 'planet-art');
const panel = createPlanetImage(body, 'rm-planet');
const failed = createPlanetImage({ preview: 'other-small.webp', image: 'broken.webp' }, 'planet-art');
startPlanetImageUpgrades();
assert.deepEqual(requests, ['small.webp', 'small.webp', 'other-small.webp']);
assert.equal(idle, undefined, 'Full-size work waits for previews');
download('small.webp').resolve();
await flush();
assert.equal(idle, undefined, 'One unfinished preview still prevents upgrades');
download('other-small.webp').resolve();
await flush();
assert.equal(typeof idle, 'function');
assert.ok(!requests.includes('large.webp'), 'Idle scheduling does not start a download immediately');
idle();
assert.equal(requests.filter(source => source === 'large.webp').length, 1, 'World and panel share the full-size download');
assert.equal(planet.children.length, 1, 'The preview remains until decoding finishes');
download('large.webp').resolve();
download('broken.webp').reject(new Error('Simulated network failure'));
await flush();
assert.equal(planet.children.length, 2);
assert.equal(panel.children.length, 2);
assert.equal(failed.children.length, 1, 'A failed upgrade retains its preview');
assert.equal(planet.classes.has('is-sharp'), false, 'The decoded layer must be painted before fading');
for (const callback of frames.splice(0)) callback();
assert.equal(planet.classes.has('is-sharp'), false);
for (const callback of frames.splice(0)) callback();
assert.equal(planet.classes.has('is-sharp'), true);
assert.equal(panel.classes.has('is-sharp'), true);
assert.equal(failed.classes.has('is-sharp'), false);
console.log('Planet images verified: previews first, idle upgrades, shared download, decoded crossfade, network-error fallback.');
