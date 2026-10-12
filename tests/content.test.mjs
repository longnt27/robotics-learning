import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const base = path.resolve(import.meta.dirname, '..');
const source = fs.readFileSync(path.join(base, 'lib/papers.ts'), 'utf8');
const slugs = [...source.matchAll(/\bslug:\s*"([^"]+)"/g)].map(x => x[1]);
const userPickCount = (source.match(/userPick:\s*true/g) ?? []).length;
assert.equal(slugs.length, 22, 'Expected 22 unique paper entries');
assert.equal(new Set(slugs).size, 22, 'Duplicate paper slugs');
assert.equal(userPickCount, 6, 'Expected six user-supplied, highlighted papers');
assert.equal(slugs.filter(x => x === 'libero').length, 1, 'LIBERO should not be duplicated');
for (const slug of slugs) {
  const file = path.join(base, `content/papers/${slug}.md`);
  assert.ok(fs.existsSync(file), `Missing Vietnamese chapter for ${slug}`);
  const text = fs.readFileSync(file, 'utf8');
  for (const section of ['Why', 'How', 'Results', 'Limitations', 'Connections']) {
    assert.ok(text.includes(`## ${section}`), `${slug}: missing section ${section}`);
  }
  assert.ok(text.length > 1900, `${slug}: chapter too short (${text.length})`);
}
const relationSource = fs.readFileSync(path.join(base, 'lib/relations.ts'), 'utf8');
const edges = [...relationSource.matchAll(/from:\s*"([^"]+)",\s*to:\s*"([^"]+)"/g)];
assert.ok(edges.length >= 20, 'Expected at least 20 directed paper links');
for (const [_, from, to] of edges) {
  assert.ok(slugs.includes(from), `Unknown edge source ${from}`);
  assert.ok(slugs.includes(to), `Unknown edge target ${to}`);
  assert.notEqual(from, to, 'Self-loop not allowed');
}
console.log(`PASS: ${slugs.length} papers, ${userPickCount} highlighted, ${edges.length} valid relations`);
