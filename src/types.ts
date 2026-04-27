export interface FileMatch {
  filePath: string;
  content: string;
}

export interface SelectorInfo {
  selector: string;
  line: number;
  column: number;
}

export interface UnusedResult {
  filePath: string;
  selector: string;
  line: number;
  column: number;
}

export interface ColorInfo {
  value: string;
  normalized: string;
  occurrences: number;
  sources: Array<{ filePath: string; line: number }>;
}

export interface SpecificityInfo {
  selector: string;
  specificity: [number, number, number];
  score: number;
  line: number;
  filePath: string;
}

export type OutputFormat = 'table' | 'json' | 'pretty';

export interface CliOptions {
  format: OutputFormat;
  verbose?: boolean;
}

export interface UnusedOptions extends CliOptions {
  css: string;
  html: string;
}

export interface ColorsOptions extends CliOptions {
  colorFormat: 'hex' | 'rgb' | 'hsl';
  output: 'list' | 'palette' | 'stats';
  includeKeywords: boolean;
}

export interface SpecificityOptions extends CliOptions {
  threshold: [number, number, number];
  sort: 'asc' | 'desc';
}
