// CONTEXTO COMPARTIDO: lee config.json, data/*.json y content/*.json una sola vez
// y ofrece pequeñas utilidades que usan todos los demás archivos de src/.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(DIR, rel), 'utf8'));
export const out = (rel, txt) => {
  const file = path.join(DIR, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, txt);
};

// Ajustes globales (correo, redes, idioma por defecto, efectos)
export const S = readJson('config.json');
export const SP = !!S.showPlaceholders;            // ¿mostrar etiquetas de «marcador»?
export const LANGS = S.languages;                  // ['es', 'en']
export const DEFAULT_LANG = S.defaultLanguage;     // 'es'

// Datos (estructura, imágenes, fechas: SIN textos traducibles)
export const P = readJson('data/projects.json').projects;
export const X = readJson('data/explorations.json').entries;
export const N = readJson('data/notes.json').notes;
export const SH = readJson('data/products.json');
export const AB = readJson('data/about.json');
export const ECO = readJson('data/ecosystem.json');
export const LAB = readJson('data/lab.json');

// Textos traducidos (un diccionario por idioma)
export const CONTENT = Object.fromEntries(LANGS.map((l) => [l, readJson(`content/${l}.json`)]));

// Rutas relativas: cada página sabe cuántas carpetas debe «subir» para llegar a css/, js/ y assets/.
export const state = { root: '' };
export const u = (p) => state.root + p;
export const setRoot = (file) => { state.root = '../'.repeat(file.split('/').length - 1); };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const hrefOf = (p) => p.href || `projects/${p.slug}.html`;
export const pages = [];   // lista de páginas escritas (para el informe y el sitemap)
