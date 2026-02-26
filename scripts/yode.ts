import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const { path } = require('fetch-yode');

const args = process.argv.slice(2);

const child = execFile(path, args);

child.stdout?.pipe(process.stdout);
child.stderr?.pipe(process.stderr);

child.on('exit', (code) => process.exit(code));
