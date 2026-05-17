import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'web-component': 'src/web-component.ts',
  },
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  target: 'es2022',
  treeshake: true,
  splitting: false,
  minify: false,
  esbuildOptions(options) {
    options.legalComments = 'none';
  },
});
