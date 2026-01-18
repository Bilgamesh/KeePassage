import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import yuePlugin from './src/renderer/vite-plugin.ts';

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
      }),
      yuePlugin({ src: resolve(__dirname, 'src'), input, output })
    ],
    build: {
      rollupOptions: {
        external: ['./addon.node']
      }
    }
  };
});
