import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { buildAll, hydrate, setBase } from './render.mjs';

const root = resolve(process.argv[2] || '.');
const dist = join(root, 'dist');

const data = JSON.parse(readFileSync(join(root, 'content.json'), 'utf8'));

// essays live in texts/<name>.md
const texts = {};
const textDir = join(root, 'texts');
if (existsSync(textDir)) {
  for (const f of readdirSync(textDir)) {
    if (f.endsWith('.md')) texts[f.replace(/\.md$/, '')] = readFileSync(join(textDir, f), 'utf8');
  }
}
hydrate(data, texts);

// BASE_PATH comes from the Pages workflow: '' on a custom domain,
// '/portfolio' on the github.io project URL.
setBase(process.env.BASE_PATH || data.site.basePath || '');

// Which referenced images actually exist? Knowing lets the templates pick a
// real photograph for the hero and skip <img> tags that would 404.
const has = (rel) => !!rel && existsSync(join(root, 'static', rel.replace(/^\//, '')));
data.pages.forEach(p => { p.hasCover = has(p.cover); });
data.site.assetExists = has;

if (existsSync(dist)) rmSync(dist, { recursive: true });
mkdirSync(dist, { recursive: true });

// copy static assets first so generated files can overwrite where needed
cpSync(join(root, 'static'), dist, { recursive: true });

const files = buildAll(data);
for (const [path, contents] of Object.entries(files)) {
  const full = join(dist, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents, 'utf8');
}

console.log(`built ${Object.keys(files).length} files -> ${dist}`);
