import { basename, join, resolve } from 'node:path';
import type { Plugin } from 'vite';

const yuePlugin: (config: {
  src: string;
  assetsFolder?: string;
  input: string;
  output?: string;
}) => Plugin = (config) => ({
  name: 'yue-plugin',
  transform(_: unknown, id: string) {
    config.assetsFolder = config.assetsFolder || join(config.src, 'assets');
    config.assetsFolder = resolve(config.assetsFolder);
    if (resolve(id).startsWith(config.assetsFolder)) {
      return `
      import { checkIfPacked, getResourcePath } from '#/renderer/package';
      const relativePath = \`${id.split(basename(config.assetsFolder))[1]}\`;
      const path = checkIfPacked() ? getResourcePath(relativePath) : \`${id}\`;
      export default path;
      `;
    }
    return null;
  },
  config() {
    config.output = config.output || 'index.cjs';
    return {
      resolve: {
        alias: {
          '#': config.src
        }
      },
      ssr: {
        noExternal: true,
        resolve: {
          conditions: ['browser']
        }
      },
      build: {
        target: 'node22',
        outDir: './build',
        emptyOutDir: false,
        ssr: config.input,
        minify: 'esbuild',
        rollupOptions: {
          input: config.input,
          output: {
            format: 'cjs',
            entryFileNames: config.output
          },
          external: ['gui'],
          treeshake: true
        }
      }
    };
  }
});

export default yuePlugin;
export { yuePlugin };
