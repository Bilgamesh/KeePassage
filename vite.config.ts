import path from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig(({ mode }) => {
  const input = mode === 'daemon' ? 'src/pcsc-daemon/pcsc-daemon.ts' : 'src/index.tsx';
  const output = mode === 'daemon' ? 'pcsc-daemon.cjs' : 'index.cjs';

  return {
    plugins: [
      solidPlugin({
        solid: {
          generate: 'universal',
          moduleName: '@/renderer'
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    ssr: {
      noExternal: true,
      resolve: {
        conditions: ['browser']
      }
    },
    build: {
      target: mode === 'daemon' ? 'node24' : 'node22',
      outDir: './build',
      emptyOutDir: false,
      ssr: input,
      minify: 'esbuild',
      rollupOptions: {
        input,
        output: {
          format: 'cjs',
          entryFileNames: output
        },
        external: ['gui', './addon.node'],
        treeshake: true
      }
    }
  };
});
