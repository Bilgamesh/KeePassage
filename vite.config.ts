import { resolve } from 'path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import yuePlugin from './src/renderer/vite-plugin.ts';

export default defineConfig(({ mode }) => ({
  plugins: [
    solidPlugin({
      solid: {
        generate: 'universal',
        moduleName: '@/renderer'
      }
    }),
    yuePlugin({
      src: resolve(__dirname, 'src'),
      assetsFolder: resolve(__dirname, 'src', 'assets'),
      input: mode === 'daemon' ? 'src/pcsc-daemon/pcsc-daemon.ts' : 'src/index.tsx',
      output: mode === 'daemon' ? 'pcsc-daemon.cjs' : 'index.cjs'
    })
  ],
  build: {
    rollupOptions: {
      external: ['./addon.node']
    }
  }
}));
