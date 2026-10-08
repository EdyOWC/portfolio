# odedstrauss.com

A static rebuild of the Adobe Portfolio site, hosted on GitHub Pages. Every URL
is identical to the current one, so nothing shared or indexed breaks.

The point of the rebuild: **things run inside the page.** Virtual tours, data
pieces, charts and small interactive explainers all embed instead of linking out.

---

## Deploy it

1. Create a repository and push this folder to `main`.
2. Settings → Pages → **Source: GitHub Actions**.
3. Push. `.github/workflows/deploy.yml` runs `node build/build.mjs .` and publishes
   `dist/`. Takes about a minute.
4. When you are ready to move the domain: Settings → Pages → Custom domain →
   `odedstrauss.com`, then point the DNS at GitHub. The build already writes a
   `CNAME` file into `dist/`, so it survives every deploy.

`dist/` is gitignored — it is built in CI, never committed. There is nothing to
drag anywhere.

**No terminal?** `build.html` still works: open it in Chrome, pick this folder,
press Build, and you get the same `dist/` as a zip. Useful for previewing before
you push.

---

## How the site is put together

```
content.json          ← the page list: slugs, titles, years, tags, embeds
texts/*.md            ← long essays, one file each, plain markdown
static/assets/        ← site.css, site.js, images
static/widgets/*.html ← small interactive pieces, one file each
static/data/*.csv     ← data the widgets read
build/render.mjs      ← the templates
dist/                 ← generated. Never edit; CI overwrites it
```

## Adding a page

Copy an entry in `content.json` → `pages`, change `slug`, `title`, `year`, `tags`.
Either write `blocks` inline, or set `"text": "<name>"` and write
`texts/<name>.md`. Commit and push; the site rebuilds itself.

## Writing an essay

`texts/<name>.md` is plain markdown. `## heading`, `> quote`, `- list`,
`1. list`, `**bold**`, `*italic*`, `[link](/url)`. A blank line separates
paragraphs, and the first short paragraph becomes the opening line. Hebrew is
detected automatically and set right-to-left in Frank Ruhl Libre.

Four extra lines put media in:

```
@embed https://example.com/tour | caption
@youtube VIDEO_ID | caption
@image assets/img/photo.jpg | caption
@widget widget-name | caption
```

## Block types (for `content.json`)

`text` · `lede` · `heading` · `quote` · `list` · `credits` · `image` · `gallery` ·
`video` · `youtube` · `vimeo` · `embed` · `html` · `widget` · `link` · `todo`

Any block accepts `"dir": "rtl"`.

## Embedding — the reason for the move

```json
{ "type": "embed", "src": "https://dzc-demo.odedstrauss.com/", "tall": true,
  "title": "Dizengoff Center 360 tour", "caption": "Drag to look around." }
```

Every embed gets `allow="accelerometer; autoplay; camera; clipboard-write;
encrypted-media; fullscreen; gyroscope; magnetometer; microphone;
picture-in-picture; xr-spatial-tracking"` plus `allowfullscreen`, a full-screen
button and an open-in-a-tab link. Kuula, Marzipano, A-Frame, model-viewer,
Sketchfab and WebXR all work, headset entry included. For anything with its own
script tag, use `"type": "html"` and paste their snippet into `raw`.

## Widgets

A widget is a standalone HTML file in `static/widgets/`. It is framed on the page,
reports its own height, and cannot leak CSS into the article. Three exist:

- `card-frames` — the forty-one frames of the Now You See Me trick, twelve of them
  showing the seven of diamonds, against the 1.9 % a card gets by chance.
- `further-other-new` — your Further / Other / New model as something the reader
  plays: ten titles, place each one, then see where you placed it and why.
- `theatrical-window` — reads `static/data/theatrical-window.csv`. **Currently
  empty**, and it says so on the page rather than showing invented numbers. Paste
  the seminar table in as `year,film,weeks` and the chart appears.

To add one, write the HTML file, end it with
`<script src="/widgets/_autosize.js"></script>`, and reference it with
`@widget <filename-without-extension>`.

---

## Design

Work first. The page exists to show the pieces and let people touch them.

- **Covers that already exist.** Every project gets a tile. If a photograph is in
  `static/assets/img/` it fills the tile and the title rides over it. If there is no
  photograph, the tile becomes a typographic cover — the title set large on a colour
  drawn from the project's slug, so it is the same colour on every page and across
  rebuilds. Eight gel colours, picked to sit together. The site looks like a designed
  series today and swaps to photographs one file at a time.
- **The work plays before it is described.** The home page opens on the Dizengoff
  tour running full-bleed. On a project page the first embed, video or tour is pulled
  above the title and given the full width of the page. Text comes after the thing it
  is about.
- **Media breaks the measure.** Prose stays at 62 characters; embeds, galleries and
  figures run wider. That contrast is the layout — you can feel where the reading
  stops and the looking starts.
- **Three interactions, no framework.** Subject filters on the Works and 1-hour grids
  (built from tags that group more than one project, so a filter always does
  something), click-to-enlarge on every photograph, and a full-screen button on every
  embed. About 70 lines of plain JavaScript in `static/assets/site.js`.
- **Spectral throughout**, with Frank Ruhl Libre carrying the Hebrew. Paper
  `#FAF8F4`, ink `#121316`, oxblood `#8C2230` for the one live accent. Embedded
  pieces sit on near-black: an interactive work is a different kind of object from
  the text around it and should look like one.

Colours, the type scale and the measure are CSS variables at the top of
`static/assets/site.css`. The eight tile colours are the `TINTS` array near the top
of `build/render.mjs`.

---

## The contact form

GitHub Pages has no server, so the Netlify form is gone. Right now the form
composes the message in the visitor's own mail app and sends it to the address in
`content.json`. That works everywhere and costs nothing, but it does not catch
people who use webmail without a mail client registered.

If you want real form submissions, sign up for Formspree (or Basin, or
FormSubmit), then set `"formEndpoint": "https://formspree.io/f/xxxxxx"` in
`content.json` → `site`. The build switches to a real POST form automatically. No
other change needed.

---

## What is still missing

**Images.** Adobe serves them from its own CDN behind lazy loading, and I could
not extract them. Download them from the Adobe editor into `static/assets/img/`
using the filenames already in `content.json`. Until then every project shows a
typographic cover instead, so nothing looks broken.

**Seven diary texts.** Nine of the sixteen PDFs in your Drive folder are in
`texts/` as proper markdown. The remaining seven are Hebrew ones I have not
converted yet. `build/unreverse.py` is the tool: the Drive connector extracts
Hebrew PDFs with each line reversed, and `python3 build/unreverse.py <file>`
puts them right.

Not in the Drive folder at all: פערי דיווח, הבעיה עם קרנות הקולנוע, ממזרים ללא כבוד.

**Three demo URLs.** The Cutting Room, Punch Analyzer and Jeanne Dielman are
embedded from URLs I guessed from the project names. Each page carries a visible
note saying so. Check them and correct `content.json`.

**Before you cancel Adobe.** Nine videos on `/exodus`, `/mvp`, `/one-world-city`
and `/old-works` are hosted on `www-ccv.adobe.io` — Adobe's servers, which will
very likely die with the subscription. Re-upload to YouTube or Vimeo and switch
those blocks to `"type": "youtube"`.

**Small things.** Real email and social URLs in `content.json` → `site`. An
`og-default.jpg` at 1200×630 in `static/assets/img/`. Two diary slugs are Adobe's
random ids (`16a4650c788ab5`, `169c575dd48513`) and are worth renaming.
