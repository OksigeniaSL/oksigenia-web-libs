import { defineConfig } from 'tsup';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

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
  async onSuccess() {
    // Extrae SHARE_CSS del bundle y lo escribe como dist/styles.css
    // para que los consumidores que usen mountShare (light DOM) puedan
    // hacer `import '@oksigenia/share/styles.css'`.
    const stylesSrc = await readFile(join('src', 'styles.ts'), 'utf8');
    const match = stylesSrc.match(/export const SHARE_CSS = `([\s\S]*?)`;/);
    if (!match) {
      throw new Error('No se pudo extraer SHARE_CSS de src/styles.ts');
    }
    await writeFile(join('dist', 'styles.css'), match[1]!.trim() + '\n', 'utf8');
  },
});
