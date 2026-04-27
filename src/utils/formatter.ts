import chalk from 'chalk';
import Table from 'cli-table3';
import { UnusedResult, ColorInfo, SpecificityInfo, OutputFormat } from '../types.js';

export function formatUnused(results: UnusedResult[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  if (format === 'table') {
    const table = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Selector'), chalk.cyan('Line')],
      colWidths: [40, 40, 8]
    });
    for (const r of results) {
      table.push([r.filePath, r.selector, String(r.line)]);
    }
    return table.toString();
  }

  // pretty
  if (results.length === 0) {
    return chalk.green('No unused selectors found.');
  }
  const lines: string[] = [chalk.bold.yellow(`Found ${results.length} unused selector(s):\n`)];
  for (const r of results) {
    lines.push(`${chalk.gray(r.filePath)}:${chalk.yellow(String(r.line))}  ${chalk.white(r.selector)}`);
  }
  return lines.join('\n');
}

export function formatColors(results: ColorInfo[], format: OutputFormat, options: {
  output: 'list' | 'palette' | 'stats';
  verbose: boolean;
}): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  if (results.length === 0) {
    return chalk.green('No colors found.');
  }

  if (format === 'table') {
    const table = new Table({
      head: [chalk.cyan('Color'), chalk.cyan('Normalized'), chalk.cyan('Count')],
      colWidths: [25, 25, 8]
    });
    for (const r of results) {
      table.push([r.value, r.normalized, String(r.occurrences)]);
    }
    return table.toString();
  }

  // pretty
  const lines: string[] = [];
  if (options.output === 'stats') {
    const total = results.reduce((sum, r) => sum + r.occurrences, 0);
    const unique = results.length;
    lines.push(chalk.bold(`Total color declarations: ${total}`));
    lines.push(chalk.bold(`Unique colors: ${unique}\n`));
  }

  lines.push(chalk.bold.yellow(`Found ${results.length} unique color(s):\n`));
  for (const r of results) {
    const colorBlock = chalk.bgHex(r.normalized.startsWith('#') ? r.normalized : '#000000')('  ');
    lines.push(`${colorBlock} ${chalk.white(r.normalized)} ${chalk.gray(`(${r.value})`)} ${chalk.cyan(`x${r.occurrences}`)}`);
    if (options.verbose) {
      for (const src of r.sources.slice(0, 5)) {
        lines.push(`   ${chalk.gray(src.filePath)}:${chalk.yellow(String(src.line))}`);
      }
      if (r.sources.length > 5) {
        lines.push(`   ${chalk.gray(`... and ${r.sources.length - 5} more`)}`);
      }
    }
  }
  return lines.join('\n');
}

export function formatSpecificity(results: SpecificityInfo[], format: OutputFormat): string {
  if (format === 'json') {
    return JSON.stringify(results, null, 2);
  }

  if (format === 'table') {
    const table = new Table({
      head: [chalk.cyan('File'), chalk.cyan('Selector'), chalk.cyan('Specificity'), chalk.cyan('Line')],
      colWidths: [35, 35, 15, 8]
    });
    for (const r of results) {
      table.push([r.filePath, r.selector, `(${r.specificity.join(',')})`, String(r.line)]);
    }
    return table.toString();
  }

  // pretty
  if (results.length === 0) {
    return chalk.green('No selectors exceed the specificity threshold.');
  }
  const lines: string[] = [chalk.bold.yellow(`Found ${results.length} selector(s) with high specificity:\n`)];
  for (const r of results) {
    const specStr = `(${r.specificity[0]},${r.specificity[1]},${r.specificity[2]})`;
    lines.push(`${chalk.gray(r.filePath)}:${chalk.yellow(String(r.line))}  ${chalk.white(r.selector)}  ${chalk.magenta(specStr)}`);
  }
  return lines.join('\n');
}
