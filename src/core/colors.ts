import { Declaration } from 'postcss';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import { FileMatch, ColorInfo } from '../types.js';
import { parseCSS } from './parser.js';

extend([namesPlugin]);

const COLOR_PROPS = [
  'color','background','background-color','border','border-color','border-top-color','border-right-color',
  'border-bottom-color','border-left-color','outline','outline-color','text-decoration-color',
  'caret-color','column-rule-color','fill','stroke','stop-color','flood-color',
  'lighting-color'
];

const KEYWORD_COLORS = new Set(['inherit','initial','unset','revert','currentColor','transparent']);

// Extract all potential color tokens from a CSS value string
function extractColorTokens(value: string): string[] {
  const tokens: string[] = [];

  // Hex colors: #fff, #ffffff
  const hexMatches = value.match(/#[0-9a-fA-F]{3,8}\b/g);
  if (hexMatches) tokens.push(...hexMatches);

  // rgb/rgba
  const rgbMatches = value.match(/rgba?\([^)]*\)/gi);
  if (rgbMatches) tokens.push(...rgbMatches);

  // hsl/hsla
  const hslMatches = value.match(/hsla?\([^)]*\)/gi);
  if (hslMatches) tokens.push(...hslMatches);

  // Named colors (basic check for alphabetic tokens that are valid colors)
  const wordMatches = value.match(/\b[a-zA-Z]+\b/g);
  if (wordMatches) {
    for (const word of wordMatches) {
      const lower = word.toLowerCase();
      if (KEYWORD_COLORS.has(lower)) {
        tokens.push(lower);
      } else {
        const test = colord(lower);
        if (test.isValid()) tokens.push(lower);
      }
    }
  }

  return tokens;
}

export function extractColors(cssFiles: FileMatch[], options: {
  colorFormat: 'hex' | 'rgb' | 'hsl';
  includeKeywords: boolean;
}): ColorInfo[] {
  const colorMap = new Map<string, { normalized: string; sources: Array<{ filePath: string; line: number }> }>();

  for (const css of cssFiles) {
    const { root } = parseCSS(css);
    root.walkDecls((decl: Declaration) => {
      if (!COLOR_PROPS.includes(decl.prop)) return;
      const rawValue = decl.value.trim();

      // If the entire value is a single color
      const singleParsed = colord(rawValue);
      const isSingleKeyword = KEYWORD_COLORS.has(rawValue.toLowerCase());

      let colorsToProcess: string[] = [];

      if (singleParsed.isValid() || isSingleKeyword) {
        colorsToProcess.push(rawValue);
      } else {
        // Try to extract individual color tokens from shorthand values
        colorsToProcess = extractColorTokens(rawValue);
      }

      for (const colorVal of colorsToProcess) {
        if (!options.includeKeywords && KEYWORD_COLORS.has(colorVal.toLowerCase())) continue;

        const parsed = colord(colorVal);
        if (!parsed.isValid() && !KEYWORD_COLORS.has(colorVal.toLowerCase())) continue;

        let normalized: string;
        if (KEYWORD_COLORS.has(colorVal.toLowerCase())) {
          normalized = colorVal.toLowerCase();
        } else {
          switch (options.colorFormat) {
            case 'rgb':
              normalized = parsed.toRgbString();
              break;
            case 'hsl':
              normalized = parsed.toHslString();
              break;
            case 'hex':
            default:
              normalized = parsed.toHex();
              break;
          }
        }

        const key = `${colorVal.toLowerCase()}|${normalized}`;
        const existing = colorMap.get(key);
        if (existing) {
          existing.sources.push({ filePath: css.filePath, line: decl.source?.start?.line ?? 0 });
        } else {
          colorMap.set(key, {
            normalized,
            sources: [{ filePath: css.filePath, line: decl.source?.start?.line ?? 0 }]
          });
        }
      }
    });
  }

  const results: ColorInfo[] = [];
  for (const [rawPlusNorm, data] of colorMap.entries()) {
    const raw = rawPlusNorm.split('|')[0];
    results.push({
      value: raw,
      normalized: data.normalized,
      occurrences: data.sources.length,
      sources: data.sources
    });
  }

  // Sort by occurrences desc
  results.sort((a, b) => b.occurrences - a.occurrences);
  return results;
}
