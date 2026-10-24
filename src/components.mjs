// COMPONENTES REUTILIZABLES: imágenes, ventanas, módulos de proyecto, salas, mapa, conexiones…
// Cada función devuelve un trozo de HTML (texto). Los textos salen de content/*.json mediante claves.
import { S, SP, P, X, N, ECO, out, u, esc, hrefOf } from './context.mjs';
import { tx, ta, has, len, text, val } from './i18n.mjs';

/* ---------- Imágenes de marcador (nunca se confunden con obra real) ---------- */
export const DIMS = { '16x9': [1600, 900], '3x2': [1200, 800], '4x5': [800, 1000], '1x1': [1000, 1000] };
const TONES = {
  green: { bg: '#0f2214', line: '#79BF65', text: '#e9e4d6' },
  gold: { bg: '#1a1508', line: '#d9a63f', text: '#e9e4d6' },
  red: { bg: '#2a1019', line: '#c9788a', text: '#e9e4d6' },
  graphite: { bg: '#161a18', line: '#9aa59c', text: '#e9e4d6' },
  paper: { bg: '#e2dccb', line: '#591D28', text: '#3a1a20' },
};
function placeholderSvg(tone, ratio) {
  const [W, H] = DIMS[ratio]; const c = TONES[tone]; const fs = Math.round(Math.min(W, H) * 0.045);
  const tick = (x, y, dx, dy) => `<path d="M${x} ${y + dy * 40}V${y}H${x + dx * 40}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><pattern id="h" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="30" stroke="${c.line}" stroke-opacity=".16" stroke-width="3"/></pattern></defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/><rect width="${W}" height="${H}" fill="url(#h)"/>
<g fill="none" stroke="${c.line}" stroke-opacity=".55" stroke-width="2"><path d="M0 0L${W} ${H}M${W} 0L0 ${H}" stroke-opacity=".18"/><rect x="28" y="28" width="${W - 56}" height="${H - 56}" stroke-dasharray="10 10" stroke-opacity=".35"/>${tick(28, 28, 1, 1)}${tick(W - 28, 28, -1, 1)}${tick(28, H - 28, 1, -1)}${tick(W - 28, H - 28, -1, -1)}</g>
<rect x="${W / 2 - fs * 7.2}" y="${H / 2 - fs * 1.35}" width="${fs * 14.4}" height="${fs * 2.7}" fill="${c.bg}" stroke="${c.line}" stroke-width="2"/>
<text x="${W / 2}" y="${H / 2 + fs * 0.1}" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="${fs}" font-weight="700" letter-spacing="${fs * 0.18}" fill="${c.text}">PLACEHOLDER</text>
<text x="${W / 2}" y="${H / 2 + fs * 0.95}" text-anchor="middle" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="${fs * 0.55}" letter-spacing="${fs * 0.08}" fill="${c.text}" fill-opacity=".8">ARTE / ART · ${ratio.replace('x', ':')}</text>
</svg>`;
}
export function writePlaceholders() {
  for (const tone of Object.keys(TONES)) for (const r of Object.keys(DIMS)) out(`assets/ph/ph-${tone}-${r}.svg`, placeholderSvg(tone, r));
  out('assets/favicon.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#07100a"/><circle cx="40" cy="24" r="12" fill="#591D28"/><path d="M24 14v26a8 8 0 0 1-8 8" fill="none" stroke="#79BF65" stroke-width="7" stroke-linecap="round"/></svg>`);
  out('robots.txt', `User-agent: *\nAllow: /\n${S.siteUrl ? `Sitemap: ${S.siteUrl.replace(/\/$/, '')}/sitemap.xml\n` : ''}`);
}

/* ---------- Piezas pequeñas ---------- */
export const empty = (key = 'empty.add') => tx(key, 'span', 'class="is-empty"');
export const flag = (key = 'flag.placeholder') => tx(key, 'span', 'class="flag"');
// nota de «marcador» (solo si showPlaceholders está activo y existe el texto)
export const flagNote = (key) => (SP && has(key) && text(key) ? `<p class="flag-note">${flag()} ${tx(key)}</p>` : '');
export const socialList = (cls = '', { onlySet = false } = {}) => `<ul class="socials ${cls}">${S.socials.filter((s) => !onlySet || s.url).map((s) => s.url
  ? `<li><a href="${esc(s.url)}" target="_blank" rel="noopener me">${esc(s.label)}${tx('social.newTab', 'span', 'class="sr-only"')}</a></li>`
  : `<li><span class="is-unset" ${ta('title', 'social.unset')}>${esc(s.label)}${tx('social.unsetSr', 'span', 'class="sr-only"')}</span></li>`).join('')}</ul>`;
export const mailLink = (cls = '') => `<a class="mail ${cls}" href="mailto:${esc(S.email)}">${esc(S.email)}</a>`;
export const wipe = (p) => esc(p.theme?.accent2 || '#591D28');

/* ---------- Imagen y figura ---------- */
export function img(i, { tone = 'graphite', eager = false, sizes = '', altKey = null } = {}) {
  const ratio = DIMS[i.ratio] ? i.ratio : '3x2'; const [w, h] = DIMS[ratio]; const ph = !i.src;
  const src = ph ? u(`assets/ph/ph-${tone}-${ratio}.svg`) : u(i.src);
  const srcset = !ph && i.small ? ` srcset="${u(i.small)} 800w, ${u(i.src)} 1600w" sizes="${sizes || '(min-width: 1000px) 50vw, 100vw'}"` : '';
  const alt = altKey && has(altKey) && text(altKey) ? ta('alt', altKey) : 'alt=""';
  return `<img src="${src}" width="${i.w || w}" height="${i.h || h}" ${alt} ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${srcset}${ph ? ' class="is-ph"' : ''}>`;
}
// opts.base = clave de contenido del elemento, p. ej. "projects.biopunk.modules.maps.items.0"
// (usa base.caption y base.alt). También se pueden pasar capKey / altKey sueltas.
export function figure(i, tone, { zoom = false, cls = '', style = '', base = null, capKey = null, altKey = null, metaBase = 'imageMeta' } = {}) {
  capKey = capKey ?? (base ? `${base}.caption` : null); if (capKey && !(has(capKey) && text(capKey))) capKey = null;
  altKey = altKey ?? (base && has(`${base}.alt`) ? `${base}.alt` : capKey);
  const ratio = DIMS[i.ratio] ? i.ratio : '3x2';
  const src = i.src ? u(i.src) : u(`assets/ph/ph-${tone}-${ratio}.svg`);
  const label = capKey || altKey;
  const inner = zoom
    ? `<button type="button" class="zoom" data-lightbox data-full="${src}"${label ? ' ' + ta('data-caption', label) : ''}>${tx('module.enlarge', 'span', 'class="sr-only"')} ${img(i, { tone, altKey })}</button>`
    : img(i, { tone, altKey });
  const meta = i.meta ? `<dl class="meta">${Object.entries(i.meta).map(([k, v]) => `<div><dt>${tx(`${metaBase}.${k}`)}</dt><dd>${val(v) ?? empty()}</dd></div>`).join('')}</dl>` : '';
  const prov = i.provisional && SP ? flag('flag.provisional') : '';
  return `<figure class="fig r-${ratio} ${cls}"${style ? ` style="${style}"` : ''}>${inner}${capKey || meta || prov ? `<figcaption>${capKey ? tx(capKey) : ''}${prov}${meta}</figcaption>` : ''}</figure>`;
}

/* ---------- «Ventana»: el panel básico de la interfaz del archivo ---------- */
// code = código de catálogo (JA-01…), titleHtml = etiqueta, collapsible = con botón plegar/desplegar
export function win({ code = '', titleHtml = '', body = '', cls = '', id = '', collapsible = false, attrs = '', tag = 'section' }) {
  const bodyId = id ? `${id}-body` : '';
  const toggle = collapsible && id ? `<button type="button" class="win-toggle" aria-expanded="true" aria-controls="${bodyId}" data-win-toggle>${tx('ui.togglePanel', 'span', 'class="sr-only"')}<span aria-hidden="true" class="win-chev"></span></button>` : '';
  return `<${tag} class="win ${cls}"${id ? ` id="${id}"` : ''}${attrs ? ' ' + attrs : ''}><header class="win-bar">${code ? `<span class="win-code">${esc(code)}</span>` : ''}<span class="win-title">${titleHtml}</span>${toggle}</header><div class="win-body"${bodyId ? ` id="${bodyId}"` : ''}>${body}</div></${tag}>`;
}

/* ---------- El ecosistema: registro de nodos y conexiones ---------- */
// Cada elemento enlazable del archivo se registra con un id. data/ecosystem.json decide qué se conecta con qué.
export const REG = {};
P.forEach((p) => { REG[p.slug] = { id: p.slug, kind: 'project', code: p.acc, href: hrefOf(p), titleKey: `projects.${p.slug}.title`, shortKey: `projects.${p.slug}.short`, theme: p.theme }; });
X.filter((e) => e.page).forEach((e, n) => { REG[e.slug] = { id: e.slug, kind: 'exploration', code: `JA-04.${n + 1}`, href: `explorations/${e.slug}.html`, titleKey: `explorations.${e.slug}.title`, shortKey: `explorations.${e.slug}.short` }; });
N.forEach((n, i) => { REG[n.slug] = { id: n.slug, kind: 'note', code: `NC-${String(i + 1).padStart(2, '0')}`, href: `field-notes.html#${n.slug}`, titleKey: `notes.${n.slug}.title`, shortKey: `notes.${n.slug}.body.0` }; });
REG['field-notes'] = { id: 'field-notes', kind: 'area', code: 'JA-A1', href: 'field-notes.html', titleKey: 'nav.notes', shortKey: 'notes.lede' };
REG.shop = { id: 'shop', kind: 'area', code: 'JA-A2', href: 'shop.html', titleKey: 'nav.shop', shortKey: 'home.shopText' };
REG.lab = { id: 'lab', kind: 'area', code: 'JA-A4', href: 'lab.html', titleKey: 'nav.lab', shortKey: 'lab.lede' };
REG.about = { id: 'about', kind: 'area', code: 'JA-A3', href: 'about.html', titleKey: 'nav.about', shortKey: 'statement.short' };
ECO.extraNodes.forEach((n) => { REG[n.id] = { ...n }; });

// Conexiones de un elemento: [{ node, kind, dir: 'out' | 'in' }]
export function relatedFor(id) {
  return ECO.links.flatMap((l) => (l.from === id && REG[l.to] ? [{ node: REG[l.to], kind: l.kind, dir: 'out' }] : l.to === id && REG[l.from] ? [{ node: REG[l.from], kind: l.kind, dir: 'in' }] : []));
}
// Panel «Conexiones» (solo aparece si el elemento tiene conexiones reales)
export function connectionsPanel(id, code) {
  const rel = relatedFor(id); if (!rel.length) return '';
  const body = `<p class="rel-lede">${tx('rel.lede')}</p><ul class="rel-list">${rel.map((r) => `<li><span class="rel-kind">${tx(`rel.${r.kind}.${r.dir}`)}</span> <a href="${u(r.node.href)}" ${r.node.theme ? `data-wipe="${esc(r.node.theme.accent2)}"` : ''}>${tx(r.node.titleKey)}</a><span class="rel-code">${esc(r.node.code)}</span></li>`).join('')}</ul>`;
  return `<aside class="wrap rel-wrap reveal" aria-labelledby="rel-h">${win({ code, titleHtml: tx('rel.title', 'span', 'id="rel-h"'), body, cls: 'win--rel' })}</aside>`;
}

// Mapa del ecosistema (portada). En pantallas pequeñas se convierte en lista.
export function ecosystemMap() {
  const nodes = ECO.nodes.filter((n) => REG[n.id]);
  const trunk = ['biopunk', 'golden-tec', 'ira', 'explorations', 'field-notes', 'shop', 'lab'].filter((id) => ECO.nodes.some((n) => n.id === id));
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const line = (a, b, cls) => (pos[a] && pos[b] ? `<line class="eco-line ${cls}" x1="${pos[a].x}" y1="${pos[a].y}" x2="${pos[b].x}" y2="${pos[b].y}" data-a="${a}" data-b="${b}"/>` : '');
  const lines = trunk.map((id) => `<line class="eco-line is-trunk" x1="${ECO.hub.x}" y1="${ECO.hub.y}" x2="${pos[id].x}" y2="${pos[id].y}" data-a="hub" data-b="${id}"/>`).join('') + ECO.links.map((l) => line(l.from, l.to, 'is-link')).join('');
  const li = nodes.map((n) => {
    const r = REG[n.id]; const rel = relatedFor(n.id);
    return `<li class="eco-node eco-node--${r.kind}${n.x > 66 ? ' is-left' : ''}" style="--x:${n.x}%;--y:${n.y}%" data-node="${n.id}" data-group="${esc(n.group || 'archive')}" data-x="${n.x}" data-y="${n.y}">
      <a href="${u(r.href)}"${r.theme ? ` data-wipe="${esc(r.theme.accent2)}"` : ''}><span class="eco-dot" aria-hidden="true"></span><span class="eco-name"><span class="eco-code">${esc(r.code)}</span>${tx(r.titleKey)}</span></a>
      <div class="eco-card"><p class="eco-kind">${tx(`kind.${r.kind}`)}</p><p class="eco-desc">${tx(r.shortKey)}</p>${rel.length ? `<p class="eco-rel">${tx('map.linkedWith')}: ${rel.map((x) => tx(x.node.titleKey)).join(', ')}</p>` : ''}${tx('map.enter', 'a', `class="btn btn-small eco-go" href="${u(r.href)}"${r.theme ? ` data-wipe="${esc(r.theme.accent2)}"` : ''}`)}</div>
    </li>`;
  }).join('');
  const readout = win({ code: 'JA-00', titleHtml: tx('map.readout'), cls: 'eco-readout', attrs: 'aria-live="polite" data-readout', body: `<p class="eco-idle" data-idle>${tx('map.idle')}</p><div class="eco-live" data-live hidden></div>` });
  const groups = (ECO.groups || []).filter((g) => nodes.some((n) => n.group === g));
  const filters = `<div class="eco-tools"><div class="chips" role="group" ${ta('aria-label', 'map.filterAria')} data-eco-filters><button type="button" class="chip" data-group="*" aria-pressed="true">${tx('projects.all')}</button>${groups.map((g) => `<button type="button" class="chip" data-group="${esc(g)}" aria-pressed="false">${tx(`map.group.${g}`)}</button>`).join('')}</div>
    <p class="eco-count" role="status" data-count>${tx('map.countShowing')} <b data-n>${nodes.length}</b> ${tx('map.countOf')} <b>${nodes.length}</b> ${tx('map.countNodes')}</p></div>`;
  const map = `<div class="eco-main">${filters}<div class="eco-map win" data-eco><div class="win-bar"><span class="win-code">JA-00</span><span class="win-title">${tx('map.window')}</span></div>
    <div class="eco-stage"><svg class="eco-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">${lines}</svg>
    <div class="eco-hub" style="--x:${ECO.hub.x}%;--y:${ECO.hub.y}%" aria-hidden="true"><span>${tx('map.hub')}</span></div>
    <ul class="eco-nodes" ${ta('aria-label', 'map.aria')}>${li}</ul></div>
    <div class="eco-foot"><p class="muted eco-hint">${tx('map.dragHint')}</p><button type="button" class="linklike" data-eco-reset>${tx('map.reset')}</button></div></div></div>`;
  return `<section class="wrap ecosystem" id="archive" aria-labelledby="eco-h"><header class="section-head reveal">${tx('map.title', 'h2', 'id="eco-h"')}<p class="muted">${tx('map.lede')}</p></header><div class="eco-grid reveal">${map}${readout}</div></section>`;
}

/* ---------- Salas de exposición (una presentación por tipo de obra) ---------- */
export function tear(seed) {
  let s = seed * 97 | 0; const r = () => { s = (s + 0x6D2B79F5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
  let d = 'M0 40'; for (let x = 0; x <= 1440; x += 16) d += `L${x} ${(5 + r() * 26 + (Math.sin(x / 140) * 5)).toFixed(1)}`;
  return `<svg class="tear" viewBox="0 0 1440 40" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="${d}L1440 40Z"/></svg>`;
}
export function room(p, k, { compact = false } = {}) {
  const th = p.theme, tone = th.tone, base = `projects.${p.slug}`;
  const vars = `--room-bg:${th.bg};--room-bg2:${th.bg2};--room-accent:${th.highlight || th.accent};--room-red:${th.accent2}`;
  const tags = Array.from({ length: len(`${base}.tags`) }, (_, i) => tx(`${base}.tags.${i}`));
  let art;
  if (p.layout === 'sheets') {
    const ims = [p.cover, ...X.filter((e) => !e.placeholder).map((e) => e.image)].sort((a, b) => !!b.src - !!a.src).slice(0, 3); if (ims[0].h > ims[0].w) ims.push(ims.shift());
    art = `<div class="sheet-collage" aria-hidden="true">${ims.map((m, n) => `<div class="sc sc-${n + 1}">${img(m, { tone })}</div>`).join('')}</div>`;
  } else {
    art = `<div class="room-art"${p.cover.w ? ` style="--ar:${p.cover.w}/${p.cover.h}"` : ''}>${img(p.cover, { tone, altKey: `${base}.coverAlt` })}${p.layout === 'cinema' ? '<span class="play" aria-hidden="true"></span>' : ''}<div class="room-reveal" aria-hidden="true"><span>${tags.join(', ')}</span></div></div>`;
  }
  return `<section class="room room--${p.layout}${compact ? ' room--compact' : ''}" style="${vars}" aria-labelledby="room-${p.slug}">${tear(k + 3)}
  <div class="wrap room-grid">${art}
    <div class="room-label"><p class="acc">${p.acc}</p><h2 id="room-${p.slug}"><a href="${u(hrefOf(p))}" data-wipe="${wipe(p)}">${tx(`${base}.title`)}</a></h2><p class="room-sub">${tx(`${base}.subtitle`)}</p><p class="room-short">${tx(`${base}.short`)}</p><p class="room-enter">${tx(`${base}.verb`)}</p><ul class="room-notes">${tags.map((g) => `<li>${g}</li>`).join('')}</ul></div>
  </div></section>`;
}

/* ---------- Módulos de las páginas de proyecto ---------- */
function bodyReal(base) { return Array.from({ length: len(`${base}.body`) }, (_, i) => i).filter((i) => text(`${base}.body.${i}`)); }
function hasReal(m, base) {
  switch (m.type) {
    case 'text': return bodyReal(base).length > 0;
    case 'gallery': return (m.items || []).some((i) => i.src);
    case 'specimens': return (m.items || []).some((i) => i.src || Object.values(i.fields || {}).some(Boolean));
    case 'media': return (m.videos || []).some((v) => v.src || ytId(v.youtube));
    case 'compare': return !!(m.before?.src && m.after?.src);
    case 'facts': return Object.values(m.facts || {}).some(Boolean);
    default: return true;
  }
}
const mhead = (m, base, n) => `<header class="module-head">${has(`${base}.kicker`) ? `<p class="kicker"><span class="kicker-n">${String(n + 1).padStart(2, '0')}</span>${tx(`${base}.kicker`)}</p>` : ''}${tx(`${base}.heading`, 'h2', `id="${esc(m.id)}-h"`)}</header>`;
// Acepta un enlace de YouTube (watch?v=, youtu.be/, /embed/, /shorts/) o directamente el ID de 11 caracteres
export const ytId = (s) => { const m = String(s || '').match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/) || String(s || '').match(/^([A-Za-z0-9_-]{11})$/); return m ? m[1] : null; };
function videoEl(v, tone, vbase) {
  const ratio = DIMS[v.ratio] ? v.ratio : '16x9'; const title = `${vbase}.title`;
  const yt = ytId(v.youtube);
  if (yt) {   // YouTube: no carga nada de YouTube hasta que la persona pulsa play (más rápido y respeta la privacidad)
    const thumb = v.poster ? u(v.poster) : `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
    return `<figure class="fig video yt" data-yt="${yt}"><div class="yt-box"><img src="${thumb}" alt="" loading="lazy" decoding="async" width="1600" height="900"><button type="button" class="yt-play" ${ta('aria-label', title)}><span class="play" aria-hidden="true"></span></button></div><figcaption>${tx(title)} <a class="yt-link" href="https://www.youtube.com/watch?v=${yt}" rel="noopener" target="_blank">${tx('module.ytOpen')}</a></figcaption></figure>`;
  }
  if (!v.src) return `<figure class="fig video is-slot"><div class="video-ph">${img({ src: null, ratio }, { tone, altKey: title })}<span class="play" aria-hidden="true"></span></div><figcaption>${tx(title)} ${SP ? flag('flag.video') : ''}</figcaption></figure>`;
  const srcs = (Array.isArray(v.src) ? v.src : [v.src]).map((s) => { const e = s.split('.').pop().toLowerCase(); return `<source src="${u(s)}" type="video/${e === 'mov' ? 'quicktime' : e}">`; }).join('');
  return `<figure class="fig video"><video controls preload="none" playsinline ${v.poster ? `poster="${u(v.poster)}"` : ''} ${ta('aria-label', title)}>${srcs}<p>${tx('module.videoFallback')}</p></video><figcaption>${tx(title)}</figcaption></figure>`;
}
// Comparador boceto / final. base = clave con beforeLabel, afterLabel, beforeAlt, afterAlt
export function compare(m, tone, base) {
  const ratio = m.ratio || '4x5'; const [w, h] = DIMS[ratio];
  return `<figure class="compare" data-compare style="--pos:50%;aspect-ratio:${w}/${h}">
  <div class="compare-after">${img({ ...m.after, ratio }, { tone, altKey: `${base}.afterAlt` })}</div>
  <div class="compare-before">${img({ ...m.before, ratio }, { tone: tone === 'paper' ? 'paper' : 'graphite', altKey: `${base}.beforeAlt` })}</div>
  <span class="compare-label l1">${tx(`${base}.beforeLabel`)}</span><span class="compare-label l2">${tx(`${base}.afterLabel`)}</span>
  <span class="compare-handle" aria-hidden="true"></span>
  <input type="range" min="0" max="100" value="50" ${ta('aria-label', 'module.compareHint')}></figure>`;
}
export const isVisible = (m, slug) => SP || hasReal(m, `projects.${slug}.modules.${m.id}`);
export function renderModule(m, tone, slug, n) {
  const base = `projects.${slug}.modules.${m.id}`;
  if (!SP && !hasReal(m, base)) return '';
  const id = `id="${esc(m.id)}"`; const head = mhead(m, base, n); const aria = `aria-labelledby="${esc(m.id)}-h"`;
  switch (m.type) {
    case 'text': case 'section': {
      const real = bodyReal(base);
      return `<section class="module module-text ${m.type === 'section' ? 'module-connected' : ''} reveal" ${id} ${aria}>${head}<div class="prose">${real.length ? real.map((i) => tx(`${base}.body.${i}`, 'p')).join('') : `<p>${empty('empty.text')}</p>`}</div>${m.image ? figure(m.image, tone, { zoom: true, cls: 'module-image', capKey: `${base}.imageCaption`, altKey: `${base}.imageAlt` }) : ''}${flagNote(`${base}.note`)}</section>`;
    }
    case 'wip':
      return `<section class="module module-wip reveal" ${id} ${aria}><div class="wip-box"><p class="wip-badge">${tx('module.wip')}</p>${head}<div class="prose">${Array.from({ length: len(`${base}.body`) }, (_, i) => tx(`${base}.body.${i}`, 'p')).join('')}</div></div></section>`;
    case 'facts':
      return `<section class="module reveal" ${id} ${aria}>${head}<dl class="facts">${Object.entries(m.facts).map(([k, v]) => `<div><dt>${tx(`${base}.facts.${k}`)}</dt><dd>${val(v) ?? empty('empty.confirm')}</dd></div>`).join('')}</dl>${flagNote(`${base}.note`)}</section>`;
    case 'gallery':
      return `<section class="module reveal" ${id} ${aria}>${head}<div class="gallery gallery--${m.style || 'grid'}">${m.items.map((i, k) => figure(i, tone, { zoom: !!m.lightbox, style: `--n:${k}`, base: `${base}.items.${k}` })).join('')}</div></section>`;
    case 'specimens':
      return `<section class="module reveal" ${id} ${aria}>${head}<div class="specimens">${m.items.map((i, k) => `<article class="specimen win" style="--rot:${[-0.7, 0.5, -0.25][k % 3]}deg"><header class="win-bar"><span class="win-code">ESP-${String(k + 1).padStart(2, '0')}</span><span class="win-title">${tx('project.specimen')}</span></header><div class="win-body">${figure(i, tone)}<div class="specimen-body">${tx(`${base}.items.${k}.name`, 'h3')}<dl class="meta">${Object.entries(i.fields || {}).map(([f, v]) => `<div><dt>${tx(`${base}.fields.${f}`)}</dt><dd>${val(v) ?? empty()}</dd></div>`).join('')}</dl></div></div></article>`).join('')}</div></section>`;
    case 'media':
      return `<section class="module reveal" ${id} ${aria}>${head}<div class="videos videos--${m.style || (m.videos.length > 1 ? 'multi' : 'one')}">${m.videos.map((v, k) => videoEl(v, tone, `${base}.videos.${k}`)).join('')}</div>${flagNote(`${base}.note`)}</section>`;
    case 'compare':
      return `<section class="module reveal" ${id} ${aria}>${head}${compare(m, tone, base)}</section>`;
    default: return '';
  }
}
