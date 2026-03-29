// This script acts as a launcher for the Yode runtime bundled via `fetch-yode`.

import { execFile } from 'node:child_process';
import { copyFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

let { path } = require('fetch-yode');

if (process.platform === 'win32') {
  // Due to limitation of pcsc-mini library, the runtime on Windows has to be named exactly "node.exe".
  // Hence, we are renaming yode to node.
  // https://github.com/kofi-q/pcsc-mini/issues/13
  // https://github.com/kofi-q/pcsc-mini/issues/5
  const newPath = path.replace('yode.exe', 'node.exe');
  await copyFile(path, newPath);
  path = newPath;
}

const args = process.argv.slice(2);

const child = execFile(path, args);

child.stdout?.pipe(process.stdout);
child.stderr?.pipe(process.stderr);

child.on('exit', (code) => process.exit(code));
