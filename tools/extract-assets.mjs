import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(process.argv[2] || path.join(root, '../rist-galaxy-mock.html'));
const html = await readFile(source, 'utf8');
const out = path.join(root, 'assets/img');
await mkdir(out, { recursive: true });
const origins = [
  ['sun', 'logo-mark-light.png'],
  ['p-spotjar', 'planet-spotjar.webp'],
  ['p-phaseparadise', 'planet-phaseparadise.webp'],
  ['p-unerforscht', 'asteroid.webp'],
  ['home', 'logo-mark-dark.png'],
  ['ov-hero', 'wordmark-light.png'],
  ['astImg.src', 'asteroid-small.webp'],
];
const found = new Set();
for (const match of html.matchAll(/data:image\/(png|webp|jpeg);base64,([A-Za-z0-9+/=]+)/g)) {
  const prefix = html.slice(0, match.index);
  const nearby = prefix.slice(-500);
  // HTML ownership is determined by the nearest containing ID/class, JS by its assignment.
  const owner = /astImg\.src\s*=\s*['"]$/.test(nearby) ? 'astImg.src'
    : [...prefix.matchAll(/(?:id|class)="([^"]+)"/g)].reverse()
      .find(m => origins.some(([key]) => key === m[1]))?.[1];
  const entry = origins.find(([key]) => key === owner);
  if (!entry) throw new Error(`Unmapped image at offset ${match.index}`);
  const [context, name] = entry;
  if (found.has(name)) throw new Error(`Duplicate context: ${context}`);
  const bytes = Buffer.from(match[2], 'base64');
  await writeFile(path.join(out, name), bytes);
  found.add(name);
  console.log(`${name} ← ${context} (${bytes.length} bytes)`);
}
for (const [, name] of origins) if (!found.has(name)) throw new Error(`Missing image: ${name}`);
console.log(`Extracted ${found.size} images from ${source}`);
