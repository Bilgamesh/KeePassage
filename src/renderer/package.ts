import { lstatSync } from 'node:fs';
import { join, sep } from 'node:path';

let isInit = false;
let dirname: string | null = null;
let isPacked: boolean | null = null;
let execFileName: string | null = null;
let rootDirName: string | null = null;

function init() {
  if (isInit) {
    return;
  }
  dirname = __dirname;
  isPacked = isFile(dirname.split(sep).slice(0, -1).join(sep));
  const dirs = dirname.split(sep);
  if (isPacked) {
    rootDirName = dirs.slice(0, -2).join(sep);
    execFileName = dirs.slice(0, -1).pop()!;
  } else {
    rootDirName = dirs.slice(0, -1).join(sep);
  }
  isInit = true;
  return;
}

function isFile(path: string, options?: { silent?: boolean }) {
  try {
    return lstatSync(path).isFile();
  } catch (error) {
    if (options?.silent) {
      return false;
    }
    console.error(`Failed to check if \`${path}\` is file: ${error}`);
    return false;
  }
}

function getRootDirname() {
  init();
  if (rootDirName === null) {
    throw new Error(
      'Cannot access rootDirName. FolderUtil must be initialized first.',
    );
  }
  return rootDirName;
}

function getExecFileName() {
  init();
  if (dirname === null) {
    throw new Error(
      'Cannot resolve execFileName. FolderUtil must be initialized first.',
    );
  }
  return execFileName;
}

function getResourceFolder() {
  init();
  return join(getRootDirname(), 'res');
}

function getResourcePath(...paths: string[]) {
  init();
  return join(getResourceFolder(), ...paths);
}

function getBinPath(...paths: string[]) {
  init();
  return join(getResourceFolder(), 'bin', ...paths);
}

function getBinExecPath(...paths: string[]) {
  init();
  const extension = process.platform === 'win32' ? '.exe' : '';
  return getBinPath(...paths) + extension;
}

function checkIfPacked() {
  init();
  return isPacked!;
}

export {
  checkIfPacked,
  getBinExecPath,
  getBinPath,
  getExecFileName,
  getResourceFolder,
  getResourcePath,
  getRootDirname,
  isFile,
};
