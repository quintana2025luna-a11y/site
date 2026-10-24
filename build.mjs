// GENERADOR DEL SITIO — punto de entrada.
// Uso:  node build.mjs
// Lee config.json, data/*.json y content/*.json, y escribe los archivos .html y js/dictionary.js.
// El código está repartido en src/: context (datos), i18n (traducciones), components (piezas), layout (cabecera/pie), pages (páginas).
import { pages, LANGS } from './src/context.mjs';
import { writePlaceholders } from './src/components.mjs';
import { writeDictionary, missing } from './src/i18n.mjs';
import './src/pages.mjs';

writePlaceholders();
const counts = writeDictionary();
console.log(`Páginas generadas (${pages.length}): ${pages.join(', ')}`);
console.log('Claves por idioma en js/dictionary.js:', counts);
let problems = 0;
for (const l of LANGS) {
  if (missing[l].size) { problems++; console.log(`\n⚠ Faltan ${missing[l].size} traducciones en content/${l}.json:\n  ` + [...missing[l]].sort().join('\n  ')); }
}
if (problems) process.exitCode = 1;
