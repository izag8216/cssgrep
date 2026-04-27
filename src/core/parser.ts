import { Root, Rule, AtRule, Declaration } from 'postcss';
import safeParser from 'postcss-safe-parser';
import { FileMatch, SelectorInfo } from '../types.js';

export interface ParsedCss {
  root: Root;
  warnings: string[];
  selectors: SelectorInfo[];
}

export function parseCSS(file: FileMatch): ParsedCss {
  const warnings: string[] = [];
  const result = safeParser(file.content, { from: file.filePath }) as Root;

  const selectors: SelectorInfo[] = [];

  result.walk((node) => {
    if (node.type === 'rule') {
      const rule = node as Rule;
      rule.selectors.forEach((sel) => {
        selectors.push({
          selector: sel.trim(),
          line: node.source?.start?.line ?? 0,
          column: node.source?.start?.column ?? 0
        });
      });
    }
  });

  // Collect parse warnings from safe-parser (if any malformed rules)
  result.walkDecls((decl: Declaration) => {
    if (decl.value.includes('�')) {
      warnings.push(`Potentially malformed declaration at ${file.filePath}:${decl.source?.start?.line ?? 0}`);
    }
  });

  return { root: result, warnings, selectors };
}

export function isNonSelectorRule(node: AtRule): boolean {
  const nonSelectors = ['keyframes', 'font-face', 'charset', 'import', 'namespace', 'supports', 'media'];
  return nonSelectors.includes(node.name);
}
