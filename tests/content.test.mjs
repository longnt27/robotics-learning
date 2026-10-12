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
  for (const section of ['Vì sao cần nghiên cứu này?', 'Phương pháp thực hiện', 'Kết quả thực nghiệm', 'Hạn chế và câu hỏi còn mở', 'Liên hệ với nghiên cứu khác']) {
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

// Localization regression: user-facing prose is Vietnamese, paper titles remain original.
const forbiddenHeadings = ['## Why', '## How', '## Results', '## Limitations', '## Connections'];
for (const slug of slugs) {
  const body = fs.readFileSync(path.join(base, `content/papers/${slug}.md`), 'utf8');
  for (const heading of forbiddenHeadings) assert.ok(!body.includes(heading + '\n'), `${slug}: untranslated heading ${heading}`);
}
const subtitles = [...source.matchAll(/subtitle:\s*"([^"]+)"/g)].map(x => x[1]);
assert.equal(subtitles.length, 22);
for (const sentence of subtitles) assert.match(sentence, /[À-ỹ]/u, `English subtitle: ${sentence}`);
for (const [name, banned] of Object.entries({
  'components/atlas-shell.tsx': ['AN INTERACTIVE MAP OF EMBODIED INTELLIGENCE','Read less blindly.','THE RESEARCH UNIVERSE'],
  'components/paper-reader.tsx': ['Go to the source.','Original <em>paper</em>', 'ON THIS PAGE'],
  'components/graph-view.tsx': ['Ideas are never isolated.','CONNECTION INTELLIGENCE'],
})) {
  const ui = fs.readFileSync(path.join(base, name), 'utf8');
  for (const phrase of banned) assert.ok(!ui.includes(phrase), `${name}: untranslated UI text ${phrase}`);
}
console.log('PASS: Vietnamese UI, 22 Vietnamese summaries and 22 localized chapters');
