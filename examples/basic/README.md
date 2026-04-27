# cssgrep Basic Example

This example demonstrates cssgrep on a simple HTML + CSS pair.

## Files

- `index.html` -- A landing page with header, navigation, and content
- `styles.css` -- Stylesheet with some intentionally unused selectors

## Running cssgrep

```bash
# From the repository root
cd examples/basic

# Find unused selectors
cssgrep unused --css "styles.css" --html "index.html"

# Extract colors
cssgrep colors "styles.css"

# Audit specificity
cssgrep specificity "styles.css"
```

## Expected Output

### Unused

```
Found 3 unused selector(s):

.../styles.css:67  .sidebar .widget
.../styles.css:68  .footer-links
.../styles.css:69  .hero-banner .cta
```

### Colors

| Color | Normalized | Count |
|-------|-----------|-------|
| #333 | #333333 | 1 |
| #fafafa | #fafafa | 1 |
| #0066cc | #0066cc | 2 |
| #222 | #222222 | 1 |
| #fff | #ffffff | 2 |
| #ddd | #dddddd | 1 |
| #666 | #666666 | 1 |
| #0055aa | #0055aa | 1 |

### Specificity

| Selector | Specificity |
|----------|-------------|
| #main-header | (1,0,0) |
| .sidebar .widget | (0,2,0) |
| .hero-banner .cta | (0,2,0) |
| .navbar | (0,1,0) |
| .nav-links a | (0,1,1) |
| .btn-primary:hover | (0,2,1) |
