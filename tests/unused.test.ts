import { describe, it, expect } from 'vitest';
import { findUnusedSelectors } from 'cssgrep/core/unused.js';
import { scanFiles } from 'cssgrep/core/scanner.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

async function loadFixtures() {
  const cssFiles = await scanFiles('*.css', FIXTURES);
  const htmlFiles = await scanFiles('*.html', FIXTURES);
  return { cssFiles, htmlFiles };
}

describe('findUnusedSelectors', () => {
  it('identifies unused class selectors', async () => {
    const { cssFiles, htmlFiles } = await loadFixtures();
    const results = findUnusedSelectors(cssFiles, htmlFiles);
    const selectors = results.map((r) => r.selector);
    expect(selectors).toContain('.btn-large');
    expect(selectors).toContain('.sidebar .menu-item');
  });

  it('does not flag used selectors', async () => {
    const { cssFiles, htmlFiles } = await loadFixtures();
    const results = findUnusedSelectors(cssFiles, htmlFiles);
    const selectors = results.map((r) => r.selector);
    expect(selectors).not.toContain('.btn');
    expect(selectors).not.toContain('#header');
    expect(selectors).not.toContain('.hero-banner');
    expect(selectors).not.toContain('ul > li > a');
    expect(selectors).not.toContain('input[type="text"]');
  });

  it('returns file paths and line numbers', async () => {
    const { cssFiles, htmlFiles } = await loadFixtures();
    const results = findUnusedSelectors(cssFiles, htmlFiles);
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.filePath).toBeTruthy();
      expect(r.line).toBeGreaterThan(0);
    }
  });
});
