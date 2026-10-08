/* Three small behaviours: play an embed full screen, enlarge a picture,
   filter a grid by subject. Nothing else runs on this site. */

(function () {
  'use strict';

  /* ---- embeds: load only when asked ---- */
  function openEmbed(frameEl) {
    if (frameEl.dataset.loaded) return frameEl.querySelector('iframe');
    var stage = frameEl.querySelector('.gate__stage');
    var f = document.createElement('iframe');
    f.src = frameEl.dataset.embed;
    f.title = frameEl.dataset.title || 'Embedded experience';
    f.setAttribute('allow', 'accelerometer; autoplay; camera; clipboard-write; encrypted-media; fullscreen; gyroscope; magnetometer; microphone; picture-in-picture; xr-spatial-tracking');
    f.setAttribute('allowfullscreen', '');
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    stage.innerHTML = '';
    stage.appendChild(f);
    frameEl.dataset.loaded = '1';
    return f;
  }

  document.addEventListener('click', function (e) {
    var open = e.target.closest('.gate__open');
    if (!open) return;
    openEmbed(open.closest('.gate__frame'));
  });

  /* ---- embeds: full screen ---- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-fullscreen]');
    if (!btn) return;
    var frameEl = btn.closest('.gate__frame');
    if (frameEl && !frameEl.dataset.loaded) openEmbed(frameEl);
    var stage = btn.closest('.gate').querySelector('.gate__stage');
    if (!stage) return;
    if (document.fullscreenElement) { document.exitFullscreen(); return; }
    if (stage.requestFullscreen) {
      stage.requestFullscreen().catch(function () {
        var f = stage.querySelector('iframe');
        if (f) window.open(f.src, '_blank', 'noopener');
      });
    }
  });

  /* ---- pictures: click to enlarge ---- */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('figcaption');
    var lastFocus = null;

    function open(img) {
      lastFocus = document.activeElement;
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || '';
      var fig = img.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      lbCap.textContent = cap ? cap.textContent : (img.alt || '');
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lb.querySelector('[data-lb-close]').focus();
    }
    function close() {
      lb.hidden = true;
      lbImg.removeAttribute('src');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    document.addEventListener('click', function (e) {
      var img = e.target.closest('.gallery img, .shot img');
      if (img) { e.preventDefault(); open(img); return; }
      if (e.target.closest('[data-lb-close]') || e.target === lb) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) close();
    });
  }

  /* ---- widgets: let each frame report its own height ---- */
  var frames = document.querySelectorAll('iframe[data-autosize]');
  if (frames.length) {
    frames.forEach(function (f) { f.style.height = '320px'; });
    window.addEventListener('message', function (e) {
      if (!e.data || e.data.type !== 'widget-height') return;
      frames.forEach(function (f) {
        if (f.contentWindow === e.source) f.style.height = Math.ceil(e.data.height) + 'px';
      });
    });
  }

  /* ---- contact: compose in the visitor's own mail app ---- */
  var mf = document.querySelector('form[data-mailto]');
  if (mf) {
    mf.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(mf);
      var body = f.get('message') + '\n\n\u2014 ' + f.get('name');
      window.location.href = 'mailto:' + mf.dataset.mailto +
        '?subject=' + encodeURIComponent(f.get('subject')) +
        '&body=' + encodeURIComponent(body);
    });
  }

  /* ---- grids: filter by subject ---- */
  document.querySelectorAll('[data-filters]').forEach(function (bar) {
    var grid = bar.parentElement.querySelector('[data-grid]');
    if (!grid) return;
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-tag]');
      if (!btn) return;
      var tag = btn.dataset.tag;
      bar.querySelectorAll('button').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b === btn));
      });
      grid.querySelectorAll('.tile').forEach(function (tile) {
        var tags = (tile.dataset.tags || '').split('|');
        tile.hidden = tag !== '' && tags.indexOf(tag) === -1;
      });
    });
  });
})();
