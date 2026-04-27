import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import { FileMatch } from '../types.js';

export async function scanFiles(pattern: string, cwd?: string): Promise<FileMatch[]> {
  const entries = await fg(pattern, { cwd, absolute: true, onlyFiles: true });
  const results: FileMatch[] = [];
  for (const filePath of entries) {
    try {
      const content = await readFile(filePath, 'utf-8');
      results.push({ filePath, content });
    } catch {
      // Skip unreadable files silently
    }
  }
  return results;
}
