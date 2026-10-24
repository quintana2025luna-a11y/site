/* JORGE — LIVING ARCHIVE · Laboratorio (solo se carga en lab.html).
   Cuatro módulos independientes; cada uno se desactiva solo si el navegador no lo soporta:
   1. visor 3D (canvas 2D, sin librerías)  2. sintetizador (Web Audio)  3. campo generativo (canvas 2D)  4. panel de proceso (hotspots)
   Los textos fijos están en el HTML (data-i18n); aquí solo se cambian las claves de los textos dinámicos. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = function () { return doc.dataset.motion === 'reduced'; };
  var DICT = window.JORGE_I18N || {};
  // Cambia el texto de un elemento a otra clave de traducción (y la recuerda para el selector de idioma)
  function setKey(el, key) {
    el.dataset.i18n = key;
    var d = DICT[doc.dataset.lang] || {}, b = DICT.es || {};
    el.textContent = d[key] !== undefined ? d[key] : (b[key] !== undefined ? b[key] : el.textContent);
  }
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  // Ejecuta fn mientras el elemento esté visible en pantalla y la pestaña activa (evita bucles de dibujo innecesarios)
  function whileVisible(el, onChange) {
    var vis = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; onChange(); }, { threshold: 0.01 }).observe(el);
    document.addEventListener('visibilitychange', onChange);
    return function () { return vis && !document.hidden; };
  }
  // Ajusta el tamaño interno del canvas al tamaño en pantalla (nítido en pantallas retina)
  function fit(canvas, ratio) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2), w = Math.max(200, canvas.clientWidth || 300);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * ratio * dpr); return dpr;
  }
  function ctx2d(canvas) { try { return canvas.getContext && canvas.getContext('2d'); } catch (e) { return null; } }
  function noCanvas(box) { var c = $('canvas', box), f = $('[data-fallback]', box); if (c) c.hidden = true; if (f) f.hidden = false; }

  /* ================= 1. VISOR 3D ================= */
  var viewerBox = $('[data-viewer]'), ctlBox = $('[data-viewer-ctls]');
  if (viewerBox) (function () {
    var canvas = $('canvas', viewerBox), g = ctx2d(canvas);
    if (!g) { noCanvas(viewerBox); if (ctlBox) ctlBox.hidden = true; return; }
    var ratio = 0.62;

    /* --- formas: cada una devuelve { v: [[x,y,z]…], f: [[índices de vértices]…] } --- */
    var norm = function (a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
    var sub = function (a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; };
    var cross = function (a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; };
    var dot = function (a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; };
    function icosahedron() {
      var p = (1 + Math.sqrt(5)) / 2, v = [[-1, p, 0], [1, p, 0], [-1, -p, 0], [1, -p, 0], [0, -1, p], [0, 1, p], [0, -1, -p], [0, 1, -p], [p, 0, -1], [p, 0, 1], [-p, 0, -1], [-p, 0, 1]].map(norm);
      var f = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
      return { v: v.map(function (a) { return a.map(function (c) { return c * 1.5; }); }), f: f };
    }
    function dodecahedron() {          // dual del icosaedro: vértices = centros de las caras; caras = alrededor de cada vértice
      var ico = icosahedron(), c = ico.f.map(function (t) { var s = [0, 0, 0]; t.forEach(function (i) { s[0] += ico.v[i][0]; s[1] += ico.v[i][1]; s[2] += ico.v[i][2]; }); return norm(s).map(function (k) { return k * 1.5; }); });
      var faces = ico.v.map(function (v, vi) {
        var idx = []; ico.f.forEach(function (t, ti) { if (t.indexOf(vi) > -1) idx.push(ti); });
        var n = norm(v), a = norm(sub(c[idx[0]], [n[0] * dot(c[idx[0]], n), n[1] * dot(c[idx[0]], n), n[2] * dot(c[idx[0]], n)])), b = cross(n, a);
        return idx.sort(function (i, j) { return ang(c[i]) - ang(c[j]); });
        function ang(p) { return Math.atan2(dot(p, b), dot(p, a)); }
      });
      return { v: c, f: faces };
    }
    function torusKnot() {             // nudo (2,3): un tubo siguiendo la curva
      var N = 120, R = 8, P = 2, Q = 3, rad = 0.34, curve = function (t) { var r = 1.1 + 0.45 * Math.cos(Q * t); return [r * Math.cos(P * t), r * Math.sin(P * t), 0.55 * Math.sin(Q * t)]; };
      var v = [], f = [], e = 0.002;
      for (var i = 0; i < N; i++) {
        var t = i / N * Math.PI * 2, p = curve(t), a = curve(t + e), b = curve(t - e), T = norm(sub(a, b));
        var acc = [a[0] + b[0] - 2 * p[0], a[1] + b[1] - 2 * p[1], a[2] + b[2] - 2 * p[2]], Nn = norm(sub(acc, [T[0] * dot(acc, T), T[1] * dot(acc, T), T[2] * dot(acc, T)])), B = cross(T, Nn);
        for (var j = 0; j < R; j++) { var q = j / R * Math.PI * 2, c = Math.cos(q) * rad, s = Math.sin(q) * rad; v.push([p[0] + Nn[0] * c + B[0] * s, p[1] + Nn[1] * c + B[1] * s, p[2] + Nn[2] * c + B[2] * s]); }
      }
      for (i = 0; i < N; i++) for (j = 0; j < R; j++) { var i2 = (i + 1) % N, j2 = (j + 1) % R; f.push([i * R + j, i2 * R + j, i2 * R + j2, i * R + j2]); }
      return { v: v, f: f };
    }
    var BUILD = { 'icosahedron': icosahedron, 'torus-knot': torusKnot, 'dodecahedron': dodecahedron };
    var cache = {};

    /* --- estado y dibujo --- */
    var st = { model: 'icosahedron', wire: false, spin: false, yaw: 0.6, pitch: 0.4, zoom: 1 }, dirty = true, raf = 0, dpr = 1;
    var DEF = { yaw: 0.6, pitch: 0.4, zoom: 1 };
    function mesh() { return cache[st.model] || (cache[st.model] = (function () { var m = BUILD[st.model](), seen = {}, edges = []; m.f.forEach(function (fc) { fc.forEach(function (a, k) { var b = fc[(k + 1) % fc.length], key = a < b ? a + '_' + b : b + '_' + a; if (!seen[key]) { seen[key] = 1; edges.push([a, b]); } }); }); m.e = edges; return m; })()); }
    function draw() {
      raf = 0; if (!dirty) return; dirty = false;
      var W = canvas.width, H = canvas.height, m = mesh(), cy = Math.cos(st.yaw), sy = Math.sin(st.yaw), cp = Math.cos(st.pitch), sp = Math.sin(st.pitch);
      var camD = 5 / st.zoom, scale = Math.min(W, H) * 0.42 * (camD > 0 ? 4 / camD : 1) / 1.0;
      var P = m.v.map(function (p) {   // rotar (yaw alrededor de Y, pitch alrededor de X) y proyectar
        var x = p[0] * cy + p[2] * sy, z = -p[0] * sy + p[2] * cy, y = p[1] * cp - z * sp; z = p[1] * sp + z * cp;
        var k = 1 / (1 + (z + 0.0) / (camD + 4)); return { x: W / 2 + x * scale * k * 0.5, y: H / 2 - y * scale * k * 0.5, z: z, r: [x, y, z] };
      });
      g.clearRect(0, 0, W, H);
      g.lineJoin = 'round';
      if (st.wire) {
        g.lineWidth = Math.max(1, dpr * 1.1);
        m.e.forEach(function (e) { var a = P[e[0]], b = P[e[1]], d = (a.z + b.z) / 2; g.strokeStyle = 'rgba(121,191,101,' + clamp(0.55 - d * 0.18, 0.12, 0.95).toFixed(2) + ')'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); });
      } else {
        var L = norm([-0.5, 0.7, 0.8]), faces = [];
        m.f.forEach(function (fc) {
          var a = P[fc[0]].r, b = P[fc[1]].r, c = P[fc[2]].r, n = norm(cross(sub(b, a), sub(c, a)));
          if (n[2] < 0) return;       // cara de atrás: no se dibuja
          var d = 0; fc.forEach(function (i) { d += P[i].z; }); faces.push({ fc: fc, z: d / fc.length, l: clamp(dot(n, L), 0, 1) });
        });
        faces.sort(function (a, b) { return b.z - a.z; });
        g.lineWidth = Math.max(1, dpr * 0.8);
        faces.forEach(function (o) {
          g.beginPath(); o.fc.forEach(function (i, k) { if (k) g.lineTo(P[i].x, P[i].y); else g.moveTo(P[i].x, P[i].y); }); g.closePath();
          var l = 0.25 + o.l * 0.75; g.fillStyle = 'rgb(' + Math.round(89 * (1 - l) + 121 * l * 0.9) + ',' + Math.round(29 * (1 - l) + 191 * l * 0.9) + ',' + Math.round(40 * (1 - l) + 101 * l * 0.9) + ')';
          g.fill(); g.strokeStyle = 'rgba(241,237,226,.28)'; g.stroke();
        });
      }
    }
    function request() { dirty = true; if (!raf && isVis()) raf = requestAnimationFrame(draw); }
    var isVis = whileVisible(canvas, request);
    var last = 0;
    function spin(ts) { if (!st.spin) return; if (isVis() && last) { st.yaw += (ts - last) * 0.0006; dirty = true; if (!raf) raf = requestAnimationFrame(draw); } last = ts; requestAnimationFrame(spin); }
    function resize() { dpr = fit(canvas, ratio); request(); }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    resize();

    /* --- interacción: arrastrar (rotar), rueda y pellizco (zoom), teclado --- */
    var ptrs = {}, pinch = 0;
    var setZoom = function (z) { st.zoom = clamp(z, 0.5, 3.5); request(); };
    canvas.style.touchAction = 'none';
    canvas.addEventListener('pointerdown', function (e) { canvas.setPointerCapture(e.pointerId); ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; pinch = 0; canvas.classList.add('is-drag'); });
    canvas.addEventListener('pointermove', function (e) {
      var p = ptrs[e.pointerId]; if (!p) return; var ids = Object.keys(ptrs);
      if (ids.length === 2) {         // pellizco
        ptrs[e.pointerId] = { x: e.clientX, y: e.clientY }; var a = ptrs[ids[0]], b = ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) setZoom(st.zoom * d / pinch); pinch = d; return;
      }
      st.yaw += (e.clientX - p.x) * 0.009; st.pitch = clamp(st.pitch + (e.clientY - p.y) * 0.009, -1.45, 1.45); p.x = e.clientX; p.y = e.clientY; request();
    });
    var up = function (e) { delete ptrs[e.pointerId]; pinch = 0; if (!Object.keys(ptrs).length) canvas.classList.remove('is-drag'); };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('wheel', function (e) { e.preventDefault(); setZoom(st.zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); }, { passive: false });
    canvas.addEventListener('keydown', function (e) {
      var k = e.key, h = true;
      if (k === 'ArrowLeft') st.yaw -= 0.15; else if (k === 'ArrowRight') st.yaw += 0.15; else if (k === 'ArrowUp') st.pitch = clamp(st.pitch - 0.15, -1.45, 1.45); else if (k === 'ArrowDown') st.pitch = clamp(st.pitch + 0.15, -1.45, 1.45);
      else if (k === '+' || k === '=') setZoom(st.zoom * 1.15); else if (k === '-') setZoom(st.zoom / 1.15); else if (k === '0') { st.yaw = DEF.yaw; st.pitch = DEF.pitch; setZoom(1); } else h = false;
      if (h) { e.preventDefault(); request(); }
    });

    /* --- botones --- */
    var wireBtn = $('[data-wire]', ctlBox), spinBtn = $('[data-spin]', ctlBox);
    $$('[data-model]', ctlBox).forEach(function (b) { b.addEventListener('click', function () { st.model = b.dataset.model; $$('[data-model]', ctlBox).forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); }); request(); }); });
    wireBtn.addEventListener('click', function () { st.wire = !st.wire; wireBtn.setAttribute('aria-pressed', String(st.wire)); request(); });
    spinBtn.addEventListener('click', function () { st.spin = !st.spin; spinBtn.setAttribute('aria-pressed', String(st.spin)); if (st.spin) { last = 0; requestAnimationFrame(spin); } });
    $$('[data-zoom]', ctlBox).forEach(function (b) { b.addEventListener('click', function () { setZoom(st.zoom * (b.dataset.zoom === 'in' ? 1.2 : 1 / 1.2)); }); });
    $('[data-reset]', ctlBox).addEventListener('click', function () { st.yaw = DEF.yaw; st.pitch = DEF.pitch; setZoom(1); });
  })();

  /* ================= 2. SINTETIZADOR ================= */
  var synthBox = $('[data-synth]');
  if (synthBox) (function () {
    var AC = window.AudioContext || window.webkitAudioContext;
    var startBtn = $('[data-start]', synthBox), status = $('[data-status]', synthBox), led = $('.lab-led', synthBox);
    var ins = {}; $$('[data-param]', synthBox).forEach(function (i) { ins[i.dataset.param] = i; });
    var out = function (k) { return $('[data-out="' + k + '"]', synthBox); };
    var params = function () { return { freq: +ins.freq.value, rate: +ins.rate.value, depth: +ins.depth.value, volume: +ins.volume.value, wave: ins.wave.value }; };
    Object.keys(ins).forEach(function (k) { var o = out(k); if (o) o.textContent = ins[k].value; });
    if (!AC) { $('[data-fallback]', synthBox).hidden = false; startBtn.disabled = true; $$('[data-param],[data-reset]', synthBox).forEach(function (i) { i.disabled = true; }); return; }
    var ac = null, osc, lfo, lfoGain, master, playing = false, stopTimer = 0;
    function apply() {            // pasa los valores de los controles al sonido (si está sonando)
      var p = params(); Object.keys(ins).forEach(function (k) { var o = out(k); if (o) o.textContent = ins[k].value; });
      if (!playing) return; var t = ac.currentTime;
      osc.type = p.wave; osc.frequency.setTargetAtTime(p.freq, t, 0.03);
      lfo.frequency.setTargetAtTime(Math.max(p.rate, 0.01), t, 0.05);
      lfoGain.gain.setTargetAtTime(p.freq * p.depth / 100, t, 0.05);   // profundidad = % de la frecuencia (vibrato)
      master.gain.setTargetAtTime(p.volume, t, 0.05);
    }
    function paint(on) { setKey(status, on ? 'lab.synth.on' : 'lab.synth.off'); setKey(startBtn, on ? 'lab.synth.stop' : 'lab.synth.start'); startBtn.setAttribute('aria-pressed', String(on)); led.classList.toggle('on', on); }
    function start() {
      clearTimeout(stopTimer);
      try {
        ac = new AC(); osc = ac.createOscillator(); lfo = ac.createOscillator(); lfoGain = ac.createGain(); master = ac.createGain();
        master.gain.value = 0; lfo.connect(lfoGain); lfoGain.connect(osc.frequency); osc.connect(master); master.connect(ac.destination);
        playing = true; osc.start(); lfo.start(); apply();
        if (ac.state === 'suspended' && ac.resume) ac.resume();
        paint(true);
      } catch (e) { playing = false; $('[data-fallback]', synthBox).hidden = false; startBtn.disabled = true; paint(false); }
    }
    function stop() {
      if (!playing) return; playing = false; paint(false);
      var a = ac, o = osc, l = lfo, m = master; try { m.gain.setTargetAtTime(0, a.currentTime, 0.04); } catch (e) { /* ya cerrado */ }
      stopTimer = setTimeout(function () { try { o.stop(); l.stop(); a.close(); } catch (e) { /* ya cerrado */ } }, 250);
    }
    startBtn.addEventListener('click', function () { if (playing) stop(); else start(); });
    $$('[data-param]', synthBox).forEach(function (i) { i.addEventListener('input', apply); i.addEventListener('change', apply); });
    $('[data-reset]', synthBox).addEventListener('click', function () { Object.keys(ins).forEach(function (k) { ins[k].value = ins[k].defaultValue !== undefined && ins[k].tagName === 'INPUT' ? ins[k].defaultValue : (Array.prototype.filter.call(ins[k].options || [], function (o) { return o.defaultSelected; })[0] || {}).value || ins[k].value; }); apply(); });
    // el audio nunca sigue sonando si se oculta la pestaña o se sale de la página
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); });
    window.addEventListener('pagehide', stop);
  })();

  /* ================= 3. CAMPO GENERATIVO ================= */
  var shBox = $('[data-shader]');
  if (shBox) (function () {
    var canvas = $('canvas', shBox), g = ctx2d(canvas), root = shBox.parentNode;
    if (!g) { noCanvas(shBox); return; }
    var ins = {}; $$('[data-param]', root).forEach(function (i) { ins[i.dataset.param] = i; });
    var playBtn = $('[data-play]', root), note = $('[data-paused]', root), dpr = 1;
    var PAL = { green: [[7, 16, 10], [121, 191, 101], [241, 237, 226]], crimson: [[16, 6, 8], [89, 29, 40], [241, 237, 226]], paper: [[233, 227, 213], [121, 191, 101], [89, 29, 40]] };
    var playing = !reduced(), t = 0, raf = 0, last = 0;
    var mix = function (a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; };
    function draw() {
      var W = canvas.width, H = canvas.height, f = +ins.freq.value, ch = +ins.chaos.value, pal = PAL[ins.palette.value] || PAL.green;
      var cell = Math.max(6, Math.round(10 * dpr)), cols = Math.ceil(W / cell), rows = Math.ceil(H / cell);
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var x = i / cols * Math.PI * f / 2, y = j / rows * Math.PI * f / 2;
        var v = (Math.sin(x + t) + Math.cos(y * 0.8 - t * 0.7)) / 2 + ch * Math.sin(x * y * 0.35 + t * 2.3) * 0.6;
        v = clamp((v + 1) / 2, 0, 1); var c = v < 0.5 ? mix(pal[0], pal[1], v * 2) : mix(pal[1], pal[2], (v - 0.5) * 2);
        g.fillStyle = 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; g.fillRect(i * cell, j * cell, cell - 1, cell - 1);
      }
    }
    function frame(ts) {
      raf = 0; if (!playing) return;
      if (isVis()) { if (last) t += (ts - last) / 1000 * (+ins.speed.value); draw(); last = ts; } else last = 0;
      raf = requestAnimationFrame(frame);
    }
    function sync() {
      Object.keys(ins).forEach(function (k) { var o = $('[data-out="' + k + '"]', root); if (o) o.textContent = ins[k].value; });
      if (!playing) draw();           // en pausa también se refleja cada cambio
    }
    function setPlaying(on) {
      playing = on; last = 0; playBtn.setAttribute('aria-pressed', String(on)); setKey(playBtn, on ? 'lab.shader.pause' : 'lab.shader.play');
      note.hidden = on || !reduced(); if (on && !raf) raf = requestAnimationFrame(frame); else if (!on) draw();
    }
    var isVis = whileVisible(canvas, function () { if (playing && !raf) raf = requestAnimationFrame(frame); });
    function resize() { dpr = fit(canvas, 0.625); draw(); }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas); else window.addEventListener('resize', resize);
    $$('[data-param]', root).forEach(function (i) { i.addEventListener('input', sync); i.addEventListener('change', sync); });
    playBtn.addEventListener('click', function () { setPlaying(!playing); });
    $('[data-reset]', root).addEventListener('click', function () {
      Object.keys(ins).forEach(function (k) { var i = ins[k]; if (i.tagName === 'SELECT') i.value = ($$('option', i).filter(function (o) { return o.defaultSelected; })[0] || i.options[0]).value; else i.value = i.defaultValue; });
      t = 0; sync(); draw();
    });
    resize(); sync(); setPlaying(playing); if (!playing) note.hidden = !reduced();
  })();

  /* ================= 4. PANEL DE PROCESO (hotspots) ================= */
  var hot = $('[data-hot]');
  if (hot) {
    var pts = $$('[data-pt]', hot), cards = $$('[data-card]', hot), idle = $('[data-idle]', hot);
    var select = function (id) {
      pts.forEach(function (p) { p.setAttribute('aria-pressed', String(p.dataset.pt === id)); });
      cards.forEach(function (c) { c.hidden = c.dataset.card !== id; }); idle.hidden = !!id;
    };
    pts.forEach(function (p) { p.addEventListener('click', function () { select(p.getAttribute('aria-pressed') === 'true' ? null : p.dataset.pt); }); });
  }
})();
