import { File } from 'node:buffer';

if (typeof globalThis.File === 'undefined') {
  (globalThis as any).File = File;
}
