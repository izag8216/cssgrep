import { describe, it, expect } from 'vitest';
import { extractColors } from 'cssgrep/core/colors.js';
import { scanFiles } from 'cssgrep/core/scanner.js';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(__dirname, 'fixtures');

describe('extractColors', () => {
  it('extracts colors from CSS files', async () => {
    const cssFiles = await scanFiles('*.css', FIXTURES);
    const results = extractColors(cssFiles, { colorFormat: 'hex', includeKeywords: false });
    const normalized = results.map((r) => r.normalized);
    expect(normalized).toContain('#333333');
    expect(normalized).toContain('#666666');
    expect(normalized).toContain('#cccccc');
  });

  it('normalizes colors to requested format', async () => {
    const cssFiles = await scanFiles('*.css', FIXTURES);
    const hexResults = extractColors(cssFiles, { colorFormat: 'hex', includeKeywords: false });
    const rgbResults = extractColors(cssFiles, { colorFormat: 'rgb', includeKeywords: false });
    expect(hexResults.length).toBeGreaterThan(0);
    expect(rgbResults.length).toBeGreaterThan(0);
    expect(rgbResults[0].normalized.startsWith('rgb')).toBe(true);
  });

  it('counts occurrences', async () => {
    const cssFiles = await scanFiles('*.css', FIXTURES);
    const results = extractColors(cssFiles, { colorFormat: 'hex', includeKeywords: false });
    for (const r of results) {
      expect(r.occurrences).toBeGreaterThanOrEqual(1);
      expect(r.sources.length).toBe(r.occurrences);
    }
  });
});
