// LAYOUT COMÚN: <head>, cabecera con navegación y selector de idioma, pie de página.
import { S, SP, LANGS, DEFAULT_LANG, u, esc, setRoot, state, pages, out } from './context.mjs';
import { tx, ta, bi, bix, bia } from './i18n.mjs';
import { socialList, mailLink, flag } from './components.mjs';

const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=JetBrains+Mono:wght@400;500&family=Instrument+Sans:wght@400;500;600&family=Syne:wght@600;700;800&family=Cormorant+Garamond:ital,wght@0,500;1,400;1,500&display=swap';

// Aviso si la página se abre sin sus carpetas css/ js/ assets/ (aparece solo si fallan los estilos)
const STYLE_WARNING = `<script>(function(){try{if(getComputedStyle(document.documentElement).getPropertyValue('--green').trim())return}catch(e){}document.addEventListener('DOMContentLoaded',function(){var d=document.createElement('div');d.setAttribute('role','alert');d.style.cssText='font:16px/1.5 system-ui,sans-serif;background:#fff3cd;color:#3b2f00;padding:14px 18px;border-bottom:3px solid #b8860b';d.innerHTML='<strong>No se cargaron los estilos / The page styles did not load.</strong><br>Extrae todo el ZIP y abre index.html desde la carpeta extraída, o ejecuta <code>node tools/serve.mjs</code> y visita http://localhost:4173/ · Extract the whole ZIP and open index.html from the extracted folder, or run <code>node tools/serve.mjs</code>.';document.body.insertBefore(d,document.body.firstChild)})})()</script>`;
const ROUGH = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/></filter></svg>`;

// Se ejecuta ANTES de pintar: decide el idioma (?lang=en > localStorage > idioma por defecto) y el movimiento reducido.
const EARLY = `<script>document.documentElement.classList.add('js');(function(){var d=document.documentElement,langs=${JSON.stringify(LANGS)},l='${DEFAULT_LANG}';try{var m=/[?&]lang=([a-z]{2})/.exec(location.search);if(m&&langs.indexOf(m[1])>-1){l=m[1];try{localStorage.setItem('lang',l)}catch(e){}}else{var s=localStorage.getItem('lang');if(s&&langs.indexOf(s)>-1)l=s}}catch(e){}d.lang=l;d.dataset.lang=l;if(l!=='${DEFAULT_LANG}'){d.classList.add('i18n-pending');setTimeout(function(){d.classList.remove('i18n-pending')},1500)}var r=matchMedia('(prefers-reduced-motion: reduce)').matches;try{var mo=localStorage.getItem('motion');if(mo==='reduced'||(mo===null&&r))d.dataset.motion='reduced'}catch(e){if(r)d.dataset.motion='reduced'}})()</script>`;

const langSwitch = () => `<div class="lang" role="group" ${ta('aria-label', 'ui.langLabel')}>${LANGS.map((l) => `<button type="button" class="lang-btn" data-lang="${l}" lang="${l}" aria-pressed="${l === DEFAULT_LANG}" title="${l === 'es' ? 'Español' : 'English'}">${l.toUpperCase()}</button>`).join('')}</div>`;

export function layout({ file, title, desc = null, nav = '', theme = 'dark', body, vars = '', cls = '', noindex = false, ld = '', scripts = [] }) {
  state.root = '../'.repeat(file.split('/').length - 1);
  // título y descripción: funciones (L) => texto, para que existan en ambos idiomas
  const fullTitle = (L) => (file === 'index.html' ? title(L) : `${title(L)} — ${S.name}`);
  const descFn = desc || ((L) => L('site.description'));
  const tt = bi(fullTitle), dd = bi(descFn);
  const url = S.siteUrl ? S.siteUrl.replace(/\/$/, '') + '/' + (file === 'index.html' ? '' : file) : null;
  pages.push(file);
  return `<!doctype html>
<html lang="${DEFAULT_LANG}" class="theme-${theme}">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title data-i18n="${tt.key}">${esc(tt.es)}</title>
<meta name="description" content="${esc(dd.es)}" data-i18n-attr="content:${dd.key}">
<meta name="theme-color" content="#07100a">
${noindex ? '<meta name="robots" content="noindex">' : ''}${url ? `<link rel="canonical" href="${url}">` : ''}
<meta property="og:site_name" content="${esc(S.name)}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(tt.es)}" data-i18n-attr="content:${tt.key}"><meta property="og:description" content="${esc(dd.es)}" data-i18n-attr="content:${dd.key}">${url ? `<meta property="og:url" content="${url}"><meta property="og:image" content="${S.siteUrl.replace(/\/$/, '')}/assets/og.png">` : ''}
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${u('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="${u('css/style.css')}">
${STYLE_WARNING}
${EARLY}
${ld}
</head>
<body class="${cls}" style="${vars}" data-fx="${Object.entries(S.effects).filter(([k, v]) => v === true && k[0] !== '_').map(([k]) => k).join(' ')}">
${ROUGH}
<div class="reticle" id="reticle" aria-hidden="true" hidden><span class="reticle-ring"></span><span class="reticle-xy"></span></div>
${tx('ui.skip', 'a', 'class="skip" href="#main"')}
<header class="site-header" data-header>
  <div class="wrap bar">
    <a class="wordmark" href="${u('index.html')}" ${bia('aria-label', (L) => `${S.name} — ${L('ui.home')}`)}>${esc(S.name)}</a>
    <nav id="site-nav" class="site-nav" ${ta('aria-label', 'nav.aria')}><ul>${S.nav.map((n) => `<li><a href="${u(n.href)}"${n.id === nav ? ' aria-current="page"' : ''}>${tx(`nav.${n.id}`)}</a></li>`).join('')}</ul>${tx('nav.contact', 'a', `class="btn btn-small" href="${u('about.html#contact')}"`)}</nav>
    ${langSwitch()}
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">${tx('ui.menu', 'span', 'class="sr-only"')}<span class="bars" aria-hidden="true"></span></button>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer site-footer--compact">
  <div class="wrap foot-row">
    <div class="foot-id"><p class="foot-mark">${esc(S.name)}</p><p class="foot-mail">${S.email ? mailLink() : tx('empty.emailShort', 'span', 'class="is-unset"')}</p></div>
    <nav class="foot-links" ${ta('aria-label', 'ui.footElsewhere')}>${socialList('foot-socials', { onlySet: true })}</nav>
    <div class="foot-copy"><p>© <span data-year>2026</span> ${esc(S.legalName || S.name)}</p><p><button type="button" class="linklike" data-motion-toggle aria-pressed="false">${tx('ui.motionOn')}</button></p></div>
  </div>
</footer>
<script src="${u('js/dictionary.js')}" defer></script>
<script src="${u('js/main.js')}" defer></script>
${scripts.map((f) => `<script src="${u(f)}" defer></script>`).join('\n')}
</body>
</html>
`;
}
export const write = (file, opts) => out(file, layout({ file, ...opts }));
