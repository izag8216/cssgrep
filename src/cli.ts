import { Command } from 'commander';
import { scanFiles } from './core/scanner.js';
import { findUnusedSelectors } from './core/unused.js';
import { extractColors } from './core/colors.js';
import { analyzeSpecificity } from './core/specificity.js';
import { formatUnused, formatColors, formatSpecificity } from './utils/formatter.js';
import { OutputFormat } from './types.js';

const program = new Command();

program
  .name('cssgrep')
  .description('CSS-aware search tool: find unused selectors, extract colors, audit specificity')
  .version('0.1.0');

program
  .command('unused')
  .description('Find CSS selectors not used in HTML files')
  .option('-c, --css <pattern>', 'CSS file glob pattern', '**/*.css')
  .option('-h, --html <pattern>', 'HTML file glob pattern', '**/*.html')
  .option('-f, --format <format>', 'Output format: table, json, pretty', 'pretty')
  .action(async (options: { css: string; html: string; format: string }) => {
    const format = options.format as OutputFormat;
    const cssFiles = await scanFiles(options.css);
    const htmlFiles = await scanFiles(options.html);
    if (cssFiles.length === 0) {
      console.error('No CSS files found matching pattern: ' + options.css);
      process.exit(1);
    }
    const results = findUnusedSelectors(cssFiles, htmlFiles);
    console.log(formatUnused(results, format));
    process.exit(results.length > 0 ? 1 : 0);
  });

program
  .command('colors [pattern]')
  .description('Extract and catalog all colors used in CSS files')
  .option('-f, --format <format>', 'Color format: hex, rgb, hsl', 'hex')
  .option('-o, --output <output>', 'Output view: list, palette, stats', 'list')
  .option('--include-keywords', 'Include CSS keyword colors (inherit, initial, etc.)', false)
  .option('-v, --verbose', 'Show file and line for each occurrence', false)
  .option('--fmt <fmt>', 'Output format: table, json, pretty', 'pretty')
  .action(async (pattern: string, options: { format: string; output: string; includeKeywords: boolean; verbose: boolean; fmt: string }) => {
    const targetPattern = pattern || '**/*.css';
    const cssFiles = await scanFiles(targetPattern);
    if (cssFiles.length === 0) {
      console.error('No CSS files found matching pattern: ' + targetPattern);
      process.exit(1);
    }
    const results = extractColors(cssFiles, {
      colorFormat: options.format as 'hex' | 'rgb' | 'hsl',
      includeKeywords: options.includeKeywords
    });
    console.log(formatColors(results, options.fmt as OutputFormat, {
      output: options.output as 'list' | 'palette' | 'stats',
      verbose: options.verbose
    }));
    process.exit(0);
  });

program
  .command('specificity [pattern]')
  .description('Audit selector specificity and flag overly complex selectors')
  .option('-t, --threshold <threshold>', 'Specificity threshold (a,b,c)', '2,4,5')
  .option('-s, --sort <sort>', 'Sort order: asc, desc', 'desc')
  .option('-f, --format <format>', 'Output format: table, json, pretty', 'pretty')
  .action(async (pattern: string, options: { threshold: string; sort: string; format: string }) => {
    const targetPattern = pattern || '**/*.css';
    const cssFiles = await scanFiles(targetPattern);
    if (cssFiles.length === 0) {
      console.error('No CSS files found matching pattern: ' + targetPattern);
      process.exit(1);
    }
    const thresholdParts = options.threshold.split(',').map((s) => parseInt(s.trim(), 10));
    const threshold: [number, number, number] = [
      thresholdParts[0] ?? 2,
      thresholdParts[1] ?? 4,
      thresholdParts[2] ?? 5
    ];
    let results = analyzeSpecificity(cssFiles, threshold);
    if (options.sort === 'asc') {
      results.sort((a, b) => a.score - b.score);
    } else {
      results.sort((a, b) => b.score - a.score);
    }
    console.log(formatSpecificity(results, options.format as OutputFormat));
    process.exit(results.length > 0 ? 1 : 0);
  });

export function cli(): void {
  program.parse();
}
