// PÁGINAS: cada bloque { … } construye un archivo HTML. Para cambiar la estructura de una página, edítalo aquí.
// Los textos NO están aquí: se piden con claves a content/es.json y content/en.json.
import { S, SP, P, X, N, SH, AB, LAB, setRoot, u, esc, hrefOf, pages, out, LANGS } from './context.mjs';
import { tx, ta, tas, t, has, len, text, val, bix, bia, bi, searchText } from './i18n.mjs';
import { img, figure, flag, flagNote, empty, socialList, mailLink, wipe, win, REG, relatedFor, connectionsPanel, ecosystemMap, room, renderModule, isVisible, compare } from './components.mjs';
import { write } from './layout.mjs';

const lightboxDialog = `<dialog class="lightbox" id="lightbox" ${ta('aria-label', 'lb.label')}><form method="dialog">${tx('lb.close', 'button', `class="lb-close" ${ta('aria-label', 'lb.closeAria')}`)}</form>
<div class="lb-tools" role="group" ${ta('aria-label', 'lb.label')}><button type="button" class="lb-zoom-out" ${ta('aria-label', 'lb.zoomOutAria')}>−</button>${tx('lb.reset', 'button', `type="button" class="lb-reset" ${ta('aria-label', 'lb.resetAria')}`)}<button type="button" class="lb-zoom-in" ${ta('aria-label', 'lb.zoomInAria')}>+</button></div>
${tx('lb.prev', 'button', `class="lb-prev" type="button" ${ta('aria-label', 'lb.prevAria')}`)}<figure><div class="lb-stage" tabindex="0"><img alt="" draggable="false"></div><figcaption></figcaption>${tx('lb.hint', 'p', 'class="lb-hint"')}</figure>${tx('lb.next', 'button', `class="lb-next" type="button" ${ta('aria-label', 'lb.nextAria')}`)}</dialog>`;
const pvars = (p) => `--bg:${p.theme.bg};--bg2:${p.theme.bg2};--accent:${p.theme.accent};--accent2:${p.theme.accent2};--hl:${p.theme.highlight || p.theme.accent}`;
const filterChips = (ids, labelFn, ariaKey) => `<div class="chips" role="group" ${ta('aria-label', ariaKey)}><button type="button" class="chip" data-filter="*" aria-pressed="true">${tx('projects.all')}</button>${ids.map((id) => `<button type="button" class="chip" data-filter="${esc(id)}" aria-pressed="false">${tx(labelFn(id))}</button>`).join('')}</div>`;
const typeLabel = (id) => `types.${id}`;

const contactCta = (extraKey = 'project.ctaExtra') => `<section class="wrap cta-strip reveal"><div><p class="cta-text">${tx('project.ctaText')} ${tx(extraKey)}</p></div><div class="cta-actions">${tx('nav.contact', 'a', `class="btn" href="${u('about.html#contact')}"`)}${mailLink('cta-mail')}${socialList('inline')}</div></section>`;
const nextTerritory = (p) => {
  const i = P.indexOf(p); const n = P[(i + 1) % P.length], pr = P[(i + P.length - 1) % P.length];
  return `<nav class="wrap pager" ${ta('aria-label', 'project.pagerAria')}><a href="${u(hrefOf(pr))}" data-wipe="${wipe(pr)}">${tx('project.prev', 'span', 'class="pager-dir"')}${tx(`projects.${pr.slug}.title`, 'strong')}</a><a href="${u(hrefOf(n))}" data-wipe="${wipe(n)}" class="next">${tx('project.next', 'span', 'class="pager-dir"')}${tx(`projects.${n.slug}.title`, 'strong')}</a></nav>`;
};
const projectTitle = (p) => (L) => `${L(`projects.${p.slug}.title`)}${L(`projects.${p.slug}.subtitle`) ? ': ' + L(`projects.${p.slug}.subtitle`) : ''}`;

/* ===================== PORTADA ===================== */
{
  setRoot('index.html');
  const hero = P.find((p) => p.slug === S.home.heroProject) || P[0]; const hb = `projects.${hero.slug}`;
  const letters = [...S.name.toUpperCase()].map((c) => `<span aria-hidden="true">${esc(c)}</span>`).join('');
  const art = `<figure class="win win--art" data-depth="0.18"><figcaption class="win-bar"><span class="win-code">${hero.acc}</span><span class="win-title">${tx(`${hb}.title`)} · ${tx(`${hb}.subtitle`)}</span></figcaption>
    <a class="art-link" href="${u(hrefOf(hero))}" data-wipe="${wipe(hero)}">${img(hero.cover, { tone: hero.theme.tone, eager: true, sizes: '(min-width: 900px) 48vw, 100vw', altKey: `${hb}.coverAlt` })}<span class="art-open">${tx('home.artOpen')}</span></a>
    ${hero.cover.provisional && SP ? `<p class="win-foot">${flag('flag.provisional')}</p>` : ''}</figure>`;
  const statement = `<section class="wrap artist-statement reveal" id="statement" aria-labelledby="st-h">${win({ code: 'JA-00', titleHtml: tx('statement.window'), cls: 'win--statement', body: `${tx('statement.title', 'h2', 'id="st-h" class="st-h"')}<blockquote class="st-quote">${tx('statement.short', 'p')}</blockquote><p class="st-actions"><a class="link" href="${u('about.html#statement')}">${tx('statement.read')}</a>${SP ? ' ' + flag('flag.statement') : ''}</p>` })}</section>`;
  // Video de fondo (config.json → home.heroVideo). Mudo, en bucle, sin controles; js/main.js lo detiene con «movimiento reducido».
  const hv = S.home.heroVideo;
  const heroVideo = hv && hv.src ? `<video class="hero-video" muted loop playsinline autoplay preload="auto" tabindex="-1" aria-hidden="true"${hv.poster ? ` poster="${u(hv.poster)}"` : ''} data-hero-video><source src="${u(hv.src)}" type="video/mp4">${hv.alt ? `<source src="${u(hv.alt)}" type="video/webm">` : ''}</video>` : '';
  const body = `
<section class="hero" data-hero aria-labelledby="hero-name">
  <div class="hero-bg" aria-hidden="true">${heroVideo}<span class="hero-grid"></span><div class="hero-glow"></div></div>
  <div class="wrap hero-layout">
    <div class="hero-copy">
      ${tx('site.concept', 'p', 'class="eyebrow"')}
      <h1 class="signature" id="hero-name" aria-label="${esc(S.name)}">${letters}</h1>
      ${tx('site.tagline', 'p', 'class="lede"')}
      <div class="cta">${tx('home.cta1', 'a', `class="btn btn-primary" href="${u('projects.html')}" data-wipe="#591D28" data-enter`)}${tx('home.cta2', 'a', `class="btn btn-ghost" href="${u('projects.html#index')}"`)}</div>
    </div>
    ${art}
  </div>
  <a class="scroll-cue" href="#statement">${tx('home.scrollSr', 'span', 'class="sr-only"')}${tx('home.scroll', 'span', 'aria-hidden="true"')}<i aria-hidden="true"></i></a>
</section>

${statement}
${ecosystemMap()}

<section class="statement wrap" aria-label="${esc(S.name)}">
  ${tx('home.introText', 'p', 'class="statement-text reveal"')}
  <p class="statement-aside reveal">${tx('home.asidePre')} ${tx('home.asideIndex', 'a', `href="${u('projects.html#index')}"`)}${tx('home.asideMid')} ${tx('home.asidePro', 'a', `href="${u('about.html#professional')}"`)} ${tx('home.asidePost')}</p>
</section>

${room(P[0], 1)}
${P.slice(1).map((p, i) => room(p, i + 2, { compact: true })).join('\n')}

<section class="wrap section two-up">
  <div class="reveal">${tx(`notes.${N[0].slug}.title`, 'h2')}<p class="muted">${tx(`notes.${N[0].slug}.body.0`)}</p><p><a class="link" href="${u('field-notes.html')}">${tx('home.notesLink')}</a></p></div>
  <div class="reveal">${tx('home.shopH', 'h2')}<p class="muted">${tx('home.shopText')}</p><p><a class="link" href="${u('shop.html')}">${tx('home.shopLink')}</a></p></div>
</section>`;
  const ld = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', name: S.name, ...(S.siteUrl ? { url: S.siteUrl } : {}), author: { '@type': 'Person', name: S.legalName || S.name, email: S.email } })}</script>`;
  write('index.html', { title: (L) => L('meta.home.title'), nav: '', body, cls: 'home', ld });
}

/* ===================== PROYECTOS: exposición + índice ===================== */
{
  setRoot('projects.html');
  const rows = [
    ...P.map((p) => ({ acc: p.acc, extraKey: `projects.${p.slug}.short`, titleKey: `projects.${p.slug}.title`, subKey: `projects.${p.slug}.subtitle`, type: p.type, year: p.year, href: hrefOf(p), kind: 'projects.kindMain' })),
    ...X.filter((e) => e.page).map((e, n) => ({ acc: `JA-04.${n + 1}`, titleKey: `explorations.${e.slug}.title`, subKey: `explorations.${e.slug}.short`, type: e.type, year: e.year, href: `explorations/${e.slug}.html`, kind: 'projects.kindExploration' })),
  ];
  const types = [...new Set(rows.map((r) => r.type))].sort();
  const body = `
<section class="wrap page-head reveal">${tx('projects.h1', 'h1', 'class="h-display"')}<p class="lede muted">${tx('projects.lede')} <a href="#index">${tx('projects.jump')}</a></p></section>
${P.map((p, i) => room(p, i + 1)).join('\n')}
<section class="ledger-section" id="index" aria-labelledby="idx-h" data-filter-scope>
  <div class="wrap section">
  <header class="section-head reveal">${tx('projects.idxH', 'h2', 'id="idx-h"')}<p class="muted">${tx('projects.idxLede')}</p></header>
  <div class="tools">
    <label class="search"><span class="sr-only">${tx('projects.search')}</span><input type="search" ${ta('placeholder', 'projects.search')} data-search autocomplete="off"></label>
    ${filterChips(types, typeLabel, 'projects.filterAria')}
  </div>
  <div class="table-wrap"><table class="index-table"><thead><tr><th scope="col">${tx('projects.thNo')}</th><th scope="col">${tx('projects.thTitle')}</th><th scope="col">${tx('projects.thType')}</th><th scope="col">${tx('projects.thKind')}</th><th scope="col">${tx('projects.thYear')}</th></tr></thead><tbody>
  ${rows.map((r) => `<tr data-item data-type="${esc(r.type)}" data-text="${esc(r.acc.toLowerCase() + ' ' + searchText(...[r.titleKey, r.subKey, r.extraKey, typeLabel(r.type)].filter(Boolean)))}"><td class="acc">${r.acc}</td><th scope="row"><a href="${u(r.href)}">${tx(r.titleKey)}</a><small>${tx(r.subKey)}</small></th><td>${tx(typeLabel(r.type))}</td><td>${tx(r.kind)}</td><td>${val(r.year) ?? '—'}</td></tr>`).join('')}
  </tbody></table></div>
  <p class="muted empty-msg" data-empty hidden role="status">${tx('projects.empty')}</p>
  </div>
</section>`;
  write('projects.html', { title: (L) => L('meta.projects.title'), desc: (L) => L('meta.projects.desc'), nav: 'projects', body, cls: 'page-projects' });
}

/* ===================== PÁGINAS DE PROYECTO (Biopunk, Golden Tec, Ira) ===================== */
function projectHero(p) {
  const tone = p.theme.tone, b = `projects.${p.slug}`;
  const crumb = `<p class="crumb"><a href="${u('projects.html')}">${tx('project.crumb')}</a> / ${p.acc}</p>`;
  const prov = p.cover.provisional && SP ? flag('flag.provisional') : '';
  const credit = has(`${b}.coverCaption`) ? `<p class="cover-credit">${tx(`${b}.coverCaption`)} ${prov}</p>` : (prov ? `<p class="cover-credit">${prov}</p>` : '');
  if (p.layout === 'gallery') return `<section class="gallery-hero"><div class="wrap gh-grid"><div class="gh-text reveal">${crumb}${tx(`${b}.title`, 'h1', 'class="h-display"')}${tx(`${b}.subtitle`, 'p', 'class="subtitle"')}${tx(`${b}.short`, 'p', 'class="lede"')}</div><figure class="gh-art framed">${img(p.cover, { tone: 'paper', eager: true, altKey: `${b}.coverAlt` })}<figcaption>${prov}</figcaption></figure></div></section>`;
  if (p.layout === 'sheets') return `<section class="sheets-hero wrap">${crumb}${tx(`${b}.title`, 'h1', 'class="h-display"')}${tx(`${b}.subtitle`, 'p', 'class="subtitle"')}${tx(`${b}.short`, 'p', 'class="lede"')}</section>`;
  return `<section class="project-hero project-hero--${p.layout}"><div class="project-cover">${img(p.cover, { tone, eager: true, altKey: `${b}.coverAlt` })}<div class="project-scrim"></div>${p.layout === 'fieldguide' ? '<span class="grid-ticks" aria-hidden="true"></span>' : ''}${credit}</div><div class="wrap project-title reveal">${crumb}${tx(`${b}.title`, 'h1', 'class="h-display"')}${tx(`${b}.subtitle`, 'p', 'class="subtitle"')}${tx(`${b}.short`, 'p', 'class="lede"')}</div></section>`;
}
// Columna lateral: índice del proyecto + ficha del sistema (ventanas plegables)
function projectSide(p, mods) {
  const rel = relatedFor(p.slug);
  const toc = mods.length ? win({ code: p.acc, titleHtml: tx('module.toc'), id: 'toc', collapsible: true, cls: 'win--toc', body: `<nav ${ta('aria-label', 'module.tocAria')}><ol class="toc-list">${mods.map((m, n) => `<li><a href="#${esc(m.id)}"><span class="toc-n">${String(n + 1).padStart(2, '0')}</span>${tx(`projects.${p.slug}.modules.${m.id}.heading`)}</a></li>`).join('')}</ol></nav>` }) : '';
  const sys = win({ code: p.acc, titleHtml: tx('project.sysTitle'), id: 'sys', collapsible: true, cls: 'win--sys', body: `<dl class="sys-list"><div><dt>${tx('sys.code')}</dt><dd>${p.acc}</dd></div><div><dt>${tx('sys.type')}</dt><dd>${tx(typeLabel(p.type))}</dd></div><div><dt>${tx('sys.year')}</dt><dd>${val(p.year) ?? empty('empty.confirm')}</dd></div><div><dt>${tx('sys.links')}</dt><dd>${rel.length ? rel.map((r) => `<a href="${u(r.node.href)}">${tx(r.node.titleKey)}</a>`).join(', ') : tx('sys.none')}</dd></div></dl>` });
  return `<aside class="project-side">${toc}${sys}</aside>`;
}
for (const p of P.filter((q) => !q.href)) {
  setRoot(`projects/${p.slug}.html`);
  const tone = p.env === 'paper' ? 'paper' : p.theme.tone;
  const mods = p.modules.filter((m) => isVisible(m, p.slug));
  const body = `
${projectHero(p)}
<div class="wrap project-layout">${projectSide(p, mods)}<div class="project-modules">${mods.map((m, n) => renderModule(m, tone, p.slug, n)).join('')}</div></div>
${connectionsPanel(p.slug, p.acc)}
${contactCta()}
${nextTerritory(p)}
${lightboxDialog}`;
  write(`projects/${p.slug}.html`, { title: projectTitle(p), desc: (L) => L(`projects.${p.slug}.short`), nav: 'projects', theme: p.env, body, vars: pvars(p), cls: `project layout-${p.layout} project-${p.slug}` });
}

/* ===================== EXPLORACIONES (proyecto 04): fichas conceptuales ===================== */
{
  setRoot('explorations.html');
  const p = P.find((q) => q.slug === 'explorations'); const tone = p.theme.tone;
  const types = [...new Set(X.map((e) => e.type))].sort();
  const card = (e) => {
    const eb = `explorations.${e.slug}`;
    const inner = `<div class="entry-media">${img(e.image, { tone, altKey: `${eb}.imageAlt` })}</div><div class="entry-body"><p class="entry-type">${tx(typeLabel(e.type))}${e.year ? ', ' + val(e.year) : ''}</p>${tx(`${eb}.title`, 'h3')}${tx(`${eb}.short`, 'p', 'class="entry-short"')}${e.page ? tx('expl.view', 'p', 'class="room-enter"') : (SP ? `<p>${flag('flag.slot')}</p>` : '')}</div>`;
    return `<article class="entry ${e.page ? '' : 'is-slot'} reveal" data-item data-type="${esc(e.type)}" data-text="${esc(searchText(`${eb}.title`, `${eb}.short`, typeLabel(e.type)))}">${e.page ? `<a class="entry-link" href="${u(`explorations/${e.slug}.html`)}">${inner}</a>` : inner}</article>`;
  };
  const body = `
${projectHero(p)}
<section class="wrap section" ${ta('aria-label', 'expl.entriesAria')} data-filter-scope>
  <div class="tools"><label class="search"><span class="sr-only">${tx('expl.search')}</span><input type="search" ${ta('placeholder', 'expl.search')} data-search autocomplete="off"></label>${filterChips(types, typeLabel, 'projects.filterAria')}</div>
  <div class="entries">${X.map(card).join('')}</div>
  <p class="muted empty-msg" data-empty hidden role="status">${tx('projects.empty')}</p>
  ${SP ? `<p class="flag-note">${flag()} ${tx('expl.note')}</p>` : ''}
</section>
${connectionsPanel('explorations', p.acc)}
${contactCta()}
${nextTerritory(p)}`;
  write('explorations.html', { title: (L) => L('meta.explorations.title'), desc: (L) => L('projects.explorations.short'), nav: 'explorations', body, vars: pvars(p), cls: 'project layout-sheets project-explorations' });

  const list = X.filter((q) => q.page);
  for (const e of list) {
    setRoot(`explorations/${e.slug}.html`);
    const eb = `explorations.${e.slug}`; const i = list.findIndex((q) => q.slug === e.slug); const nx = list[(i + 1) % list.length];
    const sh = e.sheet || { silhouettes: [], palette: [], details: [] };
    const facts = `<dl class="facts"><div><dt>${tx('expl.type')}</dt><dd>${tx(typeLabel(e.type))}</dd></div><div><dt>${tx('expl.year')}</dt><dd>${val(e.year) ?? empty()}</dd></div><div><dt>${tx('expl.techniques')}</dt><dd>${val(e.techniques) ?? empty()}</dd></div></dl>`;
    const sw = sh.palette?.length ? sh.palette.map((c) => `<li style="background:${esc(c)}"><span class="sr-only">${esc(c)}</span></li>`).join('') : [1, 2, 3, 4, 5].map(() => '<li class="is-empty-swatch"></li>').join('');
    const jumps = [['sheet', 'expl.palette', true], ['details', 'expl.details', !!sh.details?.length], ['compare', 'expl.compareH', !!e.compare], ['process', 'expl.process', !!e.process?.length]].filter((j) => j[2] && j[0] !== 'sheet');
    const body2 = `
<article class="wrap entry-page">
  <p class="crumb"><a href="${u('explorations.html')}">${tx('expl.crumb')}</a> / ${tx(`${eb}.title`)}</p>
  <header class="reveal">${tx(`${eb}.title`, 'h1', 'class="h-display"')}${tx(`${eb}.short`, 'p', 'class="lede"')}${jumps.length ? `<nav class="jumps" ${ta('aria-label', 'expl.jump')}>${jumps.map((j) => tx(j[1], 'a', `href="#${j[0]}"`)).join('')}</nav>` : ''}</header>
  <div class="sheet reveal">
    <figure class="sheet-main">${figure({ ...e.image }, tone, { zoom: true, altKey: `${eb}.imageAlt`, capKey: null })}</figure>
    <aside class="sheet-side" ${ta('aria-label', 'expl.sheetAria')}>
      ${facts}
      ${sh.silhouettes?.length ? `<section><h2 class="sheet-h">${tx('expl.silhouettes')}</h2><div class="sil">${sh.silhouettes.map((q, k) => figure(q, tone, { zoom: true, base: `${eb}.silhouettes.${k}` })).join('')}</div></section>` : ''}
      <section><h2 class="sheet-h">${tx('expl.palette')}</h2><ul class="palette">${sw}</ul>${sh.palette?.length ? '' : flagNote('expl.paletteNote')}</section>
    </aside>
  </div>
  ${sh.details?.length ? `<section class="module reveal" id="details" aria-labelledby="det-h"><header class="module-head">${tx('expl.details', 'h2', 'id="det-h"')}</header><div class="gallery gallery--close">${sh.details.map((q, k) => figure(q, tone, { zoom: true, base: `${eb}.details.${k}` })).join('')}</div></section>` : ''}
  ${e.compare ? `<section class="module reveal" id="compare" aria-labelledby="cmp-h"><header class="module-head">${tx('expl.compareH', 'h2', 'id="cmp-h"')}</header>${compare(e.compare, tone, `${eb}.compare`)}</section>` : ''}
  ${e.process?.length ? `<section class="module reveal" id="process" aria-labelledby="prc-h"><header class="module-head">${tx('expl.process', 'h2', 'id="prc-h"')}</header><div class="gallery gallery--pairs">${e.process.map((q, k) => figure(q, tone, { zoom: true, base: `${eb}.process.${k}` })).join('')}</div></section>` : ''}
  ${SP ? `<p class="flag-note">${flag()} ${tx('expl.entryNote')}</p>` : ''}
</article>
${connectionsPanel(e.slug, REG[e.slug].code)}
<nav class="wrap pager" ${ta('aria-label', 'expl.entriesAria')}><a href="${u('explorations.html')}">${tx('expl.all', 'span', 'class="pager-dir"')}${tx('expl.crumb', 'strong')}</a>${list.length > 1 ? `<a class="next" href="${u(`explorations/${nx.slug}.html`)}">${tx('expl.nextSheet', 'span', 'class="pager-dir"')}${tx(`explorations.${nx.slug}.title`, 'strong')}</a>` : ''}</nav>
${lightboxDialog}`;
    write(`explorations/${e.slug}.html`, { title: (L) => L(`${eb}.title`), desc: (L) => L(`${eb}.short`), nav: 'explorations', body: body2, vars: pvars(p), cls: 'project layout-sheets project-explorations' });
  }
}

/* ===================== SOBRE MÍ + DECLARACIÓN + CONTACTO ===================== */
{
  setRoot('about.html');
  const anyUnset = S.socials.some((s) => !s.url);
  const body = `
<section class="wrap about-hero">
  <div class="about-text reveal"><h1 class="about-name">${esc(S.legalName || S.name)}</h1>
    ${tx('statement.short', 'p', 'class="about-lede"')}
    ${SP ? flagNote('statement.note') : ''}</div>
  <figure class="about-portrait reveal framed">${img(AB.portrait, { tone: 'paper', eager: true, altKey: 'about.portraitAlt' })}</figure>
</section>
<div class="wrap about-body">
  <section class="reveal" id="statement" aria-labelledby="stl-h">${tx('about.declaration', 'h2', 'id="stl-h"')}<div class="prose">${Array.from({ length: len('statement.long') }, (_, i) => tx(`statement.long.${i}`, 'p')).join('')}</div></section>
  <section class="reveal" aria-labelledby="disc-h">${tx('about.disciplines', 'h2', 'id="disc-h"')}<ul class="disc-list">${Array.from({ length: len('about.disciplines') }, (_, i) => tx(`about.disciplines.${i}`, 'li')).join('')}</ul>${flagNote('about.disciplinesNote')}</section>
  <section class="reveal" aria-labelledby="tools-h">${tx('about.tools', 'h2', 'id="tools-h"')}<div class="prose">${AB.tools ? `<p>${val(AB.tools)}</p>` : `<p>${empty('empty.tools')}</p>`}</div></section>
  <section class="reveal" id="professional" aria-labelledby="pro-h">${tx('about.pro', 'h2', 'id="pro-h"')}<dl class="facts">${Object.entries(AB.professional).map(([k, v]) => `<div><dt>${tx(`about.professional.${k}`)}</dt><dd>${val(v) ?? empty()}</dd></div>`).join('')}</dl></section>
  <section class="reveal contact-box" id="contact" aria-labelledby="contact-h">${tx('about.contact', 'h2', 'id="contact-h"')}
    <p class="big-mail">${S.email ? mailLink() : empty('empty.emailShort')}</p>
    ${socialList('big')}
    ${anyUnset ? flagNote('about.socialsNote') : ''}
    ${tx('about.hub', 'p', 'class="muted"')}
  </section>
</div>`;
  write('about.html', { title: (L) => L('meta.about.title'), desc: (L) => L('meta.about.desc'), nav: 'about', theme: 'paper', body, cls: 'page-about' });
}

/* ===================== NOTAS DE CAMPO ===================== */
{
  setRoot('field-notes.html');
  const body = `
<section class="wrap page-head reveal">${tx('notes.h1', 'h1', 'class="h-display"')}${tx('notes.lede', 'p', 'class="lede muted"')}</section>
<div class="wrap notes">${N.map((n, k) => {
    const nb = `notes.${n.slug}`; const rel = relatedFor(n.slug);
    return `<article class="note reveal" id="${esc(n.slug)}" style="--rot:${[-0.8, 0.6, -0.4, 0.9][k % 4]}deg"><header><p class="note-date"><time datetime="${esc(n.date)}">${esc(n.date)}</time>${len(`${nb}.tags`) ? ', ' + Array.from({ length: len(`${nb}.tags`) }, (_, i) => tx(`${nb}.tags.${i}`)).join(', ') : ''}</p><h2>${tx(`${nb}.title`)}${n.placeholder && SP ? ' ' + flag() : ''}</h2></header><div class="prose">${Array.from({ length: len(`${nb}.body`) }, (_, i) => tx(`${nb}.body.${i}`, 'p')).join('')}</div>${rel.length ? `<ul class="note-rel">${rel.map((r) => `<li><span class="rel-kind">${tx(`rel.${r.kind}.${r.dir === 'out' ? 'out' : 'in'}`)}</span> <a href="${u(r.node.href)}">${tx(r.node.titleKey)}</a></li>`).join('')}</ul>` : ''}</article>`;
  }).join('')}</div>`;
  write('field-notes.html', { title: (L) => L('meta.notes.title'), desc: (L) => L('meta.notes.desc'), nav: 'notes', body, cls: 'page-notes' });
}

/* ===================== TIENDA (solo catálogo de vista previa; sin pago) ===================== */
{
  setRoot('shop.html');
  const prod = (p) => {
    const buy = p.buyUrl || (SH.checkout.baseUrl ? `${SH.checkout.baseUrl}${p.slug}` : null); const pb = `shop.products.${p.slug}`;
    const status = p.status || 'placeholder';
    // «Disponible» solo se muestra si de verdad hay enlace de compra; si no, se degrada a «Marcador».
    const shown = status === 'available' && !buy ? 'placeholder' : status;
    return `<article class="product reveal" data-item data-type="${esc(p.category)}" data-text="${esc(searchText(`${pb}.title`, `${pb}.description`, `shop.categories.${p.category}`))}">${figure({ ...p.image }, 'paper', { altKey: `${pb}.imageAlt` })}<div class="product-body"><p class="entry-type">${tx(`shop.categories.${p.category}`)} <span class="status status--${shown}">${tx(`shop.status.${shown}`)}</span></p>${tx(`${pb}.title`, 'h3')}${tx(`${pb}.description`, 'p')}<p class="price">${val(p.price) ?? empty('empty.price')}</p>${tx(`${pb}.availability`, 'p', 'class="avail"')}
    <div class="product-actions">${buy && shown === 'available' ? tx('shop.buy', 'a', `class="btn" href="${esc(buy)}" rel="noopener"`) : `${tx('shop.soon', 'button', 'class="btn" type="button" disabled')}${tx('shop.check', 'a', `class="link" href="${u('about.html#contact')}"`)}`}</div></div></article>`;
  };
  const body = `
<section class="wrap page-head reveal">${tx('shop.h1', 'h1', 'class="h-display"')}
<p class="notice" role="note"><strong>${tx('shop.noticeStrong')}</strong> ${tx('shop.notice')}</p><p class="flag-note">${tx('shop.statusHelp')}</p></section>
<section class="wrap" ${ta('aria-label', 'shop.catalogAria')} data-filter-scope>
  <div class="tools"><label class="search"><span class="sr-only">${tx('shop.search')}</span><input type="search" ${ta('placeholder', 'shop.search')} data-search autocomplete="off"></label>${filterChips(SH.categories, (c) => `shop.categories.${c}`, 'shop.filterAria')}</div>
  <div class="products">${SH.products.map(prod).join('')}</div>
  <p class="muted empty-msg" data-empty hidden role="status">${tx('shop.empty')}</p>
</section>
<section class="wrap section" aria-labelledby="ship-h">${tx('shop.infoH', 'h2', 'id="ship-h"')}<dl class="facts">${Object.entries(SH.info).map(([k, v]) => `<div><dt>${tx(`shop.info.${k}`)}</dt><dd>${val(v) ?? empty('empty.store')}</dd></div>`).join('')}</dl></section>`;
  write('shop.html', { title: (L) => L('meta.shop.title'), desc: (L) => L('meta.shop.desc'), nav: 'shop', theme: 'paper', body, cls: 'page-shop' });
}

/* ===================== LABORATORIO (visor 3D, sintetizador, campo generativo, panel de proceso) ===================== */
{
  setRoot('lab.html');
  const range = (group, key, c) => `<label class="ctl">${tx(`lab.${group}.${key}`)}<span class="ctl-row"><input type="range" data-param="${key}" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.value}"><output data-out="${key}">${c.value}</output></span></label>`;
  const pressed = (key, attrs) => tx(key, 'button', `type="button" aria-pressed="false" ${attrs}`);
  const viewer = win({ code: 'LB-01', titleHtml: tx('lab.viewer.title'), cls: 'lab-win', body: `${tx('lab.viewer.text', 'p', 'class="muted"')}
    <div class="viewer" data-viewer><canvas class="lab-canvas" width="900" height="560" tabindex="0" role="img" ${ta('aria-label', 'lab.viewer.aria')}></canvas><p class="lab-fallback" data-fallback hidden>${tx('lab.viewer.fallback')}</p></div>
    <div class="lab-ctls" data-viewer-ctls>
      <div class="chips" role="group" ${ta('aria-label', 'lab.viewer.object')}>${LAB.models.map((m, i) => `<button type="button" class="chip" data-model="${m}" aria-pressed="${i === 0}">${tx(`lab.viewer.${m}`)}</button>`).join('')}</div>
      <div class="chips">${pressed('lab.viewer.wire', 'class="chip" data-wire')}${pressed('lab.viewer.spin', 'class="chip" data-spin')}<button type="button" class="chip" data-zoom="out">−${tx('lab.viewer.zoomOut', 'span', 'class="sr-only"')}</button><button type="button" class="chip" data-zoom="in">+${tx('lab.viewer.zoomIn', 'span', 'class="sr-only"')}</button>${tx('lab.viewer.reset', 'button', 'type="button" class="chip" data-reset')}</div>
    </div>` });
  const sy = LAB.synth;
  const synth = win({ code: 'LB-02', titleHtml: tx('lab.synth.title'), cls: 'lab-win', body: `${tx('lab.synth.text', 'p', 'class="muted"')}
    <div data-synth><p class="lab-fallback" data-fallback hidden>${tx('lab.synth.unsupported')}</p>
    <p class="lab-status" role="status"><span class="lab-led" aria-hidden="true"></span><span data-status>${tx('lab.synth.off')}</span></p>
    <div class="lab-ctls"><button type="button" class="btn" data-start>${tx('lab.synth.start')}</button>${tx('lab.synth.reset', 'button', 'type="button" class="btn btn-ghost" data-reset')}</div>
    <div class="ctl-grid">${range('synth', 'freq', sy.freq)}${range('synth', 'rate', sy.rate)}${range('synth', 'depth', sy.depth)}${range('synth', 'volume', sy.volume)}
    <label class="ctl">${tx('lab.synth.wave')}<select data-param="wave">${['sine', 'triangle', 'sawtooth'].map((w) => `<option value="${w}"${w === sy.wave ? ' selected' : ''} data-i18n="lab.synth.${w}">${t(`lab.synth.${w}`)}</option>`).join('')}</select></label></div></div>` });
  const sh = LAB.shader;
  const shader = win({ code: 'LB-03', titleHtml: tx('lab.shader.title'), cls: 'lab-win', body: `${tx('lab.shader.text', 'p', 'class="muted"')}
    <div class="viewer" data-shader><canvas class="lab-canvas" width="480" height="300" role="img" ${ta('aria-label', 'lab.shader.aria')}></canvas><p class="lab-fallback" data-fallback hidden>${tx('lab.shader.fallback')}</p></div>
    <p class="muted lab-paused" data-paused hidden role="status">${tx('lab.shader.paused')}</p>
    <div class="lab-ctls"><button type="button" class="btn" data-play aria-pressed="true">${tx('lab.shader.pause')}</button>${tx('lab.shader.reset', 'button', 'type="button" class="btn btn-ghost" data-reset')}</div>
    <div class="ctl-grid">${range('shader', 'freq', sh.freq)}${range('shader', 'chaos', sh.chaos)}${range('shader', 'speed', sh.speed)}
    <label class="ctl">${tx('lab.shader.palette')}<select data-param="palette">${['green', 'crimson', 'paper'].map((w) => `<option value="${w}"${w === sh.palette ? ' selected' : ''} data-i18n="lab.shader.${w}">${t(`lab.shader.${w}`)}</option>`).join('')}</select></label></div>` });
  const hs = LAB.hotspots;
  const hot = win({ code: 'LB-04', titleHtml: tx('lab.hot.title'), cls: 'lab-win', body: `${tx('lab.hot.text', 'p', 'class="muted"')}
    <div class="hot-grid" data-hot>
      <figure class="hot-fig">${img(hs.image, { tone: 'paper', altKey: 'lab.hot.imageAlt', sizes: '(min-width: 900px) 40vw, 100vw' })}${hs.points.map((pt) => `<button type="button" class="hot-pt" style="--x:${pt.x}%;--y:${pt.y}%" data-pt="${pt.id}" aria-pressed="false" ${bia('aria-label', (L) => `${L('lab.hot.point')} ${pt.id}: ${L(`lab.hot.${pt.id}.title`)}`)}>${pt.id}</button>`).join('')}${hs.image.provisional && SP ? `<figcaption>${flag('flag.provisional')}</figcaption>` : ''}</figure>
      <div class="hot-panel" aria-live="polite"><p class="eco-idle" data-idle>${tx('lab.hot.idle')}</p>${hs.points.map((pt) => `<div class="hot-card" data-card="${pt.id}" hidden>${tx(`lab.hot.${pt.id}.title`, 'h3')}${tx(`lab.hot.${pt.id}.text`, 'p')}<p>${flag('lab.hot.noteFlag')}</p></div>`).join('')}</div>
    </div>` });
  const body = `
<section class="wrap page-head reveal">${tx('lab.h1', 'h1', 'class="h-display"')}${tx('lab.lede', 'p', 'class="lede muted"')}
<p class="notice" role="note"><strong>${tx('lab.noticeStrong')}</strong> ${tx('lab.notice')}</p>
<nav class="jumps" ${ta('aria-label', 'lab.toc')}><a href="#viewer">${tx('lab.viewer.title')}</a><a href="#synth">${tx('lab.synth.title')}</a><a href="#shader">${tx('lab.shader.title')}</a><a href="#process">${tx('lab.hot.title')}</a></nav></section>
<div class="wrap lab-grid">
  <section id="viewer" class="reveal">${viewer}</section>
  <section id="synth" class="reveal">${synth}</section>
  <section id="shader" class="reveal">${shader}</section>
  <section id="process" class="reveal">${hot}</section>
</div>`;
  write('lab.html', { title: (L) => L('meta.lab.title'), desc: (L) => L('meta.lab.desc'), nav: 'lab', body, cls: 'page-lab', scripts: ['js/lab.js'] });
}

/* ===================== 404 + sitemap ===================== */
setRoot('404.html');
write('404.html', { title: (L) => L('meta.notfound.title'), desc: (L) => L('meta.notfound.desc'), body: `<section class="wrap page-head">${tx('nf.h1', 'h1', 'class="h-display"')}${tx('nf.lede', 'p', 'class="lede muted"')}<p>${tx('nf.back', 'a', `class="btn btn-primary" href="${u('index.html')}"`)}</p></section>`, noindex: true });
if (S.siteUrl) out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.filter((f) => f !== '404.html').map((f) => `<url><loc>${S.siteUrl.replace(/\/$/, '')}/${f === 'index.html' ? '' : f}</loc></url>`).join('\n')}\n</urlset>\n`);
