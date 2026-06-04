import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import yuePlugin from './src/renderer/vite-plugin.ts';

export default defineConfig((env) => ({
  plugins: [
    solidPlugin({
      solid: {
        generate: 'universal',
        moduleName: '#/renderer'
      }
    }),
    yuePlugin({
      mode: env.mode === 'dev' ? 'dev' : 'release',
      src: resolve(__dirname, 'src'),
      assetsFolder: resolve(__dirname, 'src', 'assets'),
      input: 'src/index.tsx',
      output: 'index.cjs'
    })
  ],
  build: {
    rollupOptions: {
      external: ['./addon.node']
    },
    sourcemap: true
  }
}));
