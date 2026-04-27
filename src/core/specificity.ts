import selectorParser from 'postcss-selector-parser';
import { FileMatch, SpecificityInfo } from '../types.js';
import { parseCSS } from './parser.js';

function calculateSpecificity(selector: string): [number, number, number] {
  let a = 0, b = 0, c = 0;
  try {
    const parsed = selectorParser().astSync(selector);
    parsed.walk((node) => {
      if (node.type === 'id') {
        a += 1;
      } else if (node.type === 'class' || node.type === 'attribute') {
        b += 1;
      } else if (node.type === 'pseudo') {
        const name = node.value.replace(/^:+/, '');
        // :is() and :not() specificity = most specific argument
        if (name === 'is' || name === 'not' || name === 'has') {
          if (node.nodes && node.nodes.length > 0) {
            let maxSpec: [number, number, number] = [0, 0, 0];
            node.nodes.forEach((child) => {
              if (child.type === 'selector') {
                const childSpec = calculateSpecificity(child.toString());
                if (childSpec[0] > maxSpec[0] ||
                    (childSpec[0] === maxSpec[0] && childSpec[1] > maxSpec[1]) ||
                    (childSpec[0] === maxSpec[0] && childSpec[1] === maxSpec[1] && childSpec[2] > maxSpec[2])) {
                  maxSpec = childSpec;
                }
              }
            });
            a += maxSpec[0];
            b += maxSpec[1];
            c += maxSpec[2];
          }
        } else if (name === 'where') {
          // :where() always 0
        } else if (name === 'nth-child' || name === 'nth-last-child') {
          b += 1;
          // Also check for selector list inside
          if (node.nodes && node.nodes.length > 0) {
            node.nodes.forEach((child) => {
              if (child.type === 'selector') {
                const childSpec = calculateSpecificity(child.toString());
                a += childSpec[0];
                b += childSpec[1];
                c += childSpec[2];
              }
            });
          }
        } else {
          b += 1;
        }
      } else if (node.type === 'tag') {
        c += 1;
      }
    });
  } catch {
    // If parsing fails, return zero specificity
  }
  return [a, b, c];
}

export function analyzeSpecificity(cssFiles: FileMatch[], threshold: [number, number, number]): SpecificityInfo[] {
  const results: SpecificityInfo[] = [];

  for (const css of cssFiles) {
    const { selectors } = parseCSS(css);
    for (const selInfo of selectors) {
      const spec = calculateSpecificity(selInfo.selector);
      const score = spec[0] * 10000 + spec[1] * 100 + spec[2];
      const thresholdScore = threshold[0] * 10000 + threshold[1] * 100 + threshold[2];

      if (score > thresholdScore) {
        results.push({
          selector: selInfo.selector,
          specificity: spec,
          score,
          line: selInfo.line,
          filePath: css.filePath
        });
      }
    }
  }

  return results;
}
