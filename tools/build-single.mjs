import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const modules = new Map();
const visiting = new Set();
const importPattern = /^import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"];?\s*$/gm;
// A small dependency-ordered bundler for this project's static relative ES modules.
// Wrapping each module preserves scopes, so helpers with the same name never collide.
async function visit(id) {
  if (modules.has(id)) return;
  if (visiting.has(id)) throw new Error(`Circular module: ${id}`);
  visiting.add(id);
  const source = await readFile(path.join(root, id), 'utf8');
  const imports = [...source.matchAll(importPattern)];
  const dependencies = imports.map(match => path.posix.normalize(path.posix.join(path.posix.dirname(id), match[2])));
  for (const dependency of dependencies) await visit(dependency);
  let code = source;
  for (let i = 0; i < imports.length; i++) {
    const [statement, binding] = imports[i];
    if (!binding.trim().startsWith('{')) {
      code = code.replace(statement, `const ${binding.trim()} = __modules[${JSON.stringify(dependencies[i])}].default;\n`);
    } else {
      const destructure = binding.replace(/\bas\b/g, ':');
      code = code.replace(statement, `const ${destructure} = __modules[${JSON.stringify(dependencies[i])}];\n`);
    }
  }
  const named = [...code.matchAll(/^export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/gm)].map(match => match[1]);
  const hasDefault = /^export default /m.test(code);
  code = code.replace(/^export default /gm, 'const __default = ').replace(/^export\s+/gm, '');
  modules.set(id, `__modules[${JSON.stringify(id)}] = (() => {\n${code}\nreturn { ${named.join(', ')}${hasDefault ? `${named.length ? ', ' : ''}default: __default` : ''} };\n})();`);
  visiting.delete(id);
}
await visit('js/main.js');
let html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const match of [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)]) {
  const css = await readFile(path.join(root, match[1]), 'utf8');
  html = html.replace(match[0], () => `<style>\n${css}\n</style>`);
}
let script = `(() => {\n'use strict';\nconst __modules = Object.create(null);\n${[...modules.values()].join('\n')}\n})();`;
const inlineImage = async resource => {
  const extension = path.extname(resource).slice(1);
  return `data:image/${extension === 'jpg' ? 'jpeg' : extension};base64,${(await readFile(path.join(root, resource))).toString('base64')}`;
};
// Include images referenced by generated data as well as by the static markup.
const imagePaths = new Set([...`${html}\n${script}`.matchAll(/assets\/img\/(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+\.(?:webp|png|jpe?g)/g)].map(match => match[0]));
for (const resource of imagePaths) {
  const data = await inlineImage(resource);
  html = html.replaceAll(resource, data); script = script.replaceAll(resource, data);
}
// Prevent translated text or future configuration strings from ending a script element.
script = script.replace(/<\/script/gi, '<\\/script');
html = html.replace(/<script type="module" src="js\/main\.js"><\/script>/, () => `<script>\n${script}\n</script>`);
const out = path.join(root, 'dist');
await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'index.html'), html);
console.log(`Built ${path.join(out, 'index.html')} (${modules.size} modules, ${imagePaths.size} images, ${Buffer.byteLength(html)} bytes)`);
