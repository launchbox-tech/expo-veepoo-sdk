import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'tsdown';

const here = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'cjs',
  outDir: 'build',
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  // Resolve the `@/*` → `src/*` tsconfig path so internal modules are bundled
  // instead of externalized into dangling relative requires (which break the
  // CJS bundle for consumers). tsdown does not pick up tsconfig `paths` here.
  alias: { '@': path.resolve(here, 'src') },
  deps: {
    neverBundle: ['expo-modules-core', 'expo', 'react', 'react-native'],
  },
  rolldownOptions: {
    output: { exports: 'named' },
  },
});
