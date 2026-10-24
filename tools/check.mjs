// Link checker: every local href/src must exist, every #anchor must exist on its target page.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.name === 'node_modules' || e.name.startsWith('.') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const htmls = walk(root).filter((f) => f.endsWith('.html')); let bad = 0, n = 0;
const ids = (f) => new Set([...fs.readFileSync(f, 'utf8').matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
for (const f of htmls) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const v = m[1]; if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(v)) continue; n++;
    const [p, hash] = v.split('#'); const target = p ? path.resolve(path.dirname(f), p) : f;
    if (!fs.existsSync(target)) { bad++; console.log(`MISSING  ${path.relative(root, f)} -> ${v}`); continue; }
    if (hash && target.endsWith('.html') && !ids(target).has(hash)) { bad++; console.log(`NO ANCHOR ${path.relative(root, f)} -> ${v}`); }
  }
}
console.log(`${htmls.length} pages, ${n} local references checked, ${bad} problems.`); process.exit(bad ? 1 : 0);
