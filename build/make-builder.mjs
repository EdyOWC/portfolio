/* Generates build.html: the same generator, running in a browser tab,
   so the site can be rebuilt on Windows with no terminal and no npm. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.argv[2] || '.');
const renderSrc = readFileSync(join(root, 'build/render.mjs'), 'utf8')
  .replace(/^export /gm, '');   // inline, no module exports needed

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Rebuild odedstrauss.com</title>
<style>
  :root { color-scheme: dark; }
  body { margin:0; background:#151210; color:#F2ECE3; font:16px/1.6 ui-sans-serif, system-ui, sans-serif; }
  main { width:min(100% - 3rem, 720px); margin:4rem auto; }
  h1 { font-size:1.9rem; margin:0 0 .4rem; letter-spacing:-.02em; }
  p  { color:#C4B9AB; }
  ol { color:#C4B9AB; padding-left:1.2rem; }
  li { margin-bottom:.5rem; }
  .drop {
    border:1px dashed #3A312A; padding:2rem; margin:2rem 0; text-align:center; background:#1D1815;
  }
  input[type=file] { color:#C4B9AB; }
  button {
    background:#E4A24A; color:#14100C; border:0; padding:.7rem 1.3rem;
    font:inherit; font-weight:700; cursor:pointer; margin-top:1rem;
  }
  button[disabled] { opacity:.4; cursor:default; }
  pre { background:#1D1815; border:1px solid #3A312A; padding:1rem; overflow:auto; font-size:.85rem; color:#8FB9A8; max-height:16rem; }
  code { color:#E4A24A; }
</style>
</head>
<body>
<main>
<h1>Rebuild the site</h1>
<p>No terminal, no npm. This page turns <code>content.json</code> into every HTML page of the site and hands you a zip to drag onto Netlify.</p>

<ol>
  <li>Edit <code>content.json</code> in any text editor. Add a page, change a slug, paste an embed.</li>
  <li>Drop images into <code>static/assets/img/</code>.</li>
  <li>Pick the project folder below and press Build.</li>
  <li>Unzip, then drag the unzipped folder onto <a href="https://app.netlify.com/drop" style="color:#E4A24A">app.netlify.com/drop</a>.</li>
</ol>

<div class="drop">
  <p style="margin-top:0">Choose the folder that contains <code>content.json</code></p>
  <input type="file" id="dir" webkitdirectory directory multiple>
  <br>
  <button id="go" disabled>Build the site</button>
</div>

<pre id="log">Waiting for a folder…</pre>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<script type="module">
${renderSrc}

const log = document.getElementById('log');
const go  = document.getElementById('go');
const dir = document.getElementById('dir');
let files = [];

const say = (m) => { log.textContent += '\\n' + m; };

dir.addEventListener('change', () => {
  files = Array.from(dir.files);
  const hasContent = files.some(f => f.webkitRelativePath.endsWith('/content.json'));
  log.textContent = files.length + ' files read.';
  if (!hasContent) { say('content.json not found in that folder. Pick the folder that contains it.'); go.disabled = true; return; }
  say('content.json found. Ready to build.');
  go.disabled = false;
});

go.addEventListener('click', async () => {
  go.disabled = true;
  try {
    const contentFile = files.find(f => f.webkitRelativePath.endsWith('/content.json'));
    const data = JSON.parse(await contentFile.text());
    const zip = new JSZip();

    // 1. copy everything under static/ to the root of the zip
    let copied = 0;
    for (const f of files) {
      const rel = f.webkitRelativePath.split('/').slice(1).join('/');
      if (!rel.startsWith('static/')) continue;
      zip.file(rel.slice('static/'.length), await f.arrayBuffer());
      copied++;
    }
    say('copied ' + copied + ' static files');

    // 2. generate every page
    const out = buildAll(data);
    for (const [path, contents] of Object.entries(out)) zip.file(path, contents);
    say('generated ' + Object.keys(out).length + ' files');

    // 3. hand it back
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'odedstrauss-site.zip';
    a.click();
    say('done — unzip it and drag the folder onto app.netlify.com/drop');
  } catch (err) {
    say('Build failed: ' + err.message);
    say('Most likely a typo in content.json — a missing comma or quote.');
  }
  go.disabled = false;
});
</script>
</body>
</html>`;

writeFileSync(join(root, 'build.html'), html, 'utf8');
console.log('wrote build.html');
