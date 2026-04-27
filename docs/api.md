# API Reference

## Core Functions

### `scanFiles(pattern: string, cwd?: string): Promise<FileMatch[]>`

Scan files matching a glob pattern.

```typescript
import { scanFiles } from 'cssgrep';

const cssFiles = await scanFiles('src/**/*.css');
// => [{ filePath: '/absolute/path/to/file.css', content: '...' }]
```

### `findUnusedSelectors(cssFiles: FileMatch[], htmlFiles: FileMatch[]): UnusedResult[]`

Find CSS selectors with no matching HTML elements.

```typescript
import { scanFiles, findUnusedSelectors } from 'cssgrep';

const css = await scanFiles('src/**/*.css');
const html = await scanFiles('public/**/*.html');
const unused = findUnusedSelectors(css, html);

for (const u of unused) {
  console.log(`${u.filePath}:${u.line}  ${u.selector}`);
}
```

**Returns:** `UnusedResult[]`

| Property | Type | Description |
|----------|------|-------------|
| `filePath` | `string` | Absolute path to CSS file |
| `selector` | `string` | The unused selector text |
| `line` | `number` | Line number in CSS file |
| `column` | `number` | Column number in CSS file |

### `extractColors(cssFiles: FileMatch[], options): ColorInfo[]`

Extract and normalize color values from CSS.

```typescript
import { scanFiles, extractColors } from 'cssgrep';

const css = await scanFiles('src/**/*.css');
const colors = extractColors(css, {
  colorFormat: 'hex',
  includeKeywords: false
});

for (const c of colors) {
  console.log(`${c.normalized} (x${c.occurrences})`);
}
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `colorFormat` | `'hex' \| 'rgb' \| 'hsl'` | `'hex'` | Normalization format |
| `includeKeywords` | `boolean` | `false` | Include CSS keyword colors |

**Returns:** `ColorInfo[]`

| Property | Type | Description |
|----------|------|-------------|
| `value` | `string` | Original color value |
| `normalized` | `string` | Normalized color value |
| `occurrences` | `number` | Number of declarations |
| `sources` | `Array<{filePath, line}>` | Source locations |

### `analyzeSpecificity(cssFiles: FileMatch[], threshold: [number, number, number]): SpecificityInfo[]`

Audit selector specificity.

```typescript
import { scanFiles, analyzeSpecificity } from 'cssgrep';

const css = await scanFiles('src/**/*.css');
const flagged = analyzeSpecificity(css, [2, 4, 5]);

for (const s of flagged) {
  console.log(`${s.selector}: (${s.specificity.join(',')})`);
}
```

**Returns:** `SpecificityInfo[]`

| Property | Type | Description |
|----------|------|-------------|
| `selector` | `string` | Selector text |
| `specificity` | `[number, number, number]` | (a, b, c) tuple |
| `score` | `number` | Computed score (a*10000 + b*100 + c) |
| `line` | `number` | Line number |
| `filePath` | `string` | Absolute file path |

## Types

All TypeScript types are exported from the main entry point.

```typescript
import type { FileMatch, UnusedResult, ColorInfo, SpecificityInfo } from 'cssgrep';
```
