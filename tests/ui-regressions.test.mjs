import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const graph = fs.readFileSync(path.join(root, 'components/graph-view.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');
const styles = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');

test('DAG wheel gesture zooms rather than panning the viewport away', () => {
  assert.match(graph, /zoomOnScroll(?:=\{true\})?/);
  assert.doesNotMatch(graph, /\bpanOnScroll(?:\s|\s*=\s*\{true\})/);
});

test('DAG keeps all 22 nodes mounted even when exploring a zoomed viewport', () => {
  assert.doesNotMatch(graph, /\bonlyRenderVisibleElements\b/);
});

test('DAG offers an explicit fit-to-screen recovery control', () => {
  assert.match(graph, /aria-label="Hiện toàn bộ sơ đồ"/);
  assert.match(graph, /\.fitView\(/);
});

test('all Vietnamese UI text uses self-hosted Montserrat latin and vietnamese subsets', () => {
  assert.match(layout, /import\s*\{\s*Montserrat\s*\}\s*from\s*["']next\/font\/google["']/);
  assert.match(layout, /subsets:\s*\[\s*["']latin["']\s*,\s*["']vietnamese["']\s*\]/);
  assert.match(styles, /font-family:\s*var\(--font-montserrat\)/);
  assert.doesNotMatch(styles, /DM Sans|Space Grotesk|fonts\.googleapis\.com/);
});
