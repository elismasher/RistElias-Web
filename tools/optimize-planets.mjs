import { stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
for (const name of ['planet-spotJar', 'planet-phaseparadise', 'asteroid', 'asteroid_underConstruction']) {
  const source = path.join(root, 'assets/img/planets', `${name}.png`);
  const outputs = [
    { suffix: '-preview', quality: 45, resize: ['-resize', '320', '320'] },
    { suffix: '', quality: 86, resize: [] },
  ];
  for (const { suffix, quality, resize } of outputs) {
    const output = path.join(root, 'assets/img/planets', `${name}${suffix}.webp`);
    const result = spawnSync('cwebp', ['-quiet', '-q', String(quality), '-m', '6', ...resize, source, '-o', output], { stdio: 'inherit' });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`cwebp failed for ${source}`);
    console.log(`${path.basename(output)}: ${(await stat(output)).size} bytes`);
  }
}
