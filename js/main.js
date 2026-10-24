/* JORGE — LIVING ARCHIVE · comportamiento (JavaScript).
   Todo degrada con elegancia sin JS: el sitio se lee en español y los enlaces funcionan.
   Secciones de este archivo (busca los títulos numerados «---- n. ----»):
   1. utilidades   2. idioma ES/EN   3. menú móvil   4. movimiento   5. aparición al hacer scroll
   6. paralaje de la portada   7. transición de color entre páginas   8. filtros y búsqueda
   9. comparador boceto/final   10. visor de imágenes (zoom/pan)   11. ventanas plegables   12. mapa del ecosistema (filtros, arrastre)
   13. retícula con coordenadas   14. videos de YouTube (se cargan al pulsar play)   15. video de fondo de la portada */
(function () {
  'use strict';

  /* ---- 1. utilidades ---- */
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = function () { return doc.dataset.motion === 'reduced'; };
  // Efectos opcionales: se activan/desactivan en config.json → effects
  var fx = function (name) { return (document.body.dataset.fx || '').split(' ').indexOf(name) > -1; };

  var y = $('[data-year]'); if (y) y.textContent = new Date().getFullYear();

  /* ---- 2. idioma ES/EN ----
     Las páginas se escriben en español. Cada texto traducible lleva data-i18n="clave" (texto)
     o data-i18n-attr="atributo:clave;otro:clave" (alt, aria-label, title…).
     js/dictionary.js (generado por build.mjs) contiene los textos de cada idioma. */
  var DICT = window.JORGE_I18N || {};
  var DEFAULT_LANG = 'es';
  var tr = function (key, lang) { var d = DICT[lang || doc.dataset.lang || DEFAULT_LANG]; return d && d[key]; };

  function applyLanguage(lang) {
    var dict = DICT[lang] || {}, base = DICT[DEFAULT_LANG] || {};
    $$('[data-i18n]').forEach(function (el) {
      var k = el.dataset.i18n, v = dict[k];
      if (v === undefined) { v = base[k]; if (lang !== DEFAULT_LANG) el.classList.add('is-untranslated'); }
      else el.classList.remove('is-untranslated');
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(';').forEach(function (pair) {
        var i = pair.indexOf(':'), attr = pair.slice(0, i), k = pair.slice(i + 1);
        var v = dict[k]; if (v === undefined) v = base[k];
        if (v !== undefined) el.setAttribute(attr, v);
      });
    });
    doc.lang = lang; doc.dataset.lang = lang;
    $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === lang)); });
    doc.classList.remove('i18n-pending');
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  // Si el navegador bloquea localStorage, el idioma viaja en la URL (?lang=en) añadida a los enlaces internos.
  var storageOk = (function () { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch (e) { return false; } })();
  function carryLanguageInLinks(lang) {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!h || /^(https?:|mailto:|tel:|#|javascript:)/.test(h)) return;
      var hash = ''; var i = h.indexOf('#'); if (i > -1) { hash = h.slice(i); h = h.slice(0, i); }
      h = h.replace(/([?&])lang=[a-z]{2}&?/, '$1').replace(/[?&]$/, '');
      a.setAttribute('href', h + (h.indexOf('?') > -1 ? '&' : '?') + 'lang=' + lang + hash);
    });
  }
  function setLanguage(lang) {
    try { localStorage.setItem('lang', lang); } catch (e) { /* sin almacenamiento */ }
    try { if (/[?&]lang=/.test(location.search)) history.replaceState(null, '', location.pathname + location.search.replace(/([?&])lang=[a-z]{2}/, '$1lang=' + lang) + location.hash); } catch (e) { /* file:// */ }
    applyLanguage(lang);
    if (!storageOk) carryLanguageInLinks(lang);
  }
  $$('.lang-btn').forEach(function (b) { b.addEventListener('click', function () { setLanguage(b.dataset.lang); }); });
  var startLang = doc.dataset.lang || DEFAULT_LANG;
  if (startLang !== DEFAULT_LANG) applyLanguage(startLang); else $$('.lang-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === startLang)); });
  if (!storageOk && startLang !== DEFAULT_LANG) carryLanguageInLinks(startLang);

  /* ---- 3. menú móvil ---- */
  var toggle = $('.nav-toggle'), nav = $('#site-nav');
  if (toggle && nav) {
    var setNav = function (open) { toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('open', open); };
    toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setNav(false); toggle.focus(); } });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  }

  /* la cabecera se vuelve sólida al bajar (portada) */
  var header = $('[data-header]');
  if (header) { var onS = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); }; onS(); window.addEventListener('scroll', onS, { passive: true }); }

  /* ---- 4. movimiento reducido (se guarda; si el almacenamiento falla, no pasa nada) ---- */
  var mt = $('[data-motion-toggle]');
  function paintMotion() {
    if (!mt) return;
    var key = reduced() ? 'ui.motionReduced' : 'ui.motionOn', label = $('[data-i18n]', mt) || mt;
    label.dataset.i18n = key; label.textContent = tr(key) || label.textContent;
    mt.setAttribute('aria-pressed', String(reduced()));
  }
  if (mt) {
    paintMotion();
    document.addEventListener('langchange', paintMotion);
    mt.addEventListener('click', function () {
      var r = !reduced(); if (r) doc.dataset.motion = 'reduced'; else delete doc.dataset.motion;
      try { localStorage.setItem('motion', r ? 'reduced' : 'on'); } catch (e) { /* ignorar */ }
      paintMotion(); resetParallax(); heroVideoSync();
    });
  }

  /* ---- 5. aparición al hacer scroll ---- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else revealEls.forEach(function (el) { el.classList.add('in'); });

  /* ---- 6. portada: las capas ([data-depth]) se desplazan con el puntero y con el scroll ---- */
  var hero = $('[data-hero]'), layers = hero ? $$('[data-depth]', hero) : [];
  var px = 0, py = 0, tx = 0, ty = 0, sy = 0, raf = null;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  function apply() {
    raf = null;
    px += (tx - px) * 0.08; py += (ty - py) * 0.08;
    layers.forEach(function (l) {
      var d = parseFloat(l.dataset.depth);
      l.style.setProperty('--tx', (px * d * -26).toFixed(1) + 'px');
      l.style.setProperty('--ty', (py * d * -16 + sy * d * 0.12).toFixed(1) + 'px');
    });
    if (Math.abs(tx - px) > 0.002 || Math.abs(ty - py) > 0.002) raf = requestAnimationFrame(apply);
  }
  function queue() { if (!raf && !reduced() && fx('heroParallax')) raf = requestAnimationFrame(apply); }
  function resetParallax() { layers.forEach(function (l) { l.style.removeProperty('--tx'); l.style.removeProperty('--ty'); }); }
  if (hero && layers.length) {
    window.addEventListener('scroll', function () { if (window.scrollY < window.innerHeight * 1.2) { sy = window.scrollY; queue(); } }, { passive: true });
    if (fine) {
      hero.addEventListener('pointermove', function (e) {
        if (reduced()) return; var r = hero.getBoundingClientRect();
        tx = (e.clientX - r.left) / r.width - 0.5; ty = (e.clientY - r.top) / r.height - 0.5;
        if (fx('pointerGlow')) { hero.style.setProperty('--mx', (tx + 0.5) * 100 + '%'); hero.style.setProperty('--my', (ty + 0.5) * 100 + '%'); hero.classList.add('is-pointer'); }
        queue();
      });
      hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; hero.classList.remove('is-pointer'); queue(); });
    }
  }

  /* las salas de exposición: el origen del «revelado» sigue al puntero */
  $$('.room').forEach(function (room) {
    var art = room.querySelector('.room-art'); if (!art) return;
    room.addEventListener('pointermove', function (e) { var r = art.getBoundingClientRect(); art.style.setProperty('--x', (e.clientX - r.left) + 'px'); art.style.setProperty('--y', (e.clientY - r.top) + 'px'); });
  });

  /* ---- 7. transición de color entre páginas (el enlace funciona igual sin JS) ---- */
  function leaving(a, x, yy) {
    var w = document.createElement('div'); w.className = 'wipe'; w.setAttribute('aria-hidden', 'true');
    w.style.setProperty('--wipe', a.dataset.wipe || '#591D28'); w.style.setProperty('--x', x + 'px'); w.style.setProperty('--y', yy + 'px');
    document.body.appendChild(w);
    var go = function () { window.location.href = a.href; };
    if (!w.animate) return go();
    var anim = w.animate([{ clipPath: 'circle(0% at ' + x + 'px ' + yy + 'px)' }, { clipPath: 'circle(150% at ' + x + 'px ' + yy + 'px)' }], { duration: 480, easing: 'cubic-bezier(.6,0,.2,1)', fill: 'forwards' });
    anim.onfinish = go; setTimeout(go, 900);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-wipe]');
    if (!a || !fx('pageTransition') || reduced() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    e.preventDefault(); leaving(a, e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
  });
  window.addEventListener('pageshow', function (e) { if (e.persisted) $$('.wipe').forEach(function (w) { w.remove(); }); });

  /* ---- 8. filtros y búsqueda (índice, exploraciones, tienda) ---- */
  $$('[data-filter-scope]').forEach(function (scope) {
    var items = $$('[data-item]', scope), chips = $$('[data-filter]', scope), search = $('[data-search]', scope), empty = $('[data-empty]', scope);
    var type = '*';
    function run() {
      var q = search ? search.value.trim().toLowerCase() : '', n = 0;
      items.forEach(function (it) {
        var ok = (type === '*' || it.dataset.type === type) && (!q || (it.dataset.text || it.textContent.toLowerCase()).indexOf(q) > -1);
        it.hidden = !ok; if (ok) n++;
      });
      if (empty) empty.hidden = n > 0;
    }
    chips.forEach(function (c) { c.addEventListener('click', function () { type = c.dataset.filter; chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); }); run(); }); });
    if (search) search.addEventListener('input', run);
  });

  /* ---- 9. comparador boceto / final ---- */
  $$('[data-compare]').forEach(function (c) { var r = $('input', c); r.addEventListener('input', function () { c.style.setProperty('--pos', r.value + '%'); }); });

  /* ---- 10. visor de imágenes (<dialog> nativo) con zoom, desplazamiento y pellizco ----
     Esc cierra y el foco vuelve al botón. Rueda / pellizco / botones / teclas +, −, 0 hacen zoom;
     arrastrar mueve la imagen ampliada; con zoom 1 las flechas ← → cambian de imagen. */
  var lb = $('#lightbox');
  if (lb && lb.showModal) {
    var triggers = $$('[data-lightbox]'), idx = 0, lbImg = $('img', lb), lbCap = $('figcaption', lb), stage = $('.lb-stage', lb), last = null;
    var Z = { s: 1, x: 0, y: 0 }, MAXZ = 6, ptr = {}, pinchD = 0, moved = false;
    var apply2 = function () { lbImg.style.transform = 'translate(' + Z.x + 'px,' + Z.y + 'px) scale(' + Z.s + ')'; stage.classList.toggle('is-zoomed', Z.s > 1.001); };
    // Mantiene la imagen dentro del visor: si es más pequeña que el área, queda centrada
    var limit = function () {
      var w = lbImg.offsetWidth * Z.s, h = lbImg.offsetHeight * Z.s, mx = Math.max(0, (w - stage.clientWidth) / 2), my = Math.max(0, (h - stage.clientHeight) / 2);
      Z.x = Math.max(-mx, Math.min(mx, Z.x)); Z.y = Math.max(-my, Math.min(my, Z.y));
    };
    // Zoom hacia un punto (cx, cy en píxeles del visor, relativo a su centro) para que ese punto no se mueva
    var zoomTo = function (ns, cx, cy) {
      ns = Math.max(1, Math.min(MAXZ, ns)); var k = ns / Z.s; cx = cx || 0; cy = cy || 0;
      Z.x = cx - (cx - Z.x) * k; Z.y = cy - (cy - Z.y) * k; Z.s = ns; if (ns === 1) { Z.x = 0; Z.y = 0; } limit(); apply2();
    };
    var resetZ = function () { Z.s = 1; Z.x = 0; Z.y = 0; apply2(); };
    var show = function (i) { idx = (i + triggers.length) % triggers.length; var t = triggers[idx]; resetZ(); lbImg.src = t.dataset.full; lbImg.alt = t.dataset.caption || ''; lbCap.textContent = t.dataset.caption || ''; };
    var rel = function (e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };
    triggers.forEach(function (t, i) { t.addEventListener('click', function () { last = t; show(i); lb.showModal(); doc.classList.add('lb-open'); stage.focus(); }); });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); }); $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb-zoom-in', lb).addEventListener('click', function () { zoomTo(Z.s * 1.4); });
    $('.lb-zoom-out', lb).addEventListener('click', function () { zoomTo(Z.s / 1.4); });
    $('.lb-reset', lb).addEventListener('click', resetZ);
    lb.addEventListener('keydown', function (e) {
      var k = e.key, step = 60;
      if (k === '+' || k === '=') { zoomTo(Z.s * 1.25); e.preventDefault(); }
      else if (k === '-' || k === '_') { zoomTo(Z.s / 1.25); e.preventDefault(); }
      else if (k === '0') { resetZ(); e.preventDefault(); }
      else if (k.indexOf('Arrow') === 0 && document.activeElement === stage) {
        if (Z.s > 1.001) { if (k === 'ArrowLeft') Z.x += step; if (k === 'ArrowRight') Z.x -= step; if (k === 'ArrowUp') Z.y += step; if (k === 'ArrowDown') Z.y -= step; limit(); apply2(); e.preventDefault(); }
        else if (k === 'ArrowLeft') show(idx - 1); else if (k === 'ArrowRight') show(idx + 1);
      }
    });
    // rueda: zoom hacia el cursor (sin desplazar la página)
    stage.addEventListener('wheel', function (e) { e.preventDefault(); var c = rel(e); zoomTo(Z.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15), c[0], c[1]); }, { passive: false });
    // puntero: un dedo/ratón arrastra; dos dedos hacen pellizco
    stage.addEventListener('pointerdown', function (e) { stage.setPointerCapture(e.pointerId); ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; pinchD = 0; moved = false; });
    stage.addEventListener('pointermove', function (e) {
      var p = ptr[e.pointerId]; if (!p) return; var ids = Object.keys(ptr);
      if (ids.length >= 2) {
        ptr[e.pointerId] = { x: e.clientX, y: e.clientY }; var a = ptr[ids[0]], b = ptr[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = stage.getBoundingClientRect();
        if (pinchD) zoomTo(Z.s * d / pinchD, (a.x + b.x) / 2 - r.left - r.width / 2, (a.y + b.y) / 2 - r.top - r.height / 2); pinchD = d; moved = true; return;
      }
      if (Z.s > 1.001) { Z.x += e.clientX - p.x; Z.y += e.clientY - p.y; limit(); apply2(); moved = true; }
      p.x = e.clientX; p.y = e.clientY;
    });
    var endP = function (e) { delete ptr[e.pointerId]; pinchD = 0; };
    stage.addEventListener('pointerup', endP); stage.addEventListener('pointercancel', endP);
    stage.addEventListener('dblclick', function (e) { var c = rel(e); if (Z.s > 1.001) resetZ(); else zoomTo(2.5, c[0], c[1]); });
    // clic en el fondo oscuro (fuera de la imagen) cierra
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', function () { doc.classList.remove('lb-open'); resetZ(); if (last) last.focus(); });
    window.addEventListener('resize', function () { if (lb.open) { limit(); apply2(); } });
  }

  /* ---- 11. ventanas plegables (índice y ficha del sistema en las páginas de proyecto) ---- */
  $$('[data-win-toggle]').forEach(function (btn) {
    var body = document.getElementById(btn.getAttribute('aria-controls')); if (!body) return;
    var set = function (open) { btn.setAttribute('aria-expanded', String(open)); body.hidden = !open; btn.closest('.win').classList.toggle('is-collapsed', !open); };
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    if (window.matchMedia && matchMedia('(max-width: 900px)').matches) set(false);   // en móvil empiezan plegadas
  });

  /* ---- 12. mapa del ecosistema: lectura al apuntar/enfocar, filtros por territorio, arrastre de puntos ----
     Los puntos son enlaces normales (funcionan sin JS). Arrastrar mueve el punto (y sus líneas); un clic sin arrastre abre el enlace.
     En pantallas estrechas el mapa es una lista y el arrastre se desactiva. */
  $$('[data-eco]').forEach(function (map) {
    var nodes = $$('.eco-node', map), lines = $$('.eco-line', map), stageEl = $('.eco-stage', map), wrap = map.parentNode;
    var box = $('[data-readout]'); if (!box) return;
    var idle = $('[data-idle]', box), live = $('[data-live]', box), active = null;
    function show(node) {
      active = node;
      nodes.forEach(function (n) { n.classList.toggle('is-active', n === node); });
      lines.forEach(function (l) { l.classList.toggle('is-on', l.dataset.a === node.dataset.node || l.dataset.b === node.dataset.node); });
      live.innerHTML = '';
      var title = document.createElement('p'); title.className = 'eco-live-title'; title.innerHTML = $('.eco-name', node).innerHTML;
      live.appendChild(title); live.appendChild($('.eco-card', node).cloneNode(true));
      idle.hidden = true; live.hidden = false;
    }
    nodes.forEach(function (n) {
      n.addEventListener('pointerenter', function () { show(n); });
      n.addEventListener('focusin', function () { show(n); });
    });
    document.addEventListener('langchange', function () { if (active) show(active); });

    /* filtros por territorio + contador (el número sale de los puntos reales del mapa) */
    var chips = $$('[data-eco-filters] [data-group]', wrap), count = $('[data-count]', wrap), nEl = count && $('[data-n]', count);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        var g = c.dataset.group, n = 0;
        chips.forEach(function (o) { o.setAttribute('aria-pressed', String(o === c)); });
        nodes.forEach(function (node) { var ok = g === '*' || node.dataset.group === g; node.classList.toggle('is-dim', !ok); node.dataset.match = ok ? '1' : '0'; if (ok) n++; });
        lines.forEach(function (l) {
          var a = l.dataset.a === 'hub' || (nodes.filter(function (x) { return x.dataset.node === l.dataset.a; })[0] || {}).dataset.match !== '0';
          var b = (nodes.filter(function (x) { return x.dataset.node === l.dataset.b; })[0] || {}).dataset.match !== '0';
          l.classList.toggle('is-dim', !(a && b));
        });
        if (nEl) nEl.textContent = n;
      });
    });

    /* arrastre con puntero (ratón y táctil) */
    var wide = function () { return !window.matchMedia || !matchMedia('(max-width: 800px)').matches; };
    var pos = {}; nodes.forEach(function (n) { pos[n.dataset.node] = { x: +n.dataset.x, y: +n.dataset.y }; });
    function place(n, x, y) {
      var id = n.dataset.node; pos[id] = { x: x, y: y }; n.style.setProperty('--x', x + '%'); n.style.setProperty('--y', y + '%');
      n.classList.toggle('is-left', x > 66);
      lines.forEach(function (l) {
        if (l.dataset.a === id) { l.setAttribute('x1', x); l.setAttribute('y1', y); }
        if (l.dataset.b === id) { l.setAttribute('x2', x); l.setAttribute('y2', y); }
      });
    }
    var drag = null, suppress = false;
    nodes.forEach(function (n) {
      n.addEventListener('pointerdown', function (e) {
        if (!wide() || (e.pointerType === 'mouse' && e.button !== 0)) return;
        drag = { n: n, sx: e.clientX, sy: e.clientY, ox: pos[n.dataset.node].x, oy: pos[n.dataset.node].y, on: false, id: e.pointerId };
      });
    });
    document.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (!drag.on) { if (Math.hypot(dx, dy) < 6) return; drag.on = true; drag.n.classList.add('is-dragging'); try { drag.n.setPointerCapture(e.pointerId); } catch (er) { /* ignorar */ } show(drag.n); }
      var r = stageEl.getBoundingClientRect();
      place(drag.n, Math.max(2, Math.min(98, drag.ox + dx / r.width * 100)), Math.max(4, Math.min(96, drag.oy + dy / r.height * 100)));
    });
    var endDrag = function (e) { if (!drag || e.pointerId !== drag.id) return; if (drag.on) { drag.n.classList.remove('is-dragging'); suppress = true; setTimeout(function () { suppress = false; }, 0); } drag = null; };
    document.addEventListener('pointerup', endDrag); document.addEventListener('pointercancel', endDrag);
    map.addEventListener('click', function (e) { if (suppress && e.target.closest('.eco-node')) { e.preventDefault(); e.stopPropagation(); } }, true);
    // teclado: Alt + flechas mueve el punto enfocado (alternativa al arrastre)
    map.addEventListener('keydown', function (e) {
      var n = e.target.closest && e.target.closest('.eco-node'); if (!n || !e.altKey || e.key.indexOf('Arrow') !== 0) return;
      var p = pos[n.dataset.node], d = 2; e.preventDefault();
      place(n, Math.max(2, Math.min(98, p.x + (e.key === 'ArrowRight' ? d : e.key === 'ArrowLeft' ? -d : 0))), Math.max(4, Math.min(96, p.y + (e.key === 'ArrowDown' ? d : e.key === 'ArrowUp' ? -d : 0))));
    });
    map.addEventListener('dragstart', function (e) { e.preventDefault(); });
    var rs = $('[data-eco-reset]', wrap); if (rs) rs.addEventListener('click', function () { nodes.forEach(function (n) { place(n, +n.dataset.x, +n.dataset.y); }); });
  });

  /* ---- 13. retícula con coordenadas (solo con ratón; respeta «movimiento reducido»; el cursor normal no se oculta) ---- */
  var ret = $('#reticle');
  if (ret && fx('reticle') && fine) {
    var ring = $('.reticle-ring', ret), xy = $('.reticle-xy', ret), rx = 0, ry = 0, rraf = 0;
    var pad = function (n) { return ('0000' + Math.round(n)).slice(-4); };
    var paintRet = function () { rraf = 0; ret.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; xy.textContent = 'X ' + pad(rx) + '  Y ' + pad(ry); };
    document.addEventListener('pointermove', function (e) {
      if (reduced() || e.pointerType !== 'mouse') { ret.hidden = true; return; }
      rx = e.clientX; ry = e.clientY; ret.hidden = false; ret.classList.toggle('is-link', !!(e.target.closest && e.target.closest('a,button,input,select,summary,[data-lightbox],canvas')));
      if (!rraf) rraf = requestAnimationFrame(paintRet);
    });
    document.addEventListener('pointerleave', function () { ret.hidden = true; });
    document.documentElement.addEventListener('mouseleave', function () { ret.hidden = true; });
  }

  /* ---- 14. videos de YouTube: al pulsar play se sustituye la imagen por el reproductor (youtube-nocookie, sin autoplay antes del clic) ---- */
  $$('[data-yt]').forEach(function (fig) {
    var btn = $('.yt-play', fig), box = $('.yt-box', fig); if (!btn) return;
    btn.addEventListener('click', function () {
      // Abierto como archivo (file://) YouTube rechaza el reproductor incrustado (error 153): se abre en YouTube.
      // Con «node tools/serve.mjs» (localhost) o publicado en la web sí se incrusta.
      if (location.protocol === 'file:') { window.open('https://www.youtube.com/watch?v=' + fig.dataset.yt, '_blank', 'noopener'); return; }
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + fig.dataset.yt + '?autoplay=1&rel=0';
      f.title = btn.getAttribute('aria-label') || 'YouTube'; f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true; f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.innerHTML = ''; box.appendChild(f); f.focus();
    });
    document.addEventListener('langchange', function () { var i = $('iframe', fig); if (i) i.title = $('figcaption', fig).textContent; });
  });

  /* ---- 15. video de fondo de la portada: se detiene con «movimiento reducido», con ahorro de datos y fuera de pantalla ---- */
  var hv = $('[data-hero-video]');
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var hvVisible = true;
  function heroVideoSync() {
    if (!hv) return;
    if (reduced() || saveData || !hvVisible || document.hidden) { hv.pause(); if (reduced() || saveData) { try { hv.currentTime = 0; } catch (e) { /* aún sin metadatos */ } } }
    else { var p = hv.play(); if (p && p.catch) p.catch(function () { /* el navegador bloqueó el autoplay: queda el póster */ }); }
  }
  if (hv) {
    hv.muted = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { hvVisible = es[0].isIntersecting; heroVideoSync(); }, { threshold: 0.01 }).observe(hv);
    document.addEventListener('visibilitychange', heroVideoSync);
    heroVideoSync();
  }
})();