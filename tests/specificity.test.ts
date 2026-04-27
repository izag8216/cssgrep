import { describe, it, expect } from 'vitest';
import { analyzeSpecificity } from 'cssgrep/core/specificity.js';
import { scanFiles } from 'cssgrep/core/scanner.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

describe('analyzeSpecificity', () => {
  it('calculates specificity correctly', async () => {
    const cssFiles = await scanFiles('*.css', FIXTURES);
    const results = analyzeSpecificity(cssFiles, [0, 0, 0]);
    const bySelector = new Map(results.map((r) => [r.selector, r.specificity]));
    expect(bySelector.get('#header')).toEqual([1, 0, 0]);
    expect(bySelector.get('.sidebar .menu-item')).toEqual([0, 2, 0]);
    expect(bySelector.get('ul > li > a')).toEqual([0, 0, 3]);
  });

  it('filters by threshold', async () => {
    const cssFiles = await scanFiles('*.css', FIXTURES);
    const highThreshold = analyzeSpecificity(cssFiles, [2, 0, 0]);
    expect(highThreshold.length).toBe(0);
    const lowThreshold = analyzeSpecificity(cssFiles, [0, 0, 0]);
    expect(lowThreshold.length).toBeGreaterThan(0);
  });
});
