/* =========================================================
   render.mjs — the whole site generator.
   Pure functions: content.json in, { path: html } out.
   Used by build.mjs (Node) and by build.html (browser).
   ========================================================= */

const FONTS = 'https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,200;0,300;0,400;0,500;0,600;1,300;1,400&family=Frank+Ruhl+Libre:wght@300;400;500;600&display=swap';

/* Permissions handed to every embedded frame. This is the whole reason
   for leaving a hosted portfolio builder: XR, camera, gyroscope, fullscreen. */
const IFRAME_ALLOW = 'accelerometer; autoplay; camera; clipboard-write; encrypted-media; fullscreen; gyroscope; magnetometer; microphone; picture-in-picture; xr-spatial-tracking';

/* Every internal link goes through u(). BASE is '' on a custom domain and
   '/portfolio' on the github.io project URL, so one build serves both. */
let BASE = '';
export function setBase(b) { BASE = (b || '').replace(/\/$/, ''); }
export const u = (path = '/') => BASE + (path.startsWith('/') ? path : '/' + path);

export const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
           .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* Markdown-lite for body copy: **bold**, *italic*, [text](href) */
function inline(s = '') {
  return esc(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, h) => `<a href="${/^https?:|^mailto:|^#/.test(h) ? h : u(h)}"${/^https?:/.test(h) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*\n]+)\*/g, '$1<em>$2</em>');
}

const paras = (s = '') =>
  s.split(/\n{2,}/).map(p => `<p>${inline(p.trim()).replace(/\n/g, '<br>')}</p>`).join('\n');

const isHe = (s = '') => /[֐-׿]/.test(s);
const dirAttr = (block, page) => {
  const d = block.dir || (block.lang === 'he' || page?.lang === 'he' || isHe(block.body || '') ? 'rtl' : null);
  return d === 'rtl' ? ' dir="rtl"' : '';
};

const host = (url) => { try { return new URL(url).host.replace(/^www\./, ''); } catch { return url; } };

/* Eight gel colours. A slug always lands on the same one, so a project keeps
   its colour across the whole site until a photograph replaces the cover. */
const TINTS = ['#7A2029', '#1F3A5F', '#33543C', '#8A5A1E', '#4B2F62', '#15555A', '#8C3F1D', '#3B4059'];
const tintFor = (slug = '') => {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
};

/* Does anything on this page actually run or play? */
const playsIn = (p) => (p.blocks || []).some(b => ['embed', 'html'].includes(b.type));
const mediaCount = (p) => (p.blocks || []).filter(b => ['embed', 'html', 'youtube', 'vimeo', 'video'].includes(b.type)).length;

/* A tile: photograph if there is one, otherwise the title set large on its colour. */
function tile(p, { tall = false } = {}) {
  const he = p.lang === 'he' ? ' dir="rtl"' : '';
  /* Both covers are always in the markup. CSS shows the photograph when one
     loads and falls back to the typographic cover when it does not, so the
     grid is never full of grey rectangles. */
  const typed = `<span class="tile__type"${he}><span class="n">${esc((p.tags || [])[0] || p.year || '')}</span><h3>${esc(p.title)}</h3></span>`;
  const photo = (p.hasCover !== false && p.cover)
    ? `<img src="${u(p.cover)}" alt="" loading="lazy" onerror="this.remove()"${p.coverFit === 'contain' ? ' class="fit"' : ''}>
       <span class="tile__over"><h3${he}>${esc(p.title)}</h3></span>`
    : '';
  return `<a class="tile${tall ? ' tile--tall' : ''}" href="${u(p.slug)}"${(p.tags || []).length ? ` data-tags="${esc(p.tags.join('|'))}"` : ''}>
  <span class="tile__frame" style="--tint:${p.coverBg || tintFor(p.slug)}">
    ${playsIn(p) ? '<span class="play"><span class="dot"></span>plays here</span>' : ''}
    ${typed}${photo}
  </span>
  <span class="tile__meta">
    <span class="y">${esc(p.year || '')}</span>
    ${(p.tags || []).map(t => `<span>${esc(t)}</span>`).join('')}
  </span>
  ${p.description ? `<span class="tile__desc"${he}>${esc(p.description)}</span>` : ''}
</a>`;
}

/* Subject filter: real interaction, built from the tags that exist. */
function filters(pages) {
  /* Only subjects that group something. A filter that matches one item
     is a label, not a filter. */
  const count = {};
  pages.forEach(p => (p.tags || []).forEach(t => { count[t] = (count[t] || 0) + 1; }));
  const all = Object.keys(count).filter(t => count[t] > 1)
    .sort((a, b) => count[b] - count[a]).slice(0, 8);
  if (all.length < 2) return '';
  return `<div class="filters" data-filters>
  <button type="button" data-tag="" aria-pressed="true">Everything</button>
  ${all.map(t => `<button type="button" data-tag="${esc(t)}" aria-pressed="false">${esc(t)}</button>`).join('\n  ')}
</div>`;
}

/* ---------- blocks ---------- */

function gate({ src, title, ratio, tall, caption, note, kind, poster, defer }, extra = '') {
  const shape = tall ? ' gate--tall' : (ratio === '1/1' ? ' gate--square' : '');
  /* Tours and apps load straight away: the whole point is that the work runs
     inside the page. Video is deferred behind its own thumbnail, because a
     player that loads unbidden is just weight. */
  const stage = defer
    ? `<button class="gate__open" type="button"${poster ? ` style="background-image:url(${esc(poster)})"` : ''}>
        <span class="gate__glyph" aria-hidden="true"></span>
        <span class="gate__label">${esc(title || 'Play')}</span>
        <span class="gate__host">${esc(kind || host(src))}</span>
      </button>`
    : `<iframe src="${esc(src)}" title="${esc(title || 'Embedded experience')}" loading="lazy"
         allow="${IFRAME_ALLOW}" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;

  return `<div class="gate${shape}${extra}">
  <div class="gate__frame" data-embed="${esc(src)}" data-title="${esc(title || '')}"${defer ? '' : ' data-loaded="1"'}>
    <div class="gate__stage">${stage}</div>
    <div class="gate__bar">
      <span class="gate__src">${esc(kind || host(src))}</span>
      <span class="spacer"></span>
      <button class="gate__btn gate__btn--go" type="button" data-fullscreen>Open full screen</button>
      <a class="gate__btn" href="${esc(src)}" target="_blank" rel="noopener">New tab</a>
    </div>
  </div>
  ${caption ? `<p class="gate__cap"${isHe(caption) ? ' dir="rtl"' : ''}>${inline(caption)}</p>` : ''}
  ${note ? `<p class="gate__note">Note to self: ${esc(note)}</p>` : ''}
</div>`;
}

function block(b, page) {
  switch (b.type) {
    case 'lede':
      return `<p class="lede"${dirAttr(b, page)}>${inline(b.body)}</p>`;

    case 'text':
      return `<div class="prose"${dirAttr(b, page)}>${paras(b.body)}</div>`;

    case 'heading':
      return `<h2${dirAttr(b, page)}>${inline(b.body)}</h2>`;

    case 'quote':
      return `<blockquote class="quote"${dirAttr(b, page)}>${paras(b.body)}${b.cite ? `<cite>${esc(b.cite)}</cite>` : ''}</blockquote>`;

    case 'list': {
      const tag = b.ordered ? 'ol' : 'ul';
      return `<${tag}${dirAttr(b, page)}>${b.items.map(i => `<li>${inline(i)}</li>`).join('')}</${tag}>`;
    }

    case 'credits':
      return `<div class="credits">${b.rows.map(([k, v]) =>
        `<div><span class="k">${inline(k)}</span><span class="v">${inline(v)}</span></div>`).join('')}</div>`;

    case 'image':
      return `<figure class="shot"><img src="${u(b.src)}" alt="${esc(b.alt || '')}" loading="lazy" onerror="this.closest('figure').remove()">${
        b.caption ? `<figcaption${isHe(b.caption) ? ' dir="rtl"' : ''}>${inline(b.caption)}</figcaption>` : ''}</figure>`;

    case 'pair':
      return `<div class="pair">${b.images.map(im =>
        `<figure><img src="${u(im.src)}" alt="${esc(im.caption || '')}" loading="lazy" onerror="this.closest('figure').remove()">${
          im.caption ? `<figcaption${isHe(im.caption) ? ' dir="rtl"' : ''}>${inline(im.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`;

    case 'gallery':
      return `<div class="gallery" data-cols="${b.columns || 2}">${b.images.map(im =>
        `<img src="${u(im.src)}" alt="${esc(im.alt || '')}" loading="lazy" onerror="this.remove()">`).join('')}</div>`;

    case 'video':
      return `<div class="gate"><div class="gate__frame">
        <div class="gate__stage"><video controls preload="metadata"${b.poster ? ` poster="${u(b.poster)}"` : ''}>
          <source src="${u(b.src)}" type="video/mp4"></video></div></div>${
        b.caption ? `<p class="gate__cap">${inline(b.caption)}</p>` : ''}</div>`;

    case 'youtube':
      return gate({ src: `https://www.youtube-nocookie.com/embed/${b.id}?autoplay=1`, title: b.title, caption: b.caption, kind: 'YouTube', poster: `https://i.ytimg.com/vi/${b.id}/maxresdefault.jpg`, defer: true });

    case 'vimeo':
      return gate({ src: `https://player.vimeo.com/video/${b.id}`, title: b.title, caption: b.caption, kind: 'Vimeo', defer: true });

    case 'embed':
      return gate(b);

    /* Small interactive pieces that belong to one essay. Each is a plain
       HTML file in static/widgets/, framed so its CSS cannot leak. */
    case 'widget':
      return `<figure class="widget">
  <iframe src="${u('widgets/' + b.name + '.html')}" title="${esc(b.caption || b.name)}" loading="lazy"
          data-autosize scrolling="no"></iframe>
  ${b.caption ? `<figcaption${isHe(b.caption) ? ' dir="rtl"' : ''}>${inline(b.caption)}</figcaption>` : ''}
</figure>`;

    /* Escape hatch: paste any provider's embed snippet verbatim. */
    case 'html':
      return `<div class="gate"><div class="gate__frame">
        <div class="gate__stage">${b.raw}</div></div>${b.caption ? `<p class="gate__cap">${inline(b.caption)}</p>` : ''}</div>`;

    case 'link':
      return `<p><a class="cta" href="${esc(b.href)}"${/^https?:/.test(b.href) ? ' target="_blank" rel="noopener"' : ''}>${esc(b.label)}</a></p>`;

    case 'todo':
      return `<div class="todo"${dirAttr(b, page)}><strong>Not migrated yet.</strong> ${esc(b.body)}</div>`;

    default:
      return '';
  }
}

/* ---------- markdown essays ---------- */
/* Long pieces live in texts/<name>.md so they can be edited as prose.
   Supported: ## heading, > quote, - list, 1. list, @embed URL | caption,
   @youtube ID | caption, @image path | caption, plus **bold**, *italic*,
   [link](url). A blank line separates paragraphs. */
export function parseText(md, lang) {
  const blocks = [];
  const chunks = md.replace(/\r/g, '').split(/\n{2,}/).map(c => c.trim()).filter(Boolean);
  let first = true;
  for (const c of chunks) {
    const rtl = lang === 'he' || /[\u0590-\u05FF]/.test(c);
    const dir = rtl ? 'rtl' : undefined;

    let m;
    if (c.startsWith('@pair ')) {
      const parts = c.slice(6).split('||').map(x => x.trim()).filter(Boolean);
      blocks.push({ type: 'pair', images: parts.map(x => {
        const [src, cap] = x.split('|').map(y => y.trim());
        return { src, caption: cap || '' };
      }) });
      continue;
    }
    if ((m = c.match(/^@(embed|youtube|vimeo|image|widget)\s+(\S+)\s*(?:\|\s*([\s\S]+))?$/))) {
      const [, kind, ref, caption] = m;
      if (kind === 'embed') blocks.push({ type: 'embed', src: ref, title: caption || '', caption, tall: true });
      else if (kind === 'youtube') blocks.push({ type: 'youtube', id: ref, caption });
      else if (kind === 'vimeo') blocks.push({ type: 'vimeo', id: ref, caption });
      else if (kind === 'widget') blocks.push({ type: 'widget', name: ref, caption });
      else blocks.push({ type: 'image', src: ref, alt: caption || '', caption });
      continue;
    }
    if (c.startsWith('## ')) { blocks.push({ type: 'heading', body: c.slice(3), dir }); continue; }
    if (c.startsWith('> ')) {
      const lines = c.split('\n');
      const cite = lines[lines.length - 1].startsWith('> --') ? lines.pop().slice(5).trim() : null;
      blocks.push({ type: 'quote', body: lines.map(l => l.replace(/^>\s?/, '')).join('\n'), cite, dir });
      continue;
    }
    if (/^(\d+\.|[-*])\s/.test(c)) {
      const ordered = /^\d+\./.test(c);
      const items = c.split('\n').map(l => l.replace(/^(\d+\.|[-*])\s*/, '').trim()).filter(Boolean);
      blocks.push({ type: 'list', ordered, items, dir });
      continue;
    }
    if (first && c.length < 220) { blocks.push({ type: 'lede', body: c, dir }); first = false; continue; }
    first = false;
    blocks.push({ type: 'text', body: c, dir });
  }
  return blocks;
}

/* Pages declare "text": "<name>"; the build swaps in the parsed file. */
export function hydrate(data, texts) {
  data.pages.forEach(p => {
    if (!p.text) return;
    const md = texts[p.text];
    if (md == null) return;
    p.blocks = [...parseText(md, p.lang), ...(p.blocks || []).filter(b => b.type !== 'todo')];
  });
  return data;
}

/* ---------- chrome ---------- */

function head(data, { title, description, path, image, lang, theme }) {
  const s = data.site;
  const url = s.origin + (path === 'index.html' ? '/' : '/' + path.replace(/\/index\.html$/, ''));
  const og = s.origin + '/' + (image || s.ogImage).replace(/^\//, '');
  return `<!doctype html>
<html lang="${lang || s.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(s.name)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(og)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FBFAF7">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${u('assets/site.css')}">
<link rel="icon" href="${u('assets/favicon.svg')}" type="image/svg+xml">
<script defer src="${u('assets/site.js')}"></script>
</head>
<body${theme ? ` data-theme="${esc(theme)}"` : ''}>
<a class="skip" href="#main">Skip to content</a>`;
}

function mast(data, current) {
  const s = data.site;
  return `<header class="mast"><div class="mast__in">
  <a class="mast__name" href="${u('/')}">${esc(s.name)}</a>
  <nav class="mast__nav" aria-label="Main">
    ${s.nav.map(n => `<a href="${u(n.href)}"${current === n.href ? ' aria-current="page"' : ''}>${esc(n.label)}</a>`).join('\n    ')}
  </nav>
</div></header>`;
}

function foot(data) {
  const s = data.site;
  return `<footer class="foot"><div class="wrap foot__in">
  <div class="foot__links">
    <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>
    ${s.social.map(x => `<a href="${esc(x.href)}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('\n    ')}
  </div>
  <p class="foot__epi">${esc(s.epigraph)}</p>
</div></footer>
<div class="lb" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Enlarged image">
  <button class="lb__close" type="button" data-lb-close>Close</button>
  <figure style="margin:0"><img alt=""><figcaption></figcaption></figure>
</div>
</body>
</html>`;
}

/* ---------- pages ---------- */

function related(data, page) {
  const siblings = data.pages.filter(p => p.section === page.section && p.slug !== page.slug).slice(0, 3);
  if (!siblings.length) return '';
  return `<div class="wrap"><section class="related">
  <h2>Elsewhere in this section</h2>
  <div class="grid grid--3">${siblings.slice(0, 3).map(p => tile(p)).join('')}</div>
</section></div>`;
}

/* The metadata rail: what a journal puts above an article, not decoration.
   Built from fields that already exist, so it never invents anything. */
const byYear = (a, b) => String(b.year || '').localeCompare(String(a.year || ''));

function entryFor(data, p) {
  return `<a class="entry" href="${u(p.slug)}"${p.lang ? ` data-lang="${p.lang}"` : ''}>
  <span class="entry__year">${esc(p.year || '')}</span>
  <span>
    <h3 class="entry__title">${esc(p.title)}</h3>
    <p class="entry__desc">${esc(p.description || '')}</p>
  </span>
</a>`;
}

function listing(data, section, pages) {
  if (section.layout === 'list') return `<div class="entries">${pages.map(p => entryFor(data, p)).join('\n')}</div>`;
  const cols = section.layout === 'poster' ? 'grid--poster'
             : section.layout === 'grid' ? 'grid--3' : 'grid--2';
  return `<div class="grid ${cols}" data-grid>${pages.map(p => tile(p)).join('\n')}</div>`;
}

/* ---------- article ---------- */

function facts(data, page) {
  const section = data.sections.find(x => x.id === page.section);
  const rows = [];
  if (page.year) rows.push(['Year', esc(page.year)]);
  if (section) rows.push(['Section', `<a href="${u(section.slug)}" style="color:inherit">${esc(section.title)}</a>`]);
  if (page.tags && page.tags.length) rows.push(['Subject', page.tags.map(esc).join(', ')]);
  const n = mediaCount(page);
  if (n) rows.push(['On this page', n === 1 ? 'One piece plays here' : `${n} pieces play here`]);
  if (!rows.length) return '';
  return `<div class="facts wide">${rows.map(([k, v]) =>
    `<div><span class="k">${k}</span><p class="v">${v}</p></div>`).join('')}</div>`;
}

/* Media and galleries break out of the text measure; prose stays narrow. */
const WIDE = new Set(['embed', 'html', 'youtube', 'vimeo', 'video', 'gallery', 'image', 'widget', 'pair']);

export function renderPage(data, page) {
  const s = data.site;
  const section = data.sections.find(x => x.id === page.section);
  const navHref = section ? u(section.slug) : u('/');

  /* Lead with the work. The first thing that plays is pulled above the title
     and given the full width of the page; the rest stays in reading order. */
  const blocks = page.blocks || [];
  /* Some pages want the title first and the demo in its own section, the way
     the original was built. Those set "opener": false. */
  const first = page.opener === false ? -1
    : blocks.findIndex(b => ['embed', 'html', 'youtube', 'vimeo', 'video'].includes(b.type));
  const opener = first > -1 ? blocks[first] : null;
  const rest = first > -1 ? blocks.filter((_, i) => i !== first) : blocks;

  return [
    head(data, {
      title: `${page.title} — ${s.name}`,
      description: page.description || s.description,
      path: `${page.slug}/index.html`,
      image: page.cover,
      lang: page.lang || s.lang,
      theme: page.theme
    }),
    mast(data, section ? '/' + section.slug : '/'),
    `<main id="main">
  ${opener ? `<section class="opener"><div class="wrap">${block(opener, page)}</div></section>` : ''}
  <div class="wrap">
  <a class="crumb" href="${navHref}">${esc(section ? section.title : 'Back')}</a>
  <div class="phead">
    <h1${page.lang === 'he' ? ' dir="rtl"' : ''}>${esc(page.title)}</h1>
    ${page.description ? `<p${page.lang === 'he' ? ' dir="rtl"' : ''}>${esc(page.description)}</p>` : ''}
  </div>
  <div class="article">
    ${facts(data, page)}
    ${rest.map(b => {
      const html = block(b, page);
      return WIDE.has(b.type) ? `<div class="wide">${html}</div>` : html;
    }).join('\n    ')}
  </div>
  </div>
</main>`,
    related(data, page),
    foot(data)
  ].join('\n');
}

export function renderSection(data, section) {
  const s = data.site;
  const pages = data.pages.filter(p => p.section === section.id).sort(byYear);
  return [
    head(data, {
      title: `${section.title} — ${s.name}`,
      description: section.intro || s.description,
      path: `${section.slug}/index.html`
    }),
    mast(data, '/' + section.slug),
    `<main id="main"><div class="wrap">
  <div class="phead">
    <h1>${esc(section.heading)}</h1>
    ${section.intro ? `<p>${inline(section.intro)}</p>` : ''}
  </div>
  ${section.layout === 'list' ? '' : filters(pages)}
  ${listing(data, section, pages)}
</div></main>`,
    foot(data)
  ].join('\n');
}

export function renderHome(data) {
  const s = data.site;
  const h = s.home;
  /* The hero shows a real still. Pick the newest work that has one, so the
     page is never a black rectangle waiting for an upload. */
  const shot = data.pages
    .filter(p => p.section === 'work' && p.hasCover !== false && p.cover)
    .sort((a, b) => String(b.year || '').localeCompare(String(a.year || '')))[0];
  const hero = shot
    ? { poster: shot.cover, href: '/' + shot.slug, caption: `${shot.title}, ${shot.year}` }
    : { poster: h.heroEmbed.poster, href: h.heroEmbed.href, caption: h.heroEmbed.caption };
  const work = data.pages.filter(p => p.section === 'work').sort(byYear);
  const lab = data.pages.filter(p => p.section === 'lab').sort(byYear);
  const diaries = data.pages.filter(p => p.section === 'diaries').sort(byYear).slice(0, 6);
  const diarySection = data.sections.find(x => x.id === 'diaries');

  return [
    head(data, { title: `${s.name} — ${s.tagline}`, description: s.description, path: 'index.html' }),
    mast(data, '/'),
    `<main id="main">
  <section class="hero">
    <div class="hero__stage">
      ${hero.poster ? `<img src="${u(hero.poster)}" alt="" onerror="this.remove()">` : ''}
      <div class="hero__veil"></div>
    </div>
    <div class="hero__copy"><div class="wrap">
      <h1>${esc(h.headline)}</h1>
      <p class="hero__sub">${inline(h.statement)}</p>
      <a class="hero__now" href="${u(hero.href)}"><span class="dot"></span>${esc(hero.caption)}</a>
    </div></div>
  </section>

  <div class="wrap">
    <section class="band">
      <div class="band__head"><h2>Works</h2><a href="${u('work')}">All ${work.length} works</a></div>
      <div class="grid grid--poster">${work.slice(0, 6).map(p => tile(p)).join('\n')}</div>
    </section>

    <section class="band">
      <div class="band__head"><h2>1-hour projects</h2><a href="${u('1-hour-projects')}">All ${lab.length}</a></div>
      <p class="band__note">Very short experiments. Build it fast, ship it, write down what broke.</p>
      <div class="grid grid--3">${lab.slice(0, 3).map(p => tile(p)).join('\n')}</div>
    </section>

    <section class="band">
      <div class="band__head"><h2>Media Diaries</h2><a href="${u('media-diaries')}">All ${data.pages.filter(p => p.section === 'diaries').length}</a></div>
      ${listing(data, diarySection, diaries)}
    </section>
  </div>
</main>`,
    foot(data)
  ].join('\n');
}

export function renderAboutIndex(data) {
  const s = data.site;
  const pages = data.pages.filter(p => p.section === 'about');
  return [
    head(data, { title: `About — ${s.name}`, description: s.description, path: 'about/index.html' }),
    mast(data, '/about'),
    `<main id="main"><div class="wrap">
  <div class="phead">
    <h1>${esc(s.home.headline)}</h1>
    <p>${esc(s.tagline)}. Based in ${esc(s.location)}.</p>
  </div>
  <div class="facts">
    ${s.home.facts.map(([k, v]) => `<div><span class="k">${esc(k)}</span><p class="v">${esc(v)}</p></div>`).join('\n    ')}
  </div>
  <section class="band">
    <div class="band__head"><h2>Longer</h2></div>
    <div class="grid grid--2">${pages.map(p => tile(p)).join('\n')}</div>
  </section>
</div></main>`,
    foot(data)
  ].join('\n');
}

export function renderContact(data) {
  const s = data.site;
  return [
    head(data, { title: `Contact — ${s.name}`, description: `Get in touch with ${s.name}, ${s.location}.`, path: 'contact/index.html' }),
    mast(data, '/contact'),
    `<main id="main"><div class="wrap">
  <div class="phead">
    <h1>Contact</h1>
    <p>Commissions, virtual tours, festival and programme enquiries, teaching, or a coffee in Tel Aviv.</p>
  </div>
  <div class="facts">
    <div><span class="k">Email</span><p class="v"><a href="mailto:${esc(s.email)}" style="color:inherit">${esc(s.email)}</a></p></div>
    <div><span class="k">Based</span><p class="v">${esc(s.location)}</p></div>
    <div><span class="k">Languages</span><p class="v">Hebrew, English</p></div>
  </div>
  <div class="article" style="padding-top:2rem">
    <div>
      ${s.formEndpoint
    ? `<form class="form" method="POST" action="${esc(s.formEndpoint)}">
        <label>Name <input type="text" name="name" required autocomplete="name"></label>
        <label>Email <input type="email" name="email" required autocomplete="email"></label>
        <label>Message <textarea name="message" required></textarea></label>
        <button type="submit">Send message</button>
      </form>`
    /* GitHub Pages has no server, so with no form service configured the form
       composes the message in the visitor's own mail client instead. */
    : `<form class="form" data-mailto="${esc(s.email)}">
        <label>Name <input type="text" name="name" required autocomplete="name"></label>
        <label>Subject <input type="text" name="subject" required></label>
        <label>Message <textarea name="message" required></textarea></label>
        <button type="submit">Write this email</button>
      </form>`}
  <p class="contact-aside">${s.formEndpoint ? 'I read everything and answer most of it. If it is time-sensitive, say so in the first line.' : `This opens your own mail app with the message ready to send. Or write straight to <a href="mailto:${esc(s.email)}">${esc(s.email)}</a>.`}</p>
    </div>
  </div>
</div></main>`,
    foot(data)
  ].join('\n');
}

export function renderThanks(data) {
  const s = data.site;
  return [
    head(data, { title: `Message sent — ${s.name}`, description: 'Thank you.', path: 'thanks/index.html' }),
    mast(data, '/contact'),
    `<main id="main"><div class="wrap"><div class="phead">
  <h1>Message sent</h1>
  <p>Thank you. <a href="${u('work')}">Back to the works</a>.</p>
</div></div></main>`,
    foot(data)
  ].join('\n');
}

export function render404(data) {
  const s = data.site;
  return [
    head(data, { title: `Not found — ${s.name}`, description: 'Page not found.', path: '404.html' }),
    mast(data, ''),
    `<main id="main"><div class="wrap"><div class="phead">
  <h1>No page at this address</h1>
  <p>It moved, or it never existed. Try the <a href="${u('work')}">works</a>, the <a href="${u('media-diaries')}">media diaries</a>, or the <a href="${u('1-hour-projects')}">1-hour projects</a>.</p>
</div></div></main>`,
    foot(data)
  ].join('\n');
}

/* ---------- non-html outputs ---------- */

function sitemap(data) {
  const s = data.site;
  const urls = ['', ...data.sections.map(x => x.slug), 'contact', ...data.pages.map(p => p.slug)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...new Set(urls)].map(u => `  <url><loc>${s.origin}/${u}</loc></url>`).join('\n')}
</urlset>`;
}

const robots = (data) => `User-agent: *\nAllow: /\n\nSitemap: ${data.site.origin}/sitemap.xml\n`;

/* Old Adobe Portfolio slugs are preserved one-for-one, so nothing to redirect
   except the two index aliases. Add a line here whenever you rename a slug. */
/* GitHub Pages serves 404.html for anything missing and has no redirect
   engine. If a slug is ever renamed, add a small stub page here. */
const cname = (data) => data.site.origin.replace(/^https?:\/\//, '').replace(/\/$/, '') + '\n';



/* A registration mark: the thing a projectionist lines a frame up against. */
const favicon = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<rect width="32" height="32" fill="#FBFAF7"/>
<rect x="5.5" y="5.5" width="21" height="21" fill="none" stroke="#141618" stroke-width="1.5"/>
<circle cx="16" cy="16" r="4" fill="#7A2029"/>
</svg>`;

/* ---------- the build ---------- */

export function buildAll(data) {
  const out = {};
  out['index.html'] = renderHome(data);
  out['404.html'] = render404(data);
  out['contact/index.html'] = renderContact(data);
  out['thanks/index.html'] = renderThanks(data);

  for (const section of data.sections) {
    out[`${section.slug}/index.html`] = section.id === 'about'
      ? renderAboutIndex(data)
      : renderSection(data, section);
  }
  for (const page of data.pages) {
    out[`${page.slug}/index.html`] = renderPage(data, page);
  }

  out['sitemap.xml'] = sitemap(data);
  out['robots.txt'] = robots(data);
  out['assets/favicon.svg'] = favicon();
  /* GitHub Pages: a custom domain needs CNAME in the published output, and
     .nojekyll stops Jekyll from eating folders that begin with an underscore. */
  if (data.site.customDomain) out['CNAME'] = cname(data);
  out['.nojekyll'] = '';
  return out;
}
