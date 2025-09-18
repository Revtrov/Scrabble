import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],        // only ESM
  target: 'node22',
  dts: true,  
  sourcemap: true
});
