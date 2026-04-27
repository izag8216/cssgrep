import { load } from 'cheerio';
import selectorParser from 'postcss-selector-parser';
import { FileMatch, UnusedResult } from '../types.js';
import { parseCSS } from './parser.js';

export function findUnusedSelectors(cssFiles: FileMatch[], htmlFiles: FileMatch[]): UnusedResult[] {
  // Build HTML element index: set of all classes, ids, tags present in HTML
  const htmlClasses = new Set<string>();
  const htmlIds = new Set<string>();
  const htmlTags = new Set<string>();

  for (const html of htmlFiles) {
    const $ = load(html.content);
    $('*').each((_, el) => {
      const elem = el as { tagName?: string };
      const tagName = elem.tagName?.toLowerCase();
      if (tagName) htmlTags.add(tagName);
      const classAttr = $(el).attr('class');
      if (classAttr) {
        classAttr.split(/\s+/).forEach((c) => htmlClasses.add(c.trim()));
      }
      const idAttr = $(el).attr('id');
      if (idAttr) htmlIds.add(idAttr.trim());
    });
  }

  const results: UnusedResult[] = [];

  for (const css of cssFiles) {
    const { selectors } = parseCSS(css);
    for (const selInfo of selectors) {
      const selector = selInfo.selector;
      // Use postcss-selector-parser to tokenize and analyze selector parts
      let hasMatch = false;
      try {
        const parsed = selectorParser().astSync(selector);
        // Walk each simple selector and check if at least one part exists in HTML
        parsed.walk((node) => {
          if (hasMatch) return;
          if (node.type === 'class') {
            if (htmlClasses.has(node.value)) hasMatch = true;
          } else if (node.type === 'id') {
            if (htmlIds.has(node.value)) hasMatch = true;
          } else if (node.type === 'tag') {
            if (htmlTags.has(node.value.toLowerCase())) hasMatch = true;
          } else if (node.type === 'universal') {
            hasMatch = true; // * always matches
          } else if (node.type === 'attribute') {
            // For attribute selectors, we conservatively consider them matched
            // since we don't index all attributes
            hasMatch = true;
          } else if (node.type === 'pseudo') {
            // Pseudo-classes/elements: conservatively match common ones
            const pseudoName = node.value.replace(/^:+/, '');
            const commonPseudos = [
              'hover','focus','active','visited','link','first-child','last-child',
              'nth-child','before','after','not','is','where','has','root','empty'
            ];
            if (commonPseudos.includes(pseudoName)) hasMatch = true;
          }
        });
      } catch {
        // If parser fails, conservatively consider it used
        hasMatch = true;
      }

      if (!hasMatch) {
        results.push({
          filePath: css.filePath,
          selector: selector,
          line: selInfo.line,
          column: selInfo.column
        });
      }
    }
  }

  return results;
}
