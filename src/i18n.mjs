// TRADUCCIONES. Todo texto visible se pide con una «clave» (por ejemplo "home.cta1").
// El HTML se escribe en español (idioma por defecto) y cada elemento lleva data-i18n="clave";
// js/main.js lo cambia al idioma elegido usando js/dictionary.js (generado aquí).
import { CONTENT, LANGS, DEFAULT_LANG, esc, out } from './context.mjs';

const get = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
const used = new Set();          // claves realmente usadas en las páginas
const auto = new Map();          // textos compuestos (título + subtítulo, etc.)
export const missing = Object.fromEntries(LANGS.map((l) => [l, new Set()]));

export const has = (key) => get(CONTENT[DEFAULT_LANG], key) !== undefined;
export const len = (key) => { const v = get(CONTENT[DEFAULT_LANG], key); return Array.isArray(v) ? v.length : 0; };

// Texto en un idioma concreto (si falta, se usa el idioma por defecto y se anota en el informe)
export function T(lang, key) {
  let v = get(CONTENT[lang], key);
  if (v === undefined) {
    missing[lang].add(key);
    v = get(CONTENT[DEFAULT_LANG], key);
    if (v === undefined) return `[[${key}]]`;
  }
  return v;
}
export function text(key) {
  used.add(key);
  for (const l of LANGS) if (get(CONTENT[l], key) === undefined) missing[l].add(key);
  const v = get(CONTENT[DEFAULT_LANG], key);
  return v === undefined ? `[[${key}]]` : v;
}
export const t = (key) => esc(text(key));

// <span data-i18n="clave">texto</span>  (o la etiqueta que se pida)
export const tx = (key, tag = 'span', attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-i18n="${key}">${t(key)}</${tag}>`;
// atributos traducibles: alt="…" aria-label="…" title="…" content="…"
export const tas = (map) => Object.entries(map).map(([a, k]) => `${a}="${t(k)}"`).join(' ') + ` data-i18n-attr="${Object.entries(map).map(([a, k]) => `${a}:${k}`).join(';')}"`;
export const ta = (attr, key) => tas({ [attr]: key });

// Textos compuestos con partes de distinto idioma: bi((L) => `${L('a')} — ${L('b')}`)
export function bi(fn) {
  const es = fn((k) => T(DEFAULT_LANG, k));
  const alt = Object.fromEntries(LANGS.map((l) => [l, fn((k) => T(l, k))]));
  const id = LANGS.map((l) => alt[l]).join('␟');
  if (!auto.has(id)) auto.set(id, { key: `auto.${auto.size + 1}`, values: alt });
  return { key: auto.get(id).key, es };
}
export const bix = (fn, tag = 'span', attrs = '') => { const b = bi(fn); return `<${tag}${attrs ? ' ' + attrs : ''} data-i18n="${b.key}">${esc(b.es)}</${tag}>`; };
export const bia = (attr, fn) => { const b = bi(fn); return `${attr}="${esc(b.es)}" data-i18n-attr="${attr}:${b.key}"`; };

// Valores escritos en data/*.json: texto simple (igual en ambos idiomas) o { "es": "…", "en": "…" }
export function val(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'string') return esc(v);
  const values = Object.fromEntries(LANGS.map((l) => [l, v[l] ?? v[DEFAULT_LANG]]));
  const id = LANGS.map((l) => values[l]).join('␟');
  if (!auto.has(id)) auto.set(id, { key: `auto.${auto.size + 1}`, values });
  return `<span data-i18n="${auto.get(id).key}">${esc(values[DEFAULT_LANG])}</span>`;
}

// Cadena para el buscador: texto de TODOS los idiomas, en minúsculas
export const searchText = (...keys) => keys.flatMap((k) => LANGS.map((l) => T(l, k))).join(' ').toLowerCase();

// Escribe js/dictionary.js con las claves usadas (+ las que usa el JavaScript)
const FORCED = ['ui.motionOn', 'ui.motionReduced', 'flag.translation', 'lab.synth.on', 'lab.synth.off', 'lab.synth.start', 'lab.synth.stop', 'lab.shader.play', 'lab.shader.pause'];   // textos que cambia el JavaScript
export function writeDictionary() {
  FORCED.forEach(text);
  const dict = Object.fromEntries(LANGS.map((l) => [l, {}]));
  for (const key of used) for (const l of LANGS) { const v = get(CONTENT[l], key); if (v !== undefined && v !== null) dict[l][key] = v; }
  for (const { key, values } of auto.values()) for (const l of LANGS) if (values[l]) dict[l][key] = values[l];
  out('js/dictionary.js', `/* GENERADO por build.mjs. No lo edites: edita content/*.json y vuelve a ejecutar «node build.mjs». */\nwindow.JORGE_I18N = ${JSON.stringify(dict)};\n`);
  return Object.fromEntries(LANGS.map((l) => [l, Object.keys(dict[l]).length]));
}
