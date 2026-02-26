import fs from 'node:fs';
import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import getNode from 'get-node';
import rcedit from 'rcedit';
// @ts-expect-error
import { packageApp } from 'yackage';

function logStep(message: string) {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${message}`);
}

async function copyModule(module: string) {
  const start = performance.now();
  logStep(`📦 Copying module: ${module}`);
  await cp(
    join(import.meta.dirname, '..', 'node_modules', module),
    join(import.meta.dirname, '..', 'release', 'node_modules', module),
    { recursive: true }
  );
  const end = performance.now();
  logStep(`✅ Copied ${module} in ${((end - start) / 1000).toFixed(2)}s`);
}

async function copyResources() {
  await cp(
    join(import.meta.dirname, '..', 'src', 'assets'),
    join(import.meta.dirname, '..', 'release', 'out', 'res'),
    { recursive: true }
  );
}

function detectPcscPkg() {
  const abi = detectAbi();
  const target = abi
    ? `${process.platform}-${process.arch}-${abi}`
    : `${process.platform}-${process.arch}`;

  switch (target) {
    case 'linux-arm64-glibc':
      return '@pcsc-mini/linux-aarch64-gnu';
    case 'linux-arm64-musl':
      return '@pcsc-mini/linux-aarch64-musl';
    case 'linux-x64-glibc':
      return '@pcsc-mini/linux-x86_64-gnu';
    case 'linux-x64-musl':
      return '@pcsc-mini/linux-x86_64-musl';
    case 'linux-ia32-glibc':
      return '@pcsc-mini/linux-x86-gnu';
    case 'linux-ia32-musl':
      return '@pcsc-mini/linux-x86-musl';
    case 'darwin-arm64':
      return '@pcsc-mini/macos-aarch64';
    case 'darwin-x64':
      return '@pcsc-mini/macos-x86_64';
    case 'win32-arm64-node':
      return '@pcsc-mini/windows-aarch64-node';
    case 'win32-x64-node':
      return '@pcsc-mini/windows-x86_64-node';
    default:
      throw new Error(`Unsupported platform: ${target}`);
  }
}

function detectAbi() {
  if (process.platform === 'win32') {
    if (process.versions.bun) {
      return 'bun';
    }
    if (process.versions.electron) {
      return 'electron';
    }
    return 'node';
  }

  if (process.platform !== 'linux') {
    return null;
  }

  try {
    const ldd = fs.readFileSync('/usr/bin/ldd', 'utf8');
    if (ldd.includes('GLIBC')) {
      return 'glibc';
    }
    if (ldd.includes('musl')) {
      return 'musl';
    }
  } catch {}

  if (
    (
      process.report?.getReport() as {
        header: { glibcVersionRuntime: boolean };
      }
    ).header.glibcVersionRuntime
  ) {
    return 'glibc';
  }

  throw new Error('Unable to detect Linux ABI');
}

const require = createRequire(import.meta.url);

const appInfo = {
  ...require('../package.json'),
  main: 'index.cjs',
  unpack: '+(*.node)',
  build: {
    minify: true
  },
  appId: 'keepassage',
  productName: 'KeePassage',
  description: 'KeePassage',
  copyright: `Copyright © ${new Date().getFullYear()} KeePassage`
};

logStep('🚀 Starting release build process...');

const totalStart = performance.now();

// === Step 1: Copy dependencies ===
logStep('📁 Preparing release directory...');
await mkdir(join(import.meta.dirname, '..', 'release'), { recursive: true });

logStep('📦 Copying dependencies...');
await Promise.all([copyModule('fetch-yode'), copyModule('gui')]);

// === Step 2: Copy bundle and create package.json ===
logStep('🧩 Copying bundle and writing package.json...');
const bundleSrc = join(import.meta.dirname, '..', 'build', 'index.cjs');
const bundleDest = join(import.meta.dirname, '..', 'release', 'index.cjs');
await cp(bundleSrc, bundleDest);

await writeFile(
  join(import.meta.dirname, '..', 'release', 'package.json'),
  JSON.stringify(
    {
      main: appInfo.main,
      build: {
        appId: appInfo.appId,
        productName: appInfo.productName,
        description: appInfo.description,
        version: appInfo.version,
        copyright: appInfo.copyright,
        icons: {
          win: '../src/assets/img/logo.ico'
        }
      }
    },
    null,
    2
  )
);
logStep('✅ Bundle and package.json ready.');

// === Step 3: Run Yackage build ===
logStep('⚙️  Building with Yackage... (this might take a while)');
const yackageStart = performance.now();
await packageApp(
  join(import.meta.dirname, '..', 'release', 'out'),
  join(import.meta.dirname, '..', 'release'),
  appInfo,
  process.platform,
  null
);
const yackageEnd = performance.now();
const yackageDuration = ((yackageEnd - yackageStart) / 1000).toFixed(2);

logStep(`✅ Yackage build finished in ${yackageDuration}s`);

// === Step 4: Fetch Node binary ===
logStep('📥 Fetching Node binary...');
const nodeFetchStart = performance.now();
const { path: nodePath } = await getNode('local', {
  output: join(import.meta.dirname, '..', 'release')
});
const nodeFetchEnd = performance.now();
const nodeFetchDuration = ((nodeFetchEnd - nodeFetchStart) / 1000).toFixed(2);
logStep(`✅ Node fetched in ${nodeFetchDuration}s`);

// === Step 5: Copy resources ===
logStep('📦 Copying resources...');
const daemonSrc = join(import.meta.dirname, '..', 'build', 'pcsc-daemon.cjs');
const daemonDest = join(
  import.meta.dirname,
  '..',
  'release',
  'out',
  'res',
  'pcsc-daemon.cjs'
);
const pcscSrc = join(
  import.meta.dirname,
  '..',
  'node_modules',
  detectPcscPkg(),
  'addon.node'
);
const pcscDest = join(
  import.meta.dirname,
  '..',
  'release',
  'out',
  'res',
  'node_modules',
  'pcsc-mini',
  'addon.node'
);
const nodeDest =
  join(import.meta.dirname, '..', 'release', 'out', 'res', 'bin', 'node') +
  (process.platform === 'win32' ? '.exe' : '');
await Promise.all([
  cp(daemonSrc, daemonDest),
  cp(pcscSrc, pcscDest),
  cp(nodePath, nodeDest),
  copyResources()
]);

// === Step 6: Patch PCSC Daemon ===
logStep('🩹 Patching PCSC Daemon...');
const code = (await readFile(daemonDest)).toString();
const patched = code.replaceAll(
  join(
    import.meta.dirname,
    '..',
    'node_modules',
    'pcsc-mini',
    'build',
    'addon.node'
  ).replaceAll('\\', '\\\\'),
  './node_modules/pcsc-mini/addon.node'
);
await writeFile(daemonDest, patched);

// === Step 7: Patch Node.js Daemon ===
if (process.platform === 'win32') {
  logStep('🩹 Patching Node.js...');
  await rcedit(nodeDest, {
    'version-string': {
      FileDescription: `${appInfo.description} PCSC Daemon`,
      ProductName: `${appInfo.productName} PCSC Daemon`,
      LegalCopyright: appInfo.copyright
    },
    'file-version': appInfo.version,
    'product-version': appInfo.version
  });
}

// === Step 8: Summary ===
const totalEnd = performance.now();
const totalDuration = ((totalEnd - totalStart) / 1000).toFixed(2);

console.log('\n✨ --------------------------------------- ✨');
console.log(`🎉 Build completed successfully in ${totalDuration}s total`);
console.log('📦 Output binary can be found in: release/out');
console.log('✨ --------------------------------------- ✨\n');
