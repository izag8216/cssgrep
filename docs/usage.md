# Usage Guide

## Overview

cssgrep provides three commands for auditing CSS. Each command accepts glob patterns and outputs results in your preferred format.

## Unused Selector Detection

The most common use case: finding CSS that can be safely removed.

```bash
# Basic usage
cssgrep unused --css "src/**/*.css" --html "public/**/*.html"

# Single file pair
cssgrep unused --css "dist/bundle.css" --html "index.html"

# JSON output for CI integration
cssgrep unused --css "src/**/*.css" --html "**/*.html" --format json
```

### How It Works

1. Scans all HTML files to build an index of used classes, IDs, and tags
2. Parses CSS files and extracts every selector
3. Reports selectors with no matching elements

### Limitations

- Dynamic classes added by JavaScript are not detected (static analysis only)
- Shadow DOM content is not inspected
- Pseudo-classes are handled conservatively

## Color Extraction

Extract a complete color inventory from your stylesheets.

```bash
# List all colors (default)
cssgrep colors "src/**/*.css"

# View as palette with HSL values
cssgrep colors "theme.css" --format hsl --output palette

# Include statistics
cssgrep colors "src/**/*.css" --output stats --verbose
```

### Supported Color Formats

- Hex: `#fff`, `#ffffff`
- RGB/RGBA: `rgb(255, 0, 0)`, `rgba(0,0,0,0.5)`
- HSL/HSLA: `hsl(120, 100%, 50%)`
- Named colors: `red`, `blue`, `transparent`, etc.
- CSS variables: reported as-is (unresolved)

## Specificity Audit

Identify overly complex selectors that may cause maintenance issues.

```bash
# Default threshold (2,4,5)
cssgrep specificity "src/**/*.css"

# Custom threshold
cssgrep specificity "src/**/*.css" --threshold "1,3,3"

# Sort ascending
cssgrep specificity "src/**/*.css" --sort asc --format table
```

### Specificity Format

The threshold uses W3C (a,b,c) format:
- **a**: ID selectors
- **b**: Class selectors, attribute selectors, pseudo-classes
- **c**: Type (tag) selectors, pseudo-elements

Example: `#nav > ul > li > a` = (1, 0, 3)
